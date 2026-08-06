import express, { type Express, type Request, type Response } from "express";
import path from "path";
import fs from "fs";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { sitemapHandler } from "./routes/sitemap";
import { logger } from "./lib/logger";
import { blogSeoHeadInjection, injectHeadFromLocals } from "./middlewares/seo-head-injection";

const app: Express = express();

// ---------------------------------------------------------------------------
// SPA / SEO head-injection
// ---------------------------------------------------------------------------
// O api-server é o host de produção do SPA (Path A): quando `FRONTEND_DIST`
// (caminho absoluto p/ o `dist/public` do frontend) está presente, ele:
//   1. injeta head de SEO para `/blog/:slug` (blogSeoHeadInjection);
//   2. serve os assets estáticos do build;
//   3. faz o catch-all do SPA servindo index.html já com o head injetado
//      (canonical/título/og/JSON-LD do ARTIGO para /blog/*, shell p/ o resto).
// Sem `FRONTEND_DIST`, o app continua sendo somente API/sitemap.
const frontendDist = process.env.FRONTEND_DIST;
let indexHtml: string | null = null;

// Rotas de API/sitemap são montadas ANTES do serviço do SPA para que o
// catch-all abaixo nunca as capture.
app.get("/sitemap.xml", sitemapHandler);
app.use("/api", router);

if (frontendDist && fs.existsSync(path.join(frontendDist, "index.html"))) {
  indexHtml = fs.readFileSync(path.join(frontendDist, "index.html"), "utf8");
  logger.info({ frontendDist }, "Servindo SPA a partir do build de produção do frontend");

  // Monta SEO head antes de servir o HTML para /blog/:slug.
  app.use(blogSeoHeadInjection);

  // Assets estáticos (scripts, css, imagens) — não injeta head em binários.
  app.use(
    express.static(frontendDist, {
      index: false, // nunca serve index.html automaticamente (usamos o catch-all)
      // index.html carrega o head de SEO dinâmico (depende do slug) → não cachear.
      setHeaders(res, urlPath) {
        if (urlPath.endsWith("index.html")) res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      },
    }),
  );

  // Catch-all do SPA: qualquer rota não coberta pelos assets retorna o
  // index.html (com head de SEO injetado para /blog/*). Rotas de API não
  // mapeadas / /sitemap.xml respondem 404 JSON em vez de HTML.
  app.use((req: Request, res: Response) => {
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.status(404).json({ error: "Not found" });
      return;
    }
    if (req.path.startsWith("/api")) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    let html = indexHtml ?? "";
    const { html: injected, changed } = injectHeadFromLocals(html, req);
    if (changed) html = injected;
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
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

export default app;
