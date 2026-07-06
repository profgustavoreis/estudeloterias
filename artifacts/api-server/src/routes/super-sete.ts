import { Router } from "express";
import { db } from "@workspace/db";
import { lotteryResultsTable } from "@workspace/db/schema";
import { eq, and, desc, asc, count, max, sql } from "drizzle-orm";
import { fetchGuidi, normalizeResult } from "../services/lottery-sync";
import { getLatest } from "./loterias";

const router = Router();

const MODALIDADE = "supersete";

function toResultado(row: typeof lotteryResultsTable.$inferSelect) {
  return {
    concurso: row.concurso,
    data: row.data,
    dezenas: row.dezenas as string[],
    dezenasOrdem: (row.dezenasOrdem as string[] | null) ?? null,
    premios: row.premios as Array<{ faixa: number; descricao: string; ganhadores: number; valorPremio: number }>,
    acumulado: row.acumulado,
    valorAcumulado: row.valorAcumulado ? Number(row.valorAcumulado) : null,
    dataProximoConcurso: row.dataProximoConcurso ?? null,
    valorEstimadoProximoConcurso: row.valorEstimadoProximo ? Number(row.valorEstimadoProximo) : null,
    arrecadacaoTotal: row.arrecadacaoTotal ? Number(row.arrecadacaoTotal) : null,
  };
}

// GET /api/super-sete/resultado/ultimo
router.get("/super-sete/resultado/ultimo", async (req, res) => {
  try {
    const row = await getLatest(MODALIDADE);
    if (!row) { res.status(503).json({ error: "Dados indisponíveis" }); return; }
    res.json("id" in row ? toResultado(row as any) : row);
  } catch (err) {
    req.log.error({ err }, "Failed to get super-sete ultimo resultado");
    res.status(500).json({ error: "Erro ao buscar resultado" });
  }
});

// GET /api/super-sete/resultados
router.get("/super-sete/resultados", async (req, res) => {
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
    req.log.error({ err }, "Failed to get super-sete resultados");
    res.status(500).json({ error: "Erro ao buscar resultados" });
  }
});

// GET /api/super-sete/resultados/:concurso
router.get("/super-sete/resultados/:concurso", async (req, res) => {
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
      dezenasOrdem: norm.dezenasOrdem ?? null,
      valorAcumulado: norm.valorAcumulado ? Number(norm.valorAcumulado) : null,
      valorEstimadoProximoConcurso: norm.valorEstimadoProximo ? Number(norm.valorEstimadoProximo) : null,
      arrecadacaoTotal: norm.arrecadacaoTotal ? Number(norm.arrecadacaoTotal) : null,
    });
  } catch (err) {
    req.log.error({ err, concurso }, "Failed to get super-sete concurso");
    res.status(404).json({ error: "Concurso não encontrado" });
  }
});

