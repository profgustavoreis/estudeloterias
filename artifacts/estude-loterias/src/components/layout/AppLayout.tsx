import { Link, useLocation } from "wouter";
import { useEffect, useMemo } from "react";
import { TopNav } from "./TopNav";
import { buildAffiliateUrl, trackAffiliateClick, type Afiliado } from "@/lib/affiliate";
import { ArrowUpRight } from "lucide-react";

const loterias: Array<{ name: string; href: string; active: boolean; soon?: boolean }> = [
  { name: "Mega-Sena",   href: "/mega-sena",    active: true },
  { name: "Lotofácil",   href: "/lotofacil",   active: true },
  { name: "Quina",       href: "/quina",        active: true },
  { name: "+Milionária",  href: "/maismilionaria", active: true },
  { name: "Lotomania",   href: "/lotomania",    active: true },
  { name: "Dupla Sena",  href: "/duplasena",    active: true },
  { name: "Timemania",   href: "/timemania",   active: true },
  { name: "Dia de Sorte", href: "/diadesorte",  active: true },
  { name: "Super Sete",  href: "/super-sete",    active: true },
];

const institucional: Array<{ href: string; label: string; external?: boolean }> = [
  { href: "/sobre", label: "Sobre o Site" },
  { href: "/termos", label: "Termos de Uso" },
  { href: "/privacidade", label: "Política de Privacidade" },
  { href: "/parceiros", label: "Parceiros" },
  { href: "https://estudematematica.com.br/contato", label: "Contato", external: true },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const ano = new Date().getFullYear();

  const footerAffiliate = useMemo(() => {
    const afiliado: Afiliado = "clube_lotosport";
    const ctaLabel = "Ver bolões";
    const placement = "footer";
    return {
      afiliado,
      ctaLabel,
      placement,
      linkUrl: buildAffiliateUrl({ afiliado, placement, ctaLabel }),
    };
  }, []);

  // Scroll to top on menu-driven route changes. Tool interactions (simulador/gerador/conferidor) stay in-page so naturally unaffected.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopNav />
      <main className="flex-1 py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      <footer className="border-t border-border bg-muted/30 mt-12">
        {/* Main footer grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

            {/* Col 1 — Brand */}
            <div className="space-y-3">
              <Link href="/" className="flex items-center gap-2.5 w-fit">
                <img src="/logo.png" alt="Estude Loterias" className="w-7 h-7 rounded-md" />
                <span className="text-base" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  <span className="text-[#009640] font-normal">estude</span>
                  <span className="text-foreground font-bold">loterias</span>
                </span>
              </Link>
              <p className="text-xs text-muted-foreground leading-relaxed">
                O Estude Loterias é uma iniciativa do{" "}
                <a
                  href="https://estudematematica.com.br/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#009640] hover:underline"
                >
                  Estude Matemática
                </a>{" "}
                desenvolvida pelo{" "}
                <a
                  href="https://gustavoreis.com.br/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#009640] hover:underline"
                >
                  professor Gustavo Reis
                </a>
                . Aqui você encontra resultados, estatísticas e ferramentas gratuitas para as Loterias Caixa.
              </p>
            </div>

            {/* Col 2 — Loterias */}
            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Loterias
              </div>
              <ul className="space-y-2">
                {loterias.map((l) => (
                  <li key={l.name} className="flex items-center justify-between gap-3">
                    {l.active ? (
                      <Link
                        href={l.href}
                        className="text-xs font-semibold text-foreground hover:text-[#009640] transition-colors"
                      >
                        {l.name}
                      </Link>
                    ) : (
                      <span className="text-xs font-semibold text-muted-foreground/60">
                        {l.name}
                      </span>
                    )}
                    {l.soon && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground border border-border">
                        em breve
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3 — Institucional */}
            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Institucional
              </div>
              <ul className="space-y-2">
                {institucional.map((l) => (
                  <li key={l.href}>
                    {l.external ? (
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {l.label}
                      </a>
                    ) : (
                      <Link
                        href={l.href}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 4 — Aviso legal */}
            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Aviso Legal
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Site independente. Dados obtidos via API pública da Caixa Econômica Federal.
                Não vendemos apostas e não temos vínculo com a Caixa.
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                As loterias são jogos de azar permitidos apenas para maiores de 18 anos.
                Jogue com responsabilidade.
              </p>
              {footerAffiliate.linkUrl && (
                <div className="space-y-1">
                  <span className="inline-flex items-center rounded-full bg-gradient-to-r from-affiliate-cta-hover to-affiliate-cta px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
                    Parceiro
                  </span>
                  <a
                    href={footerAffiliate.linkUrl}
                    target="_blank"
                    rel="sponsored noopener noreferrer"
                    title="Site parceiro · 18+"
                    onClick={() =>
                      trackAffiliateClick({
                        afiliado: footerAffiliate.afiliado,
                        placement: footerAffiliate.placement,
                        ctaLabel: footerAffiliate.ctaLabel,
                        linkUrl: footerAffiliate.linkUrl ?? undefined,
                      })
                    }
                    className="flex w-fit items-center gap-1 text-xs text-affiliate-label hover:text-affiliate-cta-hover dark:hover:text-affiliate-accent hover:underline font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-affiliate-accent rounded"
                  >
                    {footerAffiliate.ctaLabel}
                    <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
                    <span className="sr-only">(site parceiro, abre em nova aba)</span>
                  </a>
                  <span className="block text-[10px] text-foreground/60 leading-relaxed">
                    Link de parceria. Podemos receber comissão, sem custo para você. Site parceiro · 18+
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>© {ano} Mathematica Et Cetera Sociedade Educacional Ltda. · CNPJ 09.631.507/0001-18</span>
            <div className="flex items-center gap-3">
              <Link href="/privacidade" className="hover:text-foreground transition-colors">Privacidade</Link>
              <span>·</span>
              <Link href="/termos" className="hover:text-foreground transition-colors">Termos</Link>
              <span>·</span>
              <Link href="/parceiros" className="hover:text-foreground transition-colors">Parceiros</Link>
              <span>·</span>
              <a href="https://estudematematica.com.br/contato" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Contato</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
