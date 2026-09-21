/**
 * Fonte única do mapa slug de hub/URL <-> nome da modalidade no DB.
 *
 * Antes o mapa vivia no middleware de SEO (e o sitemap mantinha um `slug()`
 * próprio com os dois casos especiais). Centralizar evita que head SSR e
 * sitemap gerem URLs diferentes para a mesma modalidade.
 */
export interface ModalityConfig {
  slug: string;
  dbName: string;
  name: string;
  article: string;
  in: string;
}

export const MODALIDADES_CONFIG: Record<string, ModalityConfig> = {
  "mega-sena": {
    slug: "mega-sena",
    dbName: "megasena",
    name: "Mega-Sena",
    article: "da Mega-Sena",
    in: "na Mega-Sena",
  },
  "lotofacil": {
    slug: "lotofacil",
    dbName: "lotofacil",
    name: "Lotofácil",
    article: "da Lotofácil",
    in: "na Lotofácil",
  },
  "quina": {
    slug: "quina",
    dbName: "quina",
    name: "Quina",
    article: "da Quina",
    in: "na Quina",
  },
  "lotomania": {
    slug: "lotomania",
    dbName: "lotomania",
    name: "Lotomania",
    article: "da Lotomania",
    in: "na Lotomania",
  },
  "timemania": {
    slug: "timemania",
    dbName: "timemania",
    name: "Timemania",
    article: "da Timemania",
    in: "na Timemania",
  },
  "diadesorte": {
    slug: "diadesorte",
    dbName: "diadesorte",
    name: "Dia de Sorte",
    article: "do Dia de Sorte",
    in: "no Dia de Sorte",
  },
  "duplasena": {
    slug: "duplasena",
    dbName: "duplasena",
    name: "Dupla Sena",
    article: "da Dupla Sena",
    in: "na Dupla Sena",
  },
  "maismilionaria": {
    slug: "maismilionaria",
    dbName: "maismilionaria",
    name: "+Milionária",
    article: "da +Milionária",
    in: "na +Milionária",
  },
  "super-sete": {
    slug: "super-sete",
    dbName: "supersete",
    name: "Super Sete",
    article: "da Super Sete",
    in: "na Super Sete",
  },
};

/** Nomes das modalidades como gravados no DB, na ordem de exibição do site. */
export const MODALIDADES_DB_NAMES: readonly string[] = Object.values(
  MODALIDADES_CONFIG,
).map((m) => m.dbName);

const SLUG_BY_DB_NAME = new Map(
  Object.values(MODALIDADES_CONFIG).map((m) => [m.dbName, m.slug]),
);

/** Slug de hub/URL a partir do nome da modalidade no DB (fallback: o próprio nome). */
export function slugForDbName(dbName: string): string {
  return SLUG_BY_DB_NAME.get(dbName) ?? dbName;
}

/** Configuração da modalidade a partir do slug de hub/URL. */
export function getModalityBySlug(slug: string): ModalityConfig | undefined {
  return MODALIDADES_CONFIG[slug];
}
