import { Router } from "express";
import { db } from "@workspace/db";
import { lotteryResultsTable } from "@workspace/db/schema";
import { eq, and, desc, asc, count, max, sql } from "drizzle-orm";
import { fetchGuidi, normalizeResult } from "../services/lottery-sync";
import { getLatest } from "./loterias";

const router = Router();

const MODALIDADE = "lotofacil";

function toResultado(row: typeof lotteryResultsTable.$inferSelect) {
  return {
    concurso: row.concurso,
    data: row.data,
    dezenas: row.dezenas as string[],
    premios: row.premios as Array<{ faixa: number; descricao: string; ganhadores: number; valorPremio: number }>,
    acumulado: row.acumulado,
    valorAcumulado: row.valorAcumulado ? Number(row.valorAcumulado) : null,
    dataProximoConcurso: row.dataProximoConcurso ?? null,
    valorEstimadoProximoConcurso: row.valorEstimadoProximo ? Number(row.valorEstimadoProximo) : null,
    arrecadacaoTotal: row.arrecadacaoTotal ? Number(row.arrecadacaoTotal) : null,
  };
}

// GET /api/lotofacil/resultado/ultimo
router.get("/lotofacil/resultado/ultimo", async (req, res) => {
  try {
    const row = await getLatest(MODALIDADE);
    if (!row) { res.status(503).json({ error: "Dados indisponíveis" }); return; }
    res.json("id" in row ? toResultado(row as any) : row);
  } catch (err) {
    req.log.error({ err }, "Failed to get lotofacil ultimo resultado");
    res.status(500).json({ error: "Erro ao buscar resultado" });
  }
});

// GET /api/lotofacil/resultados
router.get("/lotofacil/resultados", async (req, res) => {
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
    req.log.error({ err }, "Failed to get lotofacil resultados");
    res.status(500).json({ error: "Erro ao buscar resultados" });
  }
});

// GET /api/lotofacil/resultados/:concurso
router.get("/lotofacil/resultados/:concurso", async (req, res) => {
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
    req.log.error({ err, concurso }, "Failed to get lotofacil concurso");
    res.status(404).json({ error: "Concurso não encontrado" });
  }
});

