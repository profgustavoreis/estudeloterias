import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const blogRedirectsTable = pgTable("blog_redirects", {
  fromSlug: text("from_slug").primaryKey(),
  toSlug: text("to_slug").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type BlogRedirect = typeof blogRedirectsTable.$inferSelect;
export type InsertBlogRedirect = typeof blogRedirectsTable.$inferInsert;
