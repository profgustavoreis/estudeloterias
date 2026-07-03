import { Router } from "express";
import { db } from "@workspace/db";
import { lotteryResultsTable } from "@workspace/db/schema";
import { eq, and, desc, asc, count, max, sql } from "drizzle-orm";
import { fetchGuidi, normalizeResult } from "../services/lottery-sync";
import { getLatest } from "./loterias";

const router = Router();

const MODALIDADE = "maismilionaria";

function toResultado(row: typeof lotteryResultsTable.$inferSelect) {
  const meta = row.metadata as { trevos?: string[] } | null;
  return {
    concurso: row.concurso,
    data: row.data,
    dezenas: row.dezenas as string[],
    trevos: meta?.trevos ?? null,
    premios: row.premios as Array<{ faixa: number; descricao: string; ganhadores: number; valorPremio: number }>,
    acumulado: row.acumulado,
    valorAcumulado: row.valorAcumulado ? Number(row.valorAcumulado) : null,
    dataProximoConcurso: row.dataProximoConcurso ?? null,
    valorEstimadoProximoConcurso: row.valorEstimadoProximo ? Number(row.valorEstimadoProximo) : null,
    arrecadacaoTotal: row.arrecadacaoTotal ? Number(row.arrecadacaoTotal) : null,
  };
}

router.get("/maismilionaria/resultado/ultimo", async (req, res) => {
  try {
    const row = await getLatest(MODALIDADE);
    if (!row) { res.status(503).json({ error: "Dados indisponíveis" }); return; }
    res.json("id" in row ? toResultado(row as any) : row);
  } catch (err) {
    req.log.error({ err }, "Failed to get maismilionaria ultimo resultado");
    res.status(500).json({ error: "Erro ao buscar resultado" });
  }
});

router.get("/maismilionaria/resultados", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10));
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit ?? "20"), 10)));
    const ano = req.query.ano ? parseInt(String(req.query.ano), 10) : null;
    const ordem = req.query.ordem === "asc" ? "asc" : "desc";
    const offset = (page - 1) * limit;

    const where = ano
      ? and(
          eq(lotteryResultsTable.modalidade, MODALIDADE),
          sql`SPLIT_PART(${lotteryResultsTable.data}, '/', 3)::integer = ${ano}`,
        )
      : eq(lotteryResultsTable.modalidade, MODALIDADE);

    const [{ total }] = await db
      .select({ total: count() })
      .from(lotteryResultsTable)
      .where(where);

    const rows = await db
      .select()
      .from(lotteryResultsTable)
      .where(where)
      .orderBy(ordem === "asc" ? asc(lotteryResultsTable.concurso) : desc(lotteryResultsTable.concurso))
      .limit(limit)
      .offset(offset);

    res.json({
      total,
      pagina: page,
      limite: limit,
      totalPaginas: Math.ceil(total / limit),
      resultados: rows.map(toResultado),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get maismilionaria resultados");
    res.status(500).json({ error: "Erro ao buscar resultados" });
  }
});

router.get("/maismilionaria/resultados/:concurso", async (req, res) => {
  const concurso = parseInt(req.params.concurso, 10);
  if (isNaN(concurso) || concurso < 1) { res.status(400).json({ error: "Concurso inválido" }); return; }

  try {
    const rows = await db
      .select()
      .from(lotteryResultsTable)
      .where(and(
        eq(lotteryResultsTable.modalidade, MODALIDADE),
        eq(lotteryResultsTable.concurso, concurso),
      ))
      .limit(1);

    if (rows.length > 0) { res.json(toResultado(rows[0])); return; }

    const raw = await fetchGuidi(MODALIDADE, concurso);
    if (!raw) { res.status(404).json({ error: "Concurso não encontrado" }); return; }
    const norm = normalizeResult(raw, MODALIDADE);
    res.json({
      ...norm,
      valorAcumulado: norm.valorAcumulado ? Number(norm.valorAcumulado) : null,
      valorEstimadoProximoConcurso: norm.valorEstimadoProximo ? Number(norm.valorEstimadoProximo) : null,
      arrecadacaoTotal: norm.arrecadacaoTotal ? Number(norm.arrecadacaoTotal) : null,
    });
  } catch (err) {
    req.log.error({ err, concurso }, "Failed to get maismilionaria concurso");
    res.status(404).json({ error: "Concurso não encontrado" });
  }
});

