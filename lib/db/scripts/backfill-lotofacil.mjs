import pg from 'pg';

const { Pool } = pg;

const CAIXA_API = "https://servicebus2.caixa.gov.br/portaldeloterias/api";
const CAIXA_HEADERS = {
  Accept: "application/json",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  Origin: "https://loterias.caixa.gov.br",
  Referer: "https://loterias.caixa.gov.br/",
};

const BATCH_SIZE = 5;
const DELAY_MS = 200;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchCaixa(concurso) {
  const url = `${CAIXA_API}/lotofacil/${concurso}`;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, {
        headers: CAIXA_HEADERS,
        signal: AbortSignal.timeout(7000),
      });
      if (res.status === 403) {
        await sleep(1000 + attempt * 1000);
        continue;
      }
      if (!res.ok) return null;
      return res.json();
    } catch (e) {
      if (attempt < 1) await sleep(500);
    }
  }
  return null;
}

function normalizeResult(raw) {
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
    valorAcumulado: (raw.valorAcumuladoProximoConcurso && raw.valorAcumuladoProximoConcurso > 0) ? String(raw.valorAcumuladoProximoConcurso) : null,
    dataProximoConcurso: raw.dataProximoConcurso ?? null,
    valorEstimadoProximo: (raw.valorEstimadoProximoConcurso && raw.valorEstimadoProximoConcurso > 0) ? String(raw.valorEstimadoProximoConcurso) : null,
    local: raw.nomeMunicipioUFSorteio ?? raw.localSorteio ?? null,
    arrecadacaoTotal: raw.valorArrecadado ? String(raw.valorArrecadado) : null,
    valorAcumuladoConcurso_0_5: raw.valorAcumuladoConcurso_0_5 ? String(raw.valorAcumuladoConcurso_0_5) : null,
    valorAcumuladoConcursoEspecial: raw.valorAcumuladoConcursoEspecial ? String(raw.valorAcumuladoConcursoEspecial) : null,
  };
}

async function batchInsert(pool, items) {
  if (items.length === 0) return;

  const values = [];
  const params = [];
  let idx = 1;
  for (const data of items) {
    const premiosJson = JSON.stringify(data.premios);
    const dezenasJson = JSON.stringify(data.dezenas);
    params.push(
      data.concurso, data.data, dezenasJson, premiosJson, data.acumulado,
      data.valorAcumulado, data.dataProximoConcurso, data.valorEstimadoProximo,
      data.local, data.arrecadacaoTotal, data.valorAcumuladoConcurso_0_5, data.valorAcumuladoConcursoEspecial
    );
    values.push(`($${idx}, 'lotofacil', $${idx + 1}, $${idx + 2}::jsonb, $${idx + 3}::jsonb, $${idx + 4}, $${idx + 5}, $${idx + 6}, $${idx + 7}, $${idx + 8}, $${idx + 9}, $${idx + 10}, $${idx + 11})`);
    idx += 12;
  }

  const q = `
    INSERT INTO lottery_results (
      concurso, modalidade, data, dezenas, premios, acumulado,
      valor_acumulado, data_proximo_concurso, valor_estimado_proximo,
      local, arrecadacao_total, valor_acumulado_concurso_0_5, valor_acumulado_concurso_especial
    )
    VALUES ${values.join(", ")}
    ON CONFLICT (modalidade, concurso)
    DO UPDATE SET
      data = EXCLUDED.data,
      dezenas = EXCLUDED.dezenas,
      premios = EXCLUDED.premios,
      acumulado = EXCLUDED.acumulado,
      valor_acumulado = EXCLUDED.valor_acumulado,
      data_proximo_concurso = EXCLUDED.data_proximo_concurso,
      valor_estimado_proximo = EXCLUDED.valor_estimado_proximo,
      local = EXCLUDED.local,
      arrecadacao_total = EXCLUDED.arrecadacao_total,
      valor_acumulado_concurso_0_5 = EXCLUDED.valor_acumulado_concurso_0_5,
      valor_acumulado_concurso_especial = EXCLUDED.valor_acumulado_concurso_especial
  `;
  await pool.query(q, params);
}

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
  });

  console.log("Finding missing Lotofacil concursos...");
  const missingResult = await pool.query(`
    WITH lotofacil_nums AS (
      SELECT concurso FROM lottery_results WHERE modalidade = 'lotofacil' ORDER BY concurso
    )
    SELECT gs.n::integer as concurso
    FROM generate_series(1, 3721) AS gs(n)
    WHERE NOT EXISTS (SELECT 1 FROM lotofacil_nums WHERE concurso = gs.n)
    ORDER BY gs.n
  `);

  const missing = missingResult.rows.map((r) => r.concurso);
  console.log(`Missing concursos: ${missing.length}`);

  if (missing.length === 0) {
    console.log("No missing concursos. DB is complete.");
    await pool.end();
    return;
  }

  let succeeded = 0;
  let failed = 0;
  const total = missing.length;
  let lastLog = Date.now();

  for (let i = 0; i < missing.length; i += BATCH_SIZE) {
    const batch = missing.slice(i, i + BATCH_SIZE);

    const results = await Promise.all(
      batch.map(async (concurso) => {
        const raw = await fetchCaixa(concurso);
        if (raw) {
          const data = normalizeResult(raw);
          if (data.concurso > 0) return { ok: true, data };
        }
        return { ok: false, concurso };
      })
    );

    const validItems = results.filter((r) => r.ok).map((r) => r.data);
    const batchFailed = results.filter((r) => !r.ok);

    if (validItems.length > 0) {
      try {
        await batchInsert(pool, validItems);
        succeeded += validItems.length;
      } catch (err) {
        console.error(`  [ERR] Batch insert failed:`, err.message);
        failed += validItems.length;
      }
    }
    failed += batchFailed.length;

    const done = Math.min(i + BATCH_SIZE, total);
    const now = Date.now();
    if (done % 100 === 0 || done === total || now - lastLog > 30000) {
      console.log(`  Progress: ${done}/${total} | succeeded: ${succeeded} | failed: ${failed} | ${((done / total) * 100).toFixed(1)}%`);
      lastLog = now;
    }

    if (i + BATCH_SIZE < total) {
      await sleep(DELAY_MS);
    }
  }

  console.log(`\nDone. Total: ${total} | Succeeded: ${succeeded} | Failed: ${failed}`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
