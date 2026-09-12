import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, BadgeCheck } from "lucide-react";
import {
  AFFILIATE_NAMES,
  buildAffiliateUrl,
  trackAffiliateClick,
  trackAffiliateImpression,
  type Afiliado,
} from "@/lib/affiliate";
import { CONSENT_CHANGE_EVENT, readConsent } from "@/lib/consent";
import { cn } from "@/lib/utils";

/**
 * Barra fixa de afiliado (mobile-first), placement `sticky_bottom`.
 *
 * Regras de conformidade/UX aplicadas:
 * - Só aparece depois de o usuário rolar ~30% da página (nunca na entrada).
 * - Só aparece depois de uma decisão de consentimento salva (`readConsent()`);
 *   enquanto o CMP estiver aberto, a barra NÃO existe — os dois nunca se empilham.
 * - Dispensável ("Agora não"), lembrada na sessão; não reabre sozinha.
 * - Rotulada ("Parceiro"/"Publicidade") + disclosure + 18+.
 * - Mobile-first (`sm:hidden`): no desktop a conversão já é coberta pelo CTA do
 *   cabeçalho e pelos cards inline, então a barra fica restrita ao mobile para
 *   não sobrecarregar a tela com uma terceira superfície fixa.
 *
 * Identidade: TEAL = parceiro/publicidade. Mesma linguagem de banda do
 * `AffiliateCard`, proporcional: faixa teal sólida no topo (selo + dispensar) e
 * corpo neutro sobre `bg-card`. Contraste na banda (`#0f766e`): branco 5.47:1,
 * `text-white/90` 4.76:1 — AA. Sem gradiente/linha.
 */
const PLACEMENT = "sticky_bottom";
const AFILIADO: Afiliado = "clube_lotosport";
const CTA_LABEL = "Ver bolões";

/** Fração da rolagem total a partir da qual a barra pode aparecer. */
const SCROLL_THRESHOLD = 0.3;

const DISMISS_KEY = "el_aff_sticky_bottom_dismissed";
const IMPRESSION_KEY = "el_aff_sticky_bottom_impression";

const DISCLOSURE = "Link de parceria. Podemos receber comissão, sem custo para você.";
const RESPONSIBLE = "18+ · Jogue com responsabilidade";

function readSessionFlag(key: string): boolean {
  try {
    return sessionStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function writeSessionFlag(key: string): void {
  try {
    sessionStorage.setItem(key, "1");
  } catch {
    // sessionStorage indisponível (modo privado restrito): segue sem persistir.
  }
}

export function StickyAffiliateBar() {
  const barRef = useRef<HTMLDivElement>(null);

  const [dismissed, setDismissed] = useState<boolean>(() => readSessionFlag(DISMISS_KEY));
  const [hasConsentDecision, setHasConsentDecision] = useState<boolean>(
    () => readConsent() !== null,
  );
  const [scrolledEnough, setScrolledEnough] = useState(false);
  // Espelha o breakpoint `sm` do Tailwind: garante que o JS não rastreia/exibe em desktop.
  const [isMobile, setIsMobile] = useState<boolean>(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 639.98px)").matches,
  );

  const linkUrl = useMemo(
    () => buildAffiliateUrl({ afiliado: AFILIADO, placement: PLACEMENT, ctaLabel: CTA_LABEL }),
    [],
  );

  const trackParams = useMemo(
    () => ({ afiliado: AFILIADO, placement: PLACEMENT, ctaLabel: CTA_LABEL, linkUrl: linkUrl ?? undefined }),
    [linkUrl],
  );

  // Mantém o estado mobile em sincronia com o breakpoint (rotação/resize).
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639.98px)");
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Consentimento: reage à decisão salva (evento do CMP) e a mudanças em outras abas.
  useEffect(() => {
    const sync = () => setHasConsentDecision(readConsent() !== null);
    window.addEventListener(CONSENT_CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CONSENT_CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  // Aparece só depois de rolar uma fração relevante da página.
  useEffect(() => {    let ticking = false;

    const measure = () => {
      ticking = false;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
      setScrolledEnough(ratio >= SCROLL_THRESHOLD);
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const visible =
    isMobile && hasConsentDecision && !dismissed && scrolledEnough && linkUrl !== null;

  // Reserva espaço no fim da página para a barra não cobrir o rodapé.
  useEffect(() => {
    if (!visible) return;
    const apply = () => {
      const height = barRef.current?.offsetHeight ?? 0;
      document.body.style.paddingBottom = `${height}px`;
    };
    apply();
    window.addEventListener("resize", apply);
    return () => {
      window.removeEventListener("resize", apply);
      document.body.style.paddingBottom = "";
    };
  }, [visible]);

  // Impressão: no máximo 1x por sessão, quando a barra fica visível.
  useEffect(() => {
    if (!visible) return;
    if (readSessionFlag(IMPRESSION_KEY)) return;
    writeSessionFlag(IMPRESSION_KEY);
    trackAffiliateImpression(trackParams);
  }, [visible, trackParams]);

  const handleDismiss = useCallback(() => {
    writeSessionFlag(DISMISS_KEY);
    setDismissed(true);
  }, []);

  if (!visible) return null;

  return (
    <div
      ref={barRef}
      role="complementary"
      aria-label={`Conteúdo de parceiro — ${AFFILIATE_NAMES[AFILIADO]}`}
      data-affiliate={AFILIADO}
      data-affiliate-placement={PLACEMENT}
      className="fixed inset-x-0 bottom-0 z-40 sm:hidden animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="mx-auto max-w-2xl px-3 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
        <div className="relative overflow-hidden rounded-xl border border-affiliate-accent/30 bg-card shadow-lg">
          {/* Banda teal compacta: selo + dispensar */}
          <div className="flex min-h-11 items-center gap-2 bg-affiliate-cta px-4 py-1.5 text-white">
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-affiliate-cta shadow-sm">
              <BadgeCheck className="h-3 w-3" aria-hidden />
              Parceiro
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-widest text-white/90">
              Publicidade
            </span>
            <button
              type="button"
              onClick={handleDismiss}
              className={cn(
                "ml-auto inline-flex min-h-11 items-center rounded-md px-2 text-xs font-medium text-white/90",
                "underline-offset-4 transition-colors hover:text-white hover:underline",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-affiliate-cta",
              )}
            >
              Agora não
            </button>
          </div>

          {/* Corpo neutro sobre bg-card */}
          <div className="px-4 py-2">
            <div className="mt-0.5 flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold leading-tight text-affiliate-label">
                  {AFFILIATE_NAMES[AFILIADO]}
                </p>
                <p className="mt-0.5 text-[11px] leading-snug text-foreground/75">
                  Bolões com mais jogos, divididos em cotas acessíveis.
                </p>
              </div>
              <a
                href={linkUrl}
                target="_blank"
                rel="sponsored noopener noreferrer"
                onClick={() => trackAffiliateClick(trackParams)}
                className={cn(
                  "inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 rounded-lg",
                  "bg-affiliate-cta px-4 text-sm font-bold text-white shadow-md shadow-affiliate-accent/20 transition-all hover:bg-affiliate-cta-hover hover:shadow-lg hover:shadow-affiliate-accent/30",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-affiliate-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                )}
              >
                {CTA_LABEL}
                <ArrowUpRight aria-hidden className="h-4 w-4" />
                <span className="sr-only">(abre em nova aba)</span>
              </a>
            </div>

            <p className="mt-1.5 text-[10px] leading-snug text-foreground/60">
              {DISCLOSURE} <span className="whitespace-nowrap">{RESPONSIBLE}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
