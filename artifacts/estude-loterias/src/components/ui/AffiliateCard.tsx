import { useEffect, useMemo, useRef } from "react";
import { ArrowUpRight, BadgeCheck } from "lucide-react";
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
  /**
   * Rótulo opcional exibido em negrito antes do `body`, no mesmo parágrafo.
   * Ex.: `"Nota do Gustavo:"` renderiza `<strong>Nota do Gustavo:</strong> ...`.
   */
  noteLabel?: string;
  /** Ponto único de troca do rótulo do CTA (A/B futuro). */
  ctaLabel?: string;
  className?: string;
}

const DEFAULT_CTA = "Ver bolões";
const DEFAULT_AFILIADO: Afiliado = "clube_lotosport";
const DISCLOSURE = "Link de parceria. Podemos receber comissão, sem custo para você.";
const RESPONSIBLE = "18+ · Jogue com responsabilidade";

/**
 * Card nativo de afiliado (substitui o AdUnit naquela posição).
 *
 * Identidade: TEAL = parceiro/publicidade (verde é a marca do site).
 * Opção B — BANDA SÓLIDA: um bloco teal no topo (cantos superiores arredondados
 * pelo `overflow-hidden`) concentra o selo "Parceiro/Publicidade", o eyebrow com
 * o nome do parceiro e o título, em texto branco. O corpo (texto + CTA +
 * disclosure/18+) fica abaixo, neutro sobre `bg-card`. Sem gradiente e sem
 * filete/linha: a banda é um bloco sólido.
 *
 * Contraste na banda (`bg-affiliate-cta` = #0f766e):
 *   branco sólido 5.47:1 (título) — AA
 *   text-white/90 4.76:1 ("Publicidade" e eyebrow) — AA
 *   selo branco com texto teal: 5.47:1 — AA
 * Corpo sobre `bg-card`: `text-foreground/75` (7.95:1) e disclosure/18+
 * `text-foreground/60` (4.69:1) — AA. Nada de `muted-foreground/80`.
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
  noteLabel,
  ctaLabel = DEFAULT_CTA,
  className,
}: AffiliateCardProps) {
  const cardRef = useRef<HTMLElement>(null);

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
      className={cn(
        // Widget de parceiro: banda teal sólida no topo + corpo neutro sobre bg-card.
        "group relative overflow-hidden rounded-xl border border-affiliate-accent/30 bg-card text-card-foreground shadow-sm transition-all duration-300",
        "hover:border-affiliate-accent/50 hover:shadow-xl hover:shadow-affiliate-accent/20 hover:-translate-y-0.5 motion-reduce:hover:translate-y-0",
        className,
      )}
    >
      {/* Banda de cabeçalho sólida: selo + eyebrow + título (texto branco) */}
      <div className="bg-affiliate-cta px-5 py-4 text-white sm:px-6 sm:py-5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-affiliate-cta shadow-sm">
            <BadgeCheck className="w-3 h-3" aria-hidden />
            Parceiro
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-white/90">
            Publicidade
          </span>
        </div>

        {/* Nome do parceiro visível (eyebrow acima do título) */}
        <p className="text-xs font-bold uppercase tracking-widest text-white/90">
          {AFFILIATE_NAMES[afiliado]}
        </p>

        <h2 className="mt-1 text-lg sm:text-xl font-bold tracking-tight text-white leading-snug">
          {title}
        </h2>
      </div>

      {/* Corpo neutro sobre bg-card */}
      <div className="px-5 py-4 sm:px-6 sm:py-5">
        <p className="text-sm text-foreground/75 leading-relaxed">
          {noteLabel ? (
            <>
              <strong>{noteLabel}</strong> {body}
            </>
          ) : (
            body
          )}
        </p>

        <div className="mt-4">
          <a
            href={linkUrl}
            target="_blank"
            rel="sponsored noopener noreferrer"
            onClick={handleClick}
            className={cn(
              "inline-flex w-full sm:w-auto min-h-[44px] items-center justify-center gap-2",
              // Fundo sólido do token: branco passa em AA (5.47:1).
              "rounded-lg bg-affiliate-cta px-6 py-3 text-sm sm:text-base font-bold text-white",
              "shadow-md shadow-affiliate-accent/20 transition-all hover:bg-affiliate-cta-hover hover:shadow-lg hover:shadow-affiliate-accent/30",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-affiliate-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            )}
          >
            {ctaLabel}
            <ArrowUpRight
              aria-hidden
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
            />
            <span className="sr-only">(abre em nova aba)</span>
          </a>
        </div>

        <p className="mt-3 text-[11px] text-foreground/60 leading-relaxed">{DISCLOSURE}</p>
        <p className="mt-1 text-[11px] font-medium text-foreground/60">{RESPONSIBLE}</p>
      </div>
    </aside>
  );
}
