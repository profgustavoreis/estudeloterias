import { Router } from "express";
import { backfillOrdemSorteio } from "../services/lottery-sync";
import { logger } from "../lib/logger";

const router = Router();

router.post("/admin/backfill-ordem", (req, res) => {
  const modalidade = (req.query["modalidade"] as string) || "megasena";
  res.json({ started: true, modalidade });
  backfillOrdemSorteio(modalidade).catch((err) =>
    logger.error({ err, modalidade }, "Admin backfill-ordem failed"),
  );
});

export default router;