// GET /api/super-sete/estatisticas
router.get("/super-sete/estatisticas", async (req, res) => {
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

    // Super Sete: 7 columns, digits 0–9 each. Soma range: 0–63 (max 9×7).
    const SOMA_BUCKETS = [
      { min: 0,  max: 6,   faixa: "0–6"   },
      { min: 7,  max: 13,  faixa: "7–13"  },
      { min: 14, max: 20,  faixa: "14–20" },
      { min: 21, max: 27,  faixa: "21–27" },
      { min: 28, max: 34,  faixa: "28–34" },
      { min: 35, max: 41,  faixa: "35–41" },
      { min: 42, max: 48,  faixa: "42–48" },
      { min: 49, max: 55,  faixa: "49–55" },
      { min: 56, max: 62,  faixa: "56–62" },
      { min: 63, max: 63,  faixa: "63"     },
    ];

    // Special numbers over digits 0–9
    const PRIMOS = new Set([2, 3, 5, 7]);
    const FIBONACCI = new Set([0, 1, 2, 3, 5, 8]);
    const TRIANGULARES = new Set([0, 1, 3, 6]);

    // freq[posicao][digito] = { count, lastSeenIdx }
    const freqPosicao: (Record<string, number> | null)[] = Array.from({ length: 7 }, () => null);
    for (let p = 0; p < 7; p++) {
      const map: Record<string, number> = {};
      for (let d = 0; d <= 9; d++) map[String(d)] = 0;
      freqPosicao[p] = map;
    }
    const lastSeenPosicao: (Record<string, number> | null)[] = Array.from({ length: 7 }, () => null);
    for (let p = 0; p < 7; p++) {
      const map: Record<string, number> = {};
      for (let d = 0; d <= 9; d++) map[String(d)] = -1;
      lastSeenPosicao[p] = map;
    }

    // distribuicaoPorPosicao: counts per (position, digit)
    const distPos: number[][] = Array.from({ length: 7 }, () => Array(10).fill(0));
    const lastConcursoForPosDig: (number | null)[][] = Array.from({ length: 7 }, () => Array(10).fill(null));

    const paresDistrib: Record<number, number> = {};
    const lastConcursoForPares: Record<number, number> = {};
    const digitoUnicoDistrib: Record<number, number> = {};
    const lastConcursoForDigitoUnico: Record<number, number> = {};
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

      // Position + digit frequency
      for (let p = 0; p < 7; p++) {
        const digito = String(dezenas[p]);
        const fMap = freqPosicao[p]!;
        fMap[digito] = (fMap[digito] ?? 0) + 1;
        const lMap = lastSeenPosicao[p]!;
        if (lMap[digito] === -1) lMap[digito] = idx;
      }

      // distribuicaoPorPosicao
      for (let p = 0; p < 7; p++) {
        const dig = dezenas[p];
        distPos[p][dig]++;
        if (lastConcursoForPosDig[p][dig] == null) {
          lastConcursoForPosDig[p][dig] = row.concurso;
        }
      }

      // Pares (even digits)
      const evens = dezenas.filter(d => d % 2 === 0).length;
      paresDistrib[evens] = (paresDistrib[evens] ?? 0) + 1;
      if (!(evens in lastConcursoForPares)) lastConcursoForPares[evens] = row.concurso;

      // Digit diversity (distinct digits)
      const distinct = new Set(dezenas).size;
      digitoUnicoDistrib[distinct] = (digitoUnicoDistrib[distinct] ?? 0) + 1;
      if (!(distinct in lastConcursoForDigitoUnico)) lastConcursoForDigitoUnico[distinct] = row.concurso;

      // Soma
      const soma = dezenas.reduce((a, b) => a + b, 0);
      if (soma < menorSoma.valor) menorSoma = { valor: soma, concurso: row.concurso, data: row.data };
      if (soma > maiorSoma.valor)  maiorSoma  = { valor: soma, concurso: row.concurso, data: row.data };
      const bucket = SOMA_BUCKETS.find(b => soma >= b.min && soma <= b.max);
      if (bucket) {
        somaHist[bucket.faixa] = (somaHist[bucket.faixa] ?? 0) + 1;
        if (!(bucket.faixa in lastConcursoForBucket)) lastConcursoForBucket[bucket.faixa] = row.concurso;
      }

      // Numeros especiais
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

      // Maior prêmio
      if (row.acumulado) acumulados++;
      const premios = row.premios as Array<{ faixa: number; valorPremio: number; ganhadores: number }>;
      const faixa1  = premios[0];
      if (faixa1 && faixa1.valorPremio > maiorPremio && faixa1.ganhadores > 0) {
        maiorPremio = faixa1.valorPremio;
        maiorPremioRow = row;
      }
    });

    // Build frequenciaDezenas: pivoted array { posicao, digito, frequencia, atraso, ultimoConcurso }
    const frequenciaDezenas: Array<{
      posicao: number; digito: number; frequencia: number; atraso: number; ultimoConcurso: number | null;
    }> = [];
    for (let p = 0; p < 7; p++) {
      for (let d = 0; d <= 9; d++) {
        const digitoStr = String(d);
        const freqCount = freqPosicao[p]![digitoStr];
        const lastIdx = lastSeenPosicao[p]![digitoStr];
        const ultimoConcurso = lastIdx >= 0 && lastIdx !== null ? latestConcurso - lastIdx : null;
        const atraso = lastIdx >= 0 && lastIdx !== null ? lastIdx : total;
        frequenciaDezenas.push({
          posicao: p + 1,
          digito: d,
          frequencia: freqCount,
          atraso,
          ultimoConcurso,
        });
      }
    }

    const atrasoMaiores = [...frequenciaDezenas].sort((a, b) => b.atraso - a.atraso).slice(0, 15);

    // paresImpares reinterpreted for Super Sete: even-digit count distribution 0–7
    const paresImpares = Array.from({ length: 8 }, (_, evens) => ({
      pares: evens,
      impares: 7 - evens,
      sorteios: paresDistrib[evens] ?? 0,
      ultimoConcurso: lastConcursoForPares[evens] ?? null,
    }));

    // digitosUnicos: distinct-digit count distribution 1–7
    const digitosUnicos = Array.from({ length: 7 }, (_, i) => ({
      count: i + 1,
      sorteios: digitoUnicoDistrib[i + 1] ?? 0,
      ultimoConcurso: lastConcursoForDigitoUnico[i + 1] ?? null,
    }));

    // Soma dezenas
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
      Array.from({ length: 8 }, (_, i) => ({ count: i, sorteios: distrib[i] ?? 0, ultimoConcurso: lastConcurso[i] ?? null }));

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

    // distribuicaoPorPosicao: 7 positions × 10 digits
    const distribuicaoPorPosicao = Array.from({ length: 7 }, (_, p) => ({
      posicao: p + 1,
      distribuicao: Array.from({ length: 10 }, (_, d) => ({
        digito: d,
        sorteios: distPos[p][d],
        ultimoConcurso: lastConcursoForPosDig[p][d],
      })),
    }));

    // Total concursos (from DB max)
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
      somaDezenas,
      numerosEspeciais,
      distribuicaoPorPosicao,
      digitosUnicos,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to compute super-sete estatisticas");
    res.status(500).json({ error: "Erro ao calcular estatísticas" });
  }
});

