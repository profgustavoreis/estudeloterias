import { TopNav } from "./TopNav";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopNav />
      <main className="flex-1 py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      <footer className="border-t border-border py-6 px-4 sm:px-6 mt-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#009640] flex items-center justify-center text-white font-bold text-xs">EL</div>
            <span><strong className="text-foreground">Estude Loterias</strong> — Estatísticas e ferramentas para loterias da Caixa</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Dados obtidos via API pública da Caixa</span>
            <span>·</span>
            <a href="https://loterias.caixa.gov.br" target="_blank" rel="noopener noreferrer"
              className="hover:text-foreground transition-colors">Loterias Caixa</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
