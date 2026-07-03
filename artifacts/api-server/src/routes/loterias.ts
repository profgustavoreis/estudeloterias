import { Router } from "express";
import { db } from "@workspace/db";
import { lotteryResultsTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
import { fetchGuidi, normalizeResult } from "../services/lottery-sync";
import { logger } from "../lib/logger";

const router = Router();

const MODALIDADES_META = [
  { modalidade: "megasena",      nome: "Mega-Sena",    descricao: "Escolha de 6 a 15 números entre 01 e 60", cor: "#009640", icone: "megasena" },
  { modalidade: "lotofacil",     nome: "Lotofácil",    descricao: "Escolha de 15 a 20 números entre 01 e 25", cor: "#930089", icone: "lotofacil" },
  { modalidade: "quina",         nome: "Quina",        descricao: "Escolha de 5 a 15 números entre 01 e 80", cor: "#260085", icone: "quina" },
  { modalidade: "duplasena",     nome: "Dupla Sena",   descricao: "Escolha de 6 a 15 números entre 01 e 50", cor: "#a41024", icone: "duplasena" },
  { modalidade: "diadesorte",    nome: "Dia de Sorte", descricao: "Escolha de 7 a 15 números entre 01 e 31", cor: "#cb852b", icone: "diadesorte" },
  { modalidade: "supersete",     nome: "Super Sete",   descricao: "Escolha 7 números, um por coluna (0 a 9)", cor: "#a8cf45", icone: "supersete" },
  { modalidade: "lotomania",     nome: "Lotomania",    descricao: "Escolha de 50 números entre 00 e 99", cor: "#f8901c", icone: "lotomania" },
  { modalidade: "timemania",     nome: "Timemania",    descricao: "Escolha 10 números entre 01 e 80 e um time", cor: "#049645", icone: "timemania" },
  { modalidade: "maismilionaria",nome: "+Milionária",  descricao: "Escolha 6 números entre 01 e 50 e 2 trevos", cor: "#2E3078", icone: "maismilionaria" },
];

async function getLatest(modalidade: string) {
  // Try DB first
  const rows = await db
    .select()
    .from(lotteryResultsTable)
    .where(eq(lotteryResultsTable.modalidade, modalidade))
    .orderBy(desc(lotteryResultsTable.concurso))
    .limit(1);

  if (rows.length > 0) return rows[0];

  // Fallback to API
  const raw = await fetchGuidi(modalidade);
  if (!raw) return null;
  return normalizeResult(raw, modalidade);
}

router.get("/loterias", async (req, res) => {
  try {
    const loterias = await Promise.all(
      MODALIDADES_META.map(async (m) => {
        try {
          const latest = await getLatest(m.modalidade);
          if (!latest) return { ...m, ultimoConcurso: 0, dataUltimoSorteio: "", premioAcumulado: null, acumulado: false, dezenas: [] };
          const premios = latest.premios as Array<{ faixa: number; ganhadores: number; valorPremio: number }>;
          const faixa1 = premios?.find(p => p.faixa === 1);
          const meta = latest.metadata as { dezenas2?: string[]; nomeEspecial?: string; trevos?: string[] } | null;
          return {
            ...m,
            ultimoConcurso: latest.concurso,
            dataUltimoSorteio: latest.data,
            premioAcumulado: latest.valorAcumulado ? Number(latest.valorAcumulado) : null,
            acumulado: latest.acumulado,
            ganhadoresFaixa1: faixa1?.ganhadores ?? null,
            valorPremioFaixa1: faixa1?.valorPremio ?? null,
            dezenas: latest.dezenas as string[],
            dezenas2: meta?.dezenas2 ?? null,
            nomeEspecial: meta?.nomeEspecial ?? null,
            trevos: meta?.trevos ?? null,
            dataProximoConcurso: latest.dataProximoConcurso ?? null,
            valorEstimadoProximoConcurso: latest.valorEstimadoProximo ? Number(latest.valorEstimadoProximo) : null,
          };
        } catch {
          return { ...m, ultimoConcurso: 0, dataUltimoSorteio: "", premioAcumulado: null, acumulado: false, dezenas: [] };
        }
      })
    );
    res.json(loterias);
  } catch (err) {
    req.log.error({ err }, "Failed to get loterias");
    res.status(500).json({ error: "Erro ao buscar loterias" });
  }
});

router.get("/loterias/:modalidade/resultado/ultimo", async (req, res) => {
  const { modalidade } = req.params;
  const valid = MODALIDADES_META.map((m) => m.modalidade);
  if (!valid.includes(modalidade)) {
    res.status(404).json({ error: "Modalidade não encontrada" });
    return;
  }

  try {
    const latest = await getLatest(modalidade);
    if (!latest) { res.status(503).json({ error: "Dados indisponíveis" }); return; }

    res.json({
      concurso: latest.concurso,
      data: latest.data,
      dezenas: latest.dezenas,
      premios: latest.premios,
      acumulado: latest.acumulado,
      valorAcumulado: latest.valorAcumulado ? Number(latest.valorAcumulado) : null,
      dataProximoConcurso: latest.dataProximoConcurso ?? null,
      valorEstimadoProximoConcurso: latest.valorEstimadoProximo ? Number(latest.valorEstimadoProximo) : null,
    });
  } catch (err) {
    req.log.error({ err, modalidade }, "Failed to get ultimo resultado");
    res.status(500).json({ error: "Erro ao buscar resultado" });
  }
});

export { getLatest, MODALIDADES_META };
export default router;
