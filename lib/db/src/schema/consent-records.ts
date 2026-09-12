import { pgTable, text, integer, boolean, timestamp, serial } from "drizzle-orm/pg-core";

// Registro de prova de consentimento (LGPD art. 8º, §2º).
//
// O CMP é próprio e guarda a decisão do usuário apenas no localStorage. Este
// espelho no servidor serve como prova da escolha feita no navegador: guarda
// somente o estado binário das finalidades, a versão do aviso e um id aleatório
// anônimo do navegador. Não armazena PII (sem IP, e-mail, user-agent etc.).
export const consentRecordsTable = pgTable("consent_records", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  version: integer("version").notNull(),
  analytics: boolean("analytics").notNull(),
  marketing: boolean("marketing").notNull(),
  clientId: text("client_id"),
});

export type ConsentRecord = typeof consentRecordsTable.$inferSelect;
export type InsertConsentRecord = typeof consentRecordsTable.$inferInsert;
