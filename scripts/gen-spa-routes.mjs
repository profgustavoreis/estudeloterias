#!/usr/bin/env node
/**
 * Gerador da lista de rotas validas do SPA.
 *
 * Le `artifacts/estude-loterias/src/App.tsx` (via AST do TypeScript, nao por
 * regex) e escreve `artifacts/api-server/src/generated/spa-routes.ts` com todos
 * os `<Route path="...">` declarados. Assim a validacao do catch-all do
 * api-server deixa de depender de uma lista mantida a mao: adicionar rota no
 * App.tsx + rodar o build e suficiente.
 *
 * Modos:
 *   node scripts/gen-spa-routes.mjs           -> (re)gera o arquivo
 *   node scripts/gen-spa-routes.mjs --check   -> checa paridade, sem escrever
 *
 * Sanidade (falha com exit != 0):
 *   - extraiu menos que MIN_EXPECTED_ROUTES rotas;
 *   - achou `<Route>` com `path` que nao seja string literal (evita gerar uma
 *     lista incompleta silenciosamente).
 *
 * `<Route>` sem atributo `path` (ex.: o fallback `<Route component={NotFound}>`)
 * e ignorado de proposito: nao representa um path do roteador.
 *
 * Parametros (`:concurso`, `:slug`, `:id`, ...) sao preservados como estao no
 * App.tsx. A conversao para regex e responsabilidade do validador em
 * `artifacts/api-server/src/app.ts`.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, "..");
const APP_TSX = path.join(REPO_ROOT, "artifacts/estude-loterias/src/App.tsx");
const OUT_FILE = path.join(REPO_ROOT, "artifacts/api-server/src/generated/spa-routes.ts");

/** Piso de seguranca: hoje o App.tsx declara 123 rotas. */
export const MIN_EXPECTED_ROUTES = 100;

/**
 * Extrai os paths dos `<Route>` de um codigo-fonte TSX.
 *
 * @param {string} sourceText conteudo do App.tsx
 * @param {string} [fileName] nome para mensagens de erro
 * @returns {{ routes: string[], problems: string[], fallbackRoutes: number }}
 */
