import { db } from "@workspace/db";
import { lotteryResultsTable } from "@workspace/db/schema";
import { eq, desc, max, min, asc, sql } from "drizzle-orm";
import { logger } from "../lib/logger";

const CAIXA_API = "https://servicebus2.caixa.gov.br/portaldeloterias/api";

const CAIXA_HEADERS = {
  Accept: "application/json",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  Origin: "https://loterias.caixa.gov.br",
  Referer: "https://loterias.caixa.gov.br/",
};

const MODALIDADES = [
  "megasena", "lotofacil", "quina", "duplasena",
  "diadesorte", "supersete", "lotomania", "timemania", "maismilionaria",
];

interface CaixaResult {
  numero?: number;
  dataApuracao?: string;
  listaDezenas?: string[];
  dezenasSorteadasOrdemSorteio?: string[];
  listaDezenasSegundoSorteio?: string[];
  nomeTimeCoracaoMesSorte?: string;
  trevosSorteados?: Array<number | string>;
  listaRateioPremio?: Array<{
    numeroAcertos: number;
    descricaoFaixa: string;
    numeroDeGanhadores: number;
    valorPremio: number;
  }>;
  acumulado?: boolean;
  valorAcumuladoProximoConcurso?: number;
  valorEstimadoProximoConcurso?: number;
  dataProximoConcurso?: string;
  nomeMunicipioUFSorteio?: string;
  localSorteio?: string;
  valorArrecadado?: number;
  valorAcumuladoConcurso_0_5?: number;
  valorAcumuladoConcursoEspecial?: number;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchCaixa(modalidade: string, concurso?: number): Promise<CaixaResult | null> {
  const url = concurso
    ? `${CAIXA_API}/${modalidade}/${concurso}`
    : `${CAIXA_API}/${modalidade}`;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, {
        headers: CAIXA_HEADERS,
        signal: AbortSignal.timeout(10000),
      });
      if (res.status === 403) {
        await sleep(2000 + attempt * 1000);
        continue;
      }
      if (!res.ok) return null;
      return res.json() as Promise<CaixaResult>;
    } catch {
      if (attempt < 2) await sleep(1000);
    }
  }
  return null;
}

export function normalizeResult(raw: CaixaResult, modalidade: string) {
  const premios = (raw.listaRateioPremio ?? []).map((r, idx) => ({
    faixa: idx + 1,
    descricao: r.descricaoFaixa ?? `${r.numeroAcertos} acertos`,
    ganhadores: r.numeroDeGanhadores,
    valorPremio: r.valorPremio,
  }));

  const metadata: { dezenas2?: string[]; nomeEspecial?: string; trevos?: string[] } = {};
  if (raw.listaDezenasSegundoSorteio?.length) {
    metadata.dezenas2 = raw.listaDezenasSegundoSorteio;
  }
  if (raw.nomeTimeCoracaoMesSorte) {
    const cleaned = raw.nomeTimeCoracaoMesSorte.replace(/\u0000/g, "").trim();
    if (cleaned) metadata.nomeEspecial = cleaned;
  }
  if (raw.trevosSorteados?.length) {
    metadata.trevos = raw.trevosSorteados.map(String);
  }

  return {
    modalidade,
    concurso: raw.numero ?? 0,
    data: raw.dataApuracao ?? "",
    dezenas: raw.listaDezenas ?? [],
    dezenasOrdem: raw.dezenasSorteadasOrdemSorteio?.length ? raw.dezenasSorteadasOrdemSorteio : null,
    premios,
    acumulado: raw.acumulado ?? false,
    valorAcumulado:
      raw.valorAcumuladoProximoConcurso && raw.valorAcumuladoProximoConcurso > 0
        ? String(raw.valorAcumuladoProximoConcurso)
        : null,
    dataProximoConcurso: raw.dataProximoConcurso ?? null,
    valorEstimadoProximo:
      raw.valorEstimadoProximoConcurso && raw.valorEstimadoProximoConcurso > 0
        ? String(raw.valorEstimadoProximoConcurso)
        : null,
    local: raw.nomeMunicipioUFSorteio ?? raw.localSorteio ?? null,
    arrecadacaoTotal: raw.valorArrecadado ? String(raw.valorArrecadado) : null,
    valorAcumuladoConcurso_0_5: raw.valorAcumuladoConcurso_0_5 ? String(raw.valorAcumuladoConcurso_0_5) : null,
    valorAcumuladoConcursoEspecial: raw.valorAcumuladoConcursoEspecial ? String(raw.valorAcumuladoConcursoEspecial) : null,
    metadata: Object.keys(metadata).length > 0 ? metadata : null,
  };
}

