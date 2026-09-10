import { buildSpecialEditionSeo } from "./seo";
import type { SpecialEditionFacts } from "./types";

const DEFAULT_SITE_URL = "https://estudeloterias.com.br";
const SITE_NAME = "Estude Loterias";

/** Nomes legíveis dos hubs de modalidade usados no breadcrumb. */
const HUB_NAMES: Record<string, string> = {
  "mega-sena": "Mega-Sena",
  lotofacil: "Lotofácil",
  quina: "Quina",
  lotomania: "Lotomania",
  timemania: "Timemania",
  diadesorte: "Dia de Sorte",
  duplasena: "Dupla Sena",
  maismilionaria: "+Milionária",
  "super-sete": "Super Sete",
};

export interface SpecialEditionJsonLdOptions {
  /**
   * Data de referência da página (America/Sao_Paulo), usada como `dateModified`.
   * O chamador a fornece; a lib permanece livre de `Date.now()`.
   */
  hoje?: Date;
  /**
   * Sobrescreve o `dateModified` (ISO 8601 ou `yyyy-mm-dd`). Quando `hoje` também
   * é informado, o resultado nunca ultrapassa essa data (sem datas futuras).
   */
  dateModified?: string;
}

function siteOrigin(canonicalUrl: string): string {
  const m = /^(https?:\/\/[^/]+)/i.exec(canonicalUrl);
  return m ? m[1] : DEFAULT_SITE_URL;
}

function toAbsolute(canonicalUrl: string): string {
  if (/^https?:\/\//i.test(canonicalUrl)) return canonicalUrl;
  const prefixo = canonicalUrl.startsWith("/") ? "" : "/";
  return `${DEFAULT_SITE_URL}${prefixo}${canonicalUrl}`;
}

function brToIso(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  if (!m) return undefined;
  return `${m[3]}-${m[2]}-${m[1]}`;
}

/** `Date` (componentes locais) → `yyyy-mm-dd`. */
function toIsoDay(value: Date): string | undefined {
  if (Number.isNaN(value.getTime())) return undefined;
  const yyyy = value.getFullYear();
  const mm = String(value.getMonth() + 1).padStart(2, "0");
  const dd = String(value.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/** Normaliza um ISO 8601 (com hora) para `yyyy-mm-dd`. */
function isoSemHora(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const m = /^(\d{4}-\d{2}-\d{2})/.exec(value.trim());
  return m ? m[1] : undefined;
}

function humanize(slug: string): string {
  return slug
    .split("-")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

/**
 * Constrói um único objeto JSON-LD (`@graph`) com `Organization`, `WebSite`,
 * `WebPage` e `BreadcrumbList`. Não inclui `FAQPage` — não há FAQ visível.
 */
export function buildSpecialEditionJsonLd(
  facts: SpecialEditionFacts,
  canonicalUrl: string,
  opcoes?: SpecialEditionJsonLdOptions,
): object {
  const url = toAbsolute(canonicalUrl);
  const site = siteOrigin(url);
  const seo = buildSpecialEditionSeo(facts);

  const modalidade = facts?.modalidade ?? "";
  const hubName =
    HUB_NAMES[modalidade] ?? (modalidade ? humanize(modalidade) : SITE_NAME);
  const hubUrl = `${site}/${modalidade}`;

  // `dateModified` de página dinâmica: a data atual do servidor (`hoje`) tem
  // precedência sobre a data da edição e o valor nunca avança para o futuro.
  const hojeIso = opcoes?.hoje ? toIsoDay(opcoes.hoje) : undefined;
  const derivado =
    brToIso(facts?.ultimaEdicao?.data) ?? brToIso(facts?.proximaEdicao?.data);

  let dateModified = opcoes?.dateModified
    ? isoSemHora(opcoes.dateModified)
    : undefined;
  dateModified = dateModified ?? hojeIso ?? derivado;
  if (dateModified && hojeIso && dateModified > hojeIso) {
    dateModified = hojeIso;
  }

  const webpage: Record<string, unknown> = {
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: seo.title,
    description: seo.description,
    isPartOf: { "@id": `${site}/#website` },
    inLanguage: "pt-BR",
    breadcrumb: { "@id": `${url}#breadcrumb` },
  };
  if (dateModified) webpage.dateModified = dateModified;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${site}/#organization`,
        name: SITE_NAME,
        url: site,
      },
      {
        "@type": "WebSite",
        "@id": `${site}/#website`,
        url: site,
        name: SITE_NAME,
        inLanguage: "pt-BR",
        publisher: { "@id": `${site}/#organization` },
      },
      webpage,
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Início", item: `${site}/` },
          { "@type": "ListItem", position: 2, name: hubName, item: hubUrl },
          {
            "@type": "ListItem",
            position: 3,
            name: facts?.nome ?? seo.title,
            item: url,
          },
        ],
      },
    ],
  };
}

/**
 * Serializa o JSON-LD com escape de `<` para evitar breakout de `</script>`
 * quando injetado inline em `<script type="application/ld+json">`.
 */
export function serializeSpecialEditionJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
