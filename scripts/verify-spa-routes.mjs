#!/usr/bin/env node
/**
 * Bateria de verificacao das rotas do SPA contra um host real.
 *
 * Le os padroes de `artifacts/api-server/src/generated/spa-routes.ts` (a mesma
 * fonte que o validador do catch-all usa), materializa os parametros com
 * valores concretos e confere:
 *   - toda rota valida responde 200, sem `X-Robots-Tag: noindex`;
 *   - paths invalidos respondem 404 + `X-Robots-Tag: noindex`;
 *   - o nav server-side aparece num resultado;
 *   - assets do build e /sitemap.xml respondem.
 *
 * Uso:
 *   node scripts/verify-spa-routes.mjs [BASE_URL]
 *
 * Exemplos:
 *   node scripts/verify-spa-routes.mjs
 *   node scripts/verify-spa-routes.mjs http://localhost:5000
 *
 * Sai com codigo != 0 se qualquer rota valida falhar ou qualquer invalida
 * retornar diferente de 404.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const BASE = (process.argv[2] || "http://localhost:5000").replace(/\/$/, "");
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, "..");
const GENERATED_FILE = path.join(
  REPO_ROOT,
  "artifacts/api-server/src/generated/spa-routes.ts",
);

/** Converte um padrao com `:param` em um path concreto testavel. */
function materialize(pattern) {
  if (pattern === "/") return "/";
  return pattern
    .split("/")
    .map((segment) => {
      if (!segment.startsWith(":")) return segment;
      const name = segment.slice(1);
      if (name === "concurso" || name === "id") return "1";
      return "teste";
    })
    .join("/");
}

/** Le os padroes direto do arquivo gerado (linhas `  "/rota",`). */
function loadRoutePatterns() {
  if (!fs.existsSync(GENERATED_FILE)) {
    throw new Error(
      `Arquivo gerado nao encontrado: ${GENERATED_FILE}. Rode o build do api-server antes.`,
    );
  }
  const text = fs.readFileSync(GENERATED_FILE, "utf8");
  const patterns = [];
  const lineRe = /^\s*"(\/[^"]*)",\s*$/gm;
  let match;
  while ((match = lineRe.exec(text)) !== null) patterns.push(match[1]);
  if (patterns.length === 0) throw new Error(`Nenhuma rota extraida de ${GENERATED_FILE}`);
  return patterns;
}

const INVALID_PATHS = [
  "/xyz",
  "/lotofacil/xyz",
  "/lotofacil/resultado/abc",
  "/foo/bar/baz",
  "/mega-sena/resultado/1/2",
];

let failures = 0;
const ok = (message) => console.log(`  \x1b[32mPASS\x1b[0m ${message}`);
const bad = (message) => {
  failures += 1;
  console.log(`  \x1b[31mFAIL\x1b[0m ${message}`);
};
const warn = (message) => console.log(`  \x1b[33mWARN\x1b[0m ${message}`);

async function get(pathname) {
  return fetch(BASE + pathname, { redirect: "manual" });
}

async function checkValidRoutes() {
  const patterns = loadRoutePatterns();
  console.log(`\n== Rotas validas (${patterns.length}) em ${BASE}`);
  let passed = 0;
  for (const pattern of patterns) {
    const pathname = materialize(pattern);
    try {
      const response = await get(pathname);
      const robots = response.headers.get("x-robots-tag") || "";
      if (response.status === 200 && !/noindex/i.test(robots)) {
        passed += 1;
      } else {
        bad(`${pathname} -> ${response.status}${robots ? ` (x-robots-tag: ${robots})` : ""}`);
      }
    } catch (error) {
      bad(`${pathname} -> erro: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  console.log(`  Rotas validas: ${passed}/${patterns.length} responderam 200.`);
  return { total: patterns.length, passed };
}

async function checkInvalidRoutes() {
  console.log(`\n== Rotas invalidas (${INVALID_PATHS.length}) em ${BASE}`);
  let passed = 0;
  for (const pathname of INVALID_PATHS) {
    try {
      const response = await get(pathname);
      const robots = response.headers.get("x-robots-tag") || "";
      if (response.status === 404 && /noindex/i.test(robots)) {
        passed += 1;
        ok(`${pathname} -> 404 + x-robots-tag: ${robots}`);
      } else {
        bad(`${pathname} -> ${response.status} (x-robots-tag: ${robots || "ausente"})`);
      }
    } catch (error) {
      bad(`${pathname} -> erro: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  console.log(`  Rotas invalidas: ${passed}/${INVALID_PATHS.length} responderam 404 + noindex.`);
  return { total: INVALID_PATHS.length, passed };
}

async function checkSsrNav() {
  console.log("\n== Nav server-side e assets");
  try {
    const response = await get("/mega-sena/resultado/1");
    const html = await response.text();
    if (response.status === 200 && html.includes('data-ssr-body-links="1"')) {
      ok("nav SSR presente em /mega-sena/resultado/1");
    } else if (response.status === 200) {
      warn("nav SSR ausente em /mega-sena/resultado/1 (DB sem concursos?)");
    } else {
      bad(`/mega-sena/resultado/1 -> ${response.status}`);
    }
  } catch (error) {
    bad(`nav SSR -> erro: ${error instanceof Error ? error.message : String(error)}`);
  }

  try {
    const home = await get("/");
    const html = await home.text();
    const asset = (html.match(/(?:src|href)="(\/assets\/[^"]+)"/) || [])[1];
    if (!asset) {
      warn("nenhum asset /assets/... encontrado no HTML da home");
    } else {
      const assetResponse = await get(asset);
      assetResponse.status === 200
        ? ok(`asset ${asset} -> 200`)
        : bad(`asset ${asset} -> ${assetResponse.status}`);
    }
  } catch (error) {
    bad(`asset -> erro: ${error instanceof Error ? error.message : String(error)}`);
  }

  try {
    const sitemap = await get("/sitemap.xml");
    const contentType = sitemap.headers.get("content-type") || "";
    if (sitemap.status === 200 && /xml/i.test(contentType)) {
      ok(`/sitemap.xml -> 200 (${contentType})`);
    } else {
      bad(`/sitemap.xml -> ${sitemap.status} (${contentType})`);
    }
  } catch (error) {
    bad(`/sitemap.xml -> erro: ${error instanceof Error ? error.message : String(error)}`);
  }
}

(async () => {
  console.log(`Verificando rotas do SPA em ${BASE}`);
  const valid = await checkValidRoutes();
  const invalid = await checkInvalidRoutes();
  await checkSsrNav();

  console.log("\n== Resumo");
  console.log(`  Validas:   ${valid.passed}/${valid.total} -> 200`);
  console.log(`  Invalidas: ${invalid.passed}/${invalid.total} -> 404 + noindex`);
  console.log(
    failures === 0
      ? "  \x1b[32mTODAS AS ROTAS VALIDAS E INVALIDAS PASSARAM\x1b[0m"
      : `  \x1b[31m${failures} FALHA(S)\x1b[0m`,
  );
  process.exit(failures === 0 ? 0 : 1);
})();
