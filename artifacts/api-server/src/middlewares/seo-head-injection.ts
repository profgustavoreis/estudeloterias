import { type Request, type Response, type NextFunction } from "express";
import { db, articlesTable, blogRedirectsTable, lotteryResultsTable } from "@workspace/db";
import type { Article } from "@workspace/db/schema";
import { eq, and, max } from "drizzle-orm";
import {
  buildSpecialEditionFallback,
  buildSpecialEditionJsonLd,
  buildSpecialEditionSeo,
  serializeSpecialEditionJsonLd,
  type SpecialEditionFacts,
} from "@workspace/seo-special-editions";
import { resolveSpecialEdition } from "../services/special-editions";
import { getTodaySaoPaulo } from "../lib/sampa-date";
import { MODALIDADES_CONFIG, type ModalityConfig } from "../lib/modalidades";
import { logger } from "../lib/logger";
import {
  isConcursoIndexable,
  parseConcursoPath,
  type IndexingDecision,
} from "../services/indexing-policy";

/**
 * Middleware de injeção de SEO no head do HTML do SPA para todas as rotas
 * (concursos de loterias, hubs, estatísticas, institucionais e blog).
 *
 * Como o SPA em produção é servido como shell estático via catch-all do Express,
 * este módulo provê a resolução dinâmica de <link rel="canonical">, <title>,
 * <meta name="description">, OpenGraph e Twitter tags de acordo com a rota
 * solicitada, evitando que o Googlebot veja a home como canonical fixa em todas as páginas.
 *
 * A partir da remediação de indexação, este módulo também resolve o **status
 * HTTP** (soft-404 real) e o `X-Robots-Tag` das páginas de concurso, usando a
 * régua única de `services/indexing-policy.ts`.
 */

const BASE_URL = "https://estudeloterias.com.br";
export const SITE_NAME = "Estude Loterias";

interface ConcursoInfo {
  data: string;
  dezenas: string[];
}

/** TTL do cache de linha de concurso: positivo 24h, negativo 60s. */
const CONCURSO_CACHE_POSITIVE_TTL_MS = 24 * 60 * 60 * 1000;
const CONCURSO_CACHE_NEGATIVE_TTL_MS = 60 * 1000;
const MAX_CONCURSO_CACHE = 10000;

interface ConcursoCacheEntry {
  value: ConcursoInfo | null;
  expiresAt: number;
}

const concursoCache = new Map<string, ConcursoCacheEntry>();

/**
 * Linha do concurso no espelho local.
 *
 * `null` significa "linha ausente" e é cacheado por apenas 60s (evita o cache
 * negativo eterno de concursos ainda não sorteados). Erro de DB é **propagado**
 * para o chamador decidir o fail-open; falhas não são cacheadas.
 */
export async function getConcursoInfo(dbName: string, concurso: number): Promise<ConcursoInfo | null> {
  const cacheKey = `${dbName}:${concurso}`;
  const cached = concursoCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const [row] = await db
    .select({
      data: lotteryResultsTable.data,
      dezenas: lotteryResultsTable.dezenas,
    })
    .from(lotteryResultsTable)
    .where(
      and(
        eq(lotteryResultsTable.modalidade, dbName),
        eq(lotteryResultsTable.concurso, concurso),
      ),
    )
    .limit(1);

  const info: ConcursoInfo | null = row
    ? {
        data: row.data,
        dezenas: Array.isArray(row.dezenas) ? (row.dezenas as string[]) : [],
      }
    : null;

  if (concursoCache.size >= MAX_CONCURSO_CACHE) {
    const keysToDelete = Array.from(concursoCache.keys()).slice(0, 100);
    for (const k of keysToDelete) concursoCache.delete(k);
  }
  concursoCache.set(cacheKey, {
    value: info,
    expiresAt:
      Date.now() + (info ? CONCURSO_CACHE_POSITIVE_TTL_MS : CONCURSO_CACHE_NEGATIVE_TTL_MS),
  });
  return info;
}

/**
 * Cache TTL do último concurso conhecido por modalidade. Usado para montar o
 * grafo de links internos no HTML inicial (anterior/próximo/recentes) sem
 * rodar um `MAX(concurso)` a cada request. 5 minutos é suficiente: o concurso
 * mais recente só muda em janelas de sorteio.
 */
const LATEST_CONCURSO_TTL_MS = 5 * 60 * 1000;
const LATEST_CONCURSO_FAILURE_TTL_MS = 30 * 1000;
const latestConcursoCache = new Map<string, { value: number | null; expiresAt: number }>();

