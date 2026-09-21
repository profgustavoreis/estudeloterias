#!/usr/bin/env node
/**
 * Harness de invariantes de rotas + indexação do Estude Loterias.
 *
 * Verifica APENAS propriedades observáveis (status HTTP, `X-Robots-Tag`,
 * `<meta name="robots">` e o sitemap) contra um host real. A régua de indexação
 * (`artifacts/api-server/src/services/indexing-policy.ts`) NÃO é reimplementada
 * aqui — o que se checa é a coerência entre o que o sitemap anuncia e o que o
 * servidor responde.
 *
 * Checagens:
 *   A1. Rotas válidas (extraídas do App.tsx via arquivo gerado) -> HTTP 200.
 *       `robots` NÃO é asserção de rota válida: páginas antigas de concurso
 *       cortadas respondem 200 + `noindex, follow` por design.
 *   A2. Rotas inválidas -> 404 + `X-Robots-Tag: noindex`.
 *   B3. sitemap ⊆ 200: amostra distribuída do sitemap -> todas 200.
 *   B4. sitemap ⊆ index: URLs `/{mod}/resultado/{concurso}` do sitemap ->
 *       200 + `index, follow` (invariante central; o sitemap não anuncia o que
 *       não é indexável).
 *   B5. Cortadas -> noindex: URLs de concurso AUSENTES do sitemap -> 200 +
 *       `noindex, follow` (o corte está de fato aplicado).
 *   B6. Fora de faixa: `/resultado/0` e `/resultado/999999` em 2 modalidades ->
 *       404 + `X-Robots-Tag: noindex`.
 *   B7. Hubs, páginas especiais e institucional -> 200 + `index, follow`.
 *
 * Robustez:
 *   - fetch nativo do Node (sem dependências novas);
 *   - timeout curto por requisição e 1 retry apenas em falha transitória
 *     (erro de rede/timeout/408/425/429/5xx), com backoff curto de 400ms entre
 *     tentativas — nunca no caminho feliz;
 *   - paralelismo moderado (default 8) e amostragem determinística.
 *   - um 502 de upstream persistente após o retry é FALHA do invariante (com a
 *     URL no relatório): o sitemap não pode anunciar página indisponível.
 *
 * Uso:
 *   node scripts/verify-indexing.mjs [BASE_URL] [--sample=N] [--all]
 *                                    [--concurrency=N] [--timeout=MS]
 *
 * Exemplos:
 *   node scripts/verify-indexing.mjs
 *   node scripts/verify-indexing.mjs http://localhost:5000
 *   node scripts/verify-indexing.mjs https://estudeloterias.com.br
 *   node scripts/verify-indexing.mjs https://estudeloterias.com.br --all
 *
 * Flags:
 *   --sample=N       tamanho das amostras B3/B4 (default 30). B4 distribui a
 *                    amostra entre as modalidades (>= 1 por modalidade).
 *   --all            checa TODAS as URLs de concurso do sitemap no B4
 *                    (pode levar ~1-2 min; o default é amostra).
 *   --concurrency=N  requisições simultâneas (default 8).
 *   --timeout=MS     timeout por requisição em ms (default 10000).
 *
 * Sai com código != 0 se qualquer invariante falhar.
 */

import {
  INVALID_SPA_PATHS,
  loadRoutePatterns,
  materializePattern,
  modalitySlugsFromPatterns,
} from "./lib/spa-routes.mjs";

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------
const options = {
  base: "http://localhost:5000",
  baseProvided: false,
  all: false,
  sample: 30,
  concurrency: 8,
  timeoutMs: 10000,
};

function positiveInt(value, fallback, { min = 1, max = Number.MAX_SAFE_INTEGER } = {}) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) return fallback;
  return parsed;
}

for (const arg of process.argv.slice(2)) {
  if (arg === "--all") options.all = true;
  else if (arg.startsWith("--sample=")) options.sample = positiveInt(arg.slice(9), options.sample);
  else if (arg.startsWith("--concurrency=")) {
    options.concurrency = positiveInt(arg.slice(14), options.concurrency, { max: 32 });
  } else if (arg.startsWith("--timeout=")) {
    options.timeoutMs = positiveInt(arg.slice(10), options.timeoutMs, { min: 1000, max: 60000 });
  } else if (arg.startsWith("-")) {
    console.error(`Opção desconhecida: ${arg}`);
    process.exit(2);
  } else if (!options.baseProvided) {
    options.base = arg;
    options.baseProvided = true;
  } else {
    console.error(`Argumento posicional extra: ${arg}`);
    process.exit(2);
  }
}
options.base = options.base.replace(/\/+$/, "");

