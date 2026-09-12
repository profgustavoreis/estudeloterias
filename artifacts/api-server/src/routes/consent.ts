import { Router, type IRouter } from "express";
import { db, consentRecordsTable } from "@workspace/db";
import { logger } from "../lib/logger";

// POST /api/consent
//
// Registra de forma best-effort a decisão de consentimento feita no navegador
// (prova do art. 8º, §2º da LGPD). Sem auth: o payload só carrega o estado
// binário das finalidades, a versão do aviso e um id anônimo do navegador.
const router: IRouter = Router();

interface ConsentBody {
  version: number;
  analytics: boolean;
  marketing: boolean;
  clientId?: string;
}

// Validação manual no padrão do repo (evita adicionar dependência ao
// api-server, que não declara zod diretamente).
function parseConsentBody(value: unknown): ConsentBody | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const { version, analytics, marketing, clientId } = value as Record<string, unknown>;

  if (typeof version !== "number" || !Number.isInteger(version) || version <= 0) return null;
  if (typeof analytics !== "boolean") return null;
  if (typeof marketing !== "boolean") return null;
  if (clientId !== undefined && typeof clientId !== "string") return null;

  const parsed: ConsentBody = { version, analytics, marketing };
  const normalizedClientId = typeof clientId === "string" ? clientId.trim() : "";
  if (normalizedClientId !== "") {
    if (normalizedClientId.length > 128) return null;
    parsed.clientId = normalizedClientId;
  }

  return parsed;
}

router.post("/consent", async (req, res) => {
  const parsed = parseConsentBody(req.body);

  if (!parsed) {
    res.status(400).json({ error: "Corpo inválido." });
    return;
  }

  try {
    await db.insert(consentRecordsTable).values(parsed);
  } catch (err) {
    // Best-effort: uma falha de banco (ex.: tabela ausente em produção) nunca
    // vira erro visível. Logue para diagnóstico e responda 204 de todo modo.
    logger.error({ err }, "Falha ao registrar consentimento");
  }

  res.status(204).end();
});

export default router;
