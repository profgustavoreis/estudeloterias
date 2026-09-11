import { useCallback, useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { CONSENT_OPEN_EVENT, MARKETING_CONSENT_ENABLED, readConsent, saveConsent } from "@/lib/consent";

/** Estilo base compartilhado: garante peso visual equivalente entre as ações. */
const actionButtonBase =
  "inline-flex min-h-10 flex-1 items-center justify-center rounded-md px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const acceptButtonClass = cn(actionButtonBase, "bg-[#009640] text-white hover:bg-[#008237]");
const rejectButtonClass = cn(actionButtonBase, "bg-foreground text-background hover:opacity-90");
const preferencesButtonClass =
  "inline-flex min-h-10 items-center justify-center rounded-md px-3 text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

interface CategoryRowProps {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

function CategoryRow({ id, title, description, checked, disabled, onCheckedChange }: CategoryRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-3">
      <div className="space-y-1">
        <label htmlFor={id} className={cn("block text-sm font-medium", !disabled && "cursor-pointer")}>
          {title}
        </label>
        <p id={`${id}-description`} className="text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      <Switch
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
        aria-describedby={`${id}-description`}
        className="mt-0.5 shrink-0"
      />
    </div>
  );
}

/**
 * Banner de consentimento (CMP próprio) + painel de preferências granular.
 *
 * Regras de conformidade aplicadas:
 * - Nada não-essencial roda antes da escolha (`analytics_storage`/`ad_*` negados por padrão).
 * - "Aceitar" e "Rejeitar" têm o mesmo peso visual; não há pré-marcação.
 * - A escolha é persistida e pode ser revista/revogada a qualquer momento.
 * - O banner é não-modal, não bloqueia a leitura e não reaparece sozinho após a decisão.
 */
export function CookieConsent() {
  const [bannerOpen, setBannerOpen] = useState<boolean>(() => readConsent() === null);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [analyticsDraft, setAnalyticsDraft] = useState(false);
  const [marketingDraft, setMarketingDraft] = useState(false);

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

  const openPreferences = useCallback(() => {
    const current = readConsent();
    setAnalyticsDraft(current?.analytics ?? false);
    // Categoria oculta enquanto a publicidade estiver desativada: nunca pré-marca.
    setMarketingDraft(MARKETING_CONSENT_ENABLED && (current?.marketing ?? false));
    setPrefsOpen(true);
  }, []);

  // Link "Preferências de cookies" (rodapé) reabre o painel.
  useEffect(() => {
    window.addEventListener(CONSENT_OPEN_EVENT, openPreferences);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, openPreferences);
  }, [openPreferences]);

  const commit = useCallback((analytics: boolean, marketing: boolean) => {
    saveConsent(analytics, marketing);
    setAnalyticsDraft(analytics);
    setMarketingDraft(marketing);
    setBannerOpen(false);
    setPrefsOpen(false);
  }, []);

  // "Aceitar todos" concede todas as categorias ATIVAS; com a publicidade
  // desativada, concede apenas análise. O `saveConsent` ainda reforça o
  // `marketing: false` como defesa em profundidade.
  const handleAcceptAll = useCallback(
    () => commit(true, MARKETING_CONSENT_ENABLED),
    [commit],
  );
  const handleRejectAll = useCallback(() => commit(false, false), [commit]);
  const handleSavePreferences = useCallback(
    () => commit(analyticsDraft, marketingDraft),
    [commit, analyticsDraft, marketingDraft],
  );

  return (
    <>
      {bannerOpen && (
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
              <p id="cookie-banner-description" className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                Usamos cookies para medir audiência e, futuramente, exibir anúncios. Você pode
                aceitar, rejeitar ou escolher por categoria.{" "}
                <a href="/privacidade" className="text-[#009640] underline-offset-4 hover:underline">
                  Saiba mais
                </a>
                .
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <button type="button" onClick={handleRejectAll} className={rejectButtonClass}>
                Rejeitar todos
              </button>
              <button type="button" onClick={openPreferences} className={preferencesButtonClass}>
                Preferências
              </button>
              <button type="button" onClick={handleAcceptAll} className={acceptButtonClass}>
                Aceitar todos
              </button>
            </div>
          </div>
        </div>
      )}

      <Dialog open={prefsOpen} onOpenChange={setPrefsOpen}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preferências de cookies</DialogTitle>
            <DialogDescription>
              Escolha quais categorias você autoriza. Você pode alterar ou revogar esta decisão
              a qualquer momento pelo link &ldquo;Preferências de cookies&rdquo; no rodapé.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <CategoryRow
              id="consent-essential"
              title="Essenciais"
              description="Necessários para o funcionamento do site e para guardar sua própria escolha de cookies. Sempre ativos."
              checked
              disabled
            />
            <CategoryRow
              id="consent-analytics"
              title="Análise e medição"
              description="Cookies de estatísticas de uso (Google Analytics) que ajudam a entender como o site é utilizado."
              checked={analyticsDraft}
              onCheckedChange={setAnalyticsDraft}
            />
            {MARKETING_CONSENT_ENABLED && (
              <CategoryRow
                id="consent-marketing"
                title="Publicidade"
                description="Cookies de anúncios e personalização (Google AdSense). Hoje estão desativados; esta preferência deixa o consentimento pronto para quando os anúncios entrarem em produção."
                checked={marketingDraft}
                onCheckedChange={setMarketingDraft}
              />
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <button type="button" onClick={handleRejectAll} className={cn(rejectButtonClass, "sm:flex-none")}>
              Rejeitar todos
            </button>
            <button type="button" onClick={handleSavePreferences} className={cn(acceptButtonClass, "sm:flex-none")}>
              Salvar preferências
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
