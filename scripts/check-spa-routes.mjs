#!/usr/bin/env node
/**
 * Checagem de paridade das rotas do SPA (rede de seguranca para CI).
 *
 * Regera a lista a partir de `artifacts/estude-loterias/src/App.tsx` e falha
 * (exit != 0) se o arquivo commitado em
 * `artifacts/api-server/src/generated/spa-routes.ts` diferir do recem-gerado.
 * Detecta o caso "editei o App.tsx e esqueci de commitar o gerado".
 *
 * O build (`prebuild` do api-server) sempre regenera o arquivo; este script
 * serve para conferir o que esta no repositorio sem reescreve-lo.
 *
 * Uso:
 *   node scripts/check-spa-routes.mjs
 *   pnpm --filter @workspace/api-server run check:routes
 *
 * Sai com codigo != 0 se houver drift ou se a extracao falhar.
 */

import { checkParity } from "./gen-spa-routes.mjs";

try {
  process.exitCode = checkParity() ? 0 : 1;
} catch (error) {
  console.error(`[check-spa-routes] ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
