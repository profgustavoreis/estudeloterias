import { Router } from "express";
import { db } from "@workspace/db";
import { lotteryResultsTable } from "@workspace/db/schema";
import { eq, and, desc, asc, count, max, sql } from "drizzle-orm";
import { fetchGuidi, normalizeResult } from "../services/lottery-sync";
import { getLatest } from "./loterias";

const router = Router();

const MODALIDADE = "duplasena";

function toResultado(row: typeof lotteryResultsTable.$inferSelect) {
  const meta = row.metadata as { dezenas2?: string[]; trevos?: string[] } | null;
  const trevosRaw = meta?.trevos ?? null;
  const trevosSet = trevosRaw ? new Set(trevosRaw.map(Number)) : null;
  return {
    concurso: row.concurso,
    data: row.data,
    dezenas: row.dezenas as string[],
    dezenasOrdem: ((row.dezenasOrdem as string[] | null) ?? null)
      ?.filter(d => !trevosSet?.has(Number(d))) ?? null,
    trevos: trevosRaw ? [...trevosRaw].sort((a, b) => Number(a) - Number(b)) : null,
    dezenas2: meta?.dezenas2 ?? null,
    premios: row.premios as Array<{ faixa: number; descricao: string; ganhadores: number; valorPremio: number }>,
    acumulado: row.acumulado,
    valorAcumulado: row.valorAcumulado ? Number(row.valorAcumulado) : null,
    dataProximoConcurso: row.dataProximoConcurso ?? null,
    valorEstimadoProximoConcurso: row.valorEstimadoProximo ? Number(row.valorEstimadoProximo) : null,
    arrecadacaoTotal: row.arrecadacaoTotal ? Number(row.arrecadacaoTotal) : null,
  };
}

// GET /api/duplasena/resultado/ultimo
router.get("/duplasena/resultado/ultimo", async (req, res) => {
  try {
    const row = await getLatest(MODALIDADE);
    if (!row) { res.status(503).json({ error: "Dados indisponíveis" }); return; }
    res.json("id" in row ? toResultado(row as any) : row);
  } catch (err) {
    req.log.error({ err }, "Failed to get duplasena ultimo resultado");
    res.status(500).json({ error: "Erro ao buscar resultado" });
  }
});

// GET /api/duplasena/resultados
router.get("/duplasena/resultados", async (req, res) => {
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
    req.log.error({ err }, "Failed to get duplasena resultados");
    res.status(500).json({ error: "Erro ao buscar resultados" });
  }
});

// GET /api/duplasena/resultados/:concurso
router.get("/duplasena/resultados/:concurso", async (req, res) => {
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
    const fbMeta = norm.metadata as { dezenas2?: string[]; trevos?: string[] } | null;
    const fbTrevos = fbMeta?.trevos ?? null;
    const fbTrevosSet = fbTrevos ? new Set(fbTrevos.map(Number)) : null;
    res.json({
      ...norm,
      dezenasOrdem: (norm.dezenasOrdem as string[] | null)
        ?.filter(d => !fbTrevosSet?.has(Number(d))) ?? null,
      trevos: fbTrevos ? [...fbTrevos].sort((a, b) => Number(a) - Number(b)) : null,
      dezenas2: fbMeta?.dezenas2 ?? null,
      valorAcumulado: norm.valorAcumulado ? Number(norm.valorAcumulado) : null,
      valorEstimadoProximoConcurso: norm.valorEstimadoProximo ? Number(norm.valorEstimadoProximo) : null,
      arrecadacaoTotal: norm.arrecadacaoTotal ? Number(norm.arrecadacaoTotal) : null,
    });
  } catch (err) {
    req.log.error({ err, concurso }, "Failed to get duplasena concurso");
    res.status(404).json({ error: "Concurso não encontrado" });
  }
});

// GET /api/duplasena/estatisticas?sorteio=1|2|ambos
router.get("/duplasena/estatisticas", async (req, res) => {
  try {
    const sorteio = (req.query.sorteio as string) || "1";
    if (!["1", "2"].includes(sorteio)) {
      res.status(400).json({ error: "sorteio deve ser '1' ou '2'" });
      return;
    }

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

    // Dupla Sena: 6 dezenas de 01 a 50 (min=21, max=285)
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
    const freqLinha = Array(5).fill(0);    // 5 rows
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
      const dezenasStr1 = row.dezenas as string[];
      const meta = row.metadata as { dezenas2?: string[] } | null;
      const dezenasStr2 = meta?.dezenas2 ?? [];

      const dezenasStr = sorteio === "2" ? dezenasStr2 : dezenasStr1;

      if (dezenasStr.length === 0) return;

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
    req.log.error({ err }, "Failed to compute duplasena estatisticas");
    res.status(500).json({ error: "Erro ao calcular estatísticas" });
  }
});

// GET /api/duplasena/resumo
router.get("/duplasena/resumo", async (req, res) => {
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
    req.log.error({ err }, "Failed to get duplasena resumo");
    res.status(500).json({ error: "Erro ao buscar resumo" });
  }
});

