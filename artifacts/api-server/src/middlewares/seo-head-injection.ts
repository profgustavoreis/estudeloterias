import { type Request, type Response, type NextFunction } from "express";
import { db, articlesTable } from "@workspace/db";
import type { Article } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Middleware de injeção de SEO no head do HTML do SPA para rotas de blog.
 *
 * Como o SPA em produção é servido como shell estático (serviço "web" separado
 * do "api"), este middleware é exposto aqui de forma reutilizável e toda a lógica
 * de construção de `<head>` fica isolada em funções puras (buildArticleHead /
 * injectHead) para que possa ser chamada por qualquer servidor de HTML — inclusive
 * por um futuro middeware de servir o próprio build do SPA a partir do api-server.
 */

const BASE_URL = "https://estudeloterias.com.br";
export const SITE_NAME = "Estude Loterias";

// A mongoose ao selecionar campos não é necessária (usamos $inferSelect),
// mas evitamos carregar colunas pesadas desnecessariamente.
export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const [artigo] = await db
    .select()
    .from(articlesTable)
    .where(and(eq(articlesTable.slug, slug), eq(articlesTable.status, "published")))
    .limit(1);
  return artigo ?? null;
}

/** Escapa caracteres que quebrariam o atributo/HTML. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Detecta se um artigo é "time-sensitive" (noticioso / de o retifico de concurso/prêmio)
 * para escolher entre schema.org BlogPosting e NewsArticle.
 * Heurística: slug começando com <modalidade>-<concurso> ou tags/termos-chave.
 */
export function isTimeSensitiveArticle(artigo: Article): boolean {
  const slug = artigo.slug?.toLowerCase() ?? "";
  const title = artigo.title?.toLowerCase() ?? "";
  const tags = (artigo.tags ?? []).join(" ").toLowerCase();
  const haystack = `${slug} ${title} ${tags}`;

  if (/^[a-z-]{3,}?-(\d{2,4})(-|$)/.test(slug)) {
    return true;
  }

  const newsMarkers = [
    "premio de r$",
    "premio acumulado",
    "premio estimado",
    "vence hoje",
    "hoje",
    "resultado do concurso",
    "aguardando sorteio",
    "sorteio",
    "ultima",
    "noticia",
    "acumulou",
    "acontecimento",
    "saiu o resultado",
  ];
  return newsMarkers.some((m) => haystack.includes(m));
}

