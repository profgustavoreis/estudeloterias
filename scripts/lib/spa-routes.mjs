#!/usr/bin/env node
/**
 * Helpers compartilhados dos harnesses de verificação de rotas do SPA
 * (`scripts/verify-spa-routes.mjs` e `scripts/verify-indexing.mjs`).
 *
 * Fonte única: o arquivo GERADO `artifacts/api-server/src/generated/spa-routes.ts`
 * (extraído do App.tsx no prebuild e consumido pelo validador do catch-all em
 * `artifacts/api-server/src/app.ts`). Ler o gerado — e não o App.tsx — garante
 * que o harness verifica exatamente a lista que o servidor usa.
 *
 * Contrato de expectativa (corrigido após o corte de indexação):
 *   - rota válida   = HTTP 200. Ponto. O valor de `robots` (index/noindex) é
 *     decisão da régua de indexação (`services/indexing-policy.ts`) e NÃO é
 *     asserção de "rota válida";
 *   - rota inválida = HTTP 404 + `X-Robots-Tag: noindex`.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const LIB_DIR = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(LIB_DIR, "..", "..");
export const GENERATED_ROUTES_FILE = path.join(
  REPO_ROOT,
  "artifacts/api-server/src/generated/spa-routes.ts",
);

/**
 * Paths fora do roteador do SPA: o catch-all responde 404 real + noindex.
 * Mesma lista usada pelos dois harnesses (antes duplicada no verify-spa-routes).
 */
export const INVALID_SPA_PATHS = [
  "/xyz",
  "/lotofacil/xyz",
  "/lotofacil/resultado/abc",
  "/foo/bar/baz",
  "/mega-sena/resultado/1/2",
];

/** Converte um padrão com `:param` em um path concreto testável. */
export function materializePattern(pattern) {
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

/** Lê os padrões direto do arquivo gerado (linhas `  "/rota",`). */
export function loadRoutePatterns(filePath = GENERATED_ROUTES_FILE) {
  if (!fs.existsSync(filePath)) {
    throw new Error(
      `Arquivo gerado não encontrado: ${filePath}. Rode o build do api-server antes.`,
    );
  }
  const text = fs.readFileSync(filePath, "utf8");
  const patterns = [];
  const lineRe = /^\s*"(\/[^"]*)",\s*$/gm;
  let match;
  while ((match = lineRe.exec(text)) !== null) patterns.push(match[1]);
  if (patterns.length === 0) throw new Error(`Nenhuma rota extraída de ${filePath}`);
  return patterns;
}

/**
 * Slugs de modalidade declarados em `/:mod/resultado/:concurso`, na ordem do
 * App.tsx. Usado para montar as checagens por modalidade sem hardcode de lista.
 */
export function modalitySlugsFromPatterns(patterns) {
  const slugs = new Set();
  for (const pattern of patterns) {
    const match = /^\/([a-z0-9-]+)\/resultado\/:concurso$/.exec(pattern);
    if (match) slugs.add(match[1]);
  }
  return [...slugs];
}
