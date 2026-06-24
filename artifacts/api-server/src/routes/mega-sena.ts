import { Router } from "express";
import { db } from "@workspace/db";
import { lotteryResultsTable } from "@workspace/db/schema";
import { eq, and, desc, asc, count, max, sql } from "drizzle-orm";
import { fetchGuidi, normalizeResult } from "../services/lottery-sync";
import { getLatest } from "./loterias";

const router = Router();

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
    local: row.local ?? null,
    localGanhadores: null,
    arrecadacaoTotal: row.arrecadacaoTotal ? Number(row.arrecadacaoTotal) : null,
    valorAcumuladoConcurso_0_5: row.valorAcumuladoConcurso_0_5 ? Number(row.valorAcumuladoConcurso_0_5) : null,
    valorAcumuladoConcursoEspecial: row.valorAcumuladoConcursoEspecial ? Number(row.valorAcumuladoConcursoEspecial) : null,
  };
}

// GET /api/mega-sena/resultado/ultimo
router.get("/mega-sena/resultado/ultimo", async (req, res) => {
  try {
    const row = await getLatest("megasena");
    if (!row) { res.status(503).json({ error: "Dados indisponíveis" }); return; }
    res.json("id" in row ? toResultado(row as any) : row);
  } catch (err) {
    req.log.error({ err }, "Failed to get mega-sena ultimo resultado");
    res.status(500).json({ error: "Erro ao buscar resultado" });
  }
});

// GET /api/mega-sena/resultados
router.get("/mega-sena/resultados", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10));
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit ?? "20"), 10)));
    const ano = req.query.ano ? parseInt(String(req.query.ano), 10) : null;

    const offset = (page - 1) * limit;

    let baseQuery = db.select().from(lotteryResultsTable).where(eq(lotteryResultsTable.modalidade, "megasena"));

    // Count total
    const [{ total }] = await db
      .select({ total: count() })
      .from(lotteryResultsTable)
      .where(eq(lotteryResultsTable.modalidade, "megasena"));

    const rows = await db
      .select()
      .from(lotteryResultsTable)
      .where(eq(lotteryResultsTable.modalidade, "megasena"))
      .orderBy(desc(lotteryResultsTable.concurso))
      .limit(limit)
      .offset(offset);

    let resultados = rows.map(toResultado);

    if (ano) {
      resultados = resultados.filter(r => {
        const parts = r.data.split("/");
        return parts.length === 3 && parseInt(parts[2], 10) === ano;
      });
    }

    res.json({
      total,
      pagina: page,
      limite: limit,
      totalPaginas: Math.ceil(total / limit),
      resultados,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get mega-sena resultados");
    res.status(500).json({ error: "Erro ao buscar resultados" });
  }
});

// GET /api/mega-sena/resultados/:concurso
router.get("/mega-sena/resultados/:concurso", async (req, res) => {
  const concurso = parseInt(req.params.concurso, 10);
  if (isNaN(concurso) || concurso < 1) { res.status(400).json({ error: "Concurso inválido" }); return; }

  try {
    const rows = await db
      .select()
      .from(lotteryResultsTable)
      .where(and(
        eq(lotteryResultsTable.modalidade, "megasena"),
        eq(lotteryResultsTable.concurso, concurso),
      ))
      .limit(1);

    if (rows.length > 0) {
      res.json(toResultado(rows[0]));
      return;
    }

    // Fallback to external API
    const raw = await fetchGuidi("megasena", concurso);
    if (!raw) { res.status(404).json({ error: "Concurso não encontrado" }); return; }
    const norm = normalizeResult(raw, "megasena");
    res.json({
      ...norm,
      valorAcumulado: norm.valorAcumulado ? Number(norm.valorAcumulado) : null,
      valorEstimadoProximoConcurso: norm.valorEstimadoProximo ? Number(norm.valorEstimadoProximo) : null,
      local: norm.local,
      localGanhadores: null,
      arrecadacaoTotal: norm.arrecadacaoTotal ? Number(norm.arrecadacaoTotal) : null,
      valorAcumuladoConcurso_0_5: norm.valorAcumuladoConcurso_0_5 ? Number(norm.valorAcumuladoConcurso_0_5) : null,
      valorAcumuladoConcursoEspecial: norm.valorAcumuladoConcursoEspecial ? Number(norm.valorAcumuladoConcursoEspecial) : null,
    });
  } catch (err) {
    req.log.error({ err, concurso }, "Failed to get concurso");
    res.status(404).json({ error: "Concurso não encontrado" });
  }
});

