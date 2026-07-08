import { type Request, type Response } from "express";
import { db } from "@workspace/db";
import { lotteryResultsTable } from "@workspace/db/schema";
import { eq, asc, or } from "drizzle-orm";

const BASE_URL = "https://estudeloterias.com.br";

interface SitemapEntry {
  url: string;
  lastmod?: string;
  changefreq: string;
  priority: string;
}

const MODALIDADES = [
  "megasena",
  "lotofacil",
  "quina",
  "lotomania",
  "timemania",
  "diadesorte",
  "duplasena",
  "maismilionaria",
  "supersete",
] as const;

function slug(modalidade: string): string {
  const slugs: Record<string, string> = {
    megasena: "mega-sena",
    supersete: "super-sete",
  };
  return slugs[modalidade] ?? modalidade;
}

const COMMON_PAGES: Array<{ path: string; changefreq: string; priority: string }> = [
  { path: "",                    changefreq: "daily",   priority: "0.9" },
  { path: "/resultado",          changefreq: "daily",   priority: "0.9" },
  { path: "/resultados",         changefreq: "daily",   priority: "0.8" },
  { path: "/resumo-estatistico", changefreq: "daily",   priority: "0.7" },
  { path: "/tabela-de-dezenas",  changefreq: "daily",   priority: "0.7" },
  { path: "/gerador",            changefreq: "monthly", priority: "0.6" },
  { path: "/simulador",          changefreq: "monthly", priority: "0.6" },
  { path: "/conferidor",         changefreq: "monthly", priority: "0.6" },
  { path: "/como-jogar",         changefreq: "monthly", priority: "0.5" },
  { path: "/premiacao",          changefreq: "monthly", priority: "0.5" },
  { path: "/perguntas-frequentes", changefreq: "monthly", priority: "0.5" },
];

const SPECIAL_PAGES: Record<string, Array<{ path: string; changefreq: string; priority: string }>> = {
  megasena:   [{ path: "/mega-da-virada",           changefreq: "monthly", priority: "0.7" }],
  lotofacil:  [{ path: "/lotofacil-da-independencia", changefreq: "monthly", priority: "0.7" }],
  quina:      [{ path: "/quina-de-sao-joao",        changefreq: "monthly", priority: "0.7" }],
  duplasena:  [{ path: "/dupla-de-pascoa",          changefreq: "monthly", priority: "0.7" }],
};

const INSTITUCIONAL_PAGES: SitemapEntry[] = [
  { url: "/sobre",         changefreq: "monthly", priority: "0.4" },
  { url: "/privacidade",   changefreq: "monthly", priority: "0.3" },
  { url: "/termos",        changefreq: "monthly", priority: "0.3" },
  { url: "/contato",       changefreq: "monthly", priority: "0.3" },
];

function buildStaticPages(): SitemapEntry[] {
  const pages: SitemapEntry[] = [];

  for (const m of MODALIDADES) {
    const s = slug(m);

    for (const cp of COMMON_PAGES) {
      pages.push({ url: `/${s}${cp.path}`, changefreq: cp.changefreq, priority: cp.priority });
    }

    const specials = SPECIAL_PAGES[m];
    if (specials) {
      for (const sp of specials) {
        pages.push({ url: `/${s}${sp.path}`, changefreq: sp.changefreq, priority: sp.priority });
      }
    }
  }

  return pages;
}

const STATIC_PAGES: SitemapEntry[] = [
  { url: "/", changefreq: "daily", priority: "1.0" },
  ...buildStaticPages(),
  ...INSTITUCIONAL_PAGES,
];

function parseDate(ddmmyyyy: string): string {
  const parts = ddmmyyyy.split("/");
  if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
  return new Date().toISOString().split("T")[0]!;
}

function toXmlUrl(entry: SitemapEntry): string {
  return [
    "  <url>",
    `    <loc>${BASE_URL}${entry.url}</loc>`,
    entry.lastmod ? `    <lastmod>${entry.lastmod}</lastmod>` : "",
    `    <changefreq>${entry.changefreq}</changefreq>`,
    `    <priority>${entry.priority}</priority>`,
    "  </url>",
  ].filter(Boolean).join("\n");
}

export async function sitemapHandler(req: Request, res: Response) {
  const today = new Date().toISOString().split("T")[0]!;

  const rows = await db
    .select({
      modalidade: lotteryResultsTable.modalidade,
      concurso: lotteryResultsTable.concurso,
      data: lotteryResultsTable.data,
    })
    .from(lotteryResultsTable)
    .where(
      or(...MODALIDADES.map((m) => eq(lotteryResultsTable.modalidade, m)),
    ))
    .orderBy(asc(lotteryResultsTable.concurso));

  const entries: SitemapEntry[] = [
    ...STATIC_PAGES.map((p) => ({ ...p, lastmod: today })),
    ...rows.map((row) => ({
      url: `/${slug(row.modalidade)}/resultado/${row.concurso}`,
      lastmod: parseDate(row.data),
      changefreq: "never" as const,
      priority: "0.6",
    })),
  ];

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map(toXmlUrl),
    "</urlset>",
  ].join("\n");

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.send(xml);
}
