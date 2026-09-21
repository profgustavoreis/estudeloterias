#!/usr/bin/env node
/**
 * Gera a whitelist de indexacao a partir dos exports de Paginas do Google
 * Search Console (GSC). P0 da remediacao de indexacao: a regua do head SSR
 * (`artifacts/api-server/src/services/indexing-policy.ts`) usa esta lista para
 * manter indexaveis as paginas de concurso com demanda real de busca.
 *
 * COMO EXPORTAR (janela de 90 dias):
 *   1. abra o GSC de estudeloterias.com.br;
 *   2. Desempenho > aba "Pesquisa na Web";
 *   3. no filtro "Paginas", escolha "contem" e informe "/resultado/";
 *   4. periodo: "Ultimos 90 dias";
 *   5. "Exportar" e salve o CSV em data/gsc/.
 *   O GSC limita cada CSV a 1000 linhas. Se necessario, exporte em dois
 *   recortes (por exemplo ordenando por cliques e por impressoes) e salve os
 *   dois em data/gsc/: o script casa as linhas por URL (uniao; se a mesma URL
 *   aparecer em mais de um CSV, mantem o maior valor de cada metrica, pois os
 *   recortes cobrem a mesma janela de 90 dias).
 *
 * REGRA: entra na whitelist o path /:modalidade/resultado/:concurso com
 *   cliques >= 1 E impressoes >= 10 no periodo de 90 dias.
 *
 * VALIDACOES: cada path selecionado casa com
 *   ^/[a-z0-9-]+/resultado/\d+$ ; nao ha duplicatas ; o total nao passa de
 *   3000 paths.
 *
 * SAIDA:
 *   artifacts/api-server/src/seo/indexing-whitelist.json
 *   { generatedAt, source, rules, paths: [{ path, clicks, impressions, reason }] }
 *
 * USO:
 *   node scripts/gsc-to-indexing-whitelist.mjs                   # descobre data/gsc/*.csv e escreve
 *   node scripts/gsc-to-indexing-whitelist.mjs a.csv b.csv       # CSVs explicitos
 *   node scripts/gsc-to-indexing-whitelist.mjs --check           # nao escreve; falha se divergir
 *
 * Sai com codigo != 0 em qualquer erro de validacao ou divergencia no --check.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, "..");
const GSC_DIR = path.join(ROOT, "data/gsc");
const OUT_FILE = path.join(ROOT, "artifacts/api-server/src/seo/indexing-whitelist.json");

/** Precisa espelhar `rules` do JSON consumido por `indexing-policy.ts`. */
const SOURCE = "gsc:pages:90d";
const RULES = {
  minClicks: 1,
  minImpressions: 10,
  periodDays: 90,
  pathPattern: "^/[a-z0-9-]+/resultado/\\d+$",
};
const MAX_PATHS = 3000;
const PATH_RE = new RegExp(RULES.pathPattern);

const URL_HEADERS = ["pagina", "paginas", "page", "pages", "top pages", "top paginas", "url", "endereco"];
const CLICKS_HEADERS = ["clics", "clicks"];
const IMPRESSIONS_HEADERS = ["impressoes", "impressions"];

function fail(message) {
  console.error(`\n[gsc-to-indexing-whitelist] ERRO: ${message}`);
  process.exit(1);
}

/** Caminho relativo ao repo; absoluto quando o arquivo esta fora dele. */
function displayPath(file) {
  const relative = path.relative(ROOT, file);
  return relative.startsWith("..") ? file : relative;
}

