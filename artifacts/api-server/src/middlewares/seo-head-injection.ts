import { type Request, type Response, type NextFunction } from "express";
import { db, articlesTable, blogRedirectsTable, lotteryResultsTable } from "@workspace/db";
import type { Article } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Middleware de injeção de SEO no head do HTML do SPA para todas as rotas
 * (concursos de loterias, hubs, estatísticas, institucionais e blog).
 *
 * Como o SPA em produção é servido como shell estático via catch-all do Express,
 * este módulo provê a resolução dinâmica de <link rel="canonical">, <title>,
 * <meta name="description">, OpenGraph e Twitter tags de acordo com a rota
 * solicitada, evitando que o Googlebot veja a home como canonical fixa em todas as páginas.
 */

const BASE_URL = "https://estudeloterias.com.br";
export const SITE_NAME = "Estude Loterias";

export interface ModalityConfig {
  slug: string;
  dbName: string;
  name: string;
  article: string;
  in: string;
}

export const MODALIDADES_CONFIG: Record<string, ModalityConfig> = {
  "mega-sena": {
    slug: "mega-sena",
    dbName: "megasena",
    name: "Mega-Sena",
    article: "da Mega-Sena",
    in: "na Mega-Sena",
  },
  "lotofacil": {
    slug: "lotofacil",
    dbName: "lotofacil",
    name: "Lotofácil",
    article: "da Lotofácil",
    in: "na Lotofácil",
  },
  "quina": {
    slug: "quina",
    dbName: "quina",
    name: "Quina",
    article: "da Quina",
    in: "na Quina",
  },
  "lotomania": {
    slug: "lotomania",
    dbName: "lotomania",
    name: "Lotomania",
    article: "da Lotomania",
    in: "na Lotomania",
  },
  "timemania": {
    slug: "timemania",
    dbName: "timemania",
    name: "Timemania",
    article: "da Timemania",
    in: "na Timemania",
  },
  "diadesorte": {
    slug: "diadesorte",
    dbName: "diadesorte",
    name: "Dia de Sorte",
    article: "do Dia de Sorte",
    in: "no Dia de Sorte",
  },
  "duplasena": {
    slug: "duplasena",
    dbName: "duplasena",
    name: "Dupla Sena",
    article: "da Dupla Sena",
    in: "na Dupla Sena",
  },
  "maismilionaria": {
    slug: "maismilionaria",
    dbName: "maismilionaria",
    name: "+Milionária",
    article: "da +Milionária",
    in: "na +Milionária",
  },
  "super-sete": {
    slug: "super-sete",
    dbName: "supersete",
    name: "Super Sete",
    article: "da Super Sete",
    in: "na Super Sete",
  },
};

interface ConcursoInfo {
  data: string;
  dezenas: string[];
}

const concursoCache = new Map<string, ConcursoInfo | null>();
const MAX_CONCURSO_CACHE = 10000;

