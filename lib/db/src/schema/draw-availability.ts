import { pgTable, text, integer, timestamp, serial, unique } from "drizzle-orm/pg-core";

// Tabela append-only de observações de disponibilidade de resultado por sorteio.
//
// Cada linha registra UMA ÚNICA vez por (modalidade, concurso) o momento exato
// em que o resultado daquele concurso passou a aparecer na resposta da API da Caixa
// durante nossas vartas de sincronização (ou seja, a primeira constatação via poll).
//
// É a medição a partir da OBSERVAÇÃO (o cron), não da publicação interna da Caixa —
// o que reflete exatamente o que conseguimos medir e o que queremos usar para dimensionar
// as janelas de sincronização.
//
// A utilidade é uma estatística único e rolava: queremos manter apenas um recorte recente
// (média de latência por modalidade nos últimos N), então a tabela é capada via pruning
// (DELETE em cada escrita mantém apenas os N mais recentes por modalidade).
export const drawAvailabilityTable = pgTable(
  "draw_availability",
  {
    id: serial("id").primaryKey(),
    modalidade: text("modalidade").notNull(),
    concurso: integer("concurso").notNull(),
    // Data/hora do sorteio (dataApuracao da Caixa não carrega hora; combinamos com o
    // horário agendado do sorteio daquela modalidade — veja getDrawDateTime em lottery-sync).
    drawTime: timestamp("draw_time").notNull(),
    // Instante (UTC) em que o resultado apareceu pela primeira vez no nosso poll.
    observedAt: timestamp("observed_at").notNull(),
    // Latência = observedAt - drawTime, em minutos. Fonte: descoberta (rolava) do próprio dado.
    latencyMinutes: integer("latency_minutes").notNull(),
  },
  (t) => [
    // Só registra a PRIMEIRA constatação por (modalidade, concurso). O conflict do insert
    // usa esta chave única para não duplicar/sobrescrever observações posteriores.
    unique("draw_availability_modalidade_concurso").on(t.modalidade, t.concurso),
  ],
);

export type DrawAvailability = typeof drawAvailabilityTable.$inferSelect;
export type InsertDrawAvailability = typeof drawAvailabilityTable.$inferInsert;