async function upsertResult(data: ReturnType<typeof normalizeResult>) {
  if (!data.concurso) return;
  await db
    .insert(lotteryResultsTable)
    .values(data as any)
    .onConflictDoUpdate({
      target: [lotteryResultsTable.modalidade, lotteryResultsTable.concurso],
      set: {
        dezenas: data.dezenas as any,
        dezenasOrdem: data.dezenasOrdem as any,
        premios: data.premios as any,
        acumulado: data.acumulado,
        valorAcumulado: data.valorAcumulado,
        dataProximoConcurso: data.dataProximoConcurso,
        valorEstimadoProximo: data.valorEstimadoProximo,
        local: data.local,
        arrecadacaoTotal: data.arrecadacaoTotal,
        valorAcumuladoConcurso_0_5: data.valorAcumuladoConcurso_0_5,
        valorAcumuladoConcursoEspecial: data.valorAcumuladoConcursoEspecial,
        metadata: data.metadata as any,
      },
    });
}

async function batchFetch(
  modalidade: string,
  from: number,
  to: number,
  delayMs = 120,
) {
  let succeeded = 0;
  const total = to - from + 1;
  for (let n = from; n <= to; n++) {
    const raw = await fetchCaixa(modalidade, n);
    if (raw) {
      await upsertResult(normalizeResult(raw, modalidade));
      succeeded++;
    }
    const done = n - from + 1;
    if (done % 100 === 0) {
      logger.info({ modalidade, progress: `${done}/${total}`, concurso: n }, "Batch fetch progress");
    }
    if (n < to) await sleep(delayMs);
  }
  logger.info({ modalidade, from, to, succeeded }, "Batch fetch complete");
}

export async function syncLatest(modalidade: string): Promise<void> {
  const raw = await fetchCaixa(modalidade);
  if (!raw) return;

  const latest = normalizeResult(raw, modalidade);
  await upsertResult(latest);

  const [stored] = await db
    .select({ maxConcurso: max(lotteryResultsTable.concurso) })
    .from(lotteryResultsTable)
    .where(eq(lotteryResultsTable.modalidade, modalidade));

  const maxStored = stored?.maxConcurso ?? 0;
  const latestConcurso = latest.concurso;

  if (latestConcurso > maxStored + 1) {
    const gapFrom = Math.max(1, maxStored + 1);
    const gapTo = latestConcurso - 1;
    logger.info({ modalidade, gapFrom, gapTo }, "Backfilling gap");
    await batchFetch(modalidade, gapFrom, gapTo);
  }
}

export async function seedInitialData(modalidade: string): Promise<void> {
  // Fetch latest concurso from Caixa to know the ceiling
  const raw = await fetchCaixa(modalidade);
  if (!raw) {
    logger.warn({ modalidade }, "Could not fetch latest for seed");
    return;
  }

  const latest = normalizeResult(raw, modalidade);
  await upsertResult(latest);
  const latestConcurso = latest.concurso;
  if (!latestConcurso) return;

  // Get current DB coverage
  const [coverage] = await db
    .select({
      minConcurso: min(lotteryResultsTable.concurso),
      maxConcurso: max(lotteryResultsTable.concurso),
    })
    .from(lotteryResultsTable)
    .where(eq(lotteryResultsTable.modalidade, modalidade));

  const minStored = coverage?.minConcurso ?? latestConcurso;
  const maxStored = coverage?.maxConcurso ?? latestConcurso;

  // Backfill: fetch everything from 1 up to the oldest record we have
  if (minStored > 1) {
    logger.info({ modalidade, from: 1, to: minStored - 1 }, "Historical backfill starting");
    await batchFetch(modalidade, 1, minStored - 1, 120);
  }

  // Gap fill: fetch anything between maxStored and latest
  if (maxStored < latestConcurso - 1) {
    logger.info({ modalidade, from: maxStored + 1, to: latestConcurso - 1 }, "Gap fill starting");
    await batchFetch(modalidade, maxStored + 1, latestConcurso - 1, 120);
  }

  if (minStored <= 1 && maxStored >= latestConcurso - 1) {
    logger.info({ modalidade }, "DB fully seeded, skipping");
  }
}

