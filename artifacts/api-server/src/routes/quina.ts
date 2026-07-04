import { Router } from "express";
import { db } from "@workspace/db";
import { lotteryResultsTable } from "@workspace/db/schema";
import { eq, and, desc, asc, count, max, sql } from "drizzle-orm";
import { fetchGuidi, normalizeResult } from "../services/lottery-sync";
import { getLatest } from "./loterias";

const router = Router();

const MODALIDADE = "quina";

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
    valorAcumuladoConcursoFinal5: row.valorAcumuladoConcurso_0_5 ? Number(row.valorAcumuladoConcurso_0_5) : null,
    valorAcumuladoConcursoEspecial: row.valorAcumuladoConcursoEspecial ? Number(row.valorAcumuladoConcursoEspecial) : null,
  };
}

// GET /api/quina/resultado/ultimo
router.get("/quina/resultado/ultimo", async (req, res) => {
  try {
    const row = await getLatest(MODALIDADE);
    if (!row) { res.status(503).json({ error: "Dados indisponíveis" }); return; }
    res.json("id" in row ? toResultado(row as any) : row);
  } catch (err) {
    req.log.error({ err }, "Failed to get quina ultimo resultado");
    res.status(500).json({ error: "Erro ao buscar resultado" });
  }
});

// GET /api/quina/resultados
router.get("/quina/resultados", async (req, res) => {
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
    req.log.error({ err }, "Failed to get quina resultados");
    res.status(500).json({ error: "Erro ao buscar resultados" });
  }
});

// GET /api/quina/resultados/:concurso
router.get("/quina/resultados/:concurso", async (req, res) => {
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
    req.log.error({ err, concurso }, "Failed to get quina concurso");
    res.status(404).json({ error: "Concurso não encontrado" });
  }
});

// GET /api/quina/estatisticas
router.get("/quina/estatisticas", async (req, res) => {
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

    // Soma buckets for Quina: soma de 5 dezenas entre 1 e 80 (min=15, max=390)
    const SOMA_BUCKETS = [
      { min: 15,  max: 56,  faixa: "15–56"   },
      { min: 57,  max: 98,  faixa: "57–98"   },
      { min: 99,  max: 140, faixa: "99–140"  },
      { min: 141, max: 182, faixa: "141–182" },
      { min: 183, max: 224, faixa: "183–224" },
      { min: 225, max: 266, faixa: "225–266" },
      { min: 267, max: 308, faixa: "267–308" },
      { min: 309, max: 350, faixa: "309–350" },
      { min: 351, max: 390, faixa: "351–390" },
    ];

    const PRIMOS = new Set([2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79]);
    const FIBONACCI = new Set([1,2,3,5,8,13,21,34,55]);
    const TRIANGULARES = new Set([1,3,6,10,15,21,28,36,45,55,66,78]);

    // Moldura = outer border of 8×10 grid (row1 + row8 + leftmost/rightmost of rows 2–7)
    const MOLDURA = new Set<number>([
      ...Array.from({ length: 10 }, (_, i) => i + 1),      // row 1: 01–10
      ...Array.from({ length: 10 }, (_, i) => i + 71),     // row 8: 71–80
      11, 20, 21, 30, 31, 40, 41, 50, 51, 60, 61, 70,      // left/right of rows 2–7
    ]);

    const freq: Record<string, { count: number; lastSeenIdx: number | null }> = {};
    for (let i = 1; i <= 80; i++) {
      freq[String(i).padStart(2, "0")] = { count: 0, lastSeenIdx: null };
    }

    const paresDistrib: Record<number, number> = {};
    const lastConcursoForPares: Record<number, number> = {};
    const molduraDistrib: Record<number, number> = {};
    const lastConcursoForMoldura: Record<number, number> = {};
    const freqLinha = [0, 0, 0, 0, 0, 0, 0, 0];   // 8 rows
    const freqColuna = Array(10).fill(0);          // 10 cols
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

      // Linha (row in 10-col grid)
      for (const d of dezenas) {
        const linhaIdx = Math.min(Math.floor((d - 1) / 10), 7);
        freqLinha[linhaIdx]++;
      }

      // Coluna (column in 8-row grid)
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

    const paresImpares = [0, 1, 2, 3, 4, 5].map(p => ({
      pares: p,
      impares: 5 - p,
      sorteios: paresDistrib[p] ?? 0,
      ultimoConcurso: lastConcursoForPares[p] ?? null,
    }));

    const molduraRetrato = [0, 1, 2, 3, 4, 5].map(m => ({
      moldura: m,
      retrato: 5 - m,
      sorteios: molduraDistrib[m] ?? 0,
      ultimoConcurso: lastConcursoForMoldura[m] ?? null,
    }));

    const FAIXAS_LINHAS = ["01–10","11–20","21–30","31–40","41–50","51–60","61–70","71–80"];
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
      Array.from({ length: 6 }, (_, i) => ({ count: i, sorteios: distrib[i] ?? 0, ultimoConcurso: lastConcurso[i] ?? null }));

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
    req.log.error({ err }, "Failed to compute quina estatisticas");
    res.status(500).json({ error: "Erro ao calcular estatísticas" });
  }
});

