import { Router } from "express";
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

export default router;