export function extractSpaRoutes(sourceText, fileName = "App.tsx") {
  const sourceFile = ts.createSourceFile(
    fileName,
    sourceText,
    ts.ScriptTarget.Latest,
    /* setParentNodes */ true,
    ts.ScriptKind.TSX,
  );

  /** @type {string[]} */
  const routes = [];
  const seen = new Set();
  /** @type {string[]} */
  const problems = [];
  let fallbackRoutes = 0;

  const nodeTagName = (node) =>
    ts.isIdentifier(node.tagName) ? node.tagName.text : node.tagName.getText(sourceFile);

  const readPathLiteral = (attribute) => {
    const initializer = attribute.initializer;
    if (!initializer) return { ok: false, reason: "atributo sem valor" };
    if (ts.isStringLiteral(initializer)) return { ok: true, value: initializer.text };
    if (ts.isJsxExpression(initializer) && initializer.expression) {
      const expression = initializer.expression;
      if (ts.isStringLiteral(expression) || ts.isNoSubstitutionTemplateLiteral(expression)) {
        return { ok: true, value: expression.text };
      }
      return { ok: false, reason: `expressao: ${expression.getText(sourceFile)}` };
    }
    return { ok: false, reason: initializer.getText(sourceFile) };
  };

  const visit = (node) => {
    const isRouteElement = ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node);
    if (isRouteElement && nodeTagName(node) === "Route") {
      const pathAttribute = node.attributes.properties.find(
        (property) => ts.isJsxAttribute(property) && property.name.getText(sourceFile) === "path",
      );

      if (!pathAttribute) {
        fallbackRoutes += 1;
      } else {
        const result = readPathLiteral(pathAttribute);
        if (result.ok) {
          if (!seen.has(result.value)) {
            seen.add(result.value);
            routes.push(result.value);
          }
        } else {
          const { line } = sourceFile.getLineAndCharacterOfPosition(pathAttribute.getStart(sourceFile));
          problems.push(
            `${path.relative(REPO_ROOT, fileName)}:${line + 1}: <Route path> nao literal (${result.reason})`,
          );
        }
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return { routes, problems, fallbackRoutes };
}

/** Monta o conteudo completo (deterministico) do arquivo gerado. */
export function renderSpaRoutesFile(routes) {
  const banner = [
    "// GERADO AUTOMATICAMENTE. NAO EDITAR A MAO.",
    "//",
    "// Fonte: artifacts/estude-loterias/src/App.tsx",
    "// Gerador: scripts/gen-spa-routes.mjs",
    "// Regenerar: pnpm --filter @workspace/api-server run gen:routes",
    "//",
    "// Cada item preserva a sintaxe de parametro do App.tsx (`:concurso`,",
    "// `:slug`, `:id`, ...). A conversao para regex de segmento (digitos vs.",
    "// segmento amplo) fica em artifacts/api-server/src/app.ts.",
    "",
    "export const SPA_ROUTE_PATTERNS = [",
  ];

  const patterns = routes.map((route) => `  ${JSON.stringify(route)},`);

  return [...banner, ...patterns, "] as const;", "", "export type SpaRoutePattern = (typeof SPA_ROUTE_PATTERNS)[number];", ""].join("\n");
}

/** Le o App.tsx e devolve as rotas ou lanca um erro descritivo. */
export function loadSpaRoutes() {
  if (!fs.existsSync(APP_TSX)) {
    throw new Error(`App.tsx nao encontrado em ${APP_TSX}`);
  }

  const sourceText = fs.readFileSync(APP_TSX, "utf8");
  const { routes, problems, fallbackRoutes } = extractSpaRoutes(sourceText, APP_TSX);

  if (problems.length > 0) {
    for (const problem of problems) console.error(`[gen-spa-routes] ERRO ${problem}`);
    throw new Error(
      "Encontrei <Route> com path nao literal. Use uma string literal para que a rota entre na lista gerada.",
    );
  }

  if (routes.length < MIN_EXPECTED_ROUTES) {
    throw new Error(
      `Extrai apenas ${routes.length} rotas (minimo esperado: ${MIN_EXPECTED_ROUTES}). Abortando para nao gerar lista incompleta.`,
    );
  }

  return { routes, fallbackRoutes };
}

/** Caminho absoluto do arquivo gerado. */
export function generatedFilePath() {
  return OUT_FILE;
}

/** Gera o conteudo em memoria a partir do App.tsx atual. */
export function buildGeneratedContent() {
  const { routes, fallbackRoutes } = loadSpaRoutes();
  return { content: renderSpaRoutesFile(routes), routes, fallbackRoutes };
}

/**
 * Checa se o arquivo gerado em disco bate com o App.tsx. Nao escreve nada.
 * @returns {boolean} true quando em sincronia.
 */
export function checkParity() {
  const { content, routes } = buildGeneratedContent();
  const current = fs.existsSync(OUT_FILE) ? fs.readFileSync(OUT_FILE, "utf8") : null;

  if (current === content) {
    console.log(`[check-spa-routes] OK: ${routes.length} rotas em sincronia com o App.tsx.`);
    return true;
  }

  console.error(`[check-spa-routes] DRIFT: ${path.relative(REPO_ROOT, OUT_FILE)} difere do App.tsx.`);
  if (current === null) {
    console.error("  O arquivo gerado nao existe.");
  } else {
    const currentLines = current.split("\n");
    const expectedLines = content.split("\n");
    const max = Math.max(currentLines.length, expectedLines.length);
    let shown = 0;
    for (let i = 0; i < max && shown < 10; i += 1) {
      if (currentLines[i] !== expectedLines[i]) {
        console.error(`  linha ${i + 1}:`);
        console.error(`    atual:    ${currentLines[i] ?? "<ausente>"}`);
        console.error(`    esperado: ${expectedLines[i] ?? "<ausente>"}`);
        shown += 1;
      }
    }
  }
  console.error("  Rode: pnpm --filter @workspace/api-server run gen:routes");
  return false;
}

/** Regenera o arquivo em disco (modo padrao do CLI). */
export function writeGeneratedFile() {
  const { content, routes, fallbackRoutes } = buildGeneratedContent();
  const previous = fs.existsSync(OUT_FILE) ? fs.readFileSync(OUT_FILE, "utf8") : null;

  if (previous === content) {
    console.log(`[gen-spa-routes] ${routes.length} rotas extraidas. Arquivo ja estava atualizado.`);
    return { routes, changed: false };
  }

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, content, "utf8");
  console.log(
    `[gen-spa-routes] ${routes.length} rotas extraidas (${fallbackRoutes} <Route> sem path ignorados).` +
      ` Escrito ${path.relative(REPO_ROOT, OUT_FILE)}.`,
  );
  return { routes, changed: true };
}

function main() {
  const checkMode = process.argv.includes("--check");

  try {
    if (checkMode) {
      process.exitCode = checkParity() ? 0 : 1;
      return;
    }
    writeGeneratedFile();
  } catch (error) {
    console.error(`[gen-spa-routes] ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}

const invokedDirectly =
  process.argv[1] !== undefined && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedDirectly) {
  main();
}
