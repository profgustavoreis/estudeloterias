import type { Request, Response, NextFunction } from "express";

export function adminAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const adminApiKey = process.env.ADMIN_API_KEY || "estude-admin-key-dev";
  const providedKey = req.headers["x-admin-key"];

  if (!providedKey || providedKey !== adminApiKey) {
    res.status(401).json({
      error: "Não autorizado: Chave administrativa inválida ou ausente",
    });
    return;
  }

  next();
}
