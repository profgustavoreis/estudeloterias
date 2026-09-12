import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  CONSENT_OPEN_EVENT,
  MARKETING_CONSENT_ENABLED,
  readConsent,
  saveConsent,
} from "@/lib/consent";

/** Estilo base compartilhado: garante peso visual equivalente entre as ações. */
const actionButtonBase =
  "inline-flex min-h-10 flex-1 items-center justify-center rounded-md px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const acceptButtonClass = cn(actionButtonBase, "bg-[#009640] text-white hover:bg-[#008237]");
const rejectButtonClass = cn(actionButtonBase, "bg-foreground text-background hover:opacity-90");

/**
 * Banner de consentimento (CMP próprio) — decisão **binária** (aceitar/rejeitar).
 *
 * Enquanto há uma **única finalidade não-essencial ativa** (análise), o
 * consentimento "tudo ou nada" é adequado e específico, e o painel de
 * preferências por categoria virava fricção sem propósito. A **granularidade
 * deve voltar** quando uma segunda finalidade (publicidade) for habilitada
 * (`MARKETING_CONSENT_ENABLED = true`) — aí "aceitar tudo" único deixaria de ser
 * específico.
 *
 * Regras de conformidade aplicadas:
 * - Nada não-essencial roda antes da escolha (`analytics_storage`/`ad_*` negados por padrão).
 * - "Aceitar" e "Rejeitar" têm o mesmo peso visual; não há pré-marcação.
 * - A escolha é persistida e pode ser revista/revogada a qualquer momento pelo
 *   link "Cookies" no rodapé, que reabre este banner.
 * - O banner é não-modal, não bloqueia a leitura e não reaparece sozinho após a decisão.
 */
export function CookieConsent() {
  const [bannerOpen, setBannerOpen] = useState<boolean>(() => readConsent() === null);
  const bannerRef = useRef<HTMLDivElement | null>(null);

  // Impede que o banner cubra o fim do conteúdo enquanto estiver visível.
  useEffect(() => {
    if (!bannerOpen) return;
    const applyPadding = () => {
      const height = bannerRef.current?.offsetHeight ?? 0;
      document.body.style.paddingBottom = `${height}px`;
    };
    applyPadding();
    window.addEventListener("resize", applyPadding);
    return () => {
      window.removeEventListener("resize", applyPadding);
      document.body.style.paddingBottom = "";
    };
  }, [bannerOpen]);

  // Link "Cookies" (rodapé) reabre o banner para revisar/revogar a decisão.
  useEffect(() => {
    const reopen = () => setBannerOpen(true);
    window.addEventListener(CONSENT_OPEN_EVENT, reopen);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, reopen);
  }, []);

  const commit = useCallback((analytics: boolean, marketing: boolean) => {
    saveConsent(analytics, marketing);
    setBannerOpen(false);
  }, []);

  // "Aceitar" concede as categorias ATIVAS; com a publicidade desativada,
  // concede apenas análise. O `saveConsent` reforça `marketing: false`.
  const handleAccept = useCallback(() => commit(true, MARKETING_CONSENT_ENABLED), [commit]);
  const handleReject = useCallback(() => commit(false, false), [commit]);

  if (!bannerOpen) return null;

  return (
    <div
      ref={bannerRef}
      role="region"
      aria-labelledby="cookie-banner-title"
      aria-describedby="cookie-banner-description"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 shadow-[0_-6px_24px_rgba(0,0,0,0.08)] backdrop-blur supports-[backdrop-filter]:bg-background/90"
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6">
        <div className="space-y-1">
          <p id="cookie-banner-title" className="text-sm font-semibold text-foreground">
            Sua privacidade
          </p>
          <p
            id="cookie-banner-description"
            className="text-xs leading-relaxed text-muted-foreground sm:text-sm"
          >
            Usamos cookies para medir audiência e melhorar o site. Não vendemos seus dados.{" "}
            <a href="/privacidade" className="text-[#009640] underline-offset-4 hover:underline">
              Saiba mais
            </a>
            .
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <button type="button" onClick={handleReject} className={rejectButtonClass}>
            Rejeitar
          </button>
          <button type="button" onClick={handleAccept} className={acceptButtonClass}>
            Aceitar
          </button>
        </div>
      </div>
    </div>
  );
}