router.get("/maismilionaria/estatisticas", async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(lotteryResultsTable)
      .where(eq(lotteryResultsTable.modalidade, MODALIDADE))
      .orderBy(desc(lotteryResultsTable.concurso));

    if (rows.length === 0) {
      res.status(503).json({ error: "Dados insuficientes. Sincronização em andamento." });
      return;
    }

    const total = rows.length;
    const latestConcurso = rows[0].concurso;

    // +Milionária: 6 dezenas de 01 a 50 (min=21, max=285)
    const SOMA_BUCKETS = [
      { min: 21,  max: 59,  faixa: "21–59"   },
      { min: 60,  max: 99,  faixa: "60–99"   },
      { min: 100, max: 139, faixa: "100–139" },
      { min: 140, max: 179, faixa: "140–179" },
      { min: 180, max: 219, faixa: "180–219" },
      { min: 220, max: 259, faixa: "220–259" },
      { min: 260, max: 285, faixa: "260–285" },
    ];

    const PRIMOS = new Set([2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47]);
    const FIBONACCI = new Set([1, 2, 3, 5, 8, 13, 21, 34]);
    const TRIANGULARES = new Set([1, 3, 6, 10, 15, 21, 28, 36, 45]);

    // Grid 5×10: moldura = border (row1 + row5 + left/right of rows 2–4)
    const MOLDURA = new Set<number>([
      ...Array.from({ length: 10 }, (_, i) => i + 1),     // row 1: 01–10
      ...Array.from({ length: 10 }, (_, i) => i + 41),    // row 5: 41–50
      11, 20, 21, 30, 31, 40,                               // left/right of rows 2–4
    ]);

    const freq: Record<string, { count: number; lastSeenIdx: number | null }> = {};
    for (let i = 1; i <= 50; i++) {
      freq[String(i).padStart(2, "0")] = { count: 0, lastSeenIdx: null };
    }

    const paresDistrib: Record<number, number> = {};
    const lastConcursoForPares: Record<number, number> = {};
    const molduraDistrib: Record<number, number> = {};
    const lastConcursoForMoldura: Record<number, number> = {};
    const freqLinha = Array(5).fill(0);
    const freqColuna = Array(10).fill(0);
    const somaHist: Record<string, number> = {};
    const lastConcursoForBucket: Record<string, number> = {};
    let menorSoma = { valor: Infinity, concurso: 0, data: "" };
    let maiorSoma = { valor: -Infinity, concurso: 0, data: "" };
    const primosDistrib:  Record<number, number> = {};
    const fibDistrib:     Record<number, number> = {};
    const triDistrib:     Record<number, number> = {};
    const lastConcursoForPrimos: Record<number, number> = {};
    const lastConcursoForFib:    Record<number, number> = {};
    const lastConcursoForTri:    Record<number, number> = {};
    let primosTotal = 0, fibTotal = 0, triTotal = 0;
    let maiorPremio = 0;
    let maiorPremioRow = rows[0];
    let acumulados = 0;

    rows.forEach((row, idx) => {
      const dezenasStr = row.dezenas as string[];
      const dezenas = dezenasStr.map(d => parseInt(d, 10));

      dezenasStr.forEach(d => {
        if (freq[d]) {
          freq[d].count++;
          if (freq[d].lastSeenIdx === null) freq[d].lastSeenIdx = idx;
        }
      });

      const pares = dezenas.filter(d => d % 2 === 0).length;
      paresDistrib[pares] = (paresDistrib[pares] ?? 0) + 1;
      if (!(pares in lastConcursoForPares)) lastConcursoForPares[pares] = row.concurso;

      const moldura = dezenas.filter(d => MOLDURA.has(d)).length;
      molduraDistrib[moldura] = (molduraDistrib[moldura] ?? 0) + 1;
      if (!(moldura in lastConcursoForMoldura)) lastConcursoForMoldura[moldura] = row.concurso;

      for (const d of dezenas) {
        const linhaIdx = Math.floor((d - 1) / 10);
        freqLinha[linhaIdx]++;
      }

      for (const d of dezenas) {
        const colIdx = d % 10 === 0 ? 9 : (d % 10) - 1;
        freqColuna[colIdx]++;
      }

      const soma = dezenas.reduce((a, b) => a + b, 0);
      if (soma < menorSoma.valor) menorSoma = { valor: soma, concurso: row.concurso, data: row.data };
      if (soma > maiorSoma.valor)  maiorSoma  = { valor: soma, concurso: row.concurso, data: row.data };
      const bucket = SOMA_BUCKETS.find(b => soma >= b.min && soma <= b.max);
      if (bucket) {
        somaHist[bucket.faixa] = (somaHist[bucket.faixa] ?? 0) + 1;
        if (!(bucket.faixa in lastConcursoForBucket)) lastConcursoForBucket[bucket.faixa] = row.concurso;
      }

      const pc = dezenas.filter(d => PRIMOS.has(d)).length;
      const fc = dezenas.filter(d => FIBONACCI.has(d)).length;
      const tc = dezenas.filter(d => TRIANGULARES.has(d)).length;
      primosDistrib[pc] = (primosDistrib[pc] ?? 0) + 1;
      fibDistrib[fc]    = (fibDistrib[fc] ?? 0) + 1;
      triDistrib[tc]    = (triDistrib[tc] ?? 0) + 1;
      if (!(pc in lastConcursoForPrimos)) lastConcursoForPrimos[pc] = row.concurso;
      if (!(fc in lastConcursoForFib))    lastConcursoForFib[fc]    = row.concurso;
      if (!(tc in lastConcursoForTri))    lastConcursoForTri[tc]    = row.concurso;
      primosTotal += pc; fibTotal += fc; triTotal += tc;

      if (row.acumulado) acumulados++;
      const premios = row.premios as Array<{ faixa: number; valorPremio: number; ganhadores: number }>;
      const faixa1  = premios[0];
      if (faixa1 && faixa1.valorPremio > maiorPremio && faixa1.ganhadores > 0) {
        maiorPremio = faixa1.valorPremio;
        maiorPremioRow = row;
      }
    });

    const frequenciaDezenas = Object.entries(freq)
      .map(([dezena, { count: frequencia, lastSeenIdx }]) => ({
        dezena,
        frequencia,
        percentual: total > 0 ? Math.round((frequencia / total) * 1000) / 10 : 0,
        ultimoConcurso: lastSeenIdx !== null ? latestConcurso - lastSeenIdx : null,
        atraso: lastSeenIdx !== null ? lastSeenIdx : total,
      }))
      .sort((a, b) => b.frequencia - a.frequencia);

    const atrasoMaiores = [...frequenciaDezenas].sort((a, b) => b.atraso - a.atraso).slice(0, 15);

    const paresImpares = Array.from({ length: 7 }, (_, p) => ({
      pares: p,
      impares: 6 - p,
      sorteios: paresDistrib[p] ?? 0,
      ultimoConcurso: lastConcursoForPares[p] ?? null,
    }));

    const molduraRetrato = Array.from({ length: 7 }, (_, m) => ({
      moldura: m,
      retrato: 6 - m,
      sorteios: molduraDistrib[m] ?? 0,
      ultimoConcurso: lastConcursoForMoldura[m] ?? null,
    }));

    const FAIXAS_LINHAS = ["01–10","11–20","21–30","31–40","41–50"];
    const frequenciaPorLinha = FAIXAS_LINHAS.map((faixa, i) => ({
      faixa,
      sorteios: freqLinha[i],
    }));

    const frequenciaPorColuna = Array.from({ length: 10 }, (_, i) => ({
      coluna: i + 1,
      sorteios: freqColuna[i],
    }));

    const somaDezenas = {
      intervalos: SOMA_BUCKETS.map(b => ({
        faixa: b.faixa,
        sorteios: somaHist[b.faixa] ?? 0,
        ultimoConcurso: lastConcursoForBucket[b.faixa] ?? null,
      })),
      menor: menorSoma.valor === Infinity ? null : menorSoma,
      maior: maiorSoma.valor === -Infinity ? null : maiorSoma,
    };

    const makeDistrib = (distrib: Record<number, number>, lastConcurso: Record<number, number>) =>
      Array.from({ length: 7 }, (_, i) => ({ count: i, sorteios: distrib[i] ?? 0, ultimoConcurso: lastConcurso[i] ?? null }));

    const numerosEspeciais = [
      {
        tipo: "primos",
        label: "Primos",
        dezenas: [...PRIMOS].sort((a, b) => a - b),
        quantidadeNaFaixa: PRIMOS.size,
        media: total > 0 ? Math.round(primosTotal / total * 100) / 100 : 0,
        distribuicao: makeDistrib(primosDistrib, lastConcursoForPrimos),
      },
      {
        tipo: "fibonacci",
        label: "Fibonacci",
        dezenas: [...FIBONACCI].sort((a, b) => a - b),
        quantidadeNaFaixa: FIBONACCI.size,
        media: total > 0 ? Math.round(fibTotal / total * 100) / 100 : 0,
        distribuicao: makeDistrib(fibDistrib, lastConcursoForFib),
      },
      {
        tipo: "triangulares",
        label: "Triangulares",
        dezenas: [...TRIANGULARES].sort((a, b) => a - b),
        quantidadeNaFaixa: TRIANGULARES.size,
        media: total > 0 ? Math.round(triTotal / total * 100) / 100 : 0,
        distribuicao: makeDistrib(triDistrib, lastConcursoForTri),
      },
    ];

    const [maxRow] = await db
      .select({ maxConcurso: max(lotteryResultsTable.concurso) })
      .from(lotteryResultsTable)
      .where(eq(lotteryResultsTable.modalidade, MODALIDADE));

    res.json({
      totalConcursos: maxRow.maxConcurso ?? latestConcurso,
      frequenciaDezenas,
      atrasoMaiores,
      totalAcumulados: acumulados,
      percentualAcumulado: total > 0 ? Math.round((acumulados / total) * 1000) / 10 : 0,
      maiorPremio,
      maiorPremioData: maiorPremioRow.data,
      maiorPremioConcurso: maiorPremioRow.concurso,
      paresImpares,
      molduraRetrato,
      frequenciaPorLinha,
      frequenciaPorColuna,
      somaDezenas,
      numerosEspeciais,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to compute maismilionaria estatisticas");
    res.status(500).json({ error: "Erro ao calcular estatísticas" });
  }
});

