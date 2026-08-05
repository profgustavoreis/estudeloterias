import { Router } from "express";
import { db } from "@workspace/db";
import { drawAvailabilityTable } from "@workspace/db/schema";
import { sql } from "drizzle-orm";
import { backfillOrdemSorteio, backfillGaps, runGapAudit, runSync } from "../services/lottery-sync";
import { logger } from "../lib/logger";

const router = Router();

router.post("/admin/backfill-ordem", (req, res) => {
  const modalidade = (req.query["modalidade"] as string) || "megasena";
  res.json({ started: true, modalidade });
  backfillOrdemSorteio(modalidade).catch((err) =>
    logger.error({ err, modalidade }, "Admin backfill-ordem failed"),
  );
});

router.post("/admin/backfill-gaps", (req, res) => {
  const modalidade = (req.query["modalidade"] as string) || "lotofacil";
  res.json({ started: true, modalidade });
  backfillGaps(modalidade).catch((err) =>
    logger.error({ err, modalidade }, "Admin backfill-gaps failed"),
  );
});

// Varre e preenche lacunas internas para as 9 modalidades de uma vez (sequencial).
router.post("/admin/backfill-gaps-all", (req, res) => {
  res.json({ started: true, modalidades: "all" });
  runGapAudit().catch((err) => logger.error({ err }, "Admin backfill-gaps-all failed"));
});

// Força uma sincronização imediata do último resultado de todas as modalidades,
// sem depender de reiniciar o servidor ou esperar o próximo cron.
router.post("/admin/sync-now", (req, res) => {
  res.json({ started: true });
  runSync().catch((err) => logger.error({ err }, "Admin sync-now failed"));
});

// GET /admin/availability/summary?n=40
// Média móvel da latência de disponibilidade ("min após o sorteio") por modalidade,
// sobre as últimas N observações (padrão 40). Serve de evidência para dimensionar as
// janelas dos crons. É uma estatística interna/operacional — não faz parte do contrato
// público de /api (assim como os demais endpoints /admin/* que não estão no openapi.yaml).
router.get("/admin/availability/summary", async (req, res) => {
  try {
    const n = Math.min(200, Math.max(1, Number(req.query["n"]) || 40));

    const result = await db.execute(sql`
      WITH ranked AS (
        SELECT
          modalidade,
          concurso,
          latency_minutes,
          observed_at,
          ROW_NUMBER() OVER (PARTITION BY modalidade ORDER BY observed_at DESC) AS rn
        FROM ${drawAvailabilityTable}
      )
      SELECT
        modalidade,
        COUNT(*)::int AS observacoes,
        ROUND(AVG(latency_minutes))::int AS media_minutos,
        MIN(latency_minutes)::int AS min_minutos,
        MAX(latency_minutes)::int AS max_minutos,
        MAX(observed_at) AS ultima_observacao
      FROM ranked
      WHERE rn <= ${n}
      GROUP BY modalidade
      ORDER BY modalidade
    `);

    res.json({
      janelaUltimos: n,
      geradoEm: new Date().toISOString(),
      perModalidade: result.rows,
    });
  } catch (err) {
    logger.error({ err }, "Admin availability summary failed");
    res.status(500).json({ error: "Erro ao computar média de disponibilidade" });
  }
});

export default router;