/** Último concurso conhecido no DB para a modalidade (id do DB, ex.: "megasena"). */
export async function getLatestConcurso(dbName: string): Promise<number | null> {
  const cached = latestConcursoCache.get(dbName);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  try {
    const [row] = await db
      .select({ maxConcurso: max(lotteryResultsTable.concurso) })
      .from(lotteryResultsTable)
      .where(eq(lotteryResultsTable.modalidade, dbName));

    const value = row?.maxConcurso ?? null;
    latestConcursoCache.set(dbName, {
      value,
      expiresAt: Date.now() + LATEST_CONCURSO_TTL_MS,
    });
    return value;
  } catch {
    // Falha de DB: degrada sem o nav e cacheia negativamente por pouco tempo
    // (evita martelar o banco em um pico de falhas), preservando um valor
    // eventualmente já conhecido.
    latestConcursoCache.set(dbName, {
      value: cached?.value ?? null,
      expiresAt: Date.now() + LATEST_CONCURSO_FAILURE_TTL_MS,
    });
    return cached?.value ?? null;
  }
}

/**
 * Resultado da resolução de SEO de uma rota: o head HTML e, quando a rota
 * exige, status HTTP e `X-Robots-Tag` (soft-404 e régua de indexação).
 */
export interface SeoHeadInjection {
  head: string;
  /** Status HTTP da resposta (default 200). */
  status?: number;
  /** Valor do header `X-Robots-Tag` (ausente = header não é enviado). */
  robotsHeader?: string;
}

export type SeoHeadResult = SeoHeadInjection | { redirect: string };

export type ConcursoResolution =
  | { kind: "found"; latest: number; info: ConcursoInfo; decision: IndexingDecision }
  | { kind: "grace"; latest: number }
  | { kind: "missing"; latest: number }
  | { kind: "invalid"; latest: number }
  | { kind: "unavailable" };

/**
 * Resolve a situação de um concurso contra o espelho local:
 *
 *   - `latest` indisponível (DB fora do ar)  -> fail-open (200 index);
 *   - `c < 1` ou `c > max + 1`               -> inválido (404);
 *   - linha existe                           -> régua de indexação decide;
 *   - `c === max + 1` sem linha              -> grace de sorteio (200 noindex);
 *   - `1 <= c <= max` sem linha              -> lacuna real (404).
 *
 * `latest` vem de `getLatestConcurso` (TTL 5 min) e a linha de
 * `getConcursoInfo` (positivo 24h, negativo 60s). Falha de DB na consulta da
 * linha também faz fail-open, com log.
 */
export async function resolveConcurso(
  mod: ModalityConfig,
  concurso: number,
): Promise<ConcursoResolution> {
  const latest = await getLatestConcurso(mod.dbName);
  if (latest === null) {
    logger.warn(
      { mod: mod.slug, concurso },
      "SEO concurso: último concurso indisponível; fail-open (200 index, follow)",
    );
    return { kind: "unavailable" };
  }

  // Fora do intervalo plausível nem consulta o DB (inclui números absurdos).
  if (!Number.isFinite(concurso) || concurso < 1 || concurso > latest + 1) {
    return { kind: "invalid", latest };
  }

  let info: ConcursoInfo | null;
  try {
    info = await getConcursoInfo(mod.dbName, concurso);
  } catch (err) {
    logger.error(
      { err, mod: mod.slug, concurso },
      "SEO concurso: falha ao consultar o DB; fail-open (200 index, follow)",
    );
    return { kind: "unavailable" };
  }

  if (info) {
    return {
      kind: "found",
      latest,
      info,
      decision: isConcursoIndexable({
        modSlug: mod.slug,
        concurso,
        drawDate: info.data,
      }),
    };
  }

  if (concurso === latest + 1) return { kind: "grace", latest };
  return { kind: "missing", latest };
}

/** Head de resultado com dezenas reais; `robots` vem da régua. */
function buildConcursoResultHead(
  mod: ModalityConfig,
  concurso: number,
  info: ConcursoInfo,
  canonicalUrl: string,
  robots: string,
): string {
  const dezenasStr = info.dezenas.join(", ");
  const title = `Resultado ${mod.article} | Concurso ${concurso} (${info.data}) | ${SITE_NAME}`;
  const description =
    mod.slug === "duplasena"
      ? `Dezenas sorteadas no concurso ${concurso} da Dupla Sena em ${info.data}: ${dezenasStr} (1º sorteio). Confira também o 2º sorteio e estatísticas completas.`
      : `Dezenas sorteadas no concurso ${concurso} ${mod.article} em ${info.data}: ${dezenasStr}. Confira prêmios e estatísticas completas.`;

  return buildHeadTags({ title, description, canonicalUrl, robots });
}

/**
 * Head de concurso ainda sem linha no DB: usado na grace de sorteio
 * (`max + 1`, noindex) e no fail-open (índice disponível mas DB fora, index).
 */
function buildConcursoPendingHead(
  mod: ModalityConfig,
  concurso: number,
  canonicalUrl: string,
  robots: string,
): string {
  return buildHeadTags({
    title: `Resultado ${mod.article} | Concurso ${concurso} | ${SITE_NAME}`,
    description: `Confira o resultado do concurso ${concurso} ${mod.article}, dezenas sorteadas, rateio de prêmios e estatísticas completas.`,
    canonicalUrl,
    robots,
  });
}

