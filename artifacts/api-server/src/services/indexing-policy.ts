import whitelistRaw from "../seo/indexing-whitelist.json";
import { logger } from "../lib/logger";
import { toIsoDate, windowCutoffIso } from "../lib/sampa-date";

/**
 * Régua única de indexação das páginas de concurso
 * (`/:modalidade/resultado/:concurso`), compartilhada pelo `<head>` SSR e
 * (na fase de corte) pelo sitemap.
 *
 * Decisão, em ordem de precedência:
 *   exclude > extra > whitelist GSC > janela recente > corte
 *
 * Semântica do corte (`SEO_INDEXING_CUT_ENABLED`):
 *   - desligado (default): concursos fora da janela e fora da whitelist
 *     continuam `index, follow` (nada muda no site);
 *   - ligado: esses concursos viram `noindex, follow`.
 *
 * A whitelist é um artefato revisado em commit: JSON importado e Set montado
 * **uma única vez no import**. Só as flags de ambiente são relidas, e mesmo
 * assim em snapshot memoizado (TTL de 10 min).
 */

export interface IndexingWhitelistEntry {
  path: string;
  clicks: number;
  impressions: number;
  reason: string;
}

export interface IndexingWhitelistRules {
  minClicks: number;
  minImpressions: number;
  periodDays: number;
  pathPattern: string;
}

export interface IndexingWhitelistFile {
  generatedAt: string | null;
  source: string;
  rules: IndexingWhitelistRules;
  paths: IndexingWhitelistEntry[];
}

const WHITELIST: IndexingWhitelistFile = whitelistRaw as IndexingWhitelistFile;

/** Parse único no import: whitelist de demanda vinda do GSC. */
const WHITELIST_PATHS: ReadonlySet<string> = new Set(
  WHITELIST.paths.map((entry) => entry.path),
);

export interface ConcursoPath {
  modSlug: string;
  concurso: number;
  /** Path normalizado usado nas comparações com whitelist/extra/exclude. */
  path: string;
}

/**
 * Parse canônico de `/:modalidade/resultado/:concurso` (hoje duplicado no
 * middleware de SEO e em `resolveBodyLinks`). Normaliza query/hash, barra
 * final e caixa; devolve `null` para qualquer outro shape.
 */
export function parseConcursoPath(rawPath: string): ConcursoPath | null {
  const clean = rawPath.split("?")[0]?.split("#")[0] ?? "";
  const match = /^\/([a-z0-9-]+)\/resultado\/(\d+)\/?$/.exec(clean.toLowerCase());
  if (!match) return null;
  const concurso = Number(match[2]);
  return {
    modSlug: match[1],
    concurso,
    path: `/${match[1]}/resultado/${match[2]}`,
  };
}

export type IndexingReason =
  | "exclude"
  | "extra"
  | "whitelist"
  | "window"
  | "cut"
  | "cut-disabled";

export interface IndexingDecision {
  indexable: boolean;
  reason: IndexingReason;
}

export interface IndexingPolicySnapshot {
  cutEnabled: boolean;
  windowMonths: number;
  extraPaths: ReadonlySet<string>;
  excludePaths: ReadonlySet<string>;
  whitelistPaths: ReadonlySet<string>;
}

const DEFAULT_WINDOW_MONTHS = 12;
const SNAPSHOT_TTL_MS = 10 * 60 * 1000;

let snapshot: IndexingPolicySnapshot | null = null;
let snapshotBuiltAt = 0;

function parseEnabled(value: string | undefined): boolean {
  if (!value) return false;
  return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
}

function parseWindowMonths(value: string | undefined): number {
  if (!value) return DEFAULT_WINDOW_MONTHS;
  const parsed = Number.parseInt(value.trim(), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_WINDOW_MONTHS;
}

/** Aceita path (`/mega-sena/resultado/123`) ou URL completa; ignora o resto. */
function normalizePolicyPath(value: string): string | null {
  let raw = value.trim();
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) {
    try {
      raw = new URL(raw).pathname;
    } catch {
      return null;
    }
  }
  return parseConcursoPath(raw)?.path ?? null;
}

function parsePathList(value: string | undefined, envName: string): Set<string> {
  const paths = new Set<string>();
  if (!value) return paths;
  for (const item of value.split(",")) {
    const trimmed = item.trim();
    if (!trimmed) continue;
    const path = normalizePolicyPath(trimmed);
    if (!path) {
      logger.warn(
        { env: envName, value: trimmed },
        "SEO indexing: path ignorado (shape inválido)",
      );
      continue;
    }
    paths.add(path);
  }
  return paths;
}

function buildSnapshot(): IndexingPolicySnapshot {
  return {
    cutEnabled: parseEnabled(process.env["SEO_INDEXING_CUT_ENABLED"]),
    windowMonths: parseWindowMonths(process.env["SEO_INDEXING_WINDOW_MONTHS"]),
    extraPaths: parsePathList(process.env["SEO_INDEXING_EXTRA_PATHS"], "SEO_INDEXING_EXTRA_PATHS"),
    excludePaths: parsePathList(process.env["SEO_INDEXING_EXCLUDE_PATHS"], "SEO_INDEXING_EXCLUDE_PATHS"),
    whitelistPaths: WHITELIST_PATHS,
  };
}

/** Snapshot memoizado das flags de ambiente (TTL de 10 min). */
export function getIndexingPolicySnapshot(): IndexingPolicySnapshot {
  const now = Date.now();
  if (snapshot && now - snapshotBuiltAt < SNAPSHOT_TTL_MS) return snapshot;
  snapshot = buildSnapshot();
  snapshotBuiltAt = now;
  return snapshot;
}

/** Invalida o snapshot (admin/testes); a próxima chamada relê o ambiente. */
export function clearIndexingPolicyCache(): void {
  snapshot = null;
  snapshotBuiltAt = 0;
}

/**
 * Função pura (sem I/O) que decide se uma página de concurso pode ser
 * indexada. `drawDate` é a data da Caixa (`dd/mm/yyyy`) da linha do concurso;
 * data ausente/inválida cai direto na decisão do corte.
 */
export function isConcursoIndexable(input: {
  modSlug: string;
  concurso: number;
  drawDate: string | null | undefined;
}): IndexingDecision {
  const path = `/${input.modSlug.toLowerCase()}/resultado/${input.concurso}`;
  const policy = getIndexingPolicySnapshot();

  if (policy.excludePaths.has(path)) return { indexable: false, reason: "exclude" };
  if (policy.extraPaths.has(path)) return { indexable: true, reason: "extra" };
  if (policy.whitelistPaths.has(path)) return { indexable: true, reason: "whitelist" };

  const drawIso = toIsoDate(input.drawDate ?? null);
  if (drawIso && drawIso >= windowCutoffIso(policy.windowMonths)) {
    return { indexable: true, reason: "window" };
  }

  return policy.cutEnabled
    ? { indexable: false, reason: "cut" }
    : { indexable: true, reason: "cut-disabled" };
}

/** Metadados da whitelist (para admin/logs). A whitelist em si fica no Set. */
export const INDEXING_WHITELIST_META = {
  generatedAt: WHITELIST.generatedAt,
  source: WHITELIST.source,
  rules: WHITELIST.rules,
  size: WHITELIST.paths.length,
} as const;