function normalizeHeader(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

/** CSV com aspas duplas, CRLF e BOM (formato do export do GSC). */
function parseCsv(text) {
  const src = text.replace(/^\uFEFF/, "");
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < src.length; i += 1) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (ch !== "\r") {
      field += ch;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/**
 * Localiza a linha de cabecalho (o export do GSC pode trazer linhas de
 * metadados antes dela) e os indices das colunas que interessam.
 */
function findHeader(rows, file) {
  for (let i = 0; i < rows.length; i += 1) {
    const cells = rows[i].map(normalizeHeader);
    const urlIdx = cells.findIndex((c) => URL_HEADERS.includes(c));
    const clicksIdx = cells.findIndex((c) => CLICKS_HEADERS.includes(c));
    const impressionsIdx = cells.findIndex((c) => IMPRESSIONS_HEADERS.includes(c));
    if (urlIdx >= 0 && clicksIdx >= 0 && impressionsIdx >= 0) {
      return { headerRow: i, urlIdx, clicksIdx, impressionsIdx };
    }
  }
  fail(`cabecalho com Pagina/Clics/Impressoes nao encontrado em ${displayPath(file)}`);
  return null;
}

/** Numeros do GSC vem em pt-BR ("1.234") ou en-US ("1,234"). */
function parseCount(raw) {
  const value = String(raw ?? "").replace(/[%$\s]/g, "");
  if (!value) return 0;
  let normalized = value;
  if (/^\d{1,3}(\.\d{3})+$/.test(normalized)) normalized = normalized.replace(/\./g, "");
  else if (/^\d{1,3}(,\d{3})+$/.test(normalized)) normalized = normalized.replace(/,/g, "");
  else if (normalized.includes(",") && normalized.includes(".")) {
    normalized = normalized.replace(/\./g, "").replace(",", ".");
  } else if (normalized.includes(",")) {
    normalized = normalized.replace(",", ".");
  }
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? Math.round(parsed) : 0;
}

/** URL completa ou path para path normalizado (sem query/hash, sem barra final). */
function toPath(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  let pathname = raw;
  if (/^https?:\/\//i.test(raw)) {
    try {
      pathname = new URL(raw).pathname;
    } catch {
      return null;
    }
  }
  pathname = pathname.split("?")[0].split("#")[0].replace(/\/+$/, "").toLowerCase();
  return pathname || "/";
}

function discoverCsvFiles(explicitFiles) {
  if (explicitFiles.length > 0) {
    for (const file of explicitFiles) {
      if (!fs.existsSync(file)) fail(`CSV nao encontrado: ${file}`);
    }
    return explicitFiles;
  }
  if (!fs.existsSync(GSC_DIR)) {
    fail(
      `pasta ${displayPath(GSC_DIR)} nao existe. ` +
        "Veja o cabecalho do script para exportar os CSVs do GSC.",
    );
  }
  const files = fs
    .readdirSync(GSC_DIR)
    .filter((name) => name.toLowerCase().endsWith(".csv"))
    .map((name) => path.join(GSC_DIR, name));
  if (files.length === 0) {
    fail(
      `nenhum CSV em ${displayPath(GSC_DIR)}. ` +
        "Exporte as Paginas do GSC (90 dias, filtro contem /resultado/) e salve ali.",
    );
  }
  return files.sort();
}

function buildWhitelist(files) {
  /** @type {Map<string, {path: string, clicks: number, impressions: number}>} */
  const byPath = new Map();
  let ignoredRows = 0;

  for (const file of files) {
    const rows = parseCsv(fs.readFileSync(file, "utf8"));
    const header = findHeader(rows, file);

    for (let i = header.headerRow + 1; i < rows.length; i += 1) {
      const cells = rows[i];
      if (!cells || cells.length === 0) continue;
      const candidate = toPath(cells[header.urlIdx]);
      if (!candidate) continue;

      if (!PATH_RE.test(candidate)) {
        // Fora do escopo (outras secoes do site): ignora e reporta no resumo.
        ignoredRows += 1;
        continue;
      }

      const clicks = parseCount(cells[header.clicksIdx]);
      const impressions = parseCount(cells[header.impressionsIdx]);

      const current = byPath.get(candidate);
      if (current) {
        current.clicks = Math.max(current.clicks, clicks);
        current.impressions = Math.max(current.impressions, impressions);
      } else {
        byPath.set(candidate, { path: candidate, clicks, impressions });
      }
    }
  }

  if (ignoredRows > 0) {
    console.log(
      `[gsc-to-indexing-whitelist] ${ignoredRows} linha(s) fora do padrao ` +
        `${RULES.pathPattern} ignorada(s)`,
    );
  }

  const paths = [...byPath.values()]
    .filter((entry) => entry.clicks >= RULES.minClicks && entry.impressions >= RULES.minImpressions)
    .sort((a, b) => a.path.localeCompare(b.path))
    .map((entry) => ({
      path: entry.path,
      clicks: entry.clicks,
      impressions: entry.impressions,
      reason: "gsc: cliques>=1 e impressoes>=10 em 90d",
    }));

  // Guarda defensiva: nada sem o shape de concurso pode chegar ao JSON.
  for (const entry of paths) {
    if (!PATH_RE.test(entry.path)) {
      fail(`path selecionado fora do padrao ${RULES.pathPattern}: ${entry.path}`);
    }
  }

  const unique = new Set(paths.map((entry) => entry.path));
  if (unique.size !== paths.length) {
    fail("whitelist com paths duplicados apos a uniao dos CSVs");
  }
  if (paths.length > MAX_PATHS) {
    fail(
      `whitelist com ${paths.length} paths (limite de ${MAX_PATHS}). ` +
        "Revise os recortes exportados antes de gravar.",
    );
  }

  return paths;
}

function readCurrent() {
  if (!fs.existsSync(OUT_FILE)) return null;
  try {
    return JSON.parse(fs.readFileSync(OUT_FILE, "utf8"));
  } catch {
    return null;
  }
}

function comparable(document) {
  return JSON.stringify({
    source: document?.source ?? null,
    rules: document?.rules ?? null,
    paths: Array.isArray(document?.paths) ? document.paths : null,
  });
}

function printDiff(current, next) {
  const currentPaths = new Map((current?.paths ?? []).map((entry) => [entry.path, entry]));
  const nextPaths = new Map(next.map((entry) => [entry.path, entry]));

  const added = [...nextPaths.keys()].filter((p) => !currentPaths.has(p));
  const removed = [...currentPaths.keys()].filter((p) => !nextPaths.has(p));
  const changed = [...nextPaths.keys()].filter((p) => {
    const before = currentPaths.get(p);
    const after = nextPaths.get(p);
    return before && (before.clicks !== after.clicks || before.impressions !== after.impressions);
  });

  console.log(
    `  atuais: ${currentPaths.size} | calculados: ${nextPaths.size} | ` +
      `novos: ${added.length} | removidos: ${removed.length} | alterados: ${changed.length}`,
  );
  for (const p of added.slice(0, 10)) console.log(`    + ${p}`);
  for (const p of removed.slice(0, 10)) console.log(`    - ${p}`);
  for (const p of changed.slice(0, 10)) console.log(`    ~ ${p}`);
}

function main() {
  const args = process.argv.slice(2);
  const checkOnly = args.includes("--check");
  const explicitFiles = args.filter((arg) => arg !== "--check").map((arg) => path.resolve(arg));

  const files = discoverCsvFiles(explicitFiles);
  console.log(
    `[gsc-to-indexing-whitelist] ${files.length} CSV(s): ${files
      .map((file) => displayPath(file))
      .join(", ")}`,
  );

  const paths = buildWhitelist(files);
  const next = {
    generatedAt: new Date().toISOString(),
    source: SOURCE,
    rules: RULES,
    paths,
  };

  console.log(`[gsc-to-indexing-whitelist] ${paths.length} path(s) selecionado(s)`);

  if (checkOnly) {
    const current = readCurrent();
    if (!current) fail(`arquivo ausente ou ilegivel: ${displayPath(OUT_FILE)}`);
    if (comparable(current) !== comparable(next)) {
      console.error(
        `\n[gsc-to-indexing-whitelist] DIVERGENCIA em ${displayPath(OUT_FILE)}:`,
      );
      printDiff(current, next.paths);
      process.exit(1);
    }
    console.log(
      `[gsc-to-indexing-whitelist] OK: ${displayPath(OUT_FILE)} esta atualizado`,
    );
    return;
  }

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, `${JSON.stringify(next, null, 2)}\n`, "utf8");
  console.log(`[gsc-to-indexing-whitelist] escrito: ${displayPath(OUT_FILE)}`);
}

main();
