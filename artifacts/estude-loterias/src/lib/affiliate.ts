/**
 * Affiliate (monetização por afiliação) helpers.
 *
 * Fase 1-A: Clube Lotosport (bolões) e Portal Net Sorte (ferramentas) ativos.
 * Lotosport permanece configurado, mas ainda NÃO é renderizado (A/B futuro).
 *
 * Cada parceiro pode ter mais de uma variante de link:
 * - `landing`  → página de captura / tráfego frio.
 * - `checkout` → checkout direto / tráfego quente.
 * - `anual` / `vitalicio` → planos do Lotosport (só checkout).
 *
 * Regras:
 * - Todo link de saída deve usar `target="_blank"` + `rel="sponsored noopener noreferrer"`.
 * - Nunca posicionar links de afiliado dentro de <ins class="adsbygoogle">.
 * - Disclosure de parceria sempre antes do clique (CDC/CONAR).
 */

export type Afiliado = "clube_lotosport" | "net_sorte" | "lotosport";

/** Variantes de link disponíveis por parceiro. */
export type AffiliateVariant = "landing" | "checkout" | "anual" | "vitalicio";

/** URLs de afiliado por parceiro e variante. Variante ausente = indisponível. */
export const AFFILIATE_URLS: Record<Afiliado, Partial<Record<AffiliateVariant, string>>> = {
  clube_lotosport: {
    landing: "https://clubelotosport.com.br/convite/694f3c11405d9",
  },
  net_sorte: {
    // Tráfego frio → landing; tráfego quente → checkout.
    landing: "https://edzz.la/R3QX6?a=56195291",
    checkout: "https://chk.eduzz.com/305064?a=56195291",
  },
  // Lotosport só tem checkout (anual e vitalício). Configurado, não renderizado.
  lotosport: {
    anual: "https://chk.eduzz.com/2074024?a=56195291",
    vitalicio: "https://chk.eduzz.com/2075097?a=56195291",
  },
};

/** Variante usada quando nenhuma é informada (ex.: Net Sorte em tráfego frio). */
export const DEFAULT_AFFILIATE_VARIANT: Record<Afiliado, AffiliateVariant> = {
  clube_lotosport: "landing",
  net_sorte: "landing",
  lotosport: "anual",
};

/** Nome legível do parceiro, para copy/UI. */
export const AFFILIATE_NAMES: Record<Afiliado, string> = {
  clube_lotosport: "Clube Lotosport",
  net_sorte: "Portal Net Sorte",
  lotosport: "Lotosport",
};

/** Resolve a URL base de um parceiro (sem params de rastreio). */
export function getAffiliateBaseUrl(
  afiliado: Afiliado,
  variant?: AffiliateVariant,
): string | null {
  const links = AFFILIATE_URLS[afiliado];
  return links[variant ?? DEFAULT_AFFILIATE_VARIANT[afiliado]] ?? null;
}

export interface BuildAffiliateUrlParams {
  afiliado: Afiliado;
  /** Onde o link aparece (ex.: `topnav_desktop`, `footer`, `lotofacil_independencia_inline`). */
  placement: string;
  /** Texto do CTA, usado no subid/UTM para A/B futuro (ex.: `Ver bolões`). */
  ctaLabel: string;
  /**
   * Variante do link. Padrão: `DEFAULT_AFFILIATE_VARIANT[afiliado]`
   * (Net Sorte = `landing`, para tráfego frio).
   */
  variant?: AffiliateVariant;
}

