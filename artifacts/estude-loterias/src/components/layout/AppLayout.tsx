import { Link } from "wouter";
import { TopNav } from "./TopNav";

const megaSenaLinks = [
  { href: "/mega-sena", label: "Painel Principal" },
  { href: "/mega-sena/resultado", label: "Último Resultado" },
  { href: "/mega-sena/resultados", label: "Resultados Anteriores" },
  { href: "/mega-sena/resumo-estatistico", label: "Resumo Estatístico" },
  { href: "/mega-sena/tabela-de-dezenas", label: "Tabela de Dezenas" },
  { href: "/mega-sena/gerador", label: "Gerador de Jogos" },
  { href: "/mega-sena/simulador", label: "Simulador Histórico" },
  { href: "/mega-sena/conferidor", label: "Conferidor de Apostas" },
];

const megaSenaInfoLinks = [
  { href: "/mega-sena/como-jogar", label: "Como Jogar" },
  { href: "/mega-sena/premiacao", label: "Premiação" },
  { href: "/mega-sena/perguntas-frequentes", label: "Perguntas Frequentes" },
  { href: "/mega-sena/mega-da-virada", label: "Mega da Virada" },
];

const institucionalLinks = [
  { href: "/sobre", label: "Sobre o Site" },
  { href: "/contato", label: "Contato" },
  { href: "/privacidade", label: "Política de Privacidade" },
  { href: "/termos", label: "Termos de Uso" },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const ano = new Date().getFullYear();

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
                <div className="w-7 h-7 rounded-md bg-[#009640] flex items-center justify-center text-white font-bold text-xs leading-none">EL</div>
                <span className="font-bold text-base">
                  <span className="text-[#009640]">Estude</span>
                  <span className="text-foreground"> Loterias</span>
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

            {/* Col 2 — Mega-Sena Ferramentas */}
            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Mega-Sena — Ferramentas
              </div>
              <ul className="space-y-2">
                {megaSenaLinks.map((l) => (
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

            {/* Col 3 — Mega-Sena Informações */}
            <div className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Mega-Sena — Informações
              </div>
              <ul className="space-y-2">
                {megaSenaInfoLinks.map((l) => (
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

              <div className="pt-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Institucional
              </div>
              <ul className="space-y-2">
                {institucionalLinks.map((l) => (
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
                href="https://loterias.caixa.gov.br"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-xs text-[#009640] hover:underline font-medium"
              >
                Apostar na Caixa →
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