// ---------------------------------------------------------------------------
// Constantes de domínio (páginas fora da régua de concurso)
// ---------------------------------------------------------------------------
const SPECIAL_PAGES = [
  "/mega-sena/mega-da-virada",
  "/lotofacil/lotofacil-da-independencia",
  "/quina/quina-de-sao-joao",
  "/duplasena/dupla-de-pascoa",
];
const INSTITUTIONAL_PAGES = ["/sobre", "/privacidade", "/termos", "/parceiros", "/contato"];
const OUT_OF_RANGE_MODS = ["mega-sena", "quina"];
const OUT_OF_RANGE_CONCURSOS = [0, 999999];

const USER_AGENT = "estudeloterias-verify-indexing/1.0 (+https://estudeloterias.com.br)";
const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);
// Backoff curto APENAS entre a 1ª e a 2ª tentativa (absorve restart breve do
// upstream); não é espera de condição de app e nunca ocorre no caminho feliz.
const RETRY_BACKOFF_MS = 400;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ---------------------------------------------------------------------------
// Reporter
// ---------------------------------------------------------------------------
const color = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  dim: "\x1b[2m",
  reset: "\x1b[0m",
};

let totalFailures = 0;
const checks = [];

function createCheck(id, title, { printPasses = false } = {}) {
  const check = { id, title, printPasses, passed: 0, failed: 0, passLog: [], failures: [], skipped: null };
  checks.push(check);
  return check;
}

function recordPass(check, message) {
  check.passed += 1;
  if (check.printPasses) check.passLog.push(message);
}

function recordFail(check, message) {
  check.failed += 1;
  check.failures.push(message);
}

function finishCheck(check, detail = "") {
  for (const failure of check.failures) {
    console.log(`  ${color.red}FAIL${color.reset} ${failure}`);
  }
  if (check.printPasses) {
    for (const message of check.passLog) console.log(`  ${color.green}PASS${color.reset} ${message}`);
  }
  const suffix = detail ? ` ${detail}` : "";
  if (check.skipped) {
    console.log(`  ${color.yellow}SKIP${color.reset} ${check.title} — ${check.skipped}`);
    return;
  }
  const total = check.passed + check.failed;
  if (check.failed > 0) {
    totalFailures += check.failed;
    console.log(`  ${color.red}FAIL${color.reset} ${check.title}: ${check.passed}/${total}${suffix}`);
  } else {
    console.log(`  ${color.green}PASS${color.reset} ${check.title}: ${check.passed}/${total}${suffix}`);
  }
}

// ---------------------------------------------------------------------------
// HTTP (timeout curto + 1 retry em falha transitória, sem espera fixa)
// ---------------------------------------------------------------------------
let requestCount = 0;
let retryCount = 0;
let recoveredByRetry = 0;

function extractMetaRobots(html) {
  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    const tag = match[0];
    if (!/name=["']robots["']/i.test(tag)) continue;
    const content = /content=["']([^"']*)["']/i.exec(tag);
    if (content) return content[1].trim();
  }
  return "";
}

async function fetchPath(pathname) {
  let lastError = null;
  const maxAttempts = 2;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), options.timeoutMs);
    requestCount += 1;
    try {
      const response = await fetch(options.base + pathname, {
        redirect: "manual",
        signal: controller.signal,
        headers: { "user-agent": USER_AGENT },
      });
      if (RETRYABLE_STATUS.has(response.status) && attempt < maxAttempts) {
        retryCount += 1;
        await response.text().catch(() => "");
        await sleep(RETRY_BACKOFF_MS);
        continue;
      }
      const text = await response.text();
      if (attempt > 1 && !RETRYABLE_STATUS.has(response.status)) recoveredByRetry += 1;
      return {
        pathname,
        status: response.status,
        header: (response.headers.get("x-robots-tag") || "").trim(),
        meta: extractMetaRobots(text),
        text,
        attempts: attempt,
      };
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        retryCount += 1;
        await sleep(RETRY_BACKOFF_MS);
        continue;
      }
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastError ?? new Error("falha desconhecida");
}