/** Head do soft-404: concurso inexistente ou lacuna interna, sempre noindex. */
function buildConcursoNotFoundHead(
  mod: ModalityConfig,
  concurso: number,
  canonicalUrl: string,
): string {
  return buildHeadTags({
    title: `Concurso ${concurso} não encontrado | ${mod.name} | ${SITE_NAME}`,
    description: `O concurso ${concurso} ${mod.article} não existe ou não foi publicado. Confira os resultados disponíveis no Estude Loterias.`,
    canonicalUrl,
    robots: "noindex, follow",
  });
}

/** Resolve head + status + `X-Robots-Tag` de `/:modalidade/resultado/:concurso`. */
async function resolveConcursoHead(
  mod: ModalityConfig,
  concurso: number,
  canonicalUrl: string,
): Promise<SeoHeadInjection> {
  const resolution = await resolveConcurso(mod, concurso);

  switch (resolution.kind) {
    case "invalid":
    case "missing":
      return {
        head: buildConcursoNotFoundHead(mod, concurso, canonicalUrl),
        status: 404,
        robotsHeader: "noindex, follow",
      };

    case "grace":
      return {
        head: buildConcursoPendingHead(mod, concurso, canonicalUrl, "noindex, follow"),
        status: 200,
        robotsHeader: "noindex, follow",
      };

    case "unavailable":
      return {
        head: buildConcursoPendingHead(mod, concurso, canonicalUrl, "index, follow"),
        status: 200,
        robotsHeader: "index, follow",
      };

    case "found": {
      const robots = resolution.decision.indexable ? "index, follow" : "noindex, follow";
      return {
        head: buildConcursoResultHead(mod, concurso, resolution.info, canonicalUrl, robots),
        status: 200,
        robotsHeader: robots,
      };
    }
  }
}

export function normalizeRoutePath(rawPath: string): string {
  let p = rawPath.split("?")[0]?.split("#")[0] ?? "/";
  p = p.replace(/\/+/g, "/");
  if (p.length > 1 && p.endsWith("/")) {
    p = p.slice(0, -1);
  }
  return p;
}

export interface HeadTagsOptions {
  title: string;
  description: string;
  canonicalUrl: string;
  robots?: string;
  ogType?: "website" | "article";
  imageUrl?: string;
  extraTags?: string[];
}

export function buildHeadTags({
  title,
  description,
  canonicalUrl,
  robots = "index, follow",
  ogType = "website",
  imageUrl = `${BASE_URL}/opengraph.jpg`,
  extraTags = [],
}: HeadTagsOptions): string {
  const safeTitle = escapeHtml(title);
  const safeDesc = escapeHtml(description);
  const safeCanonical = escapeHtml(canonicalUrl);
  const safeImage = escapeHtml(imageUrl);

  const tags = [
    `    <title>${safeTitle}</title>`,
    `    <meta name="description" content="${safeDesc}" />`,
    `    <meta name="robots" content="${escapeHtml(robots)}" />`,
    `    <link rel="canonical" href="${safeCanonical}" />`,
    `    <meta property="og:type" content="${ogType}" />`,
    `    <meta property="og:url" content="${safeCanonical}" />`,
    `    <meta property="og:title" content="${safeTitle}" />`,
    `    <meta property="og:description" content="${safeDesc}" />`,
    `    <meta property="og:site_name" content="${SITE_NAME}" />`,
    `    <meta property="og:locale" content="pt_BR" />`,
    `    <meta property="og:image" content="${safeImage}" />`,
    `    <meta name="twitter:card" content="summary_large_image" />`,
    `    <meta name="twitter:title" content="${safeTitle}" />`,
    `    <meta name="twitter:description" content="${safeDesc}" />`,
    `    <meta name="twitter:image" content="${safeImage}" />`,
    ...extraTags,
  ];

  return tags.filter(Boolean).join("\n");
}

/**
 * `<head>` para rotas inválidas do SPA (HTTP 404 real). Mantém o canonical do
 * caminho acessado (o catch-all já não deixa a home como canônica), mas marca
 * explicitamente como `noindex, nofollow` — reforçado pelo header
 * `X-Robots-Tag` enviado junto da resposta 404.
 */
export function buildNotFoundHead(reqPath: string): string {
  const p = normalizeRoutePath(reqPath);
  return buildHeadTags({
    title: `Página não encontrada | ${SITE_NAME}`,
    description: "A página que você procura não existe ou foi movida no Estude Loterias.",
    canonicalUrl: `${BASE_URL}${p === "" ? "/" : p}`,
    robots: "noindex, nofollow",
  });
}

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