export interface AffiliateTrackParams {
  afiliado: Afiliado;
  placement: string;
  ctaLabel: string;
  /** Variante do link usada (landing/checkout/anual/vitalício). */
  variant?: AffiliateVariant;
  /** URL final já montada. Se omitida, usa a URL base do parceiro. */
  linkUrl?: string;
  /** Permite forçar o subid; por padrão é lido da query da `linkUrl`. */
  subid?: string;
  /** Identificador do módulo/bloco na página. Padrão: o próprio placement. */
  moduleId?: string;
  /** Sobrescreve a página (pathname) capturada de `window`. */
  page?: string;
  /** Sobrescreve o tipo de página inferido (ex.: `home`, `modalidade`, `blog`). */
  pageType?: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const SUBID_PARAM = "subid";

/** Converte qualquer texto para `[a-z0-9-]`, sem acentos e sem hífens duplicados. */
function slugify(value: string): string {
  const slug = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return slug || "x";
}

/** Data local no formato AAAAMMDD. */
function yyyymmdd(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

/** 6 caracteres alfanuméricos aleatórios (URL-safe). */
function rand6(): string {
  return Math.random()
    .toString(36)
    .slice(2, 8)
    .padEnd(6, "0")
    .slice(0, 6);
}

function safeUrl(linkUrl: string): URL | null {
  try {
    return new URL(linkUrl);
  } catch {
    return null;
  }
}

function getLinkDomain(linkUrl: string): string {
  const url = safeUrl(linkUrl);
  return url ? url.hostname.replace(/^www\./, "") : "";
}

function getSubidFromUrl(linkUrl: string): string {
  const url = safeUrl(linkUrl);
  return url ? url.searchParams.get(SUBID_PARAM) ?? "" : "";
}

function derivePageType(pathname: string): string {
  const segment = pathname.split("/").filter(Boolean)[0];
  if (!segment) return "home";
  return segment;
}

// ── URL builder ──────────────────────────────────────────────────────────────

/**
 * Monta a URL de afiliado com rastreio:
 * - `subid` = `esl-{aff}-{placement}-{label}-{yyyymmdd}-{rand6}` (URL-safe `[a-z0-9-]`)
 * - `utm_source=estudeloterias`
 * - `utm_medium=affiliate`
 * - `utm_campaign=esl-aff-{aff}`
 * - `utm_content={placement}-{label}`
 *
 * Retorna `null` quando o parceiro/variante ainda não tem link.
 */
export function buildAffiliateUrl({
  afiliado,
  placement,
  ctaLabel,
  variant,
}: BuildAffiliateUrlParams): string | null {
  const base = getAffiliateBaseUrl(afiliado, variant);
  if (!base) return null;

  const url = safeUrl(base);
  if (!url) return null;

  const aff = slugify(afiliado);
  const place = slugify(placement);
  const label = slugify(ctaLabel);
  const variantSlug = slugify(variant ?? DEFAULT_AFFILIATE_VARIANT[afiliado]);

  const subid = `esl-${aff}-${place}-${label}-${variantSlug}-${yyyymmdd()}-${rand6()}`;

  url.searchParams.set(SUBID_PARAM, subid);
  url.searchParams.set("utm_source", "estudeloterias");
  url.searchParams.set("utm_medium", "affiliate");
  url.searchParams.set("utm_campaign", `esl-aff-${aff}`);
  url.searchParams.set("utm_content", `${place}-${label}`);
  url.searchParams.set("utm_term", variantSlug);

  return url.toString();
}

// ── Tracking ─────────────────────────────────────────────────────────────────

type Gtag = (...args: unknown[]) => void;

/** Acessa `window.gtag` de forma segura (definido pelo script do GA em index.html). */
function getGtag(): Gtag | undefined {
  if (typeof window === "undefined") return undefined;
  const gtag = (window as Window & { gtag?: Gtag }).gtag;
  return typeof gtag === "function" ? gtag : undefined;
}

function fireAffiliateEvent(
  eventName: "affiliate_click" | "affiliate_impression",
  params: AffiliateTrackParams,
  extra?: Record<string, unknown>,
): void {
  const gtag = getGtag();
  if (!gtag) return;

  const linkUrl =
    params.linkUrl ?? getAffiliateBaseUrl(params.afiliado, params.variant) ?? "";
  const page =
    params.page ?? (typeof window !== "undefined" ? window.location.pathname : "");
  const pageType = params.pageType ?? derivePageType(page);

  gtag("event", eventName, {
    afiliado: params.afiliado,
    placement: params.placement,
    variante: params.variant ?? DEFAULT_AFFILIATE_VARIANT[params.afiliado],
    cta_label: params.ctaLabel,
    pagina: page,
    pagina_tipo: pageType,
    module_id: params.moduleId ?? params.placement,
    link_url: linkUrl,
    link_domain: getLinkDomain(linkUrl),
    subid: params.subid ?? getSubidFromUrl(linkUrl),
    outbound: true,
    ...extra,
  });
}

/** Dispara `affiliate_click` (usa `transport_type: 'beacon'` para não perder o evento no unload). */
export function trackAffiliateClick(params: AffiliateTrackParams): void {
  fireAffiliateEvent("affiliate_click", params, { transport_type: "beacon" });
}

/** Dispara `affiliate_impression` quando o card entra no viewport. */
export function trackAffiliateImpression(params: AffiliateTrackParams): void {
  fireAffiliateEvent("affiliate_impression", params);
}

/** Extrai o `subid` de uma URL montada por `buildAffiliateUrl` (útil para debug/testes). */
export function getAffiliateSubid(linkUrl: string): string {
  return getSubidFromUrl(linkUrl);
}
