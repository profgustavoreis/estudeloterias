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

  // Seed initial data in background, then run a one-shot sync (non-blocking).
  runInitialSeed()
    .then(() => runSync())
    .catch((err) => logger.error({ err }, "Startup sync failed"));

  // IMPORTANT: node-cron evaluates schedules using the system's local timezone
  // unless an explicit `timezone` option is passed — it does NOT default to UTC.
  // All schedules below pass `timezone: "America/Sao_Paulo"` explicitly so the
  // expressions below are plain BR wall-clock time, and behave identically on any
  // host (local dev machine, Replit, etc.) regardless of that host's system TZ.
  const BR_TZ = "America/Sao_Paulo";

  // Draw-window sync — every 5 minutes (5 min) in BR time during scheduled draw
  // windows. CAIXA moved the weekend draw from Saturday night to Sunday 11:00
  // (effective 19/07/2026), so we now run two windows:
  //
  //  1. Weekday draws (Mon–Fri): weekly/daily lotteries (Mega-Sena, Lotofácil,
  //     Quina, Timemania, Dia de Sorte, +Milionária, Dupla Sena, Super Sete,
  //     Lotomania) draw on weekday evenings ~20h–22h BR. Window: 21:00–23:59 Mon–Fri.
  //  2. Weekend draw (Sunday): the block that used to be Saturday-night now draws
  //     Sunday 11:00 BR. Window: 11:00–13:59 on Sunday.
  //
  // Saturday no longer has regular draws. Caixa publication can lag ~30–60 min;
  // keeping each window slightly open + the 4-hourly net (below) catches late results without
  // extra one-off jobs.
  cron.schedule(
    "*/5 21-23 * * 1,2,3,4,5",
    () => {
      logger.info("Cron: draw-window lottery sync (5 min) — weekday evening");
      runSync().catch((err) => logger.error({ err }, "Draw-window sync failed"));
    },
    { timezone: BR_TZ },
  );

  // Sunday-morning draw window — the weekend draw moved from Saturday to Sunday 11:00
  // BR (effective 19/07/2026). Runs Sun 11:00–13:59 so the DB catches results right
  // after publication instead of waiting hours for the 4h periodic net.
  cron.schedule(
    "*/5 11-13 * * 0",
    () => {
      logger.info("Cron: draw-window lottery sync (5 min) — Sunday morning");
      runSync().catch((err) => logger.error({ err }, "Sunday draw-window sync failed"));
    },
    { timezone: BR_TZ },
  );

  // Periodic safety net every 4 hours, every day — catches anything missed
  // outside the draw window (e.g. a very late-published result, a temporary
  // Caixa API outage during the draw window).
  cron.schedule(
    "0 */4 * * *",
    () => {
      logger.info("Cron: periodic lottery sync (4h)");
      runSync().catch((err) => logger.error({ err }, "Periodic sync failed"));
    },
    { timezone: BR_TZ },
  );

  // Daily self-healing gap audit — scans every modalidade for internal gaps
  // (concursos missing between 1 and the latest known contest) and fetches
  // whatever is missing. Runs at 03:00 BR time, well outside draw windows.
  cron.schedule(
    "0 3 * * *",
    () => {
      logger.info("Cron: daily gap audit (all modalidades)");
      runGapAudit().catch((err) => logger.error({ err }, "Daily gap audit failed"));
    },
    { timezone: BR_TZ },
  );
});