/** Constrói o bloco `<head>` HTML a ser injetado para artigos do blog. */
export function buildArticleHead(artigo: Article): string {
  const p = buildArticleHeadParts(artigo);
  const fullTitle = `${escapeHtml(p.title)} | ${SITE_NAME}`;

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
    `    <meta property="og:site_name" content="${SITE_NAME}" />`,
    `    <meta property="og:locale" content="pt_BR" />`,
    p.imageUrl ? `    <meta property="og:image" content="${escapeHtml(p.imageUrl)}" />` : "",
    `    <meta name="twitter:card" content="summary_large_image" />`,
    `    <meta name="twitter:title" content="${escapeHtml(p.title)}" />`,
    `    <meta name="twitter:description" content="${escapeHtml(p.description)}" />`,
    p.imageUrl ? `    <meta name="twitter:image" content="${escapeHtml(p.imageUrl)}" />` : "",
    ...(p.publishedAt ? [`    <meta property="article:published_time" content="${p.publishedAt}" />`] : []),
    ...(p.modifiedAt ? [`    <meta property="article:modified_time" content="${p.modifiedAt}" />`] : []),
    `    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`,
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Constrói o `<head>` para a lista de artigos (/blog), com canonical/título/
 * og próprios em vez de herdar o metadata da homepage.
 */
export function buildBlogIndexHead(): string {
  const title = `Blog | Análises, Dicas e Estatísticas de Loterias | ${SITE_NAME}`;
  const description =
    "Artigos, análises e estatísticas sobre as loterias da Caixa: probabilidades, estratégias, resultados e curiosidades da Mega-Sena, Lotofácil, Quina e mais.";

  return buildHeadTags({
    title,
    description,
    canonicalUrl: `${BASE_URL}/blog`,
  });
}

/**
 * Configuração das páginas de edições especiais. `modalidade` é o que
 * `resolveSpecialEdition` espera; `nome`/`slug` alimentam o fallback atemporal
 * específico da modalidade (o mesmo que o cliente monta).
 */
interface SpecialEditionRouteConfig {
  modalidade: string;
  nome: string;
  slug: string;
}

const SPECIAL_EDITION_ROUTES: Record<string, SpecialEditionRouteConfig> = {
  "/mega-sena/mega-da-virada": {
    modalidade: "mega-sena",
    nome: "Mega da Virada",
    slug: "/mega-sena/mega-da-virada",
  },
  "/lotofacil/lotofacil-da-independencia": {
    modalidade: "lotofacil",
    nome: "Lotofácil da Independência",
    slug: "/lotofacil/lotofacil-da-independencia",
  },
  "/quina/quina-de-sao-joao": {
    modalidade: "quina",
    nome: "Quina de São João",
    slug: "/quina/quina-de-sao-joao",
  },
  "/duplasena/dupla-de-pascoa": {
    modalidade: "duplasena",
    nome: "Dupla de Páscoa",
    slug: "/duplasena/dupla-de-pascoa",
  },
};

/**
 * Fatos-base (sem payload) para o fallback atemporal — mesma forma que o cliente
 * monta via `specialEditionBaseFacts`, garantindo convergência SSR×cliente quando
 * `resolveSpecialEdition` falha/retorna null.
 */
function buildSpecialEditionBaseFacts(
  route: SpecialEditionRouteConfig,
): SpecialEditionFacts {
  return {
    modalidade: route.modalidade,
    slug: route.slug,
    nome: route.nome,
    anoProximaEdicao: getTodaySaoPaulo().year,
    ultimaEdicao: null,
    proximaEdicao: null,
    fase: "proxima",
  };
}

/**
 * `<head>` orientado a dados para as páginas de edições especiais (Mega da Virada,
 * Lotofácil da Independência, Quina de São João e Dupla de Páscoa).
 *
 * Título/descrição: **atemporais** (sem ano/fase) por decisão editorial — estas
 * páginas são arquivos permanentes. `buildSpecialEditionSeo` devolve o texto
 * atemporal da modalidade; se o serviço falhar/retornar null, usamos
 * `buildSpecialEditionFallback` com os fatos-base, resultando no mesmo texto.
 * O destaque de "última/próxima edição" é feito no corpo da página, não no head.
 *
 * JSON-LD (`@graph`: Organization/WebSite/WebPage/BreadcrumbList): injetado pelos
 * `extraTags` de `buildHeadTags` (mesmo mecanismo do head dos artigos). O
 * `dateModified` é a data atual do servidor em America/Sao_Paulo (`hoje`), nunca
 * futura; `serializeSpecialEditionJsonLd` escapa `<` para não quebrar o `<script>`.
 * No fallback não há JSON-LD (o cliente também não emite LD nesse path).
 */
async function buildSpecialEditionHead(
  route: SpecialEditionRouteConfig,
  canonicalUrl: string,
): Promise<string> {
  let facts: SpecialEditionFacts | null = null;
  try {
    facts = await resolveSpecialEdition(route.modalidade);
  } catch {
    facts = null;
  }

  const { title, description } = facts
    ? buildSpecialEditionSeo(facts)
    : buildSpecialEditionFallback(buildSpecialEditionBaseFacts(route));

  const extraTags: string[] = [];
  if (facts) {
    const { year, month, day } = getTodaySaoPaulo();
    const hoje = new Date(year, month - 1, day);
    const jsonLd = buildSpecialEditionJsonLd(facts, canonicalUrl, { hoje });
    extraTags.push(
      `    <script type="application/ld+json">${serializeSpecialEditionJsonLd(jsonLd)}</script>`,
    );
  }

  return buildHeadTags({
    title: `${title} | ${SITE_NAME}`,
    description,
    canonicalUrl,
    extraTags,
  });
}

/**
 * Resolve o bloco de tags `<head>` das rotas "estáticas" do site (home, blog,
 * institucionais, edições especiais, hubs e ferramentas). Páginas de concurso
 * NÃO passam por aqui: elas têm status/robots dinâmicos e são resolvidas em
 * `resolveSeoHead`.
 */
async function resolveSiteSeoHead(reqPath: string): Promise<string | { redirect: string }> {
  const p = normalizeRoutePath(reqPath);
  const canonicalUrl = `${BASE_URL}${p === "" ? "/" : p}`;

  // 1. Home
  if (p === "/" || p === "") {
    return buildHeadTags({
      title: `Estude Loterias | Estatísticas das Loterias da Caixa`,
      description:
        "Estatísticas completas, histórico de resultados, frequência de dezenas e ferramentas para análise das loterias da Caixa: Mega-Sena, Lotofácil, Quina e mais.",
      canonicalUrl: `${BASE_URL}/`,
    });
  }

  // 2. Admin
  if (p.startsWith("/admin")) {
    return buildHeadTags({
      title: `Painel Administrativo | ${SITE_NAME}`,
      description: "Área administrativa do Estude Loterias.",
      canonicalUrl: `${BASE_URL}/admin`,
      robots: "noindex, nofollow",
    });
  }

  // 3. Blog
  if (p === "/blog") {
    return buildBlogIndexHead();
  }

  if (p.startsWith("/blog/")) {
    const rawSlug = p.slice("/blog/".length);
    let slug = rawSlug;
    try {
      slug = decodeURIComponent(rawSlug);
    } catch {
      slug = rawSlug;
    }

    const artigo = await getArticleBySlug(slug);
    if (artigo) {
      return buildArticleHead(artigo);
    }

    // Procura na tabela de redirects 301
    try {
      const [redir] = await db
        .select({ toSlug: blogRedirectsTable.toSlug })
        .from(blogRedirectsTable)
        .where(eq(blogRedirectsTable.fromSlug, slug))
        .limit(1);

      if (redir) {
        return { redirect: `${BASE_URL}/blog/${encodeURIComponent(redir.toSlug)}` };
      }
    } catch {
      // Falha silenciosa no redirect
    }

    return buildHeadTags({
      title: `Artigo não encontrado | ${SITE_NAME}`,
      description: "Artigo não encontrado no blog do Estude Loterias.",
      canonicalUrl: `${BASE_URL}/blog`,
      robots: "noindex, follow",
    });
  }

  // 4. Páginas institucionais
  if (p === "/sobre") {
    return buildHeadTags({
      title: `Sobre | Estatísticas e Ferramentas para Loterias da Caixa | ${SITE_NAME}`,
      description:
        "Conheça o Estude Loterias: o site com estatísticas, resultados e ferramentas gratuitas para as loterias da Caixa Econômica Federal.",
      canonicalUrl,
    });
  }

  if (p === "/privacidade") {
    return buildHeadTags({
      title: `Política de Privacidade | ${SITE_NAME}`,
      description:
        "Política de Privacidade do Estude Loterias: saiba como coletamos, usamos e protegemos seus dados pessoais, em conformidade com a LGPD.",
      canonicalUrl,
    });
  }

  if (p === "/termos") {
    return buildHeadTags({
      title: `Termos de Uso | ${SITE_NAME}`,
      description:
        "Termos de Uso do Estude Loterias. Leia as condições de uso do site de estatísticas e ferramentas para loterias da Caixa.",
      canonicalUrl,
    });
  }

  if (p === "/parceiros") {
    return buildHeadTags({
      title: `Parceiros e como ganhamos dinheiro | ${SITE_NAME}`,
      description:
        "Conheça os parceiros do Estude Loterias e como o site se mantém com links de afiliado. Transparência sobre a relação comercial, sem vínculo com a CAIXA.",
      canonicalUrl,
    });
  }

  if (p === "/contato") {
    return buildHeadTags({
      title: `Contato | ${SITE_NAME}`,
      description:
        "Entre em contato com o Estude Loterias. Reporte erros, envie sugestões ou faça solicitações relacionadas à privacidade (LGPD).",
      canonicalUrl,
    });
  }

  // 5. Páginas especiais de loterias — head orientado a dados + JSON-LD
  const specialEditionRoute = SPECIAL_EDITION_ROUTES[p];
  if (specialEditionRoute) {
    return buildSpecialEditionHead(specialEditionRoute, canonicalUrl);
  }

  // 6. Rotas por modalidade de loteria
  const matchMod = /^\/([a-z-]+)(\/.*)?$/.exec(p);
  if (matchMod) {
    const modSlug = matchMod[1];
    const rest = matchMod[2] ?? "";
    const mod = MODALIDADES_CONFIG[modSlug];

    if (mod) {
      // Hub principal da loteria: /mega-sena, /lotofacil, etc.
      if (rest === "") {
        return buildHeadTags({
          title: `${mod.name} | Resultados, Estatísticas e Ferramentas | ${SITE_NAME}`,
          description: `Tudo sobre a ${mod.name}: último resultado, histórico de concursos, frequência das dezenas, gerador de apostas, simulador e muito mais.`,
          canonicalUrl,
        });
      }

      // O path /:modalidade/resultado/:concurso é resolvido por
      // `resolveSeoHead` (status HTTP + régua de indexação) antes de chegar
      // aqui; este fallback nunca o alcança com modalidade conhecida.

      // Último resultado: /:modalidade/resultado
      if (rest === "/resultado") {
        return buildHeadTags({
          title: `Último Resultado ${mod.article} | ${SITE_NAME}`,
          description: `Confira o último resultado ${mod.article}, dezenas sorteadas, premiação, ganhadores e estatísticas completas.`,
          canonicalUrl,
        });
      }

      // Resultados anteriores: /:modalidade/resultados
      if (rest === "/resultados") {
        return buildHeadTags({
          title: `Todos os Resultados ${mod.article} | ${SITE_NAME}`,
          description: `Consulte o histórico completo de todos os resultados ${mod.article}. Filtre por ano, veja dezenas sorteadas e prêmios de cada concurso.`,
          canonicalUrl,
        });
      }

      // Tabela de dezenas: /:modalidade/tabela-de-dezenas
      if (rest === "/tabela-de-dezenas") {
        return buildHeadTags({
          title: `Tabela de Dezenas ${mod.article} | Frequência e Atraso | ${SITE_NAME}`,
          description: `Ranking completo das dezenas ${mod.article}: veja as mais e menos sorteadas, as mais atrasadas e a frequência histórica de cada número.`,
          canonicalUrl,
        });
      }

      // Resumo estatístico: /:modalidade/resumo-estatistico
      if (rest === "/resumo-estatistico") {
        const isSuperSete = mod.slug === "super-sete";
        return buildHeadTags({
          title: `Resumo Estatístico ${mod.article} | Frequência e Análise ${isSuperSete ? "dos Números" : "das Dezenas"} | ${SITE_NAME}`,
          description: isSuperSete
            ? `Análise estatística completa da Super Sete: números mais e menos sorteados por posição, pares, somas, números especiais e muito mais baseado em todo o histórico de concursos.`
            : `Análise estatística completa ${mod.article}: dezenas mais e menos sorteadas, pares, sequências, somas e muito mais baseado em todo o histórico de concursos.`,
          canonicalUrl,
        });
      }

      // Gerador: /:modalidade/gerador
      if (rest === "/gerador") {
        return buildHeadTags({
          title: `Gerador de Jogos ${mod.article} | ${SITE_NAME}`,
          description: `Gere apostas aleatórias para a ${mod.name} escolhendo quantos jogos e quantas dezenas por jogo. Surpresinha inteligente e gratuita.`,
          canonicalUrl,
        });
      }

      // Simulador: /:modalidade/simulador
      if (rest === "/simulador") {
        return buildHeadTags({
          title: `Simulador Histórico ${mod.article} | Teste sua Aposta no Histórico | ${SITE_NAME}`,
          description: `Escolha suas dezenas e descubra em quantos sorteios ${mod.article} você teria ganhado. Simulador histórico gratuito e completo.`,
          canonicalUrl,
        });
      }

      // Conferidor: /:modalidade/conferidor
      if (rest === "/conferidor") {
        return buildHeadTags({
          title: `Conferidor de Apostas ${mod.article} | ${SITE_NAME}`,
          description: `Confira se sua aposta ${mod.article} ganhou! Escolha suas dezenas, selecione o concurso e veja seus acertos, apostas múltiplas e o prêmio correspondente.`,
          canonicalUrl,
        });
      }

      // Como Jogar: /:modalidade/como-jogar
      if (rest === "/como-jogar") {
        return buildHeadTags({
          title: `Como Jogar ${mod.in} | ${SITE_NAME}`,
          description: `Saiba como funciona a ${mod.name}: regras, formas de apostar, valores, dias de sorteio e tudo que você precisa para fazer sua aposta.`,
          canonicalUrl,
        });
      }

      // Premiação: /:modalidade/premiacao
      if (rest === "/premiacao") {
        return buildHeadTags({
          title: `Premiação ${mod.article} | Faixas e Distribuição de Prêmios | ${SITE_NAME}`,
          description: `Entenda como o prêmio ${mod.article} é distribuído entre as faixas de acertos, incluindo percentuais e regras de acumulação.`,
          canonicalUrl,
        });
      }

      // FAQ: /:modalidade/perguntas-frequentes
      if (rest === "/perguntas-frequentes") {
        return buildHeadTags({
          title: `Perguntas Frequentes sobre a ${mod.name} | ${SITE_NAME}`,
          description: `Respostas às dúvidas mais comuns sobre a ${mod.name}: prazo para resgatar prêmios, bolão, apostas online e muito mais.`,
          canonicalUrl,
        });
      }
    }
  }

  // 7. Fallback genérico para rotas não mapeadas:
  // Garante SEMPRE a canônica correspondente ao caminho acessado, nunca a home!
  return buildHeadTags({
    title: `Estude Loterias | Estatísticas das Loterias da Caixa`,
    description:
      "Estatísticas completas, histórico de resultados e ferramentas para análise das loterias da Caixa.",
    canonicalUrl,
  });
}

/**
 * Resolve o head de SEO, o status HTTP e o `X-Robots-Tag` de qualquer rota do
 * site. Páginas de concurso com modalidade conhecida passam pela régua de
 * indexação e pelo soft-404; as demais rotas delegam para `resolveSiteSeoHead`.
 */
export async function resolveSeoHead(reqPath: string): Promise<SeoHeadResult> {
  const p = normalizeRoutePath(reqPath);
  const concursoPath = parseConcursoPath(p);
  const mod = concursoPath ? MODALIDADES_CONFIG[concursoPath.modSlug] : undefined;

  if (concursoPath && mod) {
    const canonicalUrl = `${BASE_URL}${p === "" ? "/" : p}`;
    return resolveConcursoHead(mod, concursoPath.concurso, canonicalUrl);
  }

  const result = await resolveSiteSeoHead(p);
  return typeof result === "string" ? { head: result } : result;
}

/**
 * Injeta o bloco de cabeçalho no HTML antes do fechamento do `<head>`.
 * Remove os elementos SEO genéricos do shell (title, description, canonical,
 * robots, og:*, twitter:*, JSON-LD anterior) antes de inserir os tags novos.
 */
export function injectHead(html: string, head: string): string {
  // Remove título genérico do shell.
  let out = html.replace(/<title[^>]*>[\s\S]*?<\/title>\s*/i, "");
  // Remove canonical genérica.
  out = out.replace(/<link[^>]*rel=["']canonical["'][^>]*>\s*/gi, "");
  // Remove meta description genérica.
  out = out.replace(/<meta[^>]*name=["']description["'][^>]*>\s*/gi, "");
  // Remove robots genérico.
  out = out.replace(/<meta[^>]*name=["']robots["'][^>]*>\s*/gi, "");
  // Remove og:* genéricos.
  out = out.replace(/<meta[^>]*property=["']og:(?:type|url|title|description|site_name|locale|image)["'][^>]*>\s*/gi, "");
  // Remove twitter:* genéricos.
  out = out.replace(/<meta[^>]*name=["']twitter:(?:card|title|description|image)["'][^>]*>\s*/gi, "");
  // Remove JSON-LD genérico apenas se o novo head trouxer JSON-LD (como em artigos).
  if (head.includes('type="application/ld+json"')) {
    out = out.replace(/<script[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>\s*/gi, "");
  }

  // Remove linhas em branco residuais
  out = out.replace(/\n\s*\n\s*\n+/g, "\n\n");

  return out.replace(/<\/head>/i, `${head}\n  </head>`);
}

/** Marcador que identifica o nav SSR injetado dentro de `#root` (idempotência). */
const SSR_BODY_LINKS_MARKER = 'data-ssr-body-links="1"';

interface BodyNavLink {
  href: string;
  label: string;
}

/** Monta um `<nav>` com links `<a href>` reais, deduplicando por href. */
function buildBodyNav(links: BodyNavLink[], ariaLabel: string): string {
  const seen = new Set<string>();
  const anchors: string[] = [];
  for (const link of links) {
    if (seen.has(link.href)) continue;
    seen.add(link.href);
    anchors.push(`<a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`);
  }
  if (anchors.length === 0) return "";
  return `<nav ${SSR_BODY_LINKS_MARKER} aria-label="${escapeHtml(ariaLabel)}">${anchors.join("")}</nav>`;
}

/**
 * Nav para a página de um concurso: hub, último resultado, lista, anterior e
 * próximo (quando existem) + ~10 concursos recentes. `latest` é o último
 * concurso conhecido no DB (ou null quando indisponível).
 */
export function buildConcursoBodyNav(
  mod: ModalityConfig,
  concurso: number,
  latest: number | null,
): string {
  const links: BodyNavLink[] = [
    { href: `/${mod.slug}`, label: mod.name },
    { href: `/${mod.slug}/resultado`, label: "Último resultado" },
    { href: `/${mod.slug}/resultados`, label: "Resultados" },
  ];

  if (concurso > 1) {
    links.push({ href: `/${mod.slug}/resultado/${concurso - 1}`, label: "Anterior" });
  }
  if (latest !== null && concurso < latest) {
    links.push({ href: `/${mod.slug}/resultado/${concurso + 1}`, label: "Próximo" });
  }
  if (latest !== null) {
    for (let n = latest; n > latest - 10 && n >= 1; n--) {
      links.push({ href: `/${mod.slug}/resultado/${n}`, label: `Concurso ${n}` });
    }
  }

  return buildBodyNav(links, `Resultados ${mod.article}`);
}

/** Nav para a lista de resultados: hub, último resultado e ~20 concursos recentes. */
export function buildResultadosBodyNav(mod: ModalityConfig, latest: number): string {
  const links: BodyNavLink[] = [
    { href: `/${mod.slug}`, label: mod.name },
    { href: `/${mod.slug}/resultado`, label: "Último resultado" },
  ];
  for (let n = latest; n > latest - 20 && n >= 1; n--) {
    links.push({ href: `/${mod.slug}/resultado/${n}`, label: `Concurso ${n}` });
  }
  return buildBodyNav(links, `Últimos resultados ${mod.article}`);
}

/**
 * Resolve o nav de links internos (SSR) para as páginas de resultado. Retorna
 * string vazia quando a rota não é de resultado/lista, o DB falha ou não há
 * concursos conhecidos: o catch-all segue sem o nav, sem quebrar.
 */
export async function resolveBodyLinks(reqPath: string): Promise<string> {
  const parsed = parseConcursoPath(reqPath);
  if (parsed) {
    const mod = MODALIDADES_CONFIG[parsed.modSlug];
    if (!mod) return "";
    const latest = await getLatestConcurso(mod.dbName);
    return buildConcursoBodyNav(mod, parsed.concurso, latest);
  }

  const listMatch = /^\/([a-z0-9-]+)\/resultados$/.exec(normalizeRoutePath(reqPath).toLowerCase());
  if (listMatch) {
    const mod = MODALIDADES_CONFIG[listMatch[1]];
    if (!mod) return "";
    const latest = await getLatestConcurso(mod.dbName);
    if (latest === null) return "";
    return buildResultadosBodyNav(mod, latest);
  }

  return "";
}

/**
 * Injeta o nav de links internos logo após a abertura de `<div id="root">`.
 * O React usa `createRoot`, então este conteúdo é substituído na primeira
 * renderização (serve ao crawler, não duplica na UI). Idempotente: se o
 * marcador já existir, não injeta de novo.
 */
export function injectBodyLinks(html: string, navHtml: string): string {
  if (!navHtml) return html;
  if (html.includes(SSR_BODY_LINKS_MARKER)) return html;

  const rootTag = /<div[^>]*id=["']root["'][^>]*>/i.exec(html);
  if (!rootTag) return html;

  const insertAt = rootTag.index + rootTag[0].length;
  return `${html.slice(0, insertAt)}${navHtml}${html.slice(insertAt)}`;
}

/**
 * Middleware compatível com o legado: resolve o SEO da rota e guarda head,
 * status e `X-Robots-Tag` em `res.locals` para o catch-all aplicar.
 */
export async function spaSeoHeadInjection(req: Request, res: Response, next: NextFunction) {
  try {
    const seoResult = await resolveSeoHead(req.path);
    if ("redirect" in seoResult) {
      res.redirect(301, seoResult.redirect);
      return;
    }
    res.locals.seoHead = seoResult.head;
    res.locals.articleSeoHead = seoResult.head;
    res.locals.seoStatus = seoResult.status ?? 200;
    res.locals.seoRobotsHeader = seoResult.robotsHeader ?? "";
    next();
  } catch {
    next();
  }
}

/** Export para retrocompatibilidade com chamadas antigas ao blog middleware. */
export const blogSeoHeadInjection = spaSeoHeadInjection;

/** Aplica a injeção sobre uma resposta HTML já lida de `index.html`. */
export function injectHeadFromLocals(html: string, req: Request): { html: string; changed: boolean } {
  const head = req.res?.locals.seoHead || req.res?.locals.articleSeoHead || "";
  if (!head) return { html, changed: false };
  return { html: injectHead(html, head), changed: true };
}
