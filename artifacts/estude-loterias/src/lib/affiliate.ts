/**
 * Affiliate (monetização por afiliação) helpers.
 *
 * Fase 0: apenas "Clube Lotosport" está ativo. Net Sorte / Lotosport ficam
 * como placeholders (`null`) para a Fase 1, quando os links existirem.
 *
 * Regras:
 * - Todo link de saída deve usar `target="_blank"` + `rel="sponsored noopener noreferrer"`.
 * - Nunca posicionar links de afiliado dentro de <ins class="adsbygoogle">.
 * - Disclosure de parceria sempre antes do clique (CDC/CONAR).
 */

export type Afiliado = "clube_lotosport" | "net_sorte" | "lotosport";

/** URLs de convite/afiliado. `null` = ainda sem link (Fase 1). */
export const AFFILIATE_URLS: Record<Afiliado, string | null> = {
  clube_lotosport: "https://clubelotosport.com.br/convite/694f3c11405d9",
  net_sorte: null,
  lotosport: null,
};

/** Nome legível do parceiro, para copy/UI. */
export const AFFILIATE_NAMES: Record<Afiliado, string> = {
  clube_lotosport: "Clube Lotosport",
  net_sorte: "Net Sorte",
  lotosport: "Lotosport",
};

export interface BuildAffiliateUrlParams {
  afiliado: Afiliado;
  /** Onde o link aparece (ex.: `topnav_desktop`, `footer`, `lotofacil_independencia_inline`). */
  placement: string;
  /** Texto do CTA, usado no subid/UTM para A/B futuro (ex.: `Ver bolões`). */
  ctaLabel: string;
}

export interface AffiliateTrackParams {
  afiliado: Afiliado;
  placement: string;
  ctaLabel: string;
  /** URL final já montada. Se omitida, usa `AFFILIATE_URLS[afiliado]`. */
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
 * Retorna `null` quando o parceiro ainda não tem link (Fase 1).
 */
export function buildAffiliateUrl({
  afiliado,
  placement,
  ctaLabel,
}: BuildAffiliateUrlParams): string | null {
  const base = AFFILIATE_URLS[afiliado];
  if (!base) return null;

  const url = safeUrl(base);
  if (!url) return null;

  const aff = slugify(afiliado);
  const place = slugify(placement);
  const label = slugify(ctaLabel);

  const subid = `esl-${aff}-${place}-${label}-${yyyymmdd()}-${rand6()}`;

  url.searchParams.set(SUBID_PARAM, subid);
  url.searchParams.set("utm_source", "estudeloterias");
  url.searchParams.set("utm_medium", "affiliate");
  url.searchParams.set("utm_campaign", `esl-aff-${aff}`);
  url.searchParams.set("utm_content", `${place}-${label}`);

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

  const linkUrl = params.linkUrl ?? AFFILIATE_URLS[params.afiliado] ?? "";
  const page =
    params.page ?? (typeof window !== "undefined" ? window.location.pathname : "");
  const pageType = params.pageType ?? derivePageType(page);

  gtag("event", eventName, {
    afiliado: params.afiliado,
    placement: params.placement,
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