router.get("/maismilionaria/resumo", async (req, res) => {
  try {
    const [maxRow] = await db
      .select({ maxConcurso: max(lotteryResultsTable.concurso), total: count() })
      .from(lotteryResultsTable)
      .where(eq(lotteryResultsTable.modalidade, MODALIDADE));

    const latestRow = await getLatest(MODALIDADE);

    const rows = await db
      .select()
      .from(lotteryResultsTable)
      .where(eq(lotteryResultsTable.modalidade, MODALIDADE))
      .orderBy(desc(lotteryResultsTable.concurso));

    let maiorPremio = 0;
    let maiorPremioConcurso = 0;
    let maiorPremioAno = 0;
    let totalGanhadores6 = 0;

    rows.forEach(row => {
      const premios = row.premios as Array<{ faixa: number; valorPremio: number; ganhadores: number }>;
      const faixa1 = premios[0];
      if (faixa1) {
        totalGanhadores6 += faixa1.ganhadores ?? 0;
        if (faixa1.valorPremio > maiorPremio && faixa1.ganhadores > 0) {
          maiorPremio = faixa1.valorPremio;
          maiorPremioConcurso = row.concurso;
          const parts = row.data.split("/");
          maiorPremioAno = parts[2] ? parseInt(parts[2], 10) : 0;
        }
      }
    });

    const latest = latestRow as any;

    res.json({
      totalConcursos: maxRow.maxConcurso ?? 0,
      acumulado: latest?.acumulado ?? false,
      valorAtualAcumulado: latest?.valorAcumulado ? Number(latest.valorAcumulado) : null,
      valorEstimadoProximo: latest?.valorEstimadoProximo ? Number(latest.valorEstimadoProximo) : null,
      maiorPremio,
      maiorPremioConcurso,
      maiorPremioAno,
      totalGanhadores6,
      proximoSorteio: latest?.dataProximoConcurso ?? null,
      ultimoConcurso: maxRow.maxConcurso ?? 0,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get maismilionaria resumo");
    res.status(500).json({ error: "Erro ao buscar resumo" });
  }
});

router.post("/maismilionaria/simulador", async (req, res) => {
  try {
    const { dezenas, trevos, filtro = "premiados" } = req.body ?? {};

    if (!Array.isArray(dezenas) || dezenas.length < 6 || dezenas.length > 12) {
      res.status(400).json({ error: "Selecione de 6 a 12 dezenas" });
      return;
    }
    if (!Array.isArray(trevos) || trevos.length < 2 || trevos.length > 6) {
      res.status(400).json({ error: "Selecione de 2 a 6 trevos" });
      return;
    }

    const selecionadas = (dezenas as unknown[]).map(d => String(d).padStart(2, "0"));
    const trevosSelecionados = (trevos as unknown[]).map(t => String(t));
    const selecionadasParams = selecionadas.map(d => sql`${d}`);
    const trevosParams = trevosSelecionados.map(t => sql`${t}`);
    const anyArray = sql`ARRAY[${sql.join(selecionadasParams, sql`, `)}]`;
    const trevosArray = sql`ARRAY[${sql.join(trevosParams, sql`, `)}]`;

    const rows = await db.execute(sql`
      SELECT
        concurso, data, dezenas, premios, metadata,
        (
          SELECT COUNT(*)::integer
          FROM jsonb_array_elements_text(dezenas) AS dval
          WHERE dval = ANY(${anyArray}::text[])
        ) AS acertos,
        (
          SELECT COUNT(*)::integer
          FROM jsonb_array_elements_text(metadata->'trevos') AS tval
          WHERE tval = ANY(${trevosArray}::text[])
        ) AS acertos_trevos
      FROM lottery_results
      WHERE modalidade = 'maismilionaria'
      ORDER BY concurso DESC
    `);

    type PremioRow = { faixa: number; ganhadores: number; valorPremio: number };
    type ResultRow = {
      concurso: number; data: string; dezenas: string[]; premios: PremioRow[]; metadata: { trevos?: string[] } | null; acertos: number; acertos_trevos: number;
    };

    const allRows = rows.rows as ResultRow[];

    const FAIXAS = [
      { label: "6+2",         acertosNeeded: 6, trevosMin: 2, trevosMax: 2 },
      { label: "6+1 ou 6+0",  acertosNeeded: 6, trevosMin: 0, trevosMax: 1 },
      { label: "5+2",         acertosNeeded: 5, trevosMin: 2, trevosMax: 2 },
      { label: "5+1 ou 5+0",  acertosNeeded: 5, trevosMin: 0, trevosMax: 1 },
      { label: "4+2",         acertosNeeded: 4, trevosMin: 2, trevosMax: 2 },
      { label: "4+1 ou 4+0",  acertosNeeded: 4, trevosMin: 0, trevosMax: 1 },
      { label: "3+2",         acertosNeeded: 3, trevosMin: 2, trevosMax: 2 },
      { label: "3+1",         acertosNeeded: 3, trevosMin: 1, trevosMax: 1 },
      { label: "2+2",         acertosNeeded: 2, trevosMin: 2, trevosMax: 2 },
      { label: "2+1",         acertosNeeded: 2, trevosMin: 1, trevosMax: 1 },
    ] as const;

    // Probabilidades combinadas (D+T) sobre C(50,6) × C(6,2) = 238.360.500
    const PROBABILIDADES: Record<string, string> = {
      "6+2":         "1 em 238.360.500",
      "6+1 ou 6+0":  "1 em 17.025.750",
      "5+2":         "1 em 902.881",
      "5+1 ou 5+0":  "1 em 64.492",
      "4+2":         "1 em 16.798",
      "4+1 ou 4+0":  "1 em 1.200",
      "3+2":         "1 em 900",
      "3+1":         "1 em 112",
      "2+2":         "1 em 117",
      "2+1":         "1 em 15",
    };

    let totalPremio = 0;
    const contagemPorFaixa: Record<string, number> = {};
    const concursosFiltrados: {
      concurso: number; data: string; dezenas: string[]; trevos: string[]; acertos: number; acertosTrevos: number; premioGanho: number;
    }[] = [];

    for (const row of allRows) {
      const acertosD = Number(row.acertos);
      const acertosT = Number(row.acertos_trevos);

      // find which faixa this row belongs to, if any
      const faixa = FAIXAS.find(
        f => f.acertosNeeded === acertosD && acertosT >= f.trevosMin && acertosT <= f.trevosMax,
      );

      if (faixa) {
        contagemPorFaixa[faixa.label] = (contagemPorFaixa[faixa.label] ?? 0) + 1;
      }

      // premioGanho: use the DB prize for the matching official faixa
      // Official faixas in DB: 1=sena, 2=quina, 3=quadra, 4=terno
      const premios = row.premios as PremioRow[];
      const officalFaixa =
        acertosD === 6 ? 1 : acertosD === 5 ? 2 : acertosD === 4 ? 3 : acertosD === 3 ? 4 : null;
      const premioGanho = officalFaixa !== null
        ? (premios.find(p => p.faixa === officalFaixa)?.valorPremio ?? 0)
        : 0;
      totalPremio += premioGanho;

      // filter
      const activeFaixaLabel = faixa?.label ?? null;
      const incluir =
        filtro === "todos" ||
        (filtro === "premiados" && activeFaixaLabel !== null) ||
        (filtro === "seis"   && acertosD === 6) ||
        (filtro === "cinco"  && acertosD === 5) ||
        (filtro === "quatro" && acertosD === 4) ||
        (filtro === "tres"   && acertosD === 3);

      if (incluir) {
        concursosFiltrados.push({
          concurso: row.concurso,
          data: row.data,
          dezenas: row.dezenas,
          trevos: row.metadata?.trevos ?? [],
          acertos: acertosD,
          acertosTrevos: acertosT,
          premioGanho,
        });
      }
    }

    const faixas = FAIXAS.map(f => ({
      label: f.label,
      contagem: contagemPorFaixa[f.label] ?? 0,
      probabilidade: PROBABILIDADES[f.label],
    }));

    // Keep compat fields for safety
    const contagemPorAcertos: Record<number, number> = {};
    for (let i = 0; i <= 6; i++) contagemPorAcertos[i] = 0;
    const contagemPorAcertosTrevos: Record<number, number> = {};
    for (let i = 0; i <= 2; i++) contagemPorAcertosTrevos[i] = 0;
    for (const row of allRows) {
      contagemPorAcertos[Number(row.acertos)] = (contagemPorAcertos[Number(row.acertos)] ?? 0) + 1;
      contagemPorAcertosTrevos[Number(row.acertos_trevos)] = (contagemPorAcertosTrevos[Number(row.acertos_trevos)] ?? 0) + 1;
    }

    const resumo = Array.from({ length: 7 }, (_, i) => ({
      acertos: i,
      contagem: contagemPorAcertos[i] ?? 0,
    })).reverse();

    const resumoTrevos = Array.from({ length: 3 }, (_, i) => ({
      acertos: i,
      contagem: contagemPorAcertosTrevos[i] ?? 0,
    })).reverse();

    res.json({
      resumo,
      resumoTrevos,
      faixas,
      concursos: concursosFiltrados,
      totalPremio,
      totalConcursos: allRows.length,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to simulate maismilionaria");
    res.status(500).json({ error: "Erro ao simular" });
  }
});

router.post("/maismilionaria/gerador", async (req, res) => {
  try {
    const { quantidadeJogos = 1, quantidadeDezenas = 6, quantidadeTrevos = 2 } = req.body ?? {};

    const qtdJogos = Math.min(20, Math.max(1, parseInt(String(quantidadeJogos), 10)));
    const qtdDezenas = Math.min(12, Math.max(6, parseInt(String(quantidadeDezenas), 10)));
    const qtdTrevos = Math.min(6, Math.max(2, parseInt(String(quantidadeTrevos), 10)));

    function C(n: number, k: number): number {
      if (k < 0 || k > n) return 0;
      if (k === 0 || k === n) return 1;
      let r = 1;
      for (let i = 0; i < k; i++) r = (r * (n - i)) / (i + 1);
      return Math.round(r);
    }

    const custoPorJogo = 6.0 * C(qtdDezenas, 6) * C(qtdTrevos, 2);

    const jogos: number[][] = [];
    const trevosList: number[][] = [];
    for (let j = 0; j < qtdJogos; j++) {
      const pool = Array.from({ length: 50 }, (_, i) => i + 1);
      for (let i = pool.length - 1; i > 0; i--) {
        const r = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[r]] = [pool[r], pool[i]];
      }
      jogos.push(pool.slice(0, qtdDezenas).sort((a, b) => a - b));

      const trevoPool = Array.from({ length: 6 }, (_, i) => i + 1);
      for (let i = trevoPool.length - 1; i > 0; i--) {
        const r = Math.floor(Math.random() * (i + 1));
        [trevoPool[i], trevoPool[r]] = [trevoPool[r], trevoPool[i]];
      }
      trevosList.push(trevoPool.slice(0, qtdTrevos).sort((a, b) => a - b));
    }

    res.json({
      jogos,
      trevos: trevosList,
      custo: custoPorJogo * qtdJogos,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to generate maismilionaria jogo");
    res.status(500).json({ error: "Erro ao gerar jogo" });
  }
});

export default router;