function errorMessage(error) {
  if (error instanceof Error && error.name === "AbortError") {
    return `timeout de ${options.timeoutMs}ms`;
  }
  return error instanceof Error ? error.message : String(error);
}

/** `robots` efetivo: o header HTTP manda quando presente; senão, a meta tag. */
function effectiveRobots(response) {
  return response.header || response.meta || "ausente";
}

const robotsIsIndex = (value) => /index/i.test(value) && !/noindex/i.test(value);
const robotsIsNoindex = (value) => /noindex/i.test(value);
const robotsHasFollow = (value) => /follow/i.test(value);

function describe(response) {
  const parts = [`HTTP ${response.status}`];
  if (response.header) parts.push(`header: ${response.header}`);
  if (response.meta) parts.push(`meta: ${response.meta}`);
  if (!response.header && !response.meta) parts.push("robots: ausente");
  return parts.join(" / ");
}

/** Pool simples com concorrência limitada e resultados na ordem de entrada. */
async function mapPool(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    for (;;) {
      const index = cursor;
      cursor += 1;
      if (index >= items.length) return;
      results[index] = await worker(items[index], index);
    }
  });
  await Promise.all(runners);
  return results;
}

/** Requisição que nunca lança: devolve `{ response }` ou `{ pathname, error }`. */
async function safeFetch(pathname) {
  try {
    return { response: await fetchPath(pathname) };
  } catch (error) {
    return { pathname, error };
  }
}

// ---------------------------------------------------------------------------
// Amostragem determinística
// ---------------------------------------------------------------------------
/** Amostra distribuída por passo constante (determinística). */
function sampleDistributed(items, size) {
  if (size >= items.length) return [...items];
  const step = items.length / size;
  const indices = new Set();
  for (let i = 0; i < size; i += 1) {
    indices.add(Math.min(items.length - 1, Math.floor((i + 0.5) * step)));
  }
  return [...indices].sort((a, b) => a - b).map((index) => items[index]);
}

/** Amostra distribuída do sitemap com âncoras não-concurso (home e /blog). */
function sampleSitemapPaths(paths, size) {
  return [...new Set(["/", "/blog", ...sampleDistributed(paths, size)])];
}

/** Amostra que garante >= 1 URL por modalidade (quando size >= nº de mods). */
function sampleAcrossModalities(paths, size) {
  const byMod = new Map();
  for (const pathname of paths) {
    const mod = pathname.split("/")[1];
    if (!byMod.has(mod)) byMod.set(mod, []);
    byMod.get(mod).push(pathname);
  }
  const concursoNumber = (pathname) => Number.parseInt(pathname.split("/").pop(), 10);
  for (const group of byMod.values()) group.sort((a, b) => concursoNumber(a) - concursoNumber(b));

  const mods = [...byMod.keys()];
  const base = Math.floor(size / mods.length);
  let remainder = size % mods.length;
  const picked = [];
  for (const mod of mods) {
    const quota = base + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder -= 1;
    picked.push(...sampleDistributed(byMod.get(mod), quota));
  }
  return picked;
}

// ---------------------------------------------------------------------------
// Sitemap
// ---------------------------------------------------------------------------
const CONCURSO_PATH_RE = /^\/[a-z0-9-]+\/resultado\/\d+$/;

function xmlUnescape(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

async function loadSitemap() {
  const result = await safeFetch("/sitemap.xml");
  if (result.error) throw new Error(`/sitemap.xml -> erro: ${errorMessage(result.error)}`);
  const response = result.response;
  if (response.status !== 200) throw new Error(`/sitemap.xml -> ${describe(response)}`);

  const locs = [...response.text.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)]
    .map((match) => xmlUnescape(match[1].trim()))
    .filter(Boolean);
  if (locs.length === 0) throw new Error("/sitemap.xml não contém nenhum <loc>");

  const paths = [];
  let foreignHosts = 0;
  for (const loc of locs) {
    try {
      const url = new URL(loc);
      paths.push(url.pathname);
    } catch {
      foreignHosts += 1;
    }
  }
  return { paths: [...new Set(paths)], locCount: locs.length, invalidLocs: foreignHosts };
}

