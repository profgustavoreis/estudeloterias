/**
 * Consentimento de cookies (LGPD/ANPD) + Google Consent Mode v2.
 *
 * Fonte única de verdade da escolha do usuário:
 * - Persistência em `localStorage` (chave/versão abaixo).
 * - Aplicação no `gtag('consent', 'update', ...)`.
 * - Eventos de janela para o CMP e para os trackers reagirem.
 *
 * O `index.html` lê a mesma chave/versão antes de configurar o GA4 (default
 * negado + restauração da escolha salva). Mantenha os valores em sincronia.
 */

export const CONSENT_STORAGE_KEY = "el_cookie_consent_v1";
export const CONSENT_VERSION = 1;

/**
 * Flag da finalidade de publicidade/marketing.
 *
 * Hoje o Google AdSense está desativado (`index.html`) e não há cookies de
 * publicidade em uso, então NÃO pedimos consentimento para essa finalidade
 * (categoria "Publicidade" oculta no CMP) e os sinais `ad_*` do Consent Mode
 * permanecem sempre negados. Mantemos o estado/sinais prontos para reativar:
 * basta virar este flag para `true` (e reativar o script do AdSense no
 * `index.html`) que a UI e o Consent Mode voltam a oferecer/aceitar marketing.
 */
export const MARKETING_CONSENT_ENABLED = false;

/** Disparado sempre que uma nova escolha é salva. Trackers escutam para (re)agir. */
export const CONSENT_CHANGE_EVENT = "el-consent-change";
/** Disparado para reabrir o painel do CMP (ex.: link no rodapé). */
export const CONSENT_OPEN_EVENT = "el-consent-open";

export type ConsentCategory = "analytics" | "marketing";

export interface ConsentState {
  /** Cookies de análise/medição (Google Analytics). */
  analytics: boolean;
  /** Cookies de publicidade/personalização (ex.: Google AdSense). */
  marketing: boolean;
  version: number;
  /** ISO timestamp da última decisão (auditoria/revogação). */
  updatedAt: string;
}

/** Estado padrão: tudo negado, nada é pré-marcado. */
export const DEFAULT_CONSENT: ConsentState = {
  analytics: false,
  marketing: false,
  version: CONSENT_VERSION,
  updatedAt: "",
};

type Gtag = (...args: unknown[]) => void;

function getGtag(): Gtag | undefined {
  if (typeof window === "undefined") return undefined;
  const gtag = (window as Window & { gtag?: Gtag }).gtag;
  return typeof gtag === "function" ? gtag : undefined;
}

function isConsentState(value: unknown): value is ConsentState {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.analytics === "boolean" &&
    typeof candidate.marketing === "boolean" &&
    typeof candidate.version === "number"
  );
}

/**
 * Lê a escolha salva. Retorna `null` quando o usuário ainda não decidiu
 * (ou quando a versão do consentimento mudou e é preciso perguntar de novo).
 */
export function readConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isConsentState(parsed) || parsed.version !== CONSENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Mapeia categorias do CMP para os sinais do Consent Mode v2. */
function toGtagSignals(state: Pick<ConsentState, "analytics" | "marketing">) {
  // Enquanto a publicidade estiver desativada, `ad_*` fica sempre negado,
  // independentemente do que houver persistido no estado.
  const marketingGranted = MARKETING_CONSENT_ENABLED && state.marketing;
  return {
    analytics_storage: state.analytics ? "granted" : "denied",
    ad_storage: marketingGranted ? "granted" : "denied",
    ad_user_data: marketingGranted ? "granted" : "denied",
    ad_personalization: marketingGranted ? "granted" : "denied",
  } as const;
}

/** Envia `gtag('consent', 'update', ...)`. Silencioso se o gtag não existir (adblock). */
export function applyConsentToGtag(state: Pick<ConsentState, "analytics" | "marketing">): void {
  const gtag = getGtag();
  if (!gtag) return;
  gtag("consent", "update", toGtagSignals(state));
}

function emitConsentChange(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CONSENT_CHANGE_EVENT));
  }
}

/**
 * Persiste a escolha, aplica no gtag e notifica os interessados.
 * Use sempre este helper (em vez de escrever no localStorage direto).
 */
export function saveConsent(analytics: boolean, marketing: boolean = false): ConsentState {
  // Com a publicidade desativada, nunca persistimos marketing: true.
  const effectiveMarketing = MARKETING_CONSENT_ENABLED ? marketing : false;
  const state: ConsentState = {
    analytics,
    marketing: effectiveMarketing,
    version: CONSENT_VERSION,
    updatedAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage indisponível (modo privado restrito): segue sem persistir a sessão
    }
  }

  applyConsentToGtag(state);
  emitConsentChange();
  return state;
}

/**
 * Helper de gating para os trackers. Sem escolha salva, retorna `false`
 * (nada não-essencial roda antes do consentimento).
 */
export function hasConsent(category: ConsentCategory = "analytics"): boolean {
  // Finalidade inexistente (publicidade desativada) nunca conta como consentida.
  if (category === "marketing" && !MARKETING_CONSENT_ENABLED) return false;
  const state = readConsent();
  if (!state) return false;
  return state[category];
}

/** Abre o painel de preferências do CMP montado na aplicação. */
export function openCookiePreferences(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CONSENT_OPEN_EVENT));
  }
}
