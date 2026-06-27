import { type Request, type Response } from "express";
import { db } from "@workspace/db";
import { lotteryResultsTable } from "@workspace/db/schema";
import { eq, asc } from "drizzle-orm";

const BASE_URL = "https://estudeloterias.com.br";

interface SitemapEntry {
  url: string;
  lastmod?: string;
  changefreq: string;
  priority: string;
}

const STATIC_PAGES: SitemapEntry[] = [
  { url: "/",                               changefreq: "daily",   priority: "1.0" },
  { url: "/mega-sena",                      changefreq: "daily",   priority: "0.9" },
  { url: "/mega-sena/resultado",            changefreq: "daily",   priority: "0.9" },
  { url: "/mega-sena/resultados",           changefreq: "daily",   priority: "0.8" },
  { url: "/mega-sena/mega-da-virada",       changefreq: "monthly", priority: "0.7" },
  { url: "/mega-sena/resumo-estatistico",   changefreq: "daily",   priority: "0.7" },
  { url: "/mega-sena/tabela-de-dezenas",    changefreq: "daily",   priority: "0.7" },
  { url: "/mega-sena/gerador",              changefreq: "monthly", priority: "0.6" },
  { url: "/mega-sena/simulador",            changefreq: "monthly", priority: "0.6" },
  { url: "/mega-sena/como-jogar",           changefreq: "monthly", priority: "0.5" },
  { url: "/mega-sena/premiacao",            changefreq: "monthly", priority: "0.5" },
  { url: "/mega-sena/faq",                  changefreq: "monthly", priority: "0.5" },
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
    .select({ concurso: lotteryResultsTable.concurso, data: lotteryResultsTable.data })
    .from(lotteryResultsTable)
    .where(eq(lotteryResultsTable.modalidade, "megasena"))
    .orderBy(asc(lotteryResultsTable.concurso));

  const entries: SitemapEntry[] = [
    ...STATIC_PAGES.map((p) => ({ ...p, lastmod: today })),
    ...rows.map((row) => ({
      url: `/mega-sena/resultado/${row.concurso}`,
      lastmod: parseDate(row.data),
      changefreq: "never",
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
