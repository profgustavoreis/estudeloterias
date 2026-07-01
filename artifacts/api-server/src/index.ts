import path from "path";
import fs from "fs";

// Carrega as variáveis da raiz do projeto tanto local quanto em prod
const rootEnvPath = path.resolve(process.cwd(), ".env");
const workspaceEnvPath = path.resolve(process.cwd(), "../../.env");

if (fs.existsSync(rootEnvPath)) {
  process.loadEnvFile(rootEnvPath);
} else if (fs.existsSync(workspaceEnvPath)) {
  process.loadEnvFile(workspaceEnvPath);
}

import app from "./app";
import { logger } from "./lib/logger";
import cron from "node-cron";
import { runSync, runInitialSeed, runGapAudit } from "./services/lottery-sync";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error("PORT environment variable is required but was not provided.");
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }
  logger.info({ port }, "Server listening");

  // Seed initial data in background (non-blocking)
  runInitialSeed().catch((err) => logger.error({ err }, "Initial seed error"));

  // Cron: sync after each draw day — Tue/Thu/Sat at 22:30 and 23:30 BR time (UTC-3)
  // UTC: 01:30 and 02:30 Wed/Fri/Sun
  cron.schedule("30 1 * * 3,5,0", () => {
    logger.info("Cron: running lottery sync (first attempt)");
    runSync().catch((err) => logger.error({ err }, "Cron sync failed"));
  });
  cron.schedule("30 2 * * 3,5,0", () => {
    logger.info("Cron: running lottery sync (second attempt)");
    runSync().catch((err) => logger.error({ err }, "Cron sync failed"));
  });

  // During draw window (21:00–21:59 BR time = 00:00–00:59 UTC), sync every 1 minute
  // Mon–Sat: draws happen every day except Sunday
  cron.schedule("*/1 0 * * 1,2,3,4,5,6", () => {
    logger.info("Cron: draw-window lottery sync (1 min)");
    runSync().catch((err) => logger.error({ err }, "Draw-window sync failed"));
  });

  // After draw window, back to periodic every 4 hours
  cron.schedule("0 */4 * * *", () => {
    logger.info("Cron: periodic lottery sync (4h)");
    runSync().catch((err) => logger.error({ err }, "Periodic sync failed"));
  });

  // Daily self-healing gap audit — scans every modalidade for internal gaps
  // (concursos missing between 1 and the latest known contest) and fetches
  // whatever is missing. Runs at 06:00 UTC (03:00 BR time), outside draw windows.
  cron.schedule("0 6 * * *", () => {
    logger.info("Cron: daily gap audit (all modalidades)");
    runGapAudit().catch((err) => logger.error({ err }, "Daily gap audit failed"));
  });
});
