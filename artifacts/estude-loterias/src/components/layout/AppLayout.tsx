import { Link, useLocation } from "wouter";
import { useEffect } from "react";
import { TopNav } from "./TopNav";

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

const institucional = [
  { href: "/sobre", label: "Sobre o Site" },
  { href: "/contato", label: "Contato" },
  { href: "/privacidade", label: "Política de Privacidade" },
  { href: "/termos", label: "Termos de Uso" },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const ano = new Date().getFullYear();

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
                    <Link
                      href={l.href}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {l.label}
                    </Link>
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
              <a
                href="https://clubelotosport.com.br/convite/694f3c11405d9"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-xs text-[#009640] hover:underline font-medium"
              >
                Apostar no Clube LotoSport →
              </a>
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
              <Link href="/contato" className="hover:text-foreground transition-colors">Contato</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
