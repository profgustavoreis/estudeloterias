import { Router } from "express";
import { db } from "@workspace/db";
import { lotteryResultsTable } from "@workspace/db/schema";
import { eq, and, desc, asc, count, max, sql } from "drizzle-orm";
import { fetchGuidi, normalizeResult } from "../services/lottery-sync";
import { getLatest } from "./loterias";

const router = Router();

const MODALIDADE = "lotomania";

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

// GET /api/lotomania/resultado/ultimo
router.get("/lotomania/resultado/ultimo", async (req, res) => {
  try {
    const row = await getLatest(MODALIDADE);
    if (!row) { res.status(503).json({ error: "Dados indisponíveis" }); return; }
    res.json("id" in row ? toResultado(row as any) : row);
  } catch (err) {
    req.log.error({ err }, "Failed to get lotomania ultimo resultado");
    res.status(500).json({ error: "Erro ao buscar resultado" });
  }
});

// GET /api/lotomania/resultados
router.get("/lotomania/resultados", async (req, res) => {
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
    req.log.error({ err }, "Failed to get lotomania resultados");
    res.status(500).json({ error: "Erro ao buscar resultados" });
  }
});

// GET /api/lotomania/resultados/:concurso
router.get("/lotomania/resultados/:concurso", async (req, res) => {
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
    req.log.error({ err, concurso }, "Failed to get lotomania concurso");
    res.status(404).json({ error: "Concurso não encontrado" });
  }
});

