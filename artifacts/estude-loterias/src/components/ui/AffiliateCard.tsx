import { useEffect, useMemo, useRef } from "react";
import { useLocation } from "wouter";
import { BadgeCheck } from "lucide-react";
import {
  AFFILIATE_NAMES,
  buildAffiliateUrl,
  trackAffiliateClick,
  trackAffiliateImpression,
  type Afiliado,
  type AffiliateVariant,
} from "@/lib/affiliate";
import { cn } from "@/lib/utils";

export interface AffiliateCardProps {
  /** Parceiro. Padrão: Clube Lotosport. */
  afiliado?: Afiliado;
  /**
   * Variante do link. `landing` (tráfego frio) ou `checkout` (tráfego quente).
   * Padrão: `DEFAULT_AFFILIATE_VARIANT[afiliado]`.
   */
  variant?: AffiliateVariant;
  /** Identificador da posição na página (ex.: `lotofacil_independencia_inline`). */
  placement: string;
  /** Identificador do bloco enviado ao GA. Padrão: o próprio placement. */
  moduleId?: string;
  title: string;
  body: string;
  /** Ponto único de troca do rótulo do CTA (A/B futuro). */
  ctaLabel?: string;
  /**
   * Suprime a tinta/glow decorativo e mantém o card sólido (`bg-card`).
   * Usado como anti-colisão nas páginas da Dupla Sena (#a61324).
   * Padrão: detectado pela rota (`/duplasena`).
   */
  suppressTint?: boolean;
  className?: string;
}

const DEFAULT_CTA = "Ver bolões";
const DEFAULT_AFILIADO: Afiliado = "clube_lotosport";
const DISCLOSURE = "Link de parceria. Podemos receber comissão, sem custo para você.";
const RESPONSIBLE = "18+ · Jogue com responsabilidade";

/**
 * Card nativo de afiliado (substitui o AdUnit naquela posição).
 *
 * Identidade: VERMELHO = parceiro/publicidade (verde é a marca do site).
 * Tokens em `index.css` (`--affiliate-*`):
 *   accent   borda/filete/glow/ring (>=3:1 como UI; nunca atrás de texto normal)
 *   cta      fundo sólido do CTA (branco 5.74:1 — AA)
 *   cta-hover  hover do CTA (branco 6.47:1 — AA)
 *   label    texto do parceiro/selo (5.74:1 no claro; 10.2:1 no escuro)
 *   accent-top  tinta decorativa do topo, sem texto sobreposto
 *
 * Corpo em `text-foreground/75` (7.95:1 no claro) e disclosure/18+ em
 * `text-foreground/60` (4.69:1 no claro). Nada de `muted-foreground/80`.
 *
 * Nunca deve ser envolvido por `<ins class="adsbygoogle">`.
 */
