import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  ChevronDown, Menu, X,
  BarChart3, Dices, Gift, HelpCircle, Home,
  List, Sparkles, Table, Target, Trophy, FlaskConical, BookOpen, ClipboardCheck,
} from "lucide-react";

// ── Mega-Sena items, grouped ──────────────────────────────────────────────────
const megaSenaTools = [
  { href: "/mega-sena",              label: "Painel Principal",       icon: Target,         desc: "Visão geral da Mega-Sena" },
  { href: "/mega-sena/resultado",    label: "Último Resultado",       icon: Dices,          desc: "Dezenas e premiação do último sorteio" },
  { href: "/mega-sena/resultados",   label: "Resultados Anteriores",  icon: List,           desc: "Histórico completo de concursos" },
  { href: "/mega-sena/resumo-estatistico", label: "Resumo Estatístico", icon: BarChart3,    desc: "Frequência e análise das dezenas" },
  { href: "/mega-sena/tabela-de-dezenas",  label: "Tabela de Dezenas",  icon: Table,        desc: "Ranking detalhado de todas as dezenas" },
  { href: "/mega-sena/gerador",      label: "Gerador de Jogos",       icon: Sparkles,       desc: "Crie apostas aleatórias" },
  { href: "/mega-sena/simulador",    label: "Simulador Histórico",    icon: FlaskConical,   desc: "Teste suas dezenas no histórico completo" },
  { href: "/mega-sena/conferidor",   label: "Conferidor de Apostas",  icon: ClipboardCheck, desc: "Verifique se sua aposta ganhou" },
];

const megaSenaInfo = [
  { href: "/mega-sena/como-jogar",    label: "Como Jogar",            icon: BookOpen,   desc: "Regras e formas de apostar" },
  { href: "/mega-sena/premiacao",     label: "Premiação",             icon: Trophy,     desc: "Faixas e percentuais de prêmio" },
  { href: "/mega-sena/faq",           label: "Perguntas Frequentes",  icon: HelpCircle, desc: "Dúvidas comuns respondidas" },
  { href: "/mega-sena/mega-da-virada",label: "Mega da Virada",        icon: Gift,       desc: "O sorteio especial de 31/12" },
];

const megaSenaAll = [...megaSenaTools, ...megaSenaInfo];

// ── Outras Loterias (placeholders) ───────────────────────────────────────────
const outrasLoterias = [
  { label: "Lotofácil",   cor: "#930089", soon: true },
  { label: "Quina",       cor: "#260085", soon: true },
  { label: "Dupla Sena",  cor: "#a8003c", soon: true },
  { label: "Lotomania",   cor: "#f07d00", soon: true },
  { label: "Timemania",   cor: "#00a650", soon: true },
  { label: "Dia de Sorte",cor: "#f5a623", soon: true },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  desc: string;
}

function matchesItem(location: string, href: string) {
  return location === href || location.startsWith(href + "/");
}

function bestMatch(location: string, items: NavItem[]): NavItem | null {
  return items.reduce<NavItem | null>((best, item) => {
    if (!matchesItem(location, item.href)) return best;
    if (!best || item.href.length > best.href.length) return item;
    return best;
  }, null);
}

