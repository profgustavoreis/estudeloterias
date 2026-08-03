import { Router } from "express";
import { db, articlesTable } from "@workspace/db";
import { eq, and, or, ilike, sql, count, desc } from "drizzle-orm";

const router = Router();

// GET /blog/posts
router.get("/blog/posts", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string, 10) || 10));
    const modalidade = (req.query.modalidade as string) || null;
    const tag = (req.query.tag as string) || null;
    const q = (req.query.q as string) || null;

    const conditions = [eq(articlesTable.status, "published")];

    if (modalidade) {
      conditions.push(eq(articlesTable.modalidade, modalidade));
    }

    if (tag) {
      conditions.push(sql`jsonb_exists(${articlesTable.tags}, ${tag})`);
    }

    if (q) {
      const searchPattern = `%${q}%`;
      const searchCondition = or(
        ilike(articlesTable.title, searchPattern),
        ilike(articlesTable.excerpt, searchPattern),
        ilike(articlesTable.content, searchPattern)
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    const whereClause = and(...conditions);

    const [{ totalCount }] = await db
      .select({ totalCount: count() })
      .from(articlesTable)
      .where(whereClause);

    const total = Number(totalCount);
    const totalPaginas = Math.ceil(total / limit) || 1;
    const offset = (page - 1) * limit;

    const resultados = await db
      .select()
      .from(articlesTable)
      .where(whereClause)
      .orderBy(desc(articlesTable.publishedAt), desc(articlesTable.createdAt))
      .limit(limit)
      .offset(offset);

    res.json({
      total,
      pagina: page,
      limite: limit,
      totalPaginas,
      resultados,
    });
  } catch (error) {
    console.error("Error fetching public blog posts:", error);
    res.status(500).json({ error: "Erro ao buscar artigos do blog" });
  }
});

// GET /blog/posts/:slug
router.get("/blog/posts/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    const [artigo] = await db
      .select()
      .from(articlesTable)
      .where(
        and(
          eq(articlesTable.slug, slug),
          eq(articlesTable.status, "published")
        )
      )
      .limit(1);

    if (!artigo) {
      res.status(404).json({ error: "Artigo não encontrado" });
      return;
    }

    res.json(artigo);
  } catch (error) {
    console.error("Error fetching blog post by slug:", error);
    res.status(500).json({ error: "Erro ao buscar artigo do blog" });
  }
});

export default router;