// GET /api/lotofacil/estatisticas
router.get("/lotofacil/estatisticas", async (req, res) => {
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

    // Soma buckets for Lotofácil (min=120, max=270)
    const SOMA_BUCKETS = [
      { min: 120, max: 134, faixa: "120–134" },
      { min: 135, max: 149, faixa: "135–149" },
      { min: 150, max: 164, faixa: "150–164" },
      { min: 165, max: 179, faixa: "165–179" },
      { min: 180, max: 194, faixa: "180–194" },
      { min: 195, max: 209, faixa: "195–209" },
      { min: 210, max: 224, faixa: "210–224" },
      { min: 225, max: 239, faixa: "225–239" },
      { min: 240, max: 270, faixa: "240–270" },
    ];

    const PRIMOS    = new Set([2, 3, 5, 7, 11, 13, 17, 19, 23]);
    const FIBONACCI = new Set([1, 2, 3, 5, 8, 13, 21]);
    const TRIANGULARES = new Set([1, 3, 6, 10, 15, 21]);

    // Moldura (border of 5×5 grid): rows 1,5 and cols 1,5
    // Row 1: 01-05, Row 5: 21-25
    // Col 1: 01,06,11,16,21  Col 5: 05,10,15,20,25
    const MOLDURA = new Set<number>([
      1, 2, 3, 4, 5,        // row 1
      21, 22, 23, 24, 25,   // row 5
      6, 11, 16,             // col 1 (middle rows)
      10, 15, 20,            // col 5 (middle rows)
    ]);

    const freq: Record<string, { count: number; lastSeenIdx: number | null }> = {};
    for (let i = 1; i <= 25; i++) {
      freq[String(i).padStart(2, "0")] = { count: 0, lastSeenIdx: null };
    }

    const paresDistrib: Record<number, number> = {};
    const lastConcursoForPares: Record<number, number> = {};
    const molduraDistrib: Record<number, number> = {};
    const lastConcursoForMoldura: Record<number, number> = {};
    const freqLinha = [0, 0, 0, 0, 0];  // 5 rows
    const freqColuna = Array(5).fill(0); // 5 cols
    const somaHist: Record<string, number> = {};
    const lastConcursoForBucket: Record<string, number> = {};
    let menorSoma = { valor: Infinity, concurso: 0, data: "" };
    let maiorSoma  = { valor: -Infinity, concurso: 0, data: "" };
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
        const key = String(parseInt(d, 10)).padStart(2, "0");
        if (freq[key]) {
          freq[key].count++;
          if (freq[key].lastSeenIdx === null) freq[key].lastSeenIdx = idx;
        }
      });

      const pares = dezenas.filter(d => d % 2 === 0).length;
      paresDistrib[pares] = (paresDistrib[pares] ?? 0) + 1;
      if (!(pares in lastConcursoForPares)) lastConcursoForPares[pares] = row.concurso;

      const moldura = dezenas.filter(d => MOLDURA.has(d)).length;
      molduraDistrib[moldura] = (molduraDistrib[moldura] ?? 0) + 1;
      if (!(moldura in lastConcursoForMoldura)) lastConcursoForMoldura[moldura] = row.concurso;

      // Linhas (5 rows of 5×5 grid)
      for (const d of dezenas) {
        const linhaIdx = Math.floor((d - 1) / 5);
        freqLinha[linhaIdx]++;
      }

      // Colunas (5 cols of 5×5 grid): col index = (d-1) % 5
      for (const d of dezenas) {
        freqColuna[(d - 1) % 5]++;
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

    const paresImpares = Array.from({ length: 16 }, (_, p) => ({
      pares: p,
      impares: 15 - p,
      sorteios: paresDistrib[p] ?? 0,
      ultimoConcurso: lastConcursoForPares[p] ?? null,
    })).filter(item => item.sorteios > 0 || (item.pares >= 3 && item.pares <= 12));

    const molduraRetrato = Array.from({ length: 16 }, (_, m) => ({
      moldura: m,
      retrato: 15 - m,
      sorteios: molduraDistrib[m] ?? 0,
      ultimoConcurso: lastConcursoForMoldura[m] ?? null,
    })).filter(item => item.sorteios > 0 || (item.moldura >= 5 && item.moldura <= 12));

    const FAIXAS_LINHAS = ["01–05", "06–10", "11–15", "16–20", "21–25"];
    const frequenciaPorLinha = FAIXAS_LINHAS.map((faixa, i) => ({
      faixa,
      sorteios: freqLinha[i],
    }));

    const frequenciaPorColuna = Array.from({ length: 5 }, (_, i) => ({
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

    const makeDistrib = (distrib: Record<number, number>, lastConcurso: Record<number, number>, max: number) =>
      Array.from({ length: max + 1 }, (_, i) => ({ count: i, sorteios: distrib[i] ?? 0, ultimoConcurso: lastConcurso[i] ?? null }));

    const numerosEspeciais = [
      {
        tipo: "primos",
        label: "Primos",
        dezenas: [...PRIMOS].sort((a, b) => a - b),
        quantidadeNaFaixa: PRIMOS.size,
        media: total > 0 ? Math.round(primosTotal / total * 100) / 100 : 0,
        distribuicao: makeDistrib(primosDistrib, lastConcursoForPrimos, 9),
      },
      {
        tipo: "fibonacci",
        label: "Fibonacci",
        dezenas: [...FIBONACCI].sort((a, b) => a - b),
        quantidadeNaFaixa: FIBONACCI.size,
        media: total > 0 ? Math.round(fibTotal / total * 100) / 100 : 0,
        distribuicao: makeDistrib(fibDistrib, lastConcursoForFib, 7),
      },
      {
        tipo: "triangulares",
        label: "Triangulares",
        dezenas: [...TRIANGULARES].sort((a, b) => a - b),
        quantidadeNaFaixa: TRIANGULARES.size,
        media: total > 0 ? Math.round(triTotal / total * 100) / 100 : 0,
        distribuicao: makeDistrib(triDistrib, lastConcursoForTri, 6),
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
    req.log.error({ err }, "Failed to compute lotofacil estatisticas");
    res.status(500).json({ error: "Erro ao calcular estatísticas" });
  }
});

// GET /api/lotofacil/resumo
router.get("/lotofacil/resumo", async (req, res) => {
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
    let totalGanhadores15 = 0;

    rows.forEach(row => {
      const premios = row.premios as Array<{ faixa: number; valorPremio: number; ganhadores: number }>;
      const faixa1 = premios[0];
      if (faixa1) {
        totalGanhadores15 += faixa1.ganhadores ?? 0;
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
      totalGanhadores15,
      proximoSorteio: latest?.dataProximoConcurso ?? null,
      ultimoConcurso: maxRow.maxConcurso ?? 0,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get lotofacil resumo");
    res.status(500).json({ error: "Erro ao buscar resumo" });
  }
});

// GET /api/lotofacil/calendario
router.get("/lotofacil/calendario", async (req, res) => {
  try {
    const row = await getLatest(MODALIDADE);

    const sorteios: Array<{
      data: string; diaSemana: string; concursoEstimado: number | null;
      valorEstimado: number | null; especial: boolean; descricao: string | null;
    }> = [];

    if (row && "dataProximoConcurso" in row && row.dataProximoConcurso) {
      const [d, m, y] = row.dataProximoConcurso.split("/");
      if (d && m && y) {
        const nextDate = new Date(Number(y), Number(m) - 1, Number(d));
        sorteios.push({
          data: row.dataProximoConcurso,
          diaSemana: nextDate.toLocaleDateString("pt-BR", { weekday: "long" }),
          concursoEstimado: row.concurso + 1,
          valorEstimado: row.valorEstimadoProximo ? Number(row.valorEstimadoProximo) : null,
          especial: false,
          descricao: null,
        });
      }
    }

    // Lotofácil draws Mon/Wed/Fri (days 1, 3, 5 in JS getDay())
    const drawDays = [1, 3, 5];
    let cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    let drawCount = 0;

    while (drawCount < 15) {
      cursor.setDate(cursor.getDate() + 1);
      if (drawDays.includes(cursor.getDay())) {
        const dd = String(cursor.getDate()).padStart(2, "0");
        const mm = String(cursor.getMonth() + 1).padStart(2, "0");
        const yyyy = cursor.getFullYear();
        sorteios.push({
          data: `${dd}/${mm}/${yyyy}`,
          diaSemana: cursor.toLocaleDateString("pt-BR", { weekday: "long" }),
          concursoEstimado: null,
          valorEstimado: null,
          especial: false,
          descricao: null,
        });
        drawCount++;
      }
    }

    const seen = new Set<string>();
    const deduped = sorteios.filter(s => {
      if (seen.has(s.data)) return false;
      seen.add(s.data);
      return true;
    });

    if (deduped.length > 0 && deduped[0].concursoEstimado !== null) {
      const base = deduped[0].concursoEstimado;
      deduped.forEach((s, i) => { s.concursoEstimado = base + i; });
    }

    res.json(deduped.slice(0, 10));
  } catch (err) {
    req.log.error({ err }, "Failed to get lotofacil calendario");
    res.status(500).json({ error: "Erro ao buscar calendário" });
  }
});

// GET /api/lotofacil/lotofacil-da-independencia
router.get("/lotofacil/lotofacil-da-independencia", async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(lotteryResultsTable)
      .where(eq(lotteryResultsTable.modalidade, MODALIDADE))
      .orderBy(asc(lotteryResultsTable.concurso));

    const independencia = rows.filter(r => {
      const parts = r.data.split("/");
      return parts[0] === "07" && parts[1] === "09";
    });

    const anoAtual = new Date().getFullYear();
    res.json({
      anoAtual,
      dataProximaEdicao: `07/09/${anoAtual}`,
      valorEstimado: null,
      historico: independencia.reverse().map(toResultado),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get lotofacil da independencia");
    res.status(500).json({ error: "Erro ao buscar Lotofácil da Independência" });
  }
});

// POST /api/lotofacil/simulador
router.post("/lotofacil/simulador", async (req, res) => {
  try {
    const { dezenas, filtro = "premiados" } = req.body ?? {};

    if (!Array.isArray(dezenas) || dezenas.length < 15 || dezenas.length > 20) {
      res.status(400).json({ error: "Selecione entre 15 e 20 dezenas" });
      return;
    }

    const selecionadas = (dezenas as unknown[]).map(d => String(d).padStart(2, "0"));
    const selecionadasParams = selecionadas.map(d => sql`${d}`);
    const anyArray = sql`ARRAY[${sql.join(selecionadasParams, sql`, `)}]`;

    const rows = await db.execute(sql`
      SELECT
        concurso, data, dezenas, premios,
        (
          SELECT COUNT(*)::integer
          FROM jsonb_array_elements_text(dezenas) AS dval
          WHERE dval = ANY(${anyArray}::text[])
        ) AS acertos
      FROM lottery_results
      WHERE modalidade = 'lotofacil'
      ORDER BY concurso DESC
    `);

    type PremioRow = { faixa: number; ganhadores: number; valorPremio: number };
    type ResultRow = {
      concurso: number; data: string; dezenas: string[]; premios: PremioRow[]; acertos: number;
    };

    const allRows = rows.rows as ResultRow[];
    const contagemPorAcertos: Record<number, number> = {};
    for (let i = 0; i <= 15; i++) contagemPorAcertos[i] = 0;

    let totalPremio = 0;
    const concursosFiltrados: {
      concurso: number; data: string; dezenas: string[]; acertos: number; premioGanho: number;
    }[] = [];

    for (const row of allRows) {
      const acertos = Number(row.acertos);
      contagemPorAcertos[acertos] = (contagemPorAcertos[acertos] ?? 0) + 1;

      const premios = row.premios as PremioRow[];
      let premioGanho = 0;
      if (acertos === 15) premioGanho = premios.find(p => p.faixa === 1)?.valorPremio ?? 0;
      else if (acertos === 14) premioGanho = premios.find(p => p.faixa === 2)?.valorPremio ?? 0;
      else if (acertos === 13) premioGanho = premios.find(p => p.faixa === 3)?.valorPremio ?? 0;
      else if (acertos === 12) premioGanho = premios.find(p => p.faixa === 4)?.valorPremio ?? 0;
      else if (acertos === 11) premioGanho = premios.find(p => p.faixa === 5)?.valorPremio ?? 0;

      totalPremio += premioGanho;

      const incluir =
        filtro === "todos" ||
        (filtro === "premiados" && acertos >= 11) ||
        (filtro === "quinze"   && acertos === 15) ||
        (filtro === "quatorze" && acertos === 14) ||
        (filtro === "treze"    && acertos === 13) ||
        (filtro === "doze"     && acertos === 12) ||
        (filtro === "onze"     && acertos === 11);

      if (incluir) {
        concursosFiltrados.push({
          concurso: row.concurso,
          data: row.data,
          dezenas: row.dezenas,
          acertos,
          premioGanho,
        });
      }
    }

    const resumo = Array.from({ length: 16 }, (_, i) => ({
      acertos: i,
      contagem: contagemPorAcertos[i] ?? 0,
    })).reverse();

    res.json({
      resumo,
      concursos: concursosFiltrados,
      totalPremio,
      totalConcursos: allRows.length,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to simulate lotofacil");
    res.status(500).json({ error: "Erro ao simular" });
  }
});

// POST /api/lotofacil/gerador
router.post("/lotofacil/gerador", async (req, res) => {
  try {
    const { quantidadeJogos = 1, quantidadeDezenas = 15 } = req.body ?? {};

    const qtdJogos = Math.min(20, Math.max(1, parseInt(String(quantidadeJogos), 10)));
    const qtdDezenas = Math.min(20, Math.max(15, parseInt(String(quantidadeDezenas), 10)));

    function C(n: number, k: number): number {
      if (k < 0 || k > n) return 0;
      if (k === 0 || k === n) return 1;
      let r = 1;
      for (let i = 0; i < k; i++) r = (r * (n - i)) / (i + 1);
      return Math.round(r);
    }

    const apostasSimples = C(qtdDezenas, 15);
    const custoPorJogo = apostasSimples * 3.00;

    const jogos: number[][] = [];
    for (let j = 0; j < qtdJogos; j++) {
      const pool = Array.from({ length: 25 }, (_, i) => i + 1);
      for (let i = pool.length - 1; i > 0; i--) {
        const r = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[r]] = [pool[r], pool[i]];
      }
      jogos.push(pool.slice(0, qtdDezenas).sort((a, b) => a - b));
    }

    res.json({
      jogos,
      custo: custoPorJogo * qtdJogos,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to generate lotofacil jogo");
    res.status(500).json({ error: "Erro ao gerar jogo" });
  }
});

export default router;