export async function getConcursoInfo(dbName: string, concurso: number): Promise<ConcursoInfo | null> {
  const cacheKey = `${dbName}:${concurso}`;
  if (concursoCache.has(cacheKey)) {
    return concursoCache.get(cacheKey) ?? null;
  }

  try {
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
    concursoCache.set(cacheKey, info);
    return info;
  } catch {
    return null;
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
  const title = `Blog | ${SITE_NAME}`;
  const description =
    "Artigos, análises e estatísticas sobre as loterias da Caixa: probabilidades, estratégias, resultados e curiosidades da Mega-Sena, Lotofácil, Quina e mais.";

  return buildHeadTags({
    title,
    description,
    canonicalUrl: `${BASE_URL}/blog`,
  });
}

/**
 * Resolve o bloco de tags `<head>` para qualquer rota do site.
 * Retorna uma string de tags HTML ou um objeto `{ redirect: string }` para redirecionamentos 301.
 */
export async function resolveSeoHead(reqPath: string): Promise<string | { redirect: string }> {
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
      title: `Sobre — Estatísticas e Ferramentas para Loterias da Caixa | ${SITE_NAME}`,
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

  if (p === "/contato") {
    return buildHeadTags({
      title: `Contato | ${SITE_NAME}`,
      description:
        "Entre em contato com o Estude Loterias. Reporte erros, envie sugestões ou faça solicitações relacionadas à privacidade (LGPD).",
      canonicalUrl,
    });
  }

  // 5. Páginas especiais de loterias
  if (p === "/mega-sena/mega-da-virada") {
    return buildHeadTags({
      title: `Mega da Virada — Histórico, Resultados e Estatísticas | ${SITE_NAME}`,
      description:
        "Todos os resultados da Mega da Virada desde 2009: dezenas sorteadas, prêmios, ganhadores e estatísticas do sorteio especial de 31 de dezembro.",
      canonicalUrl,
    });
  }

  if (p === "/lotofacil/lotofacil-da-independencia") {
    return buildHeadTags({
      title: `Lotofácil da Independência — Histórico e Estatísticas | ${SITE_NAME}`,
      description:
        "Todos os resultados da Lotofácil da Independência: histórico completo, dezenas mais sorteadas, premiações e estatísticas do sorteio especial.",
      canonicalUrl,
    });
  }

  if (p === "/quina/quina-de-sao-joao") {
    return buildHeadTags({
      title: `Quina de São João — Histórico, Resultados e Estatísticas | ${SITE_NAME}`,
      description:
        "Histórico completo da Quina de São João: resultados de todas as edições, dezenas mais sorteadas, maiores prêmios e estatísticas.",
      canonicalUrl,
    });
  }

  if (p === "/duplasena/dupla-de-pascoa") {
    return buildHeadTags({
      title: `Dupla de Páscoa — Histórico, Resultados e Estatísticas | ${SITE_NAME}`,
      description:
        "Histórico completo da Dupla de Páscoa: resultados de todas as edições, 1º e 2º sorteios, maiores prêmios e estatísticas.",
      canonicalUrl,
    });
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
          title: `${mod.name} — Resultados, Estatísticas e Ferramentas | ${SITE_NAME}`,
          description: `Tudo sobre a ${mod.name}: último resultado, histórico de concursos, frequência das dezenas, gerador de apostas, simulador e muito mais.`,
          canonicalUrl,
        });
      }

      // Concurso específico: /:modalidade/resultado/:concurso
      const concursoMatch = /^\/resultado\/(\d+)$/.exec(rest);
      if (concursoMatch) {
        const concursoNum = parseInt(concursoMatch[1], 10);
        const info = await getConcursoInfo(mod.dbName, concursoNum);

        if (info) {
          const dezenasStr = info.dezenas.join(", ");
          const title = `Resultado ${mod.article} — Concurso ${concursoNum} (${info.data}) | ${SITE_NAME}`;
          const description =
            mod.slug === "duplasena"
              ? `Dezenas sorteadas no concurso ${concursoNum} da Dupla Sena em ${info.data}: ${dezenasStr} (1º sorteio). Confira também o 2º sorteio e estatísticas completas.`
              : `Dezenas sorteadas no concurso ${concursoNum} ${mod.article} em ${info.data}: ${dezenasStr}. Confira prêmios e estatísticas completas.`;

          return buildHeadTags({
            title,
            description,
            canonicalUrl,
          });
        }

        // Concurso não encontrado no banco ou recém-criado
        return buildHeadTags({
          title: `Resultado ${mod.article} — Concurso ${concursoNum} | ${SITE_NAME}`,
          description: `Confira o resultado do concurso ${concursoNum} ${mod.article}, dezenas sorteadas, rateio de prêmios e estatísticas completas.`,
          canonicalUrl,
        });
      }

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
          title: `Tabela de Dezenas ${mod.article} — Frequência e Atraso | ${SITE_NAME}`,
          description: `Ranking completo das dezenas ${mod.article}: veja as mais e menos sorteadas, as mais atrasadas e a frequência histórica de cada número.`,
          canonicalUrl,
        });
      }

      // Resumo estatístico: /:modalidade/resumo-estatistico
      if (rest === "/resumo-estatistico") {
        return buildHeadTags({
          title: `Resumo Estatístico ${mod.article} — Frequência e Análise das Dezenas | ${SITE_NAME}`,
          description: `Análise estatística completa ${mod.article}: dezenas mais e menos sorteadas, pares, sequências, somas e muito mais baseado em todo o histórico de concursos.`,
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
          title: `Simulador Histórico ${mod.article} — Teste sua Aposta no Histórico | ${SITE_NAME}`,
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
          title: `Premiação ${mod.article} — Faixas e Distribuição de Prêmios | ${SITE_NAME}`,
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

/**
 * Middleware compatível com o legado: executa injeção para rotas de blog ou gerais.
 */
export async function spaSeoHeadInjection(req: Request, res: Response, next: NextFunction) {
  try {
    const seoResult = await resolveSeoHead(req.path);
    if (typeof seoResult === "object" && "redirect" in seoResult) {
      res.redirect(301, seoResult.redirect);
      return;
    }
    res.locals.seoHead = seoResult;
    res.locals.articleSeoHead = seoResult;
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