// GET /api/mega-sena/estatisticas
router.get("/mega-sena/estatisticas", async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(lotteryResultsTable)
      .where(eq(lotteryResultsTable.modalidade, "megasena"))
      .orderBy(desc(lotteryResultsTable.concurso));

    if (rows.length === 0) {
      res.status(503).json({ error: "Dados insuficientes. Sincronização em andamento." });
      return;
    }

    const total = rows.length;
    const latestConcurso = rows[0].concurso;

    // Frequency map
    const freq: Record<string, { count: number; lastSeenIdx: number | null }> = {};
    for (let i = 1; i <= 60; i++) {
      freq[String(i).padStart(2, "0")] = { count: 0, lastSeenIdx: null };
    }

    rows.forEach((row, idx) => {
      const dezenas = row.dezenas as string[];
      dezenas.forEach(d => {
        const key = String(parseInt(d, 10)).padStart(2, "0");
        if (freq[key]) {
          freq[key].count++;
          if (freq[key].lastSeenIdx === null) freq[key].lastSeenIdx = idx;
        }
      });
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

    const acumulados = rows.filter(r => r.acumulado).length;

    // Find biggest prize
    let maiorPremio = 0;
    let maiorPremioRow = rows[0];
    rows.forEach(row => {
      const premios = row.premios as Array<{ faixa: number; valorPremio: number; ganhadores: number }>;
      const faixa1 = premios[0];
      if (faixa1 && faixa1.valorPremio > maiorPremio && faixa1.ganhadores > 0) {
        maiorPremio = faixa1.valorPremio;
        maiorPremioRow = row;
      }
    });

    // Total concursos (from DB max)
    const [maxRow] = await db
      .select({ maxConcurso: max(lotteryResultsTable.concurso) })
      .from(lotteryResultsTable)
      .where(eq(lotteryResultsTable.modalidade, "megasena"));

    res.json({
      totalConcursos: maxRow.maxConcurso ?? latestConcurso,
      frequenciaDezenas,
      atrasoMaiores,
      totalAcumulados: acumulados,
      percentualAcumulado: total > 0 ? Math.round((acumulados / total) * 1000) / 10 : 0,
      maiorPremio,
      maiorPremioData: maiorPremioRow.data,
      maiorPremioConcurso: maiorPremioRow.concurso,
      maiorSequencia: 6,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to compute estatisticas");
    res.status(500).json({ error: "Erro ao calcular estatísticas" });
  }
});

// GET /api/mega-sena/calendario
router.get("/mega-sena/calendario", async (req, res) => {
  try {
    const row = await getLatest("megasena");

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

    // Generate next 20 draw dates (Tue=2, Thu=4, Sat=6)
    const drawDays = [2, 4, 6];
    let cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    let count = 0;

    while (count < 20) {
      cursor.setDate(cursor.getDate() + 1);
      if (drawDays.includes(cursor.getDay())) {
        const dd = String(cursor.getDate()).padStart(2, "0");
        const mm = String(cursor.getMonth() + 1).padStart(2, "0");
        const yyyy = cursor.getFullYear();
        const isVirada = cursor.getMonth() === 11 && cursor.getDate() === 31;
        sorteios.push({
          data: `${dd}/${mm}/${yyyy}`,
          diaSemana: cursor.toLocaleDateString("pt-BR", { weekday: "long" }),
          concursoEstimado: null,
          valorEstimado: null,
          especial: isVirada,
          descricao: isVirada ? "Mega da Virada" : null,
        });
        count++;
      }
    }

    res.json(sorteios.slice(0, 20));
  } catch (err) {
    req.log.error({ err }, "Failed to get calendario");
    res.status(500).json({ error: "Erro ao buscar calendário" });
  }
});

// GET /api/mega-sena/mega-da-virada
router.get("/mega-sena/mega-da-virada", async (req, res) => {
  try {
    // Mega da Virada always on Dec 31 — filter by date
    const rows = await db
      .select()
      .from(lotteryResultsTable)
      .where(eq(lotteryResultsTable.modalidade, "megasena"))
      .orderBy(asc(lotteryResultsTable.concurso));

    const virada = rows.filter(r => {
      const parts = r.data.split("/");
      return parts[0] === "31" && parts[1] === "12";
    });

    const anoAtual = new Date().getFullYear();

    res.json({
      anoAtual,
      dataProximaVirada: `31/12/${anoAtual}`,
      valorEstimado: null,
      historico: virada.reverse().map(toResultado),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get mega da virada");
    res.status(500).json({ error: "Erro ao buscar Mega da Virada" });
  }
});

// GET /api/mega-sena/resumo
router.get("/mega-sena/resumo", async (req, res) => {
  try {
    const [maxRow] = await db
      .select({ maxConcurso: max(lotteryResultsTable.concurso), total: count() })
      .from(lotteryResultsTable)
      .where(eq(lotteryResultsTable.modalidade, "megasena"));

    const latestRow = await getLatest("megasena");

    // Biggest prize — all records
    const rows = await db
      .select()
      .from(lotteryResultsTable)
      .where(eq(lotteryResultsTable.modalidade, "megasena"))
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
    req.log.error({ err }, "Failed to get resumo");
    res.status(500).json({ error: "Erro ao buscar resumo" });
  }
});

// POST /api/mega-sena/gerador
router.post("/mega-sena/gerador", async (req, res) => {
  const { quantidadeJogos = 1, quantidadeDezenas = 6 } = req.body ?? {};
  const jogosNum = Math.min(20, Math.max(1, parseInt(String(quantidadeJogos), 10)));
  const dezenasNum = Math.min(15, Math.max(6, parseInt(String(quantidadeDezenas), 10)));

  const precos: Record<number, number> = {
    6: 5.0, 7: 35.0, 8: 140.0, 9: 420.0, 10: 1050.0,
    11: 2310.0, 12: 4620.0, 13: 8580.0, 14: 15015.0, 15: 25025.0,
  };

  const jogos = Array.from({ length: jogosNum }, () => {
    const nums = new Set<number>();
    while (nums.size < dezenasNum) nums.add(Math.floor(Math.random() * 60) + 1);
    return Array.from(nums).sort((a, b) => a - b);
  });

  res.json({ jogos, custo: jogosNum * (precos[dezenasNum] ?? 5.0) });
});

export default router;