// ---------------------------------------------------------------------------
// A1. Rotas válidas -> HTTP 200
// ---------------------------------------------------------------------------
async function checkValidRoutes() {
  const patterns = loadRoutePatterns();
  const paths = patterns.map(materializePattern);
  const check = createCheck("A1", `rotas válidas -> HTTP 200 (${paths.length})`);

  console.log(`\n== A1. Rotas válidas: HTTP 200 (${paths.length} rotas do App.tsx)`);
  console.log(
    `  ${color.dim}robots não é asserção de rota válida; a régua de indexação decide index/noindex.${color.reset}`,
  );

  const results = await mapPool(paths, options.concurrency, (pathname) => safeFetch(pathname));
  let noindexCount = 0;
  for (const result of results) {
    if (result.error) {
      recordFail(check, `${result.pathname} erro: ${errorMessage(result.error)}`);
      continue;
    }
    const response = result.response;
    if (response.status !== 200) {
      recordFail(check, `${response.pathname} -> ${describe(response)} (esperado 200)`);
      continue;
    }
    recordPass(check);
    if (robotsIsNoindex(effectiveRobots(response))) noindexCount += 1;
  }
  finishCheck(check, `(${noindexCount} com robots noindex (header ou meta) — esperado pela régua)`);
}

// ---------------------------------------------------------------------------
// A2. Rotas inválidas -> 404 + noindex
// ---------------------------------------------------------------------------
async function checkInvalidRoutes() {
  const check = createCheck("A2", `rotas inválidas -> 404 + noindex (${INVALID_SPA_PATHS.length})`, {
    printPasses: true,
  });
  console.log(`\n== A2. Rotas inválidas: 404 + X-Robots-Tag: noindex (${INVALID_SPA_PATHS.length})`);

  const results = await mapPool(INVALID_SPA_PATHS, options.concurrency, (pathname) =>
    safeFetch(pathname),
  );
  for (const result of results) {
    if (result.error) {
      recordFail(check, `${result.pathname} erro: ${errorMessage(result.error)}`);
      continue;
    }
    const response = result.response;
    if (response.status === 404 && robotsIsNoindex(effectiveRobots(response))) {
      recordPass(check, `${response.pathname} -> 404 + header: ${response.header || "ausente"}`);
    } else {
      recordFail(
        check,
        `${response.pathname} -> ${describe(response)} (esperado 404 + noindex)`,
      );
    }
  }
  finishCheck(check);
}

// ---------------------------------------------------------------------------
// B3. sitemap ⊆ 200 (amostra distribuída)
// ---------------------------------------------------------------------------
async function checkSitemapStatuses(sitemap) {
  const targets = sampleSitemapPaths(sitemap.paths, options.sample);
  const check = createCheck("B3", `sitemap ⊆ 200 (amostra ${targets.length}/${sitemap.paths.length})`);
  console.log(
    `\n== B3. sitemap ⊆ 200: amostra distribuída de ${targets.length}/${sitemap.paths.length} URLs`,
  );

  const results = await mapPool(targets, options.concurrency, (pathname) => safeFetch(pathname));
  for (const result of results) {
    if (result.error) {
      recordFail(check, `${result.pathname} erro: ${errorMessage(result.error)}`);
      continue;
    }
    const response = result.response;
    if (response.status === 200) {
      recordPass(check);
    } else {
      recordFail(check, `${response.pathname} -> ${describe(response)} (esperado 200)`);
    }
  }
  finishCheck(check);
}

