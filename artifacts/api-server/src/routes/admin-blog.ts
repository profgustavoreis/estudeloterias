import { Router } from "express";
import { db, articlesTable } from "@workspace/db";
import { eq, and, or, ilike, count, desc } from "drizzle-orm";
import { adminAuthMiddleware } from "../middlewares/admin-auth";
import { generateArticleWithAi, slugify } from "../services/ai-writer";

const router = Router();

// Aplica autenticação admin para todas as rotas do admin-blog
router.use(adminAuthMiddleware);

function calculateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

// GET /admin/blog/posts
router.get("/admin/blog/posts", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string, 10) || 20));
    const status = (req.query.status as string) || null;
    const q = (req.query.q as string) || null;

    const conditions = [];

    if (status) {
      conditions.push(eq(articlesTable.status, status));
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

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

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
      .orderBy(desc(articlesTable.updatedAt), desc(articlesTable.createdAt))
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
    console.error("Error fetching admin blog posts:", error);
    res.status(500).json({ error: "Erro ao buscar artigos (admin)" });
  }
});

// GET /admin/blog/posts/:id
router.get("/admin/blog/posts/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "ID inválido" });
      return;
    }

    const [artigo] = await db
      .select()
      .from(articlesTable)
      .where(eq(articlesTable.id, id))
      .limit(1);

    if (!artigo) {
      res.status(404).json({ error: "Artigo não encontrado" });
      return;
    }

    res.json(artigo);
  } catch (error) {
    console.error("Error fetching admin blog post by ID:", error);
    res.status(500).json({ error: "Erro ao buscar artigo por ID" });
  }
});

// POST /admin/blog/posts
router.post("/admin/blog/posts", async (req, res) => {
  try {
    const {
      title,
      slug,
      excerpt,
      content,
      coverImageUrl,
      status = "draft",
      modalidade,
      tags = [],
      author = "Equipe Estude Loterias",
      authorDescription = "Especialista em Loterias e Estatística",
      seoTitle,
      seoDescription,
    } = req.body || {};

    if (!title || !excerpt || !content) {
      res.status(400).json({ error: "Título, resumo e conteúdo são obrigatórios" });
      return;
    }

    const finalSlug = slug ? slugify(slug) : slugify(title);
    const readingTimeMinutes = calculateReadingTime(content);
    const publishedAt = status === "published" ? new Date() : null;

    const [inserted] = await db
      .insert(articlesTable)
      .values({
        title,
        slug: finalSlug,
        excerpt,
        content,
        coverImageUrl: coverImageUrl || null,
        status,
        modalidade: modalidade || null,
        tags: Array.isArray(tags) ? tags : [],
        author,
        authorDescription,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        readingTimeMinutes,
        publishedAt,
      })
      .returning();

    res.status(201).json(inserted);
  } catch (error) {
    console.error("Error creating blog post:", error);
    res.status(500).json({ error: "Erro ao criar artigo" });
  }
});

// PUT /admin/blog/posts/:id
router.put("/admin/blog/posts/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "ID inválido" });
      return;
    }

    const [existing] = await db
      .select()
      .from(articlesTable)
      .where(eq(articlesTable.id, id))
      .limit(1);

    if (!existing) {
      res.status(404).json({ error: "Artigo não encontrado" });
      return;
    }

    const {
      title,
      slug,
      excerpt,
      content,
      coverImageUrl,
      status,
      modalidade,
      tags,
      author,
      authorDescription,
      seoTitle,
      seoDescription,
    } = req.body || {};

    const newContent = content !== undefined ? content : existing.content;
    const readingTimeMinutes = calculateReadingTime(newContent);

    const newStatus = status !== undefined ? status : existing.status;
    let publishedAt = existing.publishedAt;

    if (newStatus === "published" && !publishedAt) {
      publishedAt = new Date();
    }

    const [updated] = await db
      .update(articlesTable)
      .set({
        title: title !== undefined ? title : existing.title,
        slug: slug !== undefined ? (slug ? slugify(slug) : slugify(title || existing.title)) : existing.slug,
        excerpt: excerpt !== undefined ? excerpt : existing.excerpt,
        content: newContent,
        coverImageUrl: coverImageUrl !== undefined ? coverImageUrl : existing.coverImageUrl,
        status: newStatus,
        modalidade: modalidade !== undefined ? modalidade : existing.modalidade,
        tags: tags !== undefined ? (Array.isArray(tags) ? tags : []) : existing.tags,
        author: author !== undefined ? author : existing.author,
        authorDescription: authorDescription !== undefined ? authorDescription : existing.authorDescription,
        seoTitle: seoTitle !== undefined ? seoTitle : existing.seoTitle,
        seoDescription: seoDescription !== undefined ? seoDescription : existing.seoDescription,
        readingTimeMinutes,
        publishedAt,
        updatedAt: new Date(),
      })
      .where(eq(articlesTable.id, id))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error("Error updating blog post:", error);
    res.status(500).json({ error: "Erro ao atualizar artigo" });
  }
});

// DELETE /admin/blog/posts/:id
router.delete("/admin/blog/posts/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "ID inválido" });
      return;
    }

    const [existing] = await db
      .select()
      .from(articlesTable)
      .where(eq(articlesTable.id, id))
      .limit(1);

    if (!existing) {
      res.status(404).json({ error: "Artigo não encontrado" });
      return;
    }

    await db.delete(articlesTable).where(eq(articlesTable.id, id));

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting blog post:", error);
    res.status(500).json({ error: "Erro ao remover artigo" });
  }
});

// POST /admin/blog/ai-generate
router.post("/admin/blog/ai-generate", async (req, res) => {
  try {
    const { pauta, modalidade, tom, tamanho } = req.body || {};

    if (!pauta) {
      res.status(400).json({ error: "A pauta é obrigatória para a geração via IA" });
      return;
    }

    const resultado = await generateArticleWithAi({
      pauta,
      modalidade,
      tom,
      tamanho,
    });

    res.json(resultado);
  } catch (error) {
    console.error("Error generating blog post with AI:", error);
    res.status(500).json({ error: "Erro na geração do artigo por IA" });
  }
});

export default router;