// GET /api/quina/resumo
router.get("/quina/resumo", async (req, res) => {
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
    let totalGanhadores5 = 0;

    rows.forEach(row => {
      const premios = row.premios as Array<{ faixa: number; valorPremio: number; ganhadores: number }>;
      const faixa1 = premios[0];
      if (faixa1) {
        totalGanhadores5 += faixa1.ganhadores ?? 0;
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
      totalGanhadores5,
      proximoSorteio: latest?.dataProximoConcurso ?? null,
      ultimoConcurso: maxRow.maxConcurso ?? 0,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get quina resumo");
    res.status(500).json({ error: "Erro ao buscar resumo" });
  }
});

// GET /api/quina/quina-de-sao-joao
// A Quina de São João é o concurso especial realizado anualmente em data próxima
// ao dia 24 de junho. Desde 2020, o sorteio acontece no sábado da semana (domingo a
// sábado) que contém o dia 24 de junho — mesmo quando o próprio 24 cai num sábado
// (ficando na mesma data). Há exceções pontuais (ex.: 2024 saiu no sábado anterior;
// 2026 saiu num domingo), então tratamos a data calculada apenas como uma estimativa
// para a próxima edição, não como regra absoluta.
//
// Assim como a Mega da Virada e a Lotofácil da Independência, é um concurso especial
// que NÃO acumula: se ninguém acerta a quina (5 números), o prêmio garantido é
// repassado, no mesmo concurso, aos acertadores da quadra (faixa 2) — foi o que
// aconteceu em 2019 (concurso 5002).
const LIMIAR_PREMIO_ESPECIAL_QUINA = 50_000_000;

type Premio = { faixa: number; valorPremio: number; ganhadores: number };

function premioEfetivoSaoJoao(premios: Premio[] | null | undefined): number {
  const faixa1 = premios?.find(p => p.faixa === 1);
  if (faixa1 && faixa1.ganhadores > 0) return faixa1.valorPremio * faixa1.ganhadores;
  // Sem acertador da quina: o prêmio garantido desce para a faixa da quadra.
  const faixa2 = premios?.find(p => p.faixa === 2);
  if (faixa2 && faixa2.ganhadores > 0) return faixa2.valorPremio * faixa2.ganhadores;
  return 0;
}

function dataSaoJoao(ano: number): Date {
  const data = new Date(Date.UTC(ano, 5, 24)); // mês 5 = junho (0-indexed)
  const diaSemana = data.getUTCDay(); // 0=domingo..6=sábado
  const offset = 6 - diaSemana; // dias até o sábado da mesma semana domingo-sábado
  data.setUTCDate(data.getUTCDate() + offset);
  return data;
}

function proximaDataSaoJoao(hoje: Date): string {
  let ano = hoje.getUTCFullYear();
  let data = dataSaoJoao(ano);
  if (data < hoje) {
    ano += 1;
    data = dataSaoJoao(ano);
  }
  const dd = String(data.getUTCDate()).padStart(2, "0");
  const mm = String(data.getUTCMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${data.getUTCFullYear()}`;
}

router.get("/quina/quina-de-sao-joao", async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(lotteryResultsTable)
      .where(eq(lotteryResultsTable.modalidade, MODALIDADE))
      .orderBy(asc(lotteryResultsTable.concurso));

    const junho = rows.filter(r => {
      const partes = r.data.split("/");
      const ano = partes[2] ? parseInt(partes[2], 10) : 0;
      return partes[1] === "06" && ano >= 2011;
    });

    const melhorPorAno = new Map<string, (typeof rows)[number]>();
    for (const r of junho) {
      const ano = r.data.split("/")[2];
      if (!ano) continue;
      const total = premioEfetivoSaoJoao(r.premios as Premio[] | null);

      const atual = melhorPorAno.get(ano);
      const totalAtual = atual ? premioEfetivoSaoJoao(atual.premios as Premio[] | null) : -1;

      if (total > totalAtual) melhorPorAno.set(ano, r);
    }

    const saoJoao = Array.from(melhorPorAno.values())
      .filter(r => premioEfetivoSaoJoao(r.premios as Premio[] | null) >= LIMIAR_PREMIO_ESPECIAL_QUINA)
      .sort((a, b) => a.concurso - b.concurso);

    const anoAtual = new Date().getFullYear();
    res.json({
      anoAtual,
      dataProximaEdicao: proximaDataSaoJoao(new Date()),
      valorEstimado: null,
      historico: saoJoao.reverse().map(toResultado),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get quina de sao joao");
    res.status(500).json({ error: "Erro ao buscar Quina de São João" });
  }
});

// POST /api/quina/simulador
router.post("/quina/simulador", async (req, res) => {
  try {
    const { dezenas, filtro = "premiados" } = req.body ?? {};

    if (!Array.isArray(dezenas) || dezenas.length < 5 || dezenas.length > 15) {
      res.status(400).json({ error: "Selecione entre 5 e 15 dezenas" });
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
      WHERE modalidade = 'quina'
      ORDER BY concurso DESC
    `);

    type PremioRow = { faixa: number; ganhadores: number; valorPremio: number };
    type ResultRow = {
      concurso: number; data: string; dezenas: string[]; premios: PremioRow[]; acertos: number;
    };

    const allRows = rows.rows as ResultRow[];
    const contagemPorAcertos: Record<number, number> = {};
    for (let i = 0; i <= 5; i++) contagemPorAcertos[i] = 0;

    let totalPremio = 0;
    const concursosFiltrados: {
      concurso: number; data: string; dezenas: string[]; acertos: number; premioGanho: number;
    }[] = [];

    for (const row of allRows) {
      const acertos = Number(row.acertos);
      contagemPorAcertos[acertos] = (contagemPorAcertos[acertos] ?? 0) + 1;

      const premios = row.premios as PremioRow[];
      let premioGanho = 0;
      if (acertos === 5) premioGanho = premios.find(p => p.faixa === 1)?.valorPremio ?? 0;
      else if (acertos === 4) premioGanho = premios.find(p => p.faixa === 2)?.valorPremio ?? 0;
      else if (acertos === 3) premioGanho = premios.find(p => p.faixa === 3)?.valorPremio ?? 0;
      else if (acertos === 2) premioGanho = premios.find(p => p.faixa === 4)?.valorPremio ?? 0;

      totalPremio += premioGanho;

      const incluir =
        filtro === "todos" ||
        (filtro === "premiados" && acertos >= 2) ||
        (filtro === "quina"  && acertos === 5) ||
        (filtro === "quadra" && acertos === 4) ||
        (filtro === "terno"  && acertos === 3) ||
        (filtro === "duque"  && acertos === 2);

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

    const resumo = Array.from({ length: 6 }, (_, i) => ({
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
    req.log.error({ err }, "Failed to simulate quina");
    res.status(500).json({ error: "Erro ao simular" });
  }
});

// POST /api/quina/gerador
router.post("/quina/gerador", async (req, res) => {
  try {
    const { quantidadeJogos = 1, quantidadeDezenas = 5 } = req.body ?? {};

    const qtdJogos = Math.min(20, Math.max(1, parseInt(String(quantidadeJogos), 10)));
    const qtdDezenas = Math.min(15, Math.max(5, parseInt(String(quantidadeDezenas), 10)));

    function C(n: number, k: number): number {
      if (k < 0 || k > n) return 0;
      if (k === 0 || k === n) return 1;
      let r = 1;
      for (let i = 0; i < k; i++) r = (r * (n - i)) / (i + 1);
      return Math.round(r);
    }

    const apostasSimples = C(qtdDezenas, 5);
    const custoPorJogo = apostasSimples * 3.0;

    const jogos: number[][] = [];
    for (let j = 0; j < qtdJogos; j++) {
      const pool = Array.from({ length: 80 }, (_, i) => i + 1);
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
    req.log.error({ err }, "Failed to generate quina jogo");
    res.status(500).json({ error: "Erro ao gerar jogo" });
  }
});

export default router;
