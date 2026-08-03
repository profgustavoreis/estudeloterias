import { pgTable, text, integer, timestamp, serial, jsonb } from "drizzle-orm/pg-core";

export const articlesTable = pgTable("articles", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  coverImageUrl: text("cover_image_url"),
  status: text("status").notNull().default("draft"), // 'draft' | 'published'
  modalidade: text("modalidade"),
  tags: jsonb("tags").$type<string[]>().default([]).notNull(),
  author: text("author").notNull().default("Equipe Estude Loterias"),
  authorDescription: text("author_description").default("Especialista em Loterias e Estatística"),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  readingTimeMinutes: integer("reading_time_minutes").notNull().default(3),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Article = typeof articlesTable.$inferSelect;
export type InsertArticle = typeof articlesTable.$inferInsert;