// ── Mega-Sena grouped dropdown ────────────────────────────────────────────────
function MegaSenaDropdown({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
  const [location] = useLocation();
  const activeItem = bestMatch(location, megaSenaAll);
  const isActive = !!activeItem;

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className={cn(
          "flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors",
          isActive
            ? "text-[#009640]"
            : "text-foreground/80 hover:text-foreground hover:bg-muted"
        )}
      >
        Mega-Sena
        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="flex">
            {/* ── Ferramentas (8 itens) ── */}
            <div className="p-3 w-64">
              <div className="px-1.5 pt-1 pb-2">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Ferramentas
                </span>
              </div>
              {megaSenaTools.map((item) => {
                const Icon = item.icon;
                const active = activeItem?.href === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onToggle}
                    className={cn(
                      "flex items-start gap-3 px-2 py-2 rounded-lg transition-colors",
                      active ? "bg-[#009640]/10 text-[#009640]" : "hover:bg-muted text-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-sm font-medium leading-none">{item.label}</div>
                      <div className="text-xs text-muted-foreground mt-1">{item.desc}</div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* ── Informações (4 itens) ── */}
            <div className="p-3 w-56 bg-muted/40 border-l border-border">
              <div className="px-1.5 pt-1 pb-2">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Informações
                </span>
              </div>
              {megaSenaInfo.map((item) => {
                const Icon = item.icon;
                const active = activeItem?.href === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onToggle}
                    className={cn(
                      "flex items-start gap-3 px-2 py-2 rounded-lg transition-colors",
                      active ? "bg-[#009640]/10 text-[#009640]" : "hover:bg-muted text-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-sm font-medium leading-none">{item.label}</div>
                      <div className="text-xs text-muted-foreground mt-1">{item.desc}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Outras Loterias dropdown ──────────────────────────────────────────────────
function OutrasLoteriasDropdown({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className={cn(
          "flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors",
          "text-foreground/80 hover:text-foreground hover:bg-muted"
        )}
      >
        Outras Loterias
        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="p-2">
            <div className="px-2 pt-1 pb-2">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Em breve
              </span>
            </div>
            {outrasLoterias.map((loteria) => (
              <div
                key={loteria.label}
                className="flex items-center justify-between gap-3 p-2.5 rounded-lg opacity-50 cursor-not-allowed select-none"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full shrink-0"
                    style={{ backgroundColor: loteria.cor }}
                  />
                  <span className="text-sm font-medium text-foreground">{loteria.label}</span>
                </div>
                <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                  em breve
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main TopNav ───────────────────────────────────────────────────────────────
export function TopNav() {
  const [location] = useLocation();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggle = (name: string) => setOpenMenu(o => o === name ? null : name);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/"
            onClick={() => { setOpenMenu(null); setMobileOpen(false); }}
            className="flex items-center gap-2.5 shrink-0"
          >
            <div className="w-8 h-8 rounded-lg bg-[#009640] flex items-center justify-center text-white font-bold text-sm leading-none">EL</div>
            <span className="font-bold text-lg tracking-tight hidden sm:block">
              <span className="text-[#009640]">Estude</span>
              <span className="text-foreground"> Loterias</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" onClick={e => e.stopPropagation()}>
            <Link
              href="/"
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                location === "/"
                  ? "text-[#009640]"
                  : "text-foreground/80 hover:text-foreground hover:bg-muted"
              )}
            >
              <Home className="w-3.5 h-3.5" />
              Início
            </Link>

            <MegaSenaDropdown
              isOpen={openMenu === "megasena"}
              onToggle={() => toggle("megasena")}
            />

            <OutrasLoteriasDropdown
              isOpen={openMenu === "outras"}
              onToggle={() => toggle("outras")}
            />
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <a
              href="https://loterias.caixa.gov.br"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-lg bg-[#009640] text-white hover:bg-[#007b34] transition-colors"
            >
              Apostar
            </a>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-md hover:bg-muted transition-colors"
              onClick={() => setMobileOpen(o => !o)}
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Click-outside overlay */}
      {openMenu && (
        <div className="fixed inset-0 z-30" onClick={() => setOpenMenu(null)} />
      )}

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-background flex flex-col md:hidden">
          <div className="h-16 border-b border-border flex items-center justify-between px-4">
            <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#009640] flex items-center justify-center text-white font-bold text-sm">EL</div>
              <span className="font-bold text-lg"><span className="text-[#009640]">Estude</span> Loterias</span>
            </Link>
            <button onClick={() => setMobileOpen(false)} className="p-2 rounded-md hover:bg-muted">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg text-sm font-medium",
                location === "/" ? "bg-[#009640]/10 text-[#009640]" : "text-foreground hover:bg-muted"
              )}
            >
              <Home className="w-4 h-4" /> Início
            </Link>

            {/* Mega-Sena — tools */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-3">
                Mega-Sena
              </div>
              <div className="space-y-1">
                {megaSenaTools.map(item => {
                  const Icon = item.icon;
                  const active = bestMatch(location, megaSenaAll)?.href === item.href;
                  return (
                    <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                      className={cn("flex items-center gap-3 p-3 rounded-lg text-sm font-medium",
                        active ? "bg-[#009640]/10 text-[#009640]" : "text-foreground hover:bg-muted")}>
                      <Icon className="w-4 h-4" /> {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Mega-Sena — info */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-3">
                Informações
              </div>
              <div className="space-y-1">
                {megaSenaInfo.map(item => {
                  const Icon = item.icon;
                  const active = location === item.href;
                  return (
                    <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                      className={cn("flex items-center gap-3 p-3 rounded-lg text-sm font-medium",
                        active ? "bg-[#009640]/10 text-[#009640]" : "text-foreground hover:bg-muted")}>
                      <Icon className="w-4 h-4" /> {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Outras Loterias */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-3">
                Outras Loterias
              </div>
              <div className="space-y-1">
                {outrasLoterias.map(loteria => (
                  <div
                    key={loteria.label}
                    className="flex items-center justify-between gap-3 p-3 rounded-lg text-sm font-medium opacity-40 cursor-not-allowed"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: loteria.cor }} />
                      {loteria.label}
                    </div>
                    <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">em breve</span>
                  </div>
                ))}
              </div>
            </div>

            <a
              href="https://loterias.caixa.gov.br"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center p-3 rounded-lg bg-[#009640] text-white font-semibold text-sm"
            >
              Apostar na Caixa
            </a>
          </div>
        </div>
      )}
    </>
  );
}