export function AffiliateCard({
  afiliado = DEFAULT_AFILIADO,
  variant,
  placement,
  moduleId,
  title,
  body,
  ctaLabel = DEFAULT_CTA,
  suppressTint,
  className,
}: AffiliateCardProps) {
  const cardRef = useRef<HTMLElement>(null);
  const [location] = useLocation();

  // Anti-colisão: na Dupla Sena o vermelho de afiliado encosta no #a61324 da
  // loteria. Mantemos rótulo + ícone + contorno (acento claro), mas sem tinta.
  const plain = suppressTint ?? location.startsWith("/duplasena");

  // Subid/UTM gerados uma vez por montagem para manter impressão e clique coerentes.
  const linkUrl = useMemo(
    () => buildAffiliateUrl({ afiliado, placement, ctaLabel, variant }),
    [afiliado, placement, ctaLabel, variant],
  );

  const trackParams = useMemo(
    () => ({ afiliado, variant, placement, ctaLabel, linkUrl: linkUrl ?? undefined, moduleId }),
    [afiliado, variant, placement, ctaLabel, linkUrl, moduleId],
  );

  // Impressão: >=50% visível por >=1s, no máximo 1x por sessão.
  useEffect(() => {
    if (!linkUrl) return;
    const el = cardRef.current;
    if (!el) return;

    const storageKey = `el_aff_imp_${placement}_${moduleId ?? ""}`;
    try {
      if (sessionStorage.getItem(storageKey)) return;
    } catch {
      // sessionStorage indisponível (modo privado): segue sem deduplicar por sessão.
    }

    let timer: number | null = null;

    const markSeen = () => {
      try {
        sessionStorage.setItem(storageKey, "1");
      } catch {
        // ignora
      }
    };

    const fire = () => {
      markSeen();
      trackAffiliateImpression(trackParams);
    };

    if (typeof IntersectionObserver === "undefined") {
      // Fallback: dispara após 1,5s quando não há suporte a IntersectionObserver.
      timer = window.setTimeout(fire, 1500);
      return () => {
        if (timer !== null) window.clearTimeout(timer);
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            if (timer === null) {
              timer = window.setTimeout(() => {
                fire();
                observer.disconnect();
              }, 1000);
            }
          } else if (timer !== null) {
            window.clearTimeout(timer);
            timer = null;
          }
        }
      },
      { threshold: [0.5] },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (timer !== null) window.clearTimeout(timer);
    };
  }, [linkUrl, trackParams, placement, moduleId]);

  // Parceiro ainda sem link (Fase 1): não renderiza nada.
  if (!linkUrl) return null;

  const handleClick = () => {
    trackAffiliateClick(trackParams);
  };

  return (
    <aside
      ref={cardRef}
      aria-label={`Conteúdo de parceiro — ${AFFILIATE_NAMES[afiliado]}`}
      data-affiliate={afiliado}
      data-affiliate-placement={placement}
      data-affiliate-plain={plain ? "" : undefined}
      className={cn(
        // Superfície sólida (`bg-card`); destaque por filete + borda de acento.
        "group relative overflow-hidden rounded-xl border border-affiliate-accent/30 border-t-4 border-t-affiliate-accent bg-card text-card-foreground shadow-sm transition-all duration-300",
        !plain && "hover:border-affiliate-accent/50 hover:shadow-xl hover:shadow-affiliate-accent/15",
        "p-5 sm:p-6",
        className,
      )}
    >
      {!plain && (
        <>
          {/* Tinta decorativa no topo (ancorada à direita, onde não há texto) */}
          <div
            aria-hidden
            className="pointer-events-none absolute right-0 top-0 h-24 w-2/3 bg-gradient-to-l from-affiliate-accent-top to-transparent dark:hidden"
          />
          {/* Glow radial ambiente (decorativo, não intercepta cliques) */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-affiliate-accent/15 blur-2xl transition-colors duration-500 group-hover:bg-affiliate-accent/25 dark:bg-affiliate-accent/20"
          />
        </>
      )}

      <div className="relative z-10">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-affiliate-cta-hover to-affiliate-cta px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-sm">
            <BadgeCheck className="w-3 h-3" aria-hidden />
            Parceiro
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-foreground/60">
            Publicidade
          </span>
        </div>

        {/* Nome do parceiro visível (eyebrow acima do título) */}
        <p className="text-xs font-bold uppercase tracking-widest text-affiliate-label">
          {AFFILIATE_NAMES[afiliado]}
        </p>

        <h2 className="mt-1 text-lg sm:text-xl font-bold tracking-tight text-foreground leading-snug">
          {title}
        </h2>

        <p className="mt-2 text-sm text-foreground/75 leading-relaxed">{body}</p>

        <div className="mt-4">
          <a
            href={linkUrl}
            target="_blank"
            rel="sponsored noopener noreferrer"
            onClick={handleClick}
            className={cn(
              "inline-flex w-full sm:w-auto min-h-[44px] items-center justify-center gap-2",
              // Fundo sólido do token: branco passa em AA (5.74:1).
              "rounded-lg bg-affiliate-cta px-5 py-2.5 text-sm font-bold text-white",
              "shadow-sm transition-all hover:bg-affiliate-cta-hover hover:shadow-md hover:shadow-affiliate-accent/25",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-affiliate-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            )}
          >
            {ctaLabel}
            <span
              aria-hidden
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            >
              ↗
            </span>
            <span className="sr-only">(abre em nova aba)</span>
          </a>
        </div>

        <p className="mt-3 text-[11px] text-foreground/60 leading-relaxed">{DISCLOSURE}</p>
        <p className="mt-1 text-[11px] font-medium text-foreground/60">{RESPONSIBLE}</p>
      </div>
    </aside>
  );
}
