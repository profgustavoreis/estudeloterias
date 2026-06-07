import { db } from "@workspace/db";
import { lotteryResultsTable } from "@workspace/db/schema";
import { eq, desc, max } from "drizzle-orm";
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

  return {
    modalidade,
    concurso: raw.numero ?? 0,
    data: raw.dataApuracao ?? "",
    dezenas: raw.listaDezenas ?? [],
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
        premios: data.premios as any,
        acumulado: data.acumulado,
        valorAcumulado: data.valorAcumulado,
        dataProximoConcurso: data.dataProximoConcurso,
        valorEstimadoProximo: data.valorEstimadoProximo,
        local: data.local,
        arrecadacaoTotal: data.arrecadacaoTotal,
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
  for (let n = to; n >= from; n--) {
    const raw = await fetchCaixa(modalidade, n);
    if (raw) {
      await upsertResult(normalizeResult(raw, modalidade));
      succeeded++;
    }
    if (n > from) await sleep(delayMs);
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
  const [stored] = await db
    .select({ maxConcurso: max(lotteryResultsTable.concurso) })
    .from(lotteryResultsTable)
    .where(eq(lotteryResultsTable.modalidade, modalidade));

  const raw = await fetchCaixa(modalidade);
  if (!raw) {
    logger.warn({ modalidade }, "Could not fetch latest for seed");
    return;
  }

  const latest = normalizeResult(raw, modalidade);
  await upsertResult(latest);

  const latestConcurso = latest.concurso;
  if (!latestConcurso) return;

  const maxStored = stored?.maxConcurso ?? 0;
  const DESIRED = 300;
  const seedFrom = Math.max(1, latestConcurso - DESIRED);

  if (maxStored < seedFrom) {
    logger.info({ modalidade, from: seedFrom, to: latestConcurso - 1 }, "Seeding");
    await batchFetch(modalidade, seedFrom, latestConcurso - 1, 150);
  } else if (maxStored < latestConcurso - 1) {
    await batchFetch(modalidade, maxStored + 1, latestConcurso - 1, 150);
  } else {
    logger.info({ modalidade }, "DB already seeded, skipping");
  }
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