// POST /api/duplasena/simulador
router.post("/duplasena/simulador", async (req, res) => {
  try {
    const { dezenas, filtro = "premiados" } = req.body ?? {};

    if (!Array.isArray(dezenas) || dezenas.length < 6 || dezenas.length > 15) {
      res.status(400).json({ error: "Selecione entre 6 e 15 dezenas" });
      return;
    }

    const selecionadas = (dezenas as unknown[]).map(d => String(d).padStart(2, "0"));
    const selecionadasParams = selecionadas.map(d => sql`${d}`);
    const anyArray = sql`ARRAY[${sql.join(selecionadasParams, sql`, `)}]`;

    const rows = await db.execute(sql`
      SELECT
        concurso, data, dezenas, premios, metadata, arrecadacao_total AS arrecadacaoTotal,
        (
          SELECT COUNT(*)::integer
          FROM jsonb_array_elements_text(dezenas) AS dval
          WHERE dval = ANY(${anyArray}::text[])
        ) AS acertos1,
        (
          SELECT COUNT(*)::integer
          FROM jsonb_array_elements_text(COALESCE(NULLIF(metadata->>'dezenas2', ''), '[]')::jsonb) AS dval
          WHERE dval = ANY(${anyArray}::text[])
        ) AS acertos2
      FROM lottery_results
      WHERE modalidade = 'duplasena'
      ORDER BY concurso DESC
    `);

    type PremioRow = { faixa: number; ganhadores: number; valorPremio: number };
    type RawRow = {
      concurso: number; data: string; dezenas: string[]; premios: PremioRow[];
      metadata: unknown; arrecadacaototal: number | null;
      acertos1: number; acertos2: number;
    };

    // Prêmio bruto: 43,35% antes da Lotex (nov/2024); 43,79% depois — Lei 13.756/2018
    const PB_POS = 0.4379;
    const PB_PRE = 0.4335;

    function taxaPremioBruto(data: string | null | undefined): number {
      if (!data) return PB_POS;
      const partes = data.split("/");
      if (partes.length !== 3) return PB_POS;
      const ano = Number(partes[2]);
      if (ano > 2024) return PB_POS;
      if (ano < 2024) return PB_PRE;
      return Number(partes[1]) >= 11 ? PB_POS : PB_PRE;
    }

    // Percentuais do 2º sorteio sobre o prêmio bruto por era:
    // 4 premios: Sena2=30%, Quina2=20%, Quadra2=20%
    // 6 premios: Sena2=20%, Quina2=15%, Quadra2=10%
    // 8 premios: Sena2=11%, Quina2= 9%, Quadra2= 8%
    function percSena2(premiosLen: number): number {
      if (premiosLen >= 8) return 0.11;
      if (premiosLen >= 6) return 0.20;
      return 0.30;
    }
    function percQuina2(premiosLen: number): number {
      if (premiosLen >= 8) return 0.09;
      if (premiosLen >= 6) return 0.15;
      return 0.20;
    }
    function percQuadra2(premiosLen: number): number {
      if (premiosLen >= 8) return 0.08;
      if (premiosLen >= 6) return 0.10;
      return 0.20;
    }

    function estimarPremioSena2(
      arrecadacaoTotal: number | null | undefined,
      premiosLen: number,
      premios: PremioRow[],
      data?: string | null,
    ): number | null {
      // Tenta a partir da Quina2 (mais preciso)
      const off2 = premiosLen >= 8 ? 5 : premiosLen >= 6 ? 4 : 2;
      const q2 = premios.find(p => p.faixa === off2 + 1);
      if (q2 && q2.ganhadores > 0) {
        const ratio = percSena2(premiosLen) / percQuina2(premiosLen);
        return Math.round((q2.ganhadores * q2.valorPremio) * ratio * 100) / 100;
      }
      // Tenta a partir da Quadra2
      const qd2 = premios.find(p => p.faixa === off2 + 2);
      if (qd2 && qd2.ganhadores > 0) {
        const ratio = percSena2(premiosLen) / percQuadra2(premiosLen);
        return Math.round((qd2.ganhadores * qd2.valorPremio) * ratio * 100) / 100;
      }
      // Fallback: arrecadação (menos preciso)
      if (arrecadacaoTotal == null || arrecadacaoTotal <= 0) return null;
      return Math.round(arrecadacaoTotal * taxaPremioBruto(data) * percSena2(premiosLen) * 100) / 100;
    }

    const allRows = rows.rows as RawRow[];
    const contagemSorteio1: Record<number, number> = {};
    const contagemSorteio2: Record<number, number> = {};
    for (let i = 0; i <= 6; i++) { contagemSorteio1[i] = 0; contagemSorteio2[i] = 0; }

    let totalPremio = 0;
    const concursosFiltrados: {
      concurso: number; data: string; dezenas: string[]; acertos: number; premioGanho: number; sorteio: number;
    }[] = [];

    // Faixas por sorteio e época da Dupla Sena:
    // 8 premios (2016+): 4 faixas/sorteio — 1º:1-4, 2º:5-8
    // 6 premios (2010–2016): 3 faixas/sorteio — 1º:1-3, 2º:4-6
    // 4 premios (2001–2010): 1º:só 6acertos(1), 2º:6acertos(2),5acertos(3),4acertos(4)
    function faixaParaSorteio(acertos: number, sorteio: 1 | 2, premiosLen: number): number | null {
      if (sorteio === 1) {
        if (acertos === 6) return 1;
        // Na era de 4 premios o 1º sorteio só pagava Sena (6 acertos)
        if (acertos === 5) return premiosLen >= 6 ? 2 : null;
        if (acertos === 4) return premiosLen >= 6 ? 3 : null;
        if (acertos === 3) return premiosLen >= 8 ? 4 : null;
      } else if (premiosLen >= 8) {
        if (acertos === 6) return 5;
        if (acertos === 5) return 6;
        if (acertos === 4) return 7;
        if (acertos === 3) return 8;
      } else if (premiosLen >= 6) {
        if (acertos === 6) return 4;
        if (acertos === 5) return 5;
        if (acertos === 4) return 6;
      } else if (premiosLen === 4) {
        if (acertos === 6) return 2;
        if (acertos === 5) return 3;
        if (acertos === 4) return 4;
      }
      return null;
    }

    for (const row of allRows) {
      const acertos1 = Number(row.acertos1);
      const acertos2 = Number(row.acertos2);
      const meta = row.metadata as { dezenas2?: string[] } | null;
      const dezenas1 = row.dezenas as string[];
      const dezenas2 = meta?.dezenas2 ?? [];
      const premios = row.premios as PremioRow[];
      const premiosLen = premios.length;

      const sorteios: Array<{ sorteio: 1 | 2; acertos: number; dezenas: string[] }> = [
        { sorteio: 1, acertos: acertos1, dezenas: dezenas1 },
        { sorteio: 2, acertos: acertos2, dezenas: dezenas2 },
      ];

      for (const { sorteio, acertos, dezenas } of sorteios) {
        const contagem = sorteio === 1 ? contagemSorteio1 : contagemSorteio2;
        contagem[acertos] = (contagem[acertos] ?? 0) + 1;

        let premioGanho = 0;
        const faixa = faixaParaSorteio(acertos, sorteio, premiosLen);
        if (faixa !== null) {
          const premioFaixa = premios.find(p => p.faixa === faixa);
          if (premioFaixa && premioFaixa.ganhadores > 0) {
            premioGanho = premioFaixa.valorPremio;
          } else if (acertos === 6) {
            // Sena sem ganhadores: estima de faixas com vencedores ou arrecadação
            const estimativa = estimarPremioSena2(row.arrecadacaototal, premiosLen, premios, row.data);
            if (estimativa != null) premioGanho = estimativa;
          }
        }

        totalPremio += premioGanho;

        const incluir =
          filtro === "todos" ||
          (filtro === "premiados" && faixa !== null) ||
          (filtro === "sena"   && acertos === 6) ||
          (filtro === "quina"  && acertos === 5) ||
          (filtro === "quadra" && acertos === 4) ||
          (filtro === "terno"  && acertos === 3);

        if (incluir && dezenas.length > 0) {
          concursosFiltrados.push({
            concurso: row.concurso,
            data: row.data,
            dezenas,
            acertos,
            premioGanho,
            sorteio,
          });
        }
      }
    }

    const resumo = [
      ...Array.from({ length: 7 }, (_, i) => ({
        acertos: i,
        contagem: contagemSorteio1[i] ?? 0,
        sorteio: 1,
      })),
      ...Array.from({ length: 7 }, (_, i) => ({
        acertos: i,
        contagem: contagemSorteio2[i] ?? 0,
        sorteio: 2,
      })),
    ].reverse();

    res.json({
      resumo,
      concursos: concursosFiltrados,
      totalPremio,
      totalConcursos: allRows.length,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to simulate duplasena");
    res.status(500).json({ error: "Erro ao realizar simulação" });
  }
});

// POST /api/duplasena/gerador
router.post("/duplasena/gerador", async (req, res) => {
  try {
    const { quantidadeJogos = 1, quantidadeDezenas = 6 } = req.body ?? {};

    const qtdJogos = Math.min(20, Math.max(1, parseInt(String(quantidadeJogos), 10)));
    const qtdDezenas = Math.min(15, Math.max(6, parseInt(String(quantidadeDezenas), 10)));

    // Dupla Sena: C(n,6) × R$ 3,30 (aposta mínima de 6 dezenas = R$ 3,30)
    function C(n: number, k: number): number {
      if (k < 0 || k > n) return 0;
      if (k === 0 || k === n) return 1;
      let r = 1;
      for (let i = 0; i < k; i++) r = (r * (n - i)) / (i + 1);
      return Math.round(r);
    }

    const custoPorJogo = 3.0 * C(qtdDezenas, 6);

    const jogos: number[][] = [];
    for (let j = 0; j < qtdJogos; j++) {
      const pool = Array.from({ length: 50 }, (_, i) => i + 1);
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
    req.log.error({ err }, "Failed to generate duplasena jogo");
    res.status(500).json({ error: "Erro ao gerar jogo" });
  }
});

export default router;
