import app from "./app";
import { logger } from "./lib/logger";
import cron from "node-cron";
import { runSync, runInitialSeed } from "./services/lottery-sync";

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

  // Also sync once every 4 hours to catch any missed draws
  cron.schedule("0 */4 * * *", () => {
    logger.info("Cron: periodic lottery sync");
    runSync().catch((err) => logger.error({ err }, "Periodic sync failed"));
  });
});
