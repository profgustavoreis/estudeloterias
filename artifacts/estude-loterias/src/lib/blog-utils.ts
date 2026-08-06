export interface ModalityMeta {
  id: string;
  label: string;
  badgeClass: string;
  bgGradient: string;
  accentColor: string;
}

export const MODALIDADE_CONFIG: Record<string, ModalityMeta> = {
  "mega-sena": {
    id: "mega-sena",
    label: "Mega-Sena",
    badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20",
    bgGradient: "from-emerald-600 to-teal-700",
    accentColor: "#009640",
  },
  lotofacil: {
    id: "lotofacil",
    label: "Lotofácil",
    badgeClass: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20 hover:bg-purple-500/20",
    bgGradient: "from-purple-600 to-pink-700",
    accentColor: "#930089",
  },
  quina: {
    id: "quina",
    label: "Quina",
    badgeClass: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20 hover:bg-blue-500/20",
    bgGradient: "from-blue-600 to-indigo-700",
    accentColor: "#260085",
  },
  lotomania: {
    id: "lotomania",
    label: "Lotomania",
    badgeClass: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20 hover:bg-orange-500/20",
    bgGradient: "from-orange-500 to-amber-600",
    accentColor: "#f78b00",
  },
  timemania: {
    id: "timemania",
    label: "Timemania",
    badgeClass: "bg-lime-500/10 text-lime-700 dark:text-lime-400 border-lime-500/20 hover:bg-lime-500/20",
    bgGradient: "from-lime-600 to-emerald-700",
    accentColor: "#00a859",
  },
  diadesorte: {
    id: "diadesorte",
    label: "Dia de Sorte",
    badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20",
    bgGradient: "from-amber-500 to-yellow-600",
    accentColor: "#cb8523",
  },
  duplasena: {
    id: "duplasena",
    label: "Dupla Sena",
    badgeClass: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20 hover:bg-red-500/20",
    bgGradient: "from-red-600 to-rose-700",
    accentColor: "#a61324",
  },
  maismilionaria: {
    id: "maismilionaria",
    label: "+Milionária",
    badgeClass: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20",
    bgGradient: "from-indigo-600 to-blue-800",
    accentColor: "#1a3b8b",
  },
  "super-sete": {
    id: "super-sete",
    label: "Super Sete",
    badgeClass: "bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/20 hover:bg-teal-500/20",
    bgGradient: "from-teal-600 to-cyan-700",
    accentColor: "#a2c638",
  },
  geral: {
    id: "geral",
    label: "Geral",
    badgeClass: "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20 hover:bg-slate-500/20",
    bgGradient: "from-slate-700 to-slate-900",
    accentColor: "#64748b",
  },
};

export function getModalityConfig(modalityKey?: string | null): ModalityMeta {
  if (!modalityKey) return MODALIDADE_CONFIG.geral;
  const key = modalityKey.toLowerCase().trim();
  return MODALIDADE_CONFIG[key] || MODALIDADE_CONFIG.geral;
}

export function formatArticleDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/**
 * Detecta se um artigo é "time-sensitive" (noticioso / sobre concurso ou prêmio)
 * para escolher entre schema.org BlogPosting e NewsArticle.
 * Mantido em sintonia com a heurística do api-server (middlewares/seo-head-injection).
 */
export function isTimeSensitiveArticle(artigo: {
  slug?: string;
  title?: string;
  tags?: string[];
}): boolean {
  const slug = artigo.slug?.toLowerCase() ?? "";
  const title = artigo.title?.toLowerCase() ?? "";
  const tags = (artigo.tags ?? []).join(" ").toLowerCase();
  const haystack = `${slug} ${title} ${tags}`;

  if (/^[a-z-]{3,}?-(\d{2,4})(-|$)/.test(slug)) {
    return true;
  }

  const newsMarkers = [
    "premio de r$",
    "premio acumulado",
    "premio estimado",
    "vence hoje",
    "hoje",
    "resultado do concurso",
    "aguardando sorteio",
    "sorteio",
    "ultima",
    "noticia",
    "acumulou",
    "acontecimento",
    "saiu o resultado",
  ];
  return newsMarkers.some((m) => haystack.includes(m));
}