export async function backfillGaps(modalidade: string): Promise<void> {
  const raw = await fetchCaixa(modalidade);
  if (!raw) {
    logger.warn({ modalidade }, "backfillGaps: could not fetch latest");
    return;
  }
  const latest = normalizeResult(raw, modalidade);
  await upsertResult(latest);
  const ceiling = latest.concurso;
  if (!ceiling) return;

  // Find all concursos in [1..ceiling] missing from DB using SQL gap detection
  const missingRows = await db.execute(sql`
    WITH existing AS (
      SELECT concurso FROM ${lotteryResultsTable}
      WHERE ${lotteryResultsTable.modalidade} = ${modalidade}
    )
    SELECT gs.n::integer AS concurso
    FROM generate_series(1, ${ceiling}) AS gs(n)
    WHERE NOT EXISTS (SELECT 1 FROM existing WHERE concurso = gs.n)
    ORDER BY gs.n
  `);

  const missing = (missingRows.rows as { concurso: number }[]).map((r) => r.concurso);
  logger.info({ modalidade, count: missing.length, ceiling }, "backfillGaps: missing concursos found");

  if (missing.length === 0) {
    logger.info({ modalidade }, "backfillGaps: no gaps, DB is complete");
    return;
  }

  let succeeded = 0;
  let failed = 0;
  for (let i = 0; i < missing.length; i++) {
    const concurso = missing[i];
    try {
      const rawItem = await fetchCaixa(modalidade, concurso);
      if (rawItem) {
        await upsertResult(normalizeResult(rawItem, modalidade));
        succeeded++;
      } else {
        failed++;
      }
    } catch (err) {
      logger.error({ err, modalidade, concurso }, "backfillGaps: fetch/upsert error");
      failed++;
    }
    if ((i + 1) % 100 === 0) {
      logger.info({ modalidade, progress: `${i + 1}/${missing.length}`, succeeded, failed }, "backfillGaps progress");
    }
    if (i < missing.length - 1) await sleep(150);
  }

  logger.info({ modalidade, succeeded, failed, total: missing.length }, "backfillGaps complete");
}

export async function runSync(): Promise<void> {
  logger.info("Running lottery sync");
  for (const modalidade of MODALIDADES) {
    try {
      await syncLatest(modalidade);
      await sleep(500);
    } catch (err) {
      logger.error({ err, modalidade }, "Sync failed");
    }
  }
}

export async function backfillOrdemSorteio(modalidade: string): Promise<void> {
  logger.info({ modalidade }, "Starting dezenasOrdem backfill");

  // Find all concursos missing draw order
  const rows = await db
    .select({ concurso: lotteryResultsTable.concurso })
    .from(lotteryResultsTable)
    .where(
      sql`${lotteryResultsTable.modalidade} = ${modalidade} AND ${lotteryResultsTable.dezenasOrdem} IS NULL`,
    )
    .orderBy(asc(lotteryResultsTable.concurso));

  const missing = rows.map((r) => r.concurso);
  logger.info({ modalidade, count: missing.length }, "Concursos missing dezenasOrdem");

  let updated = 0;
  let failed = 0;
  for (let i = 0; i < missing.length; i++) {
    const concurso = missing[i];
    try {
      const raw = await fetchCaixa(modalidade, concurso);
      if (raw?.dezenasSorteadasOrdemSorteio?.length) {
        await db
          .update(lotteryResultsTable)
          .set({ dezenasOrdem: raw.dezenasSorteadasOrdemSorteio as any })
          .where(
            sql`${lotteryResultsTable.modalidade} = ${modalidade} AND ${lotteryResultsTable.concurso} = ${concurso}`,
          );
        updated++;
      } else {
        failed++;
      }
    } catch (err) {
      logger.error({ err, concurso }, "backfillOrdemSorteio: fetch error");
      failed++;
    }

    if ((i + 1) % 100 === 0) {
      logger.info({ modalidade, progress: `${i + 1}/${missing.length}`, updated, failed }, "Backfill progress");
    }
    if (i < missing.length - 1) await sleep(120);
  }

  logger.info({ modalidade, updated, failed }, "dezenasOrdem backfill complete");
}

export async function runInitialSeed(): Promise<void> {
  logger.info("Starting initial seed — Mega-Sena first");
  try {
    await seedInitialData("megasena");
    logger.info("Mega-Sena seed complete");
  } catch (err) {
    logger.error({ err }, "Mega-Sena seed failed");
  }
  // Seed other lotteries in background
  for (const m of MODALIDADES.filter((x) => x !== "megasena")) {
    seedInitialData(m)
      .then(() => logger.info({ modalidade: m }, "Background seed complete"))
      .catch((err) => logger.error({ err, modalidade: m }, "Background seed failed"));
    await sleep(2000);
  }
}

export { fetchCaixa as fetchGuidi };
