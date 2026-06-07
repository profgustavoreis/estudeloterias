import { pgTable, text, integer, boolean, numeric, jsonb, timestamp, serial, unique } from "drizzle-orm/pg-core";

export const lotteryResultsTable = pgTable("lottery_results", {
  id: serial("id").primaryKey(),
  modalidade: text("modalidade").notNull(),
  concurso: integer("concurso").notNull(),
  data: text("data").notNull(),
  dezenas: jsonb("dezenas").$type<string[]>().notNull(),
  premios: jsonb("premios").$type<Array<{ faixa: number; descricao: string; ganhadores: number; valorPremio: number }>>().notNull(),
  acumulado: boolean("acumulado").notNull().default(false),
  valorAcumulado: numeric("valor_acumulado"),
  dataProximoConcurso: text("data_proximo_concurso"),
  valorEstimadoProximo: numeric("valor_estimado_proximo"),
  local: text("local"),
  arrecadacaoTotal: numeric("arrecadacao_total"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  unique("lottery_results_modalidade_concurso").on(t.modalidade, t.concurso),
]);

export type LotteryResult = typeof lotteryResultsTable.$inferSelect;
export type InsertLotteryResult = typeof lotteryResultsTable.$inferInsert;
