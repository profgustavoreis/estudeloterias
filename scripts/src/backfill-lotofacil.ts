import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { sql } from "drizzle-orm";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL not set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

const CAIXA_API = "https://servicebus2.caixa.gov.br/portaldeloterias/api";

const CAIXA_HEADERS = {
  Accept: "application/json",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  Origin: "https://loterias.caixa.gov.br",
  Referer: "https://loterias.caixa.gov.br/",
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

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
  valorAcumuladoConcurso_0_5?: number;
  valorAcumuladoConcursoEspecial?: number;
}

async function fetchCaixa(concurso: number): Promise<CaixaResult | null> {
  const url = `${CAIXA_API}/lotofacil/${concurso}`;
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

async function upsertResult(data: {
  concurso: number;
  data: string;
  dezenas: string[];
  premios: Array<{ faixa: number; descricao: string; ganhadores: number; valorPremio: number }>;
  acumulado: boolean;
  valorAcumulado: string | null;
  dataProximoConcurso: string | null;
  valorEstimadoProximo: string | null;
  local: string | null;
  arrecadacaoTotal: string | null;
  valorAcumuladoConcurso_0_5: string | null;
  valorAcumuladoConcursoEspecial: string | null;
}) {
  if (!data.concurso) return;
  const premiosJson = JSON.stringify(data.premios);
  const dezenasJson = JSON.stringify(data.dezenas);

  await db.execute(sql`
    INSERT INTO lottery_results (
      modalidade, concurso, data, dezenas, premios, acumulado,
      "valorAcumulado", "dataProximoConcurso", "valorEstimadoProximo",
      local, "arrecadacaoTotal", "valorAcumuladoConcurso_0_5", "valorAcumuladoConcursoEspecial"
    )
    VALUES (
      'lotofacil', ${data.concurso}, ${data.data}, ${dezenasJson}::jsonb, ${premiosJson}::jsonb, ${data.acumulado},
      ${data.valorAcumulado}, ${data.dataProximoConcurso}, ${data.valorEstimadoProximo},
      ${data.local}, ${data.arrecadacaoTotal}, ${data.valorAcumuladoConcurso_0_5}, ${data.valorAcumuladoConcursoEspecial}
    )
    ON CONFLICT (modalidade, concurso)
    DO UPDATE SET
      data = EXCLUDED.data,
      dezenas = EXCLUDED.dezenas,
      premios = EXCLUDED.premios,
      acumulado = EXCLUDED.acumulado,
      "valorAcumulado" = EXCLUDED."valorAcumulado",
      "dataProximoConcurso" = EXCLUDED."dataProximoConcurso",
      "valorEstimadoProximo" = EXCLUDED."valorEstimadoProximo",
      local = EXCLUDED.local,
      "arrecadacaoTotal" = EXCLUDED."arrecadacaoTotal",
      "valorAcumuladoConcurso_0_5" = EXCLUDED."valorAcumuladoConcurso_0_5",
      "valorAcumuladoConcursoEspecial" = EXCLUDED."valorAcumuladoConcursoEspecial"
  `);
}

function normalizeResult(raw: CaixaResult) {
  const premios = (raw.listaRateioPremio ?? []).map((r, idx) => ({
    faixa: idx + 1,
    descricao: r.descricaoFaixa ?? `${r.numeroAcertos} acertos`,
    ganhadores: r.numeroDeGanhadores,
    valorPremio: r.valorPremio,
  }));

  return {
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
    valorAcumuladoConcurso_0_5: raw.valorAcumuladoConcurso_0_5 ? String(raw.valorAcumuladoConcurso_0_5) : null,
    valorAcumuladoConcursoEspecial: raw.valorAcumuladoConcursoEspecial ? String(raw.valorAcumuladoConcursoEspecial) : null,
  };
}

async function main() {
  // Find missing concursos
  console.log("Finding missing Lotofácil concursos...");
  const missingRows = await db.execute(sql`
    WITH lotofacil_nums AS (
      SELECT concurso FROM lottery_results WHERE modalidade = 'lotofacil' ORDER BY concurso
    )
    SELECT gs.n::integer as concurso
    FROM generate_series(1, 3721) AS gs(n)
    WHERE NOT EXISTS (SELECT 1 FROM lotofacil_nums WHERE concurso = gs.n)
    ORDER BY gs.n
  `);

  const missing = missingRows.rows.map((r: any) => r.concurso) as number[];
  console.log(`Missing concursos: ${missing.length}`);

  if (missing.length === 0) {
    console.log("No missing concursos. DB is complete.");
    await pool.end();
    return;
  }

  // Fetch and insert in batches
  let succeeded = 0;
  let failed = 0;
  const total = missing.length;
  const delayMs = 150; // slightly slower to avoid rate limiting

  for (let i = 0; i < missing.length; i++) {
    const concurso = missing[i];
    const raw = await fetchCaixa(concurso);
    if (raw) {
      const data = normalizeResult(raw);
      if (data.concurso > 0) {
        try {
          await upsertResult(data);
          succeeded++;
        } catch (err) {
          console.error(`Failed to upsert concurso ${concurso}:`, err);
          failed++;
        }
      } else {
        failed++;
      }
    } else {
      console.warn(`Failed to fetch concurso ${concurso}`);
      failed++;
    }

    const done = i + 1;
    if (done % 100 === 0 || done === total) {
      console.log(`Progress: ${done}/${total} | succeeded: ${succeeded} | failed: ${failed}`);
    }

    if (i < missing.length - 1) {
      await sleep(delayMs);
    }
  }

  console.log(`Done. Total: ${total} | Succeeded: ${succeeded} | Failed: ${failed}`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