// GET /api/lotomania/estatisticas
router.get("/lotomania/estatisticas", async (req, res) => {
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

    // Soma buckets for Lotomania: 20 dezenas de 01 a 100 (min=210, max=1810)
    const SOMA_BUCKETS = [
      { min: 190, max: 349,  faixa: "190–349"  },
      { min: 350, max: 509,  faixa: "350–509"  },
      { min: 510, max: 669,  faixa: "510–669"  },
      { min: 670, max: 829,  faixa: "670–829"  },
      { min: 830, max: 989,  faixa: "830–989"  },
      { min: 990, max: 1149, faixa: "990–1149" },
      { min: 1150, max: 1309, faixa: "1150–1309" },
      { min: 1310, max: 1469, faixa: "1310–1469" },
      { min: 1470, max: 1629, faixa: "1470–1629" },
      { min: 1630, max: 1790, faixa: "1630–1790" },
    ];

    const PRIMOS = new Set([2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97]);
    const FIBONACCI = new Set([1,2,3,5,8,13,21,34,55,89]);
    const TRIANGULARES = new Set([1,3,6,10,15,21,28,36,45,55,66,78,91]);

    // Na Lotomania, a dezena "00" tem valor numérico 0 (para soma, pares, padrões matemáticos),
    // mas ocupa a ÚLTIMA posição do volante (após o 99) para fins de linha/coluna/moldura.
    // O volante segue a sequência visual: 01, 02, ..., 99, 00.
    // - valorNumerico: "00" → 0 (valor real da dezena)
    // - posicaoVolante: "00" → 99 (índice 0-based da última célula), "01" → 0, ..., "99" → 98
    const valorNumerico = (d: string): number => parseInt(d, 10);
    const posicaoVolante = (d: string): number => {
      const n = parseInt(d, 10);
      return n === 0 ? 99 : n - 1;
    };

    // Moldura = borda externa do volante 10×10 (primeira linha 01–10, última linha 91–00,
    // primeira coluna e última coluna das linhas 2–9)
    const MOLDURA_POSICOES = new Set<number>([
      ...Array.from({ length: 10 }, (_, i) => i),       // linha 1: posições 0–9 (dezenas 01–10)
      ...Array.from({ length: 10 }, (_, i) => i + 90),  // linha 10: posições 90–99 (dezenas 91–99, 00)
      10, 20, 30, 40, 50, 60, 70, 80,                    // coluna esquerda das linhas 2–9
      19, 29, 39, 49, 59, 69, 79, 89,                    // coluna direita das linhas 2–9
    ]);

    const freq: Record<string, { count: number; lastSeenIdx: number | null }> = {};
    for (let i = 0; i <= 99; i++) {
      freq[String(i).padStart(2, "0")] = { count: 0, lastSeenIdx: null };
    }

    const paresDistrib: Record<number, number> = {};
    const lastConcursoForPares: Record<number, number> = {};
    const molduraDistrib: Record<number, number> = {};
    const lastConcursoForMoldura: Record<number, number> = {};
    const freqLinha = Array(10).fill(0);   // 10 rows
    const freqColuna = Array(10).fill(0);  // 10 cols
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
      // valorNumerico: "00"→0 (para soma, pares, primos, fibonacci, triangulares)
      const dezenas = dezenasStr.map(valorNumerico);
      // posicaoVolante: "00"→99, "01"→0, ..., "99"→98 (para linha, coluna, moldura)
      const posicoes = dezenasStr.map(posicaoVolante);

      dezenasStr.forEach(d => {
        const key = d; // mantém a string original ("00"–"99") como chave de frequência
        if (freq[key]) {
          freq[key].count++;
          if (freq[key].lastSeenIdx === null) freq[key].lastSeenIdx = idx;
        }
      });

      const pares = dezenas.filter(d => d % 2 === 0).length;
      paresDistrib[pares] = (paresDistrib[pares] ?? 0) + 1;
      if (!(pares in lastConcursoForPares)) lastConcursoForPares[pares] = row.concurso;

      const moldura = posicoes.filter(p => MOLDURA_POSICOES.has(p)).length;
      molduraDistrib[moldura] = (molduraDistrib[moldura] ?? 0) + 1;
      if (!(moldura in lastConcursoForMoldura)) lastConcursoForMoldura[moldura] = row.concurso;

      // Linha (row in 10-col grid): posição 0–9 = linha 0 (01–10), ..., 90–99 = linha 9 (91–00)
      for (const p of posicoes) {
        const linhaIdx = Math.floor(p / 10);
        freqLinha[linhaIdx]++;
      }

      // Coluna (column in 10-row grid): posição % 10
      for (const p of posicoes) {
        const colIdx = p % 10;
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

    const paresImpares = Array.from({ length: 21 }, (_, p) => ({
      pares: p,
      impares: 20 - p,
      sorteios: paresDistrib[p] ?? 0,
      ultimoConcurso: lastConcursoForPares[p] ?? null,
    }));

    const molduraRetrato = Array.from({ length: 21 }, (_, m) => ({
      moldura: m,
      retrato: 20 - m,
      sorteios: molduraDistrib[m] ?? 0,
      ultimoConcurso: lastConcursoForMoldura[m] ?? null,
    }));

    const FAIXAS_LINHAS = ["01–10","11–20","21–30","31–40","41–50","51–60","61–70","71–80","81–90","91–00"];
    const frequenciaPorLinha = FAIXAS_LINHAS.map((faixa, i) => ({
      faixa,
      sorteios: freqLinha[i],
    }));

    const frequenciaPorColuna = Array.from({ length: 10 }, (_, i) => ({
      coluna: i,
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
      Array.from({ length: 21 }, (_, i) => ({ count: i, sorteios: distrib[i] ?? 0, ultimoConcurso: lastConcurso[i] ?? null }));

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
    req.log.error({ err }, "Failed to compute lotomania estatisticas");
    res.status(500).json({ error: "Erro ao calcular estatísticas" });
  }
});

// GET /api/lotomania/resumo
router.get("/lotomania/resumo", async (req, res) => {
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
    let totalGanhadores20 = 0;

    rows.forEach(row => {
      const premios = row.premios as Array<{ faixa: number; valorPremio: number; ganhadores: number }>;
      const faixa1 = premios[0];
      if (faixa1) {
        totalGanhadores20 += faixa1.ganhadores ?? 0;
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
      totalGanhadores20,
      proximoSorteio: latest?.dataProximoConcurso ?? null,
      ultimoConcurso: maxRow.maxConcurso ?? 0,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get lotomania resumo");
    res.status(500).json({ error: "Erro ao buscar resumo" });
  }
});

// POST /api/lotomania/simulador
router.post("/lotomania/simulador", async (req, res) => {
  try {
    const { dezenas, filtro = "premiados" } = req.body ?? {};

    if (!Array.isArray(dezenas) || dezenas.length !== 50) {
      res.status(400).json({ error: "Selecione exatamente 50 dezenas" });
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
      WHERE modalidade = 'lotomania'
      ORDER BY concurso DESC
    `);

    type PremioRow = { faixa: number; ganhadores: number; valorPremio: number };
    type ResultRow = {
      concurso: number; data: string; dezenas: string[]; premios: PremioRow[]; acertos: number;
    };

    const allRows = rows.rows as ResultRow[];
    const contagemPorAcertos: Record<number, number> = {};
    for (let i = 0; i <= 20; i++) contagemPorAcertos[i] = 0;

    let totalPremio = 0;
    const concursosFiltrados: {
      concurso: number; data: string; dezenas: string[]; acertos: number; premioGanho: number;
    }[] = [];

    // Lotomania faixas: 20→1, 19→2, 18→3, 17→4, 16→5, 15→6, 0→7
    const faixaForAcertos = (acertos: number): number | null => {
      if (acertos === 20) return 1;
      if (acertos === 19) return 2;
      if (acertos === 18) return 3;
      if (acertos === 17) return 4;
      if (acertos === 16) return 5;
      if (acertos === 15) return 6;
      if (acertos === 0) return 7;
      return null;
    };

    for (const row of allRows) {
      const acertos = Number(row.acertos);
      contagemPorAcertos[acertos] = (contagemPorAcertos[acertos] ?? 0) + 1;

      const premios = row.premios as PremioRow[];
      let premioGanho = 0;
      const faixa = faixaForAcertos(acertos);
      if (faixa !== null) {
        premioGanho = premios.find(p => p.faixa === faixa)?.valorPremio ?? 0;
      }

      totalPremio += premioGanho;

      const incluir =
        filtro === "todos" ||
        (filtro === "premiados" && faixa !== null) ||
        (filtro === "vinte"      && acertos === 20) ||
        (filtro === "dezenove"   && acertos === 19) ||
        (filtro === "dezoito"    && acertos === 18) ||
        (filtro === "dezessete"  && acertos === 17) ||
        (filtro === "dezesseis"  && acertos === 16) ||
        (filtro === "quinze"     && acertos === 15) ||
        (filtro === "zero"       && acertos === 0);

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

    const resumo = Array.from({ length: 21 }, (_, i) => ({
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
    req.log.error({ err }, "Failed to simulate lotomania");
    res.status(500).json({ error: "Erro ao simular" });
  }
});

// POST /api/lotomania/gerador
router.post("/lotomania/gerador", async (req, res) => {
  try {
    const { quantidadeJogos = 1 } = req.body ?? {};

    const qtdJogos = Math.min(20, Math.max(1, parseInt(String(quantidadeJogos), 10)));

    // Lotomania: aposta única de 50 dezenas (00–99, onde 00 ocupa a última posição do volante), R$ 3,00 cada
    const custoPorJogo = 3.0;

    const jogos: number[][] = [];
    for (let j = 0; j < qtdJogos; j++) {
      const pool = Array.from({ length: 100 }, (_, i) => i); // 0–99 (0 = "00")
      for (let i = pool.length - 1; i > 0; i--) {
        const r = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[r]] = [pool[r], pool[i]];
      }
      jogos.push(pool.slice(0, 50));
    }

    res.json({
      jogos,
      custo: custoPorJogo * qtdJogos,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to generate lotomania jogo");
    res.status(500).json({ error: "Erro ao gerar jogo" });
  }
});

export default router;