// ---------------------------------------------------------------------------
// B4. sitemap ⊆ index (invariante central)
// ---------------------------------------------------------------------------
async function checkSitemapConcursoIndexable(sitemap) {
  const concursoPaths = sitemap.paths.filter((pathname) => CONCURSO_PATH_RE.test(pathname));
  const targets = options.all
    ? concursoPaths
    : sampleAcrossModalities(concursoPaths, options.sample);
  const detail = options.all
    ? `(todas as ${concursoPaths.length})`
    : `(amostra ${targets.length}/${concursoPaths.length}; use --all para todas)`;
  const check = createCheck(
    "B4",
    `sitemap ⊆ index: concursos do sitemap -> 200 + index, follow ${detail}`,
  );
  console.log(
    `\n== B4. sitemap ⊆ index: ${concursoPaths.length} URLs de concurso no sitemap` +
      ` → checando ${targets.length}${options.all ? "" : " (amostra; --all para todas)"}`,
  );
  if (concursoPaths.length === 0) {
    check.skipped = "nenhuma URL de concurso no sitemap";
    finishCheck(check);
    return;
  }

  const results = await mapPool(targets, options.concurrency, (pathname) => safeFetch(pathname));
  for (const result of results) {
    if (result.error) {
      recordFail(check, `${result.pathname} erro: ${errorMessage(result.error)}`);
      continue;
    }
    const response = result.response;
    const robots = effectiveRobots(response);
    if (response.status === 200 && robotsIsIndex(robots) && robotsHasFollow(robots)) {
      recordPass(check);
    } else {
      recordFail(
        check,
        `${response.pathname} -> ${describe(response)} (esperado 200 + index, follow)`,
      );
    }
  }
  finishCheck(check);
}

// ---------------------------------------------------------------------------
// B5. Cortadas (ausentes do sitemap) -> 200 + noindex
// ---------------------------------------------------------------------------
function buildCutCandidates(modalities, sitemapSet) {
  const candidates = [];
  for (const mod of modalities) {
    for (const concurso of [1, 2, 3, 4]) {
      const pathname = `/${mod}/resultado/${concurso}`;
      if (!sitemapSet.has(pathname)) candidates.push(pathname);
    }
  }
  return candidates;
}

async function checkCutConcursoPages(modalities, sitemap) {
  const sitemapSet = new Set(sitemap.paths);
  const candidates = buildCutCandidates(modalities, sitemapSet);
  const targets = candidates.slice(0, 5);
  const check = createCheck("B5", "cortadas (fora do sitemap) -> 200 + noindex, follow", {
    printPasses: true,
  });
  console.log(
    `\n== B5. Cortadas -> 200 + noindex, follow (candidatas antigas fora do sitemap: ${candidates.length})`,
  );

  if (targets.length === 0) {
    check.skipped =
      "nenhuma URL antiga fora do sitemap — corte parece desligado (SEO_INDEXING_CUT_ENABLED=false)";
    finishCheck(check);
    return;
  }

  const results = await mapPool(targets, options.concurrency, (pathname) => safeFetch(pathname));
  for (const result of results) {
    if (result.error) {
      recordFail(check, `${result.pathname} erro: ${errorMessage(result.error)}`);
      continue;
    }
    const response = result.response;
    const robots = effectiveRobots(response);
    if (response.status === 200 && robotsIsNoindex(robots) && robotsHasFollow(robots)) {
      recordPass(check, `${response.pathname} -> 200 + header: ${response.header || "ausente"}`);
    } else {
      recordFail(
        check,
        `${response.pathname} -> ${describe(response)} (esperado 200 + noindex, follow)`,
      );
    }
  }
  finishCheck(check, `(checadas ${targets.length}/${candidates.length} candidatas)`);
}

// ---------------------------------------------------------------------------
// B6. Fora de faixa -> 404 + noindex
// ---------------------------------------------------------------------------
async function checkOutOfRange() {
  const targets = OUT_OF_RANGE_MODS.flatMap((mod) =>
    OUT_OF_RANGE_CONCURSOS.map((concurso) => `/${mod}/resultado/${concurso}`),
  );
  const check = createCheck("B6", `fora de faixa -> 404 + noindex (${targets.length})`, {
    printPasses: true,
  });
  console.log(`\n== B6. Fora de faixa: 404 + X-Robots-Tag: noindex (${targets.length})`);

  const results = await mapPool(targets, options.concurrency, (pathname) => safeFetch(pathname));
  for (const result of results) {
    if (result.error) {
      recordFail(check, `${result.pathname} erro: ${errorMessage(result.error)}`);
      continue;
    }
    const response = result.response;
    if (response.status === 404 && robotsIsNoindex(effectiveRobots(response))) {
      recordPass(check, `${response.pathname} -> 404 + header: ${response.header || "ausente"}`);
    } else {
      recordFail(check, `${response.pathname} -> ${describe(response)} (esperado 404 + noindex)`);
    }
  }
  finishCheck(check);
}

// ---------------------------------------------------------------------------
// B7. Hubs, especiais e institucional -> 200 + index, follow
// ---------------------------------------------------------------------------
function buildHubTargets(modalities) {
  const targets = ["/"];
  for (const mod of modalities) {
    targets.push(`/${mod}`, `/${mod}/resultado`, `/${mod}/resultados`);
  }
  targets.push(...SPECIAL_PAGES, "/blog", ...INSTITUTIONAL_PAGES);
  return targets;
}

async function checkHubsAndSpecialPages(modalities) {
  const targets = buildHubTargets(modalities);
  const check = createCheck("B7", `hubs/especiais/institucional -> 200 + index, follow (${targets.length})`);
  console.log(`\n== B7. Hubs, especiais e institucional: 200 + index, follow (${targets.length})`);

  const results = await mapPool(targets, options.concurrency, (pathname) => safeFetch(pathname));
  for (const result of results) {
    if (result.error) {
      recordFail(check, `${result.pathname} erro: ${errorMessage(result.error)}`);
      continue;
    }
    const response = result.response;
    const robots = effectiveRobots(response);
    if (response.status === 200 && robotsIsIndex(robots) && robotsHasFollow(robots)) {
      recordPass(check);
    } else {
      recordFail(
        check,
        `${response.pathname} -> ${describe(response)} (esperado 200 + index, follow)`,
      );
    }
  }
  finishCheck(check);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
(async () => {
  const startedAt = Date.now();
  console.log(`Verificando invariantes de rotas/indexação em ${options.base}`);
  console.log(
    `  ${color.dim}amostra=${options.sample} concorrência=${options.concurrency} timeout=${options.timeoutMs}ms${options.all ? " modo=--all" : ""}${color.reset}`,
  );

  try {
    const patterns = loadRoutePatterns();
    const modalities = modalitySlugsFromPatterns(patterns);
    console.log(`  ${color.dim}rotas do App.tsx: ${patterns.length} | modalidades: ${modalities.length}${color.reset}`);

    const sitemap = await loadSitemap();
    const concursoCount = sitemap.paths.filter((pathname) => CONCURSO_PATH_RE.test(pathname)).length;
    console.log(
      `  ${color.dim}sitemap: ${sitemap.paths.length} URLs únicas (${sitemap.locCount} <loc>) | ${concursoCount} de concurso${sitemap.invalidLocs > 0 ? ` | ${sitemap.invalidLocs} <loc> inválidos` : ""}${color.reset}`,
    );

    await checkValidRoutes();
    await checkInvalidRoutes();
    await checkSitemapStatuses(sitemap);
    await checkSitemapConcursoIndexable(sitemap);
    await checkCutConcursoPages(modalities, sitemap);
    await checkOutOfRange();
    await checkHubsAndSpecialPages(modalities);

    const duration = ((Date.now() - startedAt) / 1000).toFixed(1);
    console.log("\n== Resumo");
    for (const check of checks) {
      const total = check.passed + check.failed;
      const status = check.skipped
        ? `${color.yellow}SKIP${color.reset}`
        : check.failed > 0
          ? `${color.red}FAIL${color.reset}`
          : `${color.green}PASS${color.reset}`;
      console.log(
        `  ${status} ${check.id.padEnd(3)} ${check.passed}/${total} ${check.title}${check.skipped ? ` — ${check.skipped}` : ""}`,
      );
    }
    console.log(
      `  ${color.dim}requests: ${requestCount} | retries: ${retryCount}${recoveredByRetry > 0 ? ` (${recoveredByRetry} recuperadas no retry)` : ""} | duração: ${duration}s${color.reset}`,
    );
    console.log(
      totalFailures === 0
        ? `  ${color.green}TODOS OS INVARIANTES PASSARAM${color.reset}`
        : `  ${color.red}${totalFailures} FALHA(S) DE INVARIANTE${color.reset}`,
    );
    process.exitCode = totalFailures === 0 ? 0 : 1;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`\n  ${color.red}FATAL${color.reset} ${message}`);
    process.exitCode = 1;
  }
})();
