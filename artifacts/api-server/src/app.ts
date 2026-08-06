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
// Em produção o SPA é hoje servido pelo serviço "web" do Replit (serve=static),
// NÃO por este api-server. Para que a injeção de SEO server-side do `/blog/:slug`
// funcione de verdade é preciso que o SPA seja servido por aqui (ou por um proxy
// que invoque estas funções). Por isso o serving do build do SPA é OPCIONAL e
// ativado pela env `FRONTEND_DIST` (caminho absoluto para o diretório
// `dist/public` do frontend). Quando presente:
//   1. injeta head de SEO para /blog/:slug  (blogSeoHeadInjection);
//   2. serve os assets estáticos;
//   3. faz o catch-all do SPA servindo index.html já com o head injetado.
// Sem `FRONTEND_DIST`, o app continua sendo somente API/sitemap (comportamento atual).
const frontendDist = process.env.FRONTEND_DIST;
let indexHtml: string | null = null;

app.get("/sitemap.xml", sitemapHandler);
app.use("/api", router);

if (frontendDist && fs.existsSync(path.join(frontendDist, "index.html"))) {
  indexHtml = fs.readFileSync(path.join(frontendDist, "index.html"), "utf8");
  logger.info({ frontendDist }, "Servindo SPA a partir do build de produção do frontend");

  // Monta SEO head antes de servir o HTML para /blog/:slug
  app.use(blogSeoHeadInjection);

  // Assets estáticos (scripts, css, imagens) — não injeta head em binários.
  app.use(
    express.static(frontendDist, {
      index: false, // nunca serve index.html automaticamente (usamos o catch-all)
    }),
  );

  // Catch-all: qualquer rota não coberta pelos assets retorna o index.html
  // (com head de SEO injetado para /blog/*).
  app.use((req: Request, res: Response) => {
    if (req.method !== "GET" && req.method !== "HEAD") {
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

app.get("/sitemap.xml", sitemapHandler);
app.use("/api", router);

export default app;