function formatDate(dateStr: string | Date | null | undefined): string | undefined {
  if (!dateStr) return undefined;
  const d = dateStr instanceof Date ? dateStr : new Date(dateStr);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

interface HeadParts {
  title: string;
  description: string;
  canonicalUrl: string;
  type: "article" | "website";
  articleType: "BlogPosting" | "NewsArticle";
  publishedAt?: string;
  modifiedAt?: string;
  imageUrl?: string;
}

export function buildArticleHeadParts(artigo: Article): HeadParts {
  const title = (artigo.seoTitle || artigo.title || "").slice(0, 60);
  const description =
    (artigo.seoDescription || artigo.excerpt || "").slice(0, 155);
  const canonicalUrl = `${BASE_URL}/blog/${encodeURIComponent(artigo.slug)}`;
  const type = "article";
  const articleType = isTimeSensitiveArticle(artigo) ? "NewsArticle" : "BlogPosting";
  const publishedAt = formatDate(artigo.publishedAt ?? artigo.createdAt);
  const modifiedAt = formatDate(artigo.updatedAt ?? artigo.publishedAt ?? artigo.createdAt);
  const imageUrl = artigo.coverImageUrl ?? undefined;

  return {
    title,
    description,
    canonicalUrl,
    type,
    articleType,
    publishedAt,
    modifiedAt,
    imageUrl,
  };
}

/** Constrói o bloco `<head>` HTML a ser injetado. */
export function buildArticleHead(artigo: Article): string {
  const p = buildArticleHeadParts(artigo);
  const fullTitle = `${escapeHtml(p.title)} | ${SITE_NAME}`;

  const authorName = escapeHtml(artigo.author || "Equipe Estude Loterias");

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": p.articleType,
    headline: artigo.title,
    description: p.description,
    ...(p.imageUrl ? { image: [p.imageUrl] } : {}),
    ...(p.publishedAt ? { datePublished: p.publishedAt } : {}),
    ...(p.modifiedAt ? { dateModified: p.modifiedAt } : {}),
    author: { "@type": "Person", name: artigo.author || "Equipe Estude Loterias" },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: BASE_URL,
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": p.canonicalUrl },
  };

  return [
    `    <title>${fullTitle}</title>`,
    `    <meta name="description" content="${escapeHtml(p.description)}" />`,
    `    <meta name="robots" content="index, follow" />`,
    `    <link rel="canonical" href="${p.canonicalUrl}" />`,
    `    <meta property="og:type" content="article" />`,
    `    <meta property="og:url" content="${p.canonicalUrl}" />`,
    `    <meta property="og:title" content="${escapeHtml(p.title)}" />`,
    `    <meta property="og:description" content="${escapeHtml(p.description)}" />`,
    p.imageUrl ? `    <meta property="og:image" content="${escapeHtml(p.imageUrl)}" />` : "",
    ...(p.publishedAt ? [`    <meta property="article:published_time" content="${p.publishedAt}" />`] : []),
    ...(p.modifiedAt ? [`    <meta property="article:modified_time" content="${p.modifiedAt}" />`] : []),
    `    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`,
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Injeta o bloco de cabeçalho no HTML antes do fechamento do `<head>`.
 * Remove os elementos SEO genéricos do shell (title, description, canonical,
 * og:type/og:url/og:title/og:description, JSON-LD solto) que apontariam para a
 * homepage, evitando canônica/E-título duplicada — antes de inserir o do artigo
 * que prevalece (é o último a aparecer no documento).
 */
export function injectHead(html: string, head: string): string {
  // Remove título genérico do shell (caso exista dentro do <head>).
  let out = html.replace(/<title[^>]*>[\s\S]*?<\/title>/i, "");
  // Remove canonical genérica da home.
  out = out.replace(/<link[^>]*rel=["']canonical["'][^>]*>/gi, "");
  // Remove meta description genérica.
  out = out.replace(/<meta[^>]*name=["']description["'][^>]*>/gi, "");
  // Remove og:type / og:url / og:title / og:description genéricos.
  out = out.replace(/<meta[^>]*property=["']og:(?:url|title|description)["'][^>]*>/gi, "");
  // Remove JSON-LD genérico (bloco <script type="application/ld+json">).
  out = out.replace(/<script[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, "");

  return out.replace(/<\/head>/i, `${head}\n    </head>`);
}

/**
 * Middleware Express que, para rotas `/blog/:slug`, busca o artigo no banco,
 * monta o `<head>` com o canonical/og/JSON-LD do artigo e injeta no HTML antes
 * de enviá-lo. Rotas não `/blog` e chamadas que não esperam HTML seguem inalteradas.
 */
export function blogSeoHeadInjection(req: Request, res: Response, next: NextFunction) {
  const match = /^\/blog\/([^/?#]+)/.exec(req.path);
  if (!match) {
    next();
    return;
  }
  const slug = decodeURIComponent(match[1]);

  getArticleBySlug(slug)
    .then((artigo) => {
      if (!artigo) {
        next();
        return;
      }
      const head = buildArticleHead(artigo);
      res.locals.articleSeoHead = head;
      res.locals.articleCanonical = `${BASE_URL}/blog/${encodeURIComponent(artigo.slug)}`;
      next();
    })
    .catch(() => next());
}

/** Aplica a injeção sobre uma resposta HTML já lida de `index.html`. */
export function injectHeadFromLocals(html: string, req: Request): { html: string; changed: boolean } {
  const head = req.res?.locals.articleSeoHead || "";
  if (!head) return { html, changed: false };
  return { html: injectHead(html, head), changed: true };
}