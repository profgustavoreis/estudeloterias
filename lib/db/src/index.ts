import path from "path";
import fs from "fs";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

// --- CARREGAMENTO DINÂMICO DO ARQUIVO .ENV PARA SUPORTE A MONOREPO ---
// Como os comandos podem ser disparados da raiz ou de dentro de subpastas,
// este laço varre os caminhos mais prováveis para injetar as variáveis locais do Docker.
const envPaths = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "../../.env"),
  path.resolve(process.cwd(), "lib/db/.env")
];

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    try {
      process.loadEnvFile(envPath);
      break; // Para no primeiro arquivo .env que encontrar e carregar com sucesso
    } catch (err) {
      // Falha silenciosa caso o arquivo exista mas falte permissão de leitura
    }
  }
}
// ---------------------------------------------------------------------

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

export * from "./schema";