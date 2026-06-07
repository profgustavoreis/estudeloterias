import { pgTable, text, jsonb, timestamp, serial } from "drizzle-orm/pg-core";

export const apiCacheTable = pgTable("api_cache", {
  id: serial("id").primaryKey(),
  cacheKey: text("cache_key").notNull().unique(),
  data: jsonb("data").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ApiCache = typeof apiCacheTable.$inferSelect;
export type InsertApiCache = typeof apiCacheTable.$inferInsert;
