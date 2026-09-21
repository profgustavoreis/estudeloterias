#!/usr/bin/env node
/**
 * Bateria de verificação das rotas do SPA contra um host real (smoke test).
 *
 * Lê os padrões de `artifacts/api-server/src/generated/spa-routes.ts` (a mesma
 * fonte que o validador do catch-all usa), materializa os parâmetros com
 * valores concretos e confere:
 *   - toda rota válida responde HTTP 200 — o valor de `robots` NÃO entra na
 *     asserção: `index`/`noindex` é decisão da régua de indexação
 *     (`services/indexing-policy.ts`), não da validade da rota. Páginas antigas
 *     de concurso cortadas corretamente respondem 200 + `noindex, follow` e
 *     passam aqui;
 *   - paths inválidos respondem 404 + `X-Robots-Tag: noindex`;
 *   - o nav server-side aparece num resultado;
 *   - assets do build e /sitemap.xml respondem.
 *
 * Para os invariantes de sitemap × status × robots, use
 * `scripts/verify-indexing.mjs` (harness dedicado).
 *
 * Uso:
 *   node scripts/verify-spa-routes.mjs [BASE_URL]
 *
 * Exemplos:
 *   node scripts/verify-spa-routes.mjs
 *   node scripts/verify-spa-routes.mjs http://localhost:5000
 *   node scripts/verify-spa-routes.mjs https://estudeloterias.com.br
 *
 * Sai com código != 0 se qualquer rota válida não responder 200 ou qualquer
 * inválida não responder 404 + noindex.
 */

import {
  INVALID_SPA_PATHS,
  loadRoutePatterns,
  materializePattern,
} from "./lib/spa-routes.mjs";

const BASE = (process.argv[2] || "http://localhost:5000").replace(/\/$/, "");

let failures = 0;
const ok = (message) => console.log(`  \x1b[32mPASS\x1b[0m ${message}`);
const bad = (message) => {
  failures += 1;
  console.log(`  \x1b[31mFAIL\x1b[0m ${message}`);
};
const warn = (message) => console.log(`  \x1b[33mWARN\x1b[0m ${message}`);
const note = (message) => console.log(`  \x1b[2m${message}\x1b[0m`);

async function get(pathname) {
  return fetch(BASE + pathname, { redirect: "manual" });
}

async function checkValidRoutes() {
  const patterns = loadRoutePatterns();
  console.log(`\n== Rotas válidas (${patterns.length}) em ${BASE}`);
  note("asserção: HTTP 200 (robots é informativo; a régua de indexação decide index/noindex)");
  let passed = 0;
  let noindexCount = 0;
  for (const pattern of patterns) {
    const pathname = materializePattern(pattern);
    try {
      const response = await get(pathname);
      const robots = response.headers.get("x-robots-tag") || "";
      if (response.status === 200) {
        passed += 1;
        if (/noindex/i.test(robots)) noindexCount += 1;
      } else {
        bad(`${pathname} -> ${response.status}${robots ? ` (x-robots-tag: ${robots})` : ""}`);
      }
    } catch (error) {
      bad(`${pathname} -> erro: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  console.log(
    `  Rotas válidas: ${passed}/${patterns.length} responderam 200 (${noindexCount} com noindex, follow — esperado pela régua).`,
  );
  return { total: patterns.length, passed };
}

async function checkInvalidRoutes() {
  console.log(`\n== Rotas inválidas (${INVALID_SPA_PATHS.length}) em ${BASE}`);
  let passed = 0;
  for (const pathname of INVALID_SPA_PATHS) {
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
  console.log(`  Rotas inválidas: ${passed}/${INVALID_SPA_PATHS.length} responderam 404 + noindex.`);
  return { total: INVALID_SPA_PATHS.length, passed };
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
  console.log(`  Válidas:   ${valid.passed}/${valid.total} -> 200`);
  console.log(`  Inválidas: ${invalid.passed}/${invalid.total} -> 404 + noindex`);
  console.log(
    failures === 0
      ? "  \x1b[32mTODAS AS ROTAS VÁLIDAS E INVÁLIDAS PASSARAM\x1b[0m"
      : `  \x1b[31m${failures} FALHA(S)\x1b[0m`,
  );
  process.exit(failures === 0 ? 0 : 1);
})();
