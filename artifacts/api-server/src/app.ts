import express, { type Express, type Request, type Response } from "express";
import path from "path";
import fs from "fs";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { sitemapHandler } from "./routes/sitemap";
import { logger } from "./lib/logger";
import {
  spaSeoHeadInjection,
  resolveSeoHead,
  injectHead,
  injectBodyLinks,
  resolveBodyLinks,
  buildNotFoundHead,
  normalizeRoutePath,
} from "./middlewares/seo-head-injection";
import { SPA_ROUTE_PATTERNS } from "./generated/spa-routes";

// ---------------------------------------------------------------------------
// Validacao das rotas validas do SPA
// ---------------------------------------------------------------------------
// O catch-all responde index.html para qualquer GET nao-API. Para dar 404 real
// a paths inexistentes (hoje tudo devolve 200, o chamado soft 404), validamos
// aqui o path contra as rotas declaradas no App.tsx.
//
// A lista NAO e mantida a mao: `SPA_ROUTE_PATTERNS` e gerado em build time por
// `scripts/gen-spa-routes.mjs` (a partir de
// `artifacts/estude-loterias/src/App.tsx`, via AST do TypeScript) e roda no
// `prebuild` do api-server. Adicionar uma rota no App.tsx + rodar o build ja a
// inclui aqui, sem passo manual.
//
// Regras de parametro (explicitas e documentadas):
//   - `:concurso` -> apenas digitos (`\d+`), preservando o comportamento
//     historico de `/:modalidade/resultado/:concurso`;
//   - qualquer outro parametro (`:slug`, `:id`, ...) -> um segmento nao vazio
//     sem barra (`[^/]+`).
// Mantem a normalizacao historica: query string e hash sao ignorados, barra
// final e caixa nao importam.
const SPA_PARAM_MATCHERS: Record<string, string> = {
  concurso: "\\d+",
};
const SPA_DEFAULT_PARAM_MATCHER = "[^/]+";

/** Escapa um segmento literal para uso dentro de uma RegExp. */
function escapeRegExpLiteral(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Converte um padrao do App.tsx (ex.: `/blog/:slug`) em RegExp ancorada. */
function routePatternToRegExp(pattern: string): RegExp {
  if (pattern === "/") return /^\/$/;
  const body = pattern
    .replace(/\/+$/, "")
    .split("/")
    .filter(Boolean)
    .map((segment) => {
      if (segment.startsWith(":")) {
        const name = segment.slice(1);
        return SPA_PARAM_MATCHERS[name] ?? SPA_DEFAULT_PARAM_MATCHER;
      }
      return escapeRegExpLiteral(segment);
    })
    .join("/");
  return new RegExp(`^/${body}$`);
}

const SPA_ROUTE_REGEXPS: RegExp[] = SPA_ROUTE_PATTERNS.map(routePatternToRegExp);

/** Normaliza e valida um path do SPA (ignora query, barra final e caixa). */
function isValidSpaRoute(reqPath: string): boolean {
  const p = normalizeRoutePath(reqPath).toLowerCase();
  return SPA_ROUTE_REGEXPS.some((re) => re.test(p));
}

const app: Express = express();

// ---------------------------------------------------------------------------
// SPA / SEO head-injection
// ---------------------------------------------------------------------------
// O api-server é o host de produção do SPA: quando `FRONTEND_DIST`
// (caminho absoluto p/ o `dist/public` do frontend) está presente, ele:
//   1. serve os assets estáticos do build (scripts, css, imagens);
//   2. injeta head de SEO específico para cada rota (concursos, hubs,
//      estatísticas, ferramentas, blog e institucionais);
//   3. faz o catch-all do SPA servindo index.html já com canonical e title corretos.
// Sem `FRONTEND_DIST`, o app continua sendo somente API/sitemap.
const frontendDist = process.env.FRONTEND_DIST;
let indexHtml: string | null = null;

// Body parser é montado ANTES das rotas de API: sem isto, req.body chega
// vazio em todos os POST/PUT e os updates falham silenciosamente (só updatedAt
// muda). A ordem importa no Express.
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Rotas de API/sitemap são montadas ANTES do serviço do SPA para que o
// catch-all abaixo nunca as capture.
app.get("/sitemap.xml", sitemapHandler);
app.use("/api", router);

if (frontendDist && fs.existsSync(path.join(frontendDist, "index.html"))) {
  indexHtml = fs.readFileSync(path.join(frontendDist, "index.html"), "utf8");
  logger.info({ frontendDist }, "Servindo SPA a partir do build de produção do frontend");

  // Assets estáticos (scripts, css, imagens) — servidos direto sem computação de SEO.
  app.use(
    express.static(frontendDist, {
      index: false, // nunca serve index.html automaticamente (usamos o catch-all)
      // index.html carrega o head de SEO dinâmico → não cachear.
      setHeaders(res, urlPath) {
        if (urlPath.endsWith("index.html")) res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      },
    }),
  );

  // Injeção de SEO no head para rotas do SPA
  app.use(spaSeoHeadInjection);

  // Catch-all do SPA: qualquer rota não coberta pelos assets retorna o
  // index.html com o head de SEO apropriado para a rota atual (concursos,
  // estatísticas, blog, institucional, etc.). Rotas que não fazem parte do
  // roteador do SPA respondem HTTP 404 real (+ `X-Robots-Tag: noindex`).
  app.use(async (req: Request, res: Response) => {
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.status(404).json({ error: "Not found" });
      return;
    }
    if (req.path.startsWith("/api")) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    const isKnownRoute = isValidSpaRoute(req.path);

    let html = indexHtml ?? "";
    try {
      let head = (res.locals.seoHead || res.locals.articleSeoHead) as string | undefined;
      if (!head) {
        const seoResult = await resolveSeoHead(req.path);
        if (typeof seoResult === "object" && "redirect" in seoResult) {
          res.redirect(301, seoResult.redirect);
          return;
        }
        head = seoResult;
      }
      if (!isKnownRoute) {
        res.status(404).setHeader("X-Robots-Tag", "noindex");
        head = buildNotFoundHead(req.path);
      }
      html = injectHead(html, head);

      // Grafo de links internos no HTML inicial apenas em rotas válidas de
      // resultado/lista. Falha de DB degrada para sem nav (resolveBodyLinks
      // nunca lança).
      if (isKnownRoute) {
        const nav = await resolveBodyLinks(req.path);
        if (nav) html = injectBodyLinks(html, nav);
      }
    } catch (err) {
      logger.error({ err, path: req.path }, "Erro ao injetar SEO head no catch-all");
    }
    res.type("html").send(html);
  });
}

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());

export default app;