// GET /api/super-sete/resumo
router.get("/super-sete/resumo", async (req, res) => {
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
    let totalGanhadores7 = 0;

    rows.forEach(row => {
      const premios = row.premios as Array<{ faixa: number; valorPremio: number; ganhadores: number }>;
      const faixa1 = premios[0];
      if (faixa1) {
        totalGanhadores7 += faixa1.ganhadores ?? 0;
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
      totalGanhadores7,
      proximoSorteio: latest?.dataProximoConcurso ?? null,
      ultimoConcurso: maxRow.maxConcurso ?? 0,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get super-sete resumo");
    res.status(500).json({ error: "Erro ao buscar resumo" });
  }
});

// POST /api/super-sete/simulador
router.post("/super-sete/simulador", async (req, res) => {
  try {
    const { dezenas, dezenasMultipla, filtro = "todos" } = req.body ?? {};

    // Super Sete: 7 columns, each digit 0–9
    // Simple bet: array of 7 single digits
    // Multiple bet: array of 7 arrays, each with 1–3 digits
    const inputDezenas = dezenas ?? dezenasMultipla;
    if (!Array.isArray(inputDezenas) || inputDezenas.length !== 7) {
      res.status(400).json({ error: "Selecione exatamente 7 colunas (uma dezena por coluna)" });
      return;
    }

    const isMultiple = inputDezenas.some((col: unknown) => Array.isArray(col));
    const colSets: Set<number>[] = [];

    for (const col of inputDezenas) {
      if (isMultiple) {
        if (!Array.isArray(col) || col.length < 1 || col.length > 3) {
          res.status(400).json({ error: "Cada coluna deve ter entre 1 e 3 dígitos (0–9)" });
          return;
        }
        const nums = (col as unknown[]).map(Number);
        if (nums.some(d => isNaN(d) || d < 0 || d > 9)) {
          res.status(400).json({ error: "Dígitos devem ser números entre 0 e 9" });
          return;
        }
        colSets.push(new Set(nums));
      } else {
        const d = Number(col);
        if (isNaN(d) || d < 0 || d > 9) {
          res.status(400).json({ error: "Cada dezena deve ser um número entre 0 e 9" });
          return;
        }
        colSets.push(new Set([d]));
      }
    }

    // Build SQL: compare each drawn position against the corresponding column set.
    // We can't do this efficiently in raw SQL per-column, so we fetch all rows and process in JS.
    const rows = await db.execute(sql`
      SELECT concurso, data, dezenas, premios
      FROM lottery_results
      WHERE modalidade = 'supersete'
      ORDER BY concurso DESC
    `);

    type PremioRow = { faixa: number; ganhadores: number; valorPremio: number };
    type ResultRow = {
      concurso: number; data: string; dezenas: string[]; premios: PremioRow[];
    };

    const allRows = rows.rows as ResultRow[];

    // faixaForAcertos: 7→1, 6→2, 5→3, 4→4, 3→5
    const faixaForAcertos = (acertos: number): number | null => {
      if (acertos === 7) return 1;
      if (acertos === 6) return 2;
      if (acertos === 5) return 3;
      if (acertos === 4) return 4;
      if (acertos === 3) return 5;
      return null;
    };

    const contagemPorAcertos: Record<number, number> = {};
    for (let i = 0; i <= 7; i++) contagemPorAcertos[i] = 0;

    let totalPremio = 0;
    const concursosFiltrados: {
      concurso: number; data: string; dezenas: string[]; acertos: number; premioGanho: number;
    }[] = [];

    for (const row of allRows) {
      const drawnStr = row.dezenas as string[];
      const drawn = drawnStr.map(d => parseInt(d, 10));

      // Count acertos per position
      let acertos = 0;
      for (let p = 0; p < 7; p++) {
        if (colSets[p].has(drawn[p])) acertos++;
      }

      contagemPorAcertos[acertos] = (contagemPorAcertos[acertos] ?? 0) + 1;

      const premios = row.premios as PremioRow[];
      let premioGanho = 0;
      const faixa = faixaForAcertos(acertos);
      if (faixa !== null) {
        premioGanho = premios.find(p => p.faixa === faixa)?.valorPremio ?? 0;
      }

      totalPremio += premioGanho;

      const digitosDistintos = new Set(drawn).size;
      const temRepetidos = digitosDistintos < 7;

      const incluir =
        filtro === "todos" ||
        (filtro === "premiados" && acertos >= 3) ||
        (filtro === "3" && acertos === 3) ||
        (filtro === "4" && acertos === 4) ||
        (filtro === "5" && acertos === 5) ||
        (filtro === "6" && acertos === 6) ||
        (filtro === "7" && acertos === 7);

      if (incluir) {
        concursosFiltrados.push({
          concurso: row.concurso,
          data: row.data,
          dezenas: row.dezenas as string[],
          acertos,
          premioGanho,
        });
      }
    }

    const resumo = Array.from({ length: 8 }, (_, i) => ({
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
    req.log.error({ err }, "Failed to simulate super-sete");
    res.status(500).json({ error: "Erro ao simular" });
  }
});

// POST /api/super-sete/gerador
router.post("/super-sete/gerador", async (req, res) => {
  try {
    const { quantidade = 1, digitosPorColuna, digitosPorColunaArray } = req.body ?? {};

    const qtdJogos = Math.min(20, Math.max(1, parseInt(String(quantidade), 10)));

    // Resolve per-column digit count: array of 7 → single number (1|2|3) → uniform → default 1
    let colDigitos: number[];
    if (Array.isArray(digitosPorColunaArray) && digitosPorColunaArray.length === 7) {
      colDigitos = digitosPorColunaArray.map((c: unknown) => {
        const v = Number(c);
        return Math.min(3, Math.max(1, isNaN(v) ? 1 : v));
      });
    } else if (typeof digitosPorColuna === "number") {
      const count = Math.min(3, Math.max(1, digitosPorColuna));
      colDigitos = Array(7).fill(count);
    } else {
      // Default: 1 digit per column (aposta simples)
      colDigitos = Array(7).fill(1);
    }

    const product = colDigitos.reduce((acc, n) => acc * n, 1);
    const custoPorJogo = Number((2.5 * product).toFixed(2));

    const jogos: number[][][] = [];
    for (let j = 0; j < qtdJogos; j++) {
      const aposta: number[][] = [];
      for (let p = 0; p < 7; p++) {
        const numDigits = colDigitos[p];
        const digits: number[] = [];
        while (digits.length < numDigits) {
          const digit = Math.floor(Math.random() * 10);
          if (!digits.includes(digit)) digits.push(digit);
        }
        aposta.push(digits);
      }
      jogos.push(aposta);
    }

    res.json({
      jogos,
      digitosPorColuna: colDigitos,
      custo: custoPorJogo * qtdJogos,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to generate super-sete jogo");
    res.status(500).json({ error: "Erro ao gerar jogo" });
  }
});

export default router;
