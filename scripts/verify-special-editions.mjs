#!/usr/bin/env node
/**
 * Verificação pós-deploy das páginas de edições especiais.
 *
 * Confere, contra um host real, o head server-side (título, description,
 * canonical único e JSON-LD com BreadcrumbList) e os campos do contrato da API
 * (fase, anoProximaEdicao, ultimaEdicao, proximaEdicao, historico).
 *
 * Uso:
 *   node scripts/verify-special-editions.mjs [BASE_URL]
 *
 * Exemplos:
 *   node scripts/verify-special-editions.mjs
 *   node scripts/verify-special-editions.mjs https://estudeloterias.com.br
 *
 * Sai com código != 0 se qualquer checagem falhar.
 */

const BASE = (process.argv[2] || "https://estudeloterias.com.br").replace(/\/$/, "");
const CANONICAL_HOST = "estudeloterias.com.br";

const PAGES = [
  {
    label: "Lotofácil da Independência",
    route: "/lotofacil/lotofacil-da-independencia",
    api: "/api/lotofacil/lotofacil-da-independencia",
    title: /Todos os Resultados da Lotofácil da Independência \d{4}/i,
  },
  {
    label: "Mega da Virada",
    route: "/mega-sena/mega-da-virada",
    api: "/api/mega-sena/mega-da-virada",
    title: /Todos os Resultados da Mega da Virada \d{4}/i,
  },
  {
    label: "Quina de São João",
    route: "/quina/quina-de-sao-joao",
    api: "/api/quina/quina-de-sao-joao",
    title: /Todos os Resultados da Quina de São João \d{4}/i,
  },
  {
    label: "Dupla de Páscoa",
    route: "/duplasena/dupla-de-pascoa",
    api: "/api/duplasena/dupla-de-pascoa",
    title: /Todos os Resultados da Dupla de Páscoa \d{4}/i,
  },
];

const VALID_FASES = new Set(["proxima", "resultado", "apuracao"]);

let fail = 0;
const ok = (m) => console.log(`  \x1b[32mPASS\x1b[0m ${m}`);
const bad = (m) => {
  fail++;
  console.log(`  \x1b[31mFAIL\x1b[0m ${m}`);
};
const count = (re, s) => (s.match(re) || []).length;

async function fetchText(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.text();
}

async function checkPage(p) {
  console.log(`\n== HTML ${p.label} (${BASE}${p.route})`);
  let html;
  try {
    html = await fetchText(BASE + p.route);
  } catch (e) {
    bad(`GET ${p.route}: ${e.message}`);
    return;
  }

  const titles = [...html.matchAll(/<title[^>]*>([\s\S]*?)<\/title>/gi)].map((m) => m[1]);
  const canons = [...html.matchAll(/<link[^>]+rel=["']canonical["'][^>]*>/gi)].map(
    (m) => (m[0].match(/href=["']([^"']+)["']/i) || [])[1],
  );
  const desc = (html.match(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)["']/i) || [])[1];
  const ld = count(/application\/ld\+json/gi, html);

  titles.length === 1 ? ok("1 <title>") : bad(`${titles.length} <title>`);
  p.title.test(titles[0] || "") ? ok(`title: ${titles[0]}`) : bad(`title inesperado: ${titles[0]}`);
  desc && desc.length >= 50 ? ok(`description (${desc.length} chars)`) : bad("description ausente/curta");
  canons.length === 1 ? ok(`canonical: ${canons[0]}`) : bad(`${canons.length} <link canonical>`);
  canons[0] && canons[0].includes(CANONICAL_HOST)
    ? ok("canonical no host canônico")
    : bad(`canonical fora do host: ${canons[0]}`);
  ld >= 1 ? ok(`${ld} JSON-LD`) : bad("JSON-LD ausente");
  if (ld >= 1) {
    /BreadcrumbList/i.test(html) ? ok("BreadcrumbList no JSON-LD") : bad("JSON-LD sem BreadcrumbList");
  }
}

async function checkApi(p) {
  console.log(`\n== API ${p.label} (${BASE}${p.api})`);
  let d;
  try {
    d = JSON.parse(await fetchText(BASE + p.api));
  } catch (e) {
    bad(`GET ${p.api}: ${e.message}`);
    return;
  }

  VALID_FASES.has(d.fase) ? ok(`fase=${d.fase}`) : bad(`fase inválida: ${d.fase}`);
  Number.isInteger(d.anoProximaEdicao)
    ? ok(`anoProximaEdicao=${d.anoProximaEdicao}`)
    : bad("anoProximaEdicao ausente/inválido");
  Array.isArray(d.historico) && d.historico.length > 0
    ? ok(`historico=${d.historico.length}`)
    : bad("historico vazio");

  const u = d.ultimaEdicao;
  if (u === null || u === undefined) {
    ok("ultimaEdicao=null");
  } else if (Number.isInteger(u.anoEdicao) && typeof u.data === "string" && Number.isInteger(u.concurso)) {
    ok(`ultimaEdicao: concurso ${u.concurso} (${u.data}, edição ${u.anoEdicao})`);
  } else {
    bad("ultimaEdicao com shape inválido");
  }

  if (d.fase === "resultado") {
    u ? ok("fase=resultado com ultimaEdicao") : bad("fase=resultado sem ultimaEdicao");
  }
  if (d.fase === "proxima") {
    d.proximaEdicao && d.proximaEdicao.data
      ? ok(`próxima edição em ${d.proximaEdicao.data} (confirmado=${!!d.proximaEdicao.confirmado})`)
      : bad("fase=proxima sem data de próxima edição");
  }
}

(async () => {
  console.log(`Verificando edições especiais em ${BASE}`);
  for (const p of PAGES) {
    await checkPage(p);
    await checkApi(p);
  }
  console.log(
    `\n${fail === 0 ? "\x1b[32mTODAS AS CHECAGENS PASSARAM\x1b[0m" : `\x1b[31m${fail} CHECAGEM(NS) FALHARAM\x1b[0m`}`,
  );
  process.exit(fail === 0 ? 0 : 1);
})();
