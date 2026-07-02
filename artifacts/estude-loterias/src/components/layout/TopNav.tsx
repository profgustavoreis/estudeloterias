import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  ChevronDown, Menu, X,
  BarChart3, Dices, Gift, HelpCircle, Home,
  List, Sparkles, Table, Target, Trophy, FlaskConical, BookOpen, ClipboardCheck, PartyPopper,
} from "lucide-react";

// ── Mega-Sena items ───────────────────────────────────────────────────────────
const megaSenaTools = [
  { href: "/mega-sena",              label: "Painel Principal",       icon: Target,         desc: "Visão geral da Mega-Sena" },
  { href: "/mega-sena/resultado",    label: "Último Resultado",       icon: Dices,          desc: "Dezenas e premiação do último sorteio" },
  { href: "/mega-sena/resultados",   label: "Resultados Anteriores",  icon: List,           desc: "Histórico completo de concursos" },
  { href: "/mega-sena/resumo-estatistico", label: "Resumo Estatístico", icon: BarChart3,   desc: "Frequência e análise das dezenas" },
  { href: "/mega-sena/tabela-de-dezenas",  label: "Tabela de Dezenas", icon: Table,        desc: "Ranking detalhado de todas as dezenas" },
  { href: "/mega-sena/gerador",      label: "Gerador de Jogos",       icon: Sparkles,       desc: "Crie apostas aleatórias" },
  { href: "/mega-sena/simulador",    label: "Simulador Histórico",    icon: FlaskConical,   desc: "Teste suas dezenas no histórico completo" },
  { href: "/mega-sena/conferidor",   label: "Conferidor de Apostas",  icon: ClipboardCheck, desc: "Verifique se sua aposta ganhou" },
];

const megaSenaInfo = [
  { href: "/mega-sena/como-jogar",    label: "Como Jogar",            icon: BookOpen,   desc: "Regras e formas de apostar" },
  { href: "/mega-sena/premiacao",     label: "Premiação",             icon: Trophy,     desc: "Faixas e percentuais de prêmio" },
  { href: "/mega-sena/perguntas-frequentes", label: "Perguntas Frequentes", icon: HelpCircle, desc: "Dúvidas comuns respondidas" },
  { href: "/mega-sena/mega-da-virada",label: "Mega da Virada",        icon: Gift,       desc: "O sorteio especial de 31/12" },
];

const megaSenaAll = [...megaSenaTools, ...megaSenaInfo];

// ── Lotofácil items ───────────────────────────────────────────────────────────
const lotofacilTools = [
  { href: "/lotofacil",                     label: "Painel Principal",       icon: Target,         desc: "Visão geral da Lotofácil" },
  { href: "/lotofacil/resultado",           label: "Último Resultado",       icon: Dices,          desc: "Dezenas e premiação do último sorteio" },
  { href: "/lotofacil/resultados",          label: "Resultados Anteriores",  icon: List,           desc: "Histórico completo de concursos" },
  { href: "/lotofacil/resumo-estatistico",  label: "Resumo Estatístico",     icon: BarChart3,      desc: "Frequência e análise das dezenas" },
  { href: "/lotofacil/tabela-de-dezenas",   label: "Tabela de Dezenas",      icon: Table,          desc: "Ranking detalhado de todas as dezenas" },
  { href: "/lotofacil/gerador",             label: "Gerador de Jogos",       icon: Sparkles,       desc: "Crie apostas aleatórias" },
  { href: "/lotofacil/simulador",           label: "Simulador Histórico",    icon: FlaskConical,   desc: "Teste suas dezenas no histórico completo" },
  { href: "/lotofacil/conferidor",          label: "Conferidor de Apostas",  icon: ClipboardCheck, desc: "Verifique se sua aposta ganhou" },
];

const lotofacilInfo = [
  { href: "/lotofacil/como-jogar",                   label: "Como Jogar",                    icon: BookOpen,   desc: "Regras e formas de apostar" },
  { href: "/lotofacil/premiacao",                    label: "Premiação",                     icon: Trophy,     desc: "Faixas e percentuais de prêmio" },
  { href: "/lotofacil/perguntas-frequentes",         label: "Perguntas Frequentes",          icon: HelpCircle, desc: "Dúvidas comuns respondidas" },
  { href: "/lotofacil/lotofacil-da-independencia",   label: "Lotofácil da Independência",    icon: Gift,       desc: "O sorteio especial de 7 de setembro" },
];

const lotofacilAll = [...lotofacilTools, ...lotofacilInfo];

// ── Quina items ────────────────────────────────────────────────────────────
const quinaTools = [
  { href: "/quina",                    label: "Painel Principal",       icon: Target,         desc: "Visão geral da Quina" },
  { href: "/quina/resultado",          label: "Último Resultado",       icon: Dices,          desc: "Dezenas e premiação do último sorteio" },
  { href: "/quina/resultados",         label: "Resultados Anteriores",  icon: List,           desc: "Histórico completo de concursos" },
  { href: "/quina/resumo-estatistico", label: "Resumo Estatístico",     icon: BarChart3,      desc: "Frequência e análise das dezenas" },
  { href: "/quina/tabela-de-dezenas",  label: "Tabela de Dezenas",      icon: Table,          desc: "Ranking detalhado de todas as dezenas" },
  { href: "/quina/gerador",            label: "Gerador de Jogos",       icon: Sparkles,       desc: "Crie apostas aleatórias" },
  { href: "/quina/simulador",          label: "Simulador Histórico",    icon: FlaskConical,   desc: "Teste suas dezenas no histórico completo" },
  { href: "/quina/conferidor",         label: "Conferidor de Apostas",  icon: ClipboardCheck, desc: "Verifique se sua aposta ganhou" },
];

const quinaInfo = [
  { href: "/quina/como-jogar",           label: "Como Jogar",            icon: BookOpen,     desc: "Regras e formas de apostar" },
  { href: "/quina/premiacao",            label: "Premiação",             icon: Trophy,       desc: "Faixas e percentuais de prêmio" },
  { href: "/quina/perguntas-frequentes", label: "Perguntas Frequentes",  icon: HelpCircle,   desc: "Dúvidas comuns respondidas" },
  { href: "/quina/quina-de-sao-joao",    label: "Quina de São João",     icon: PartyPopper,  desc: "O sorteio especial de junho" },
];

const quinaAll = [...quinaTools, ...quinaInfo];

// ── Lotomania items ──────────────────────────────────────────────────────────
const lotomaniaTools = [
  { href: "/lotomania",                    label: "Painel Principal",       icon: Target,         desc: "Visão geral da Lotomania" },
  { href: "/lotomania/resultado",          label: "Último Resultado",       icon: Dices,          desc: "Dezenas e premiação do último sorteio" },
  { href: "/lotomania/resultados",         label: "Resultados Anteriores",  icon: List,           desc: "Histórico completo de concursos" },
  { href: "/lotomania/resumo-estatistico", label: "Resumo Estatístico",     icon: BarChart3,      desc: "Frequência e análise das dezenas" },
  { href: "/lotomania/tabela-de-dezenas",  label: "Tabela de Dezenas",      icon: Table,          desc: "Ranking detalhado de todas as dezenas" },
  { href: "/lotomania/gerador",            label: "Gerador de Jogos",       icon: Sparkles,       desc: "Crie apostas aleatórias" },
  { href: "/lotomania/simulador",          label: "Simulador Histórico",    icon: FlaskConical,   desc: "Teste suas dezenas no histórico completo" },
  { href: "/lotomania/conferidor",         label: "Conferidor de Apostas",  icon: ClipboardCheck, desc: "Verifique se sua aposta ganhou" },
];

const lotomaniaInfo = [
  { href: "/lotomania/como-jogar",           label: "Como Jogar",            icon: BookOpen,     desc: "Regras e formas de apostar" },
  { href: "/lotomania/premiacao",            label: "Premiação",             icon: Trophy,       desc: "Faixas e percentuais de prêmio" },
  { href: "/lotomania/perguntas-frequentes", label: "Perguntas Frequentes",  icon: HelpCircle,   desc: "Dúvidas comuns respondidas" },
];

const lotomaniaAll = [...lotomaniaTools, ...lotomaniaInfo];

// ── Timemania items ──────────────────────────────────────────────────────────
const timemaniaTools = [
  { href: "/timemania",                    label: "Painel Principal",       icon: Target,         desc: "Visão geral da Timemania" },
  { href: "/timemania/resultado",          label: "Último Resultado",       icon: Dices,          desc: "Dezenas e premiação do último sorteio" },
  { href: "/timemania/resultados",         label: "Resultados Anteriores",  icon: List,           desc: "Histórico completo de concursos" },
  { href: "/timemania/resumo-estatistico", label: "Resumo Estatístico",     icon: BarChart3,      desc: "Frequência e análise das dezenas" },
  { href: "/timemania/tabela-de-dezenas",  label: "Tabela de Dezenas",      icon: Table,          desc: "Ranking detalhado de todas as dezenas" },
  { href: "/timemania/gerador",            label: "Gerador de Jogos",       icon: Sparkles,       desc: "Crie apostas aleatórias" },
  { href: "/timemania/simulador",          label: "Simulador Histórico",    icon: FlaskConical,   desc: "Teste suas dezenas no histórico completo" },
  { href: "/timemania/conferidor",         label: "Conferidor de Apostas",  icon: ClipboardCheck, desc: "Verifique se sua aposta ganhou" },
];

const timemaniaInfo = [
  { href: "/timemania/como-jogar",           label: "Como Jogar",            icon: BookOpen,     desc: "Regras e formas de apostar" },
  { href: "/timemania/premiacao",            label: "Premiação",             icon: Trophy,       desc: "Faixas e percentuais de prêmio" },
  { href: "/timemania/perguntas-frequentes", label: "Perguntas Frequentes",  icon: HelpCircle,   desc: "Dúvidas comuns respondidas" },
];

const timemaniaAll = [...timemaniaTools, ...timemaniaInfo];

// ── Dia de Sorte items ──────────────────────────────────────────────────────
const diaDeSorteTools = [
  { href: "/diadesorte",                    label: "Painel Principal",       icon: Target,         desc: "Visão geral da Dia de Sorte" },
  { href: "/diadesorte/resultado",          label: "Último Resultado",       icon: Dices,          desc: "Dezenas e premiação do último sorteio" },
  { href: "/diadesorte/resultados",         label: "Resultados Anteriores",  icon: List,           desc: "Histórico completo de concursos" },
  { href: "/diadesorte/resumo-estatistico", label: "Resumo Estatístico",     icon: BarChart3,      desc: "Frequência e análise das dezenas" },
  { href: "/diadesorte/tabela-de-dezenas",  label: "Tabela de Dezenas",      icon: Table,          desc: "Ranking detalhado de todas as dezenas" },
  { href: "/diadesorte/gerador",            label: "Gerador de Jogos",       icon: Sparkles,       desc: "Crie apostas aleatórias" },
  { href: "/diadesorte/simulador",          label: "Simulador Histórico",    icon: FlaskConical,   desc: "Teste suas dezenas no histórico completo" },
  { href: "/diadesorte/conferidor",         label: "Conferidor de Apostas",  icon: ClipboardCheck, desc: "Verifique se sua aposta ganhou" },
];

const diaDeSorteInfo = [
  { href: "/diadesorte/como-jogar",           label: "Como Jogar",            icon: BookOpen,     desc: "Regras e formas de apostar" },
  { href: "/diadesorte/premiacao",            label: "Premiação",             icon: Trophy,       desc: "Faixas e percentuais de prêmio" },
  { href: "/diadesorte/perguntas-frequentes", label: "Perguntas Frequentes",  icon: HelpCircle,   desc: "Dúvidas comuns respondidas" },
];

const diaDeSorteAll = [...diaDeSorteTools, ...diaDeSorteInfo];

// ── Outras Loterias ───────────────────────────────────────────────────────────
// Items with an `href` are live and link out; items without one are still "em breve".
const outrasLoterias: Array<{ label: string; cor: string; href?: string }> = [
  { label: "Quina",       cor: "#260085", href: "/quina" },
  { label: "Lotomania",   cor: "#f8901c", href: "/lotomania" },
  { label: "Timemania",   cor: "#FFF600", href: "/timemania" },
  { label: "Dupla Sena",  cor: "#a8003c" },
  { label: "Dia de Sorte", cor: "#cb852b", href: "/diadesorte" },
  { label: "Super Sete",  cor: "#a8cf45" },
  { label: "+Milionária",  cor: "#2c2c2c" },
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

// ── Grouped dropdown factory ──────────────────────────────────────────────────
function LotteryDropdown({
  label,
  cor,
  tools,
  info,
  allItems,
  isOpen,
  onToggle,
}: {
  label: string;
  cor: string;
  tools: NavItem[];
  info: NavItem[];
  allItems: NavItem[];
  isOpen: boolean;
  onToggle: () => void;
}) {
  const [location] = useLocation();
  const activeItem = bestMatch(location, allItems);
  const isActive = !!activeItem;

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className={cn(
          "flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors",
          isActive
            ? ""
            : "text-foreground/80 hover:text-foreground hover:bg-muted"
        )}
        style={isActive ? { color: cor } : {}}
      >
        {label}
        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="flex">
            {/* ── Ferramentas ── */}
            <div className="p-3 w-64">
              <div className="px-1.5 pt-1 pb-2">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Ferramentas
                </span>
              </div>
              {tools.map((item) => {
                const Icon = item.icon;
                const active = activeItem?.href === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onToggle}
                    className={cn(
                      "flex items-start gap-3 px-2 py-2 rounded-lg transition-colors",
                      active ? "" : "hover:bg-muted text-foreground"
                    )}
                    style={active ? { backgroundColor: cor + "1a", color: cor } : {}}
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

            {/* ── Informações ── */}
            <div className="p-3 w-56 bg-muted/40 border-l border-border">
              <div className="px-1.5 pt-1 pb-2">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Informações
                </span>
              </div>
              {info.map((item) => {
                const Icon = item.icon;
                const active = activeItem?.href === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onToggle}
                    className={cn(
                      "flex items-start gap-3 px-2 py-2 rounded-lg transition-colors",
                      active ? "" : "hover:bg-muted text-foreground"
                    )}
                    style={active ? { backgroundColor: cor + "1a", color: cor } : {}}
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
function OutrasLoteriasDropdown({
  items,
  isOpen,
  onToggle,
  onNavigate,
}: {
  items: Array<{ label: string; cor: string; href?: string }>;
  isOpen: boolean;
  onToggle: () => void;
  onNavigate: () => void;
}) {
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
            {items.map((loteria) =>
              loteria.href ? (
                <Link
                  key={loteria.label}
                  href={loteria.href}
                  onClick={onNavigate}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: loteria.cor }} />
                  <span className="text-sm font-medium text-foreground">{loteria.label}</span>
                </Link>
              ) : (
                <div
                  key={loteria.label}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-lg opacity-50 cursor-not-allowed select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: loteria.cor }} />
                    <span className="text-sm font-medium text-foreground">{loteria.label}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                    em breve
                  </span>
                </div>
              )
            )}
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

  // Quina and Lotomania get their own top-level dropdown only while one of their pages is active;
  // otherwise they stay reachable via "Outras Loterias" (unlike the still-unbuilt lotteries).
  const quinaActive = !!bestMatch(location, quinaAll);
  const lotomaniaActive = !!bestMatch(location, lotomaniaAll);
  const timemaniaActive = !!bestMatch(location, timemaniaAll);
  const diaDeSorteActive = !!bestMatch(location, diaDeSorteAll);
  const visibleOutrasLoterias = outrasLoterias.filter(l =>
    (l.label !== "Quina" || !quinaActive) &&
    (l.label !== "Lotomania" || !lotomaniaActive) &&
    (l.label !== "Timemania" || !timemaniaActive) &&
    (l.label !== "Dia de Sorte" || !diaDeSorteActive)
  );

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
            <img src="/logo.png" alt="Estude Loterias" className="w-8 h-8 rounded-lg" />
            <span className="text-lg tracking-tight hidden sm:block" style={{ fontFamily: "'Poppins', sans-serif" }}>
              <span className="text-[#009640] font-normal">estude</span>
              <span className="text-foreground font-bold">loterias</span>
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

            <LotteryDropdown
              label="Mega-Sena"
              cor="#009640"
              tools={megaSenaTools}
              info={megaSenaInfo}
              allItems={megaSenaAll}
              isOpen={openMenu === "megasena"}
              onToggle={() => toggle("megasena")}
            />

            <LotteryDropdown
              label="Lotofácil"
              cor="#930089"
              tools={lotofacilTools}
              info={lotofacilInfo}
              allItems={lotofacilAll}
              isOpen={openMenu === "lotofacil"}
              onToggle={() => toggle("lotofacil")}
            />

            {quinaActive && (
              <LotteryDropdown
                label="Quina"
                cor="#260085"
                tools={quinaTools}
                info={quinaInfo}
                allItems={quinaAll}
                isOpen={openMenu === "quina"}
                onToggle={() => toggle("quina")}
              />
            )}

            {lotomaniaActive && (
              <LotteryDropdown
                label="Lotomania"
                cor="#f8901c"
                tools={lotomaniaTools}
                info={lotomaniaInfo}
                allItems={lotomaniaAll}
                isOpen={openMenu === "lotomania"}
                onToggle={() => toggle("lotomania")}
              />
            )}

            {timemaniaActive && (
              <LotteryDropdown
                label="Timemania"
                cor="#049645"
                tools={timemaniaTools}
                info={timemaniaInfo}
                allItems={timemaniaAll}
                isOpen={openMenu === "timemania"}
                onToggle={() => toggle("timemania")}
              />
            )}

            {diaDeSorteActive && (
              <LotteryDropdown
                label="Dia de Sorte"
                cor="#cb852b"
                tools={diaDeSorteTools}
                info={diaDeSorteInfo}
                allItems={diaDeSorteAll}
                isOpen={openMenu === "diadesorte"}
                onToggle={() => toggle("diadesorte")}
              />
            )}

            <OutrasLoteriasDropdown
              items={visibleOutrasLoterias}
              isOpen={openMenu === "outras"}
              onToggle={() => toggle("outras")}
              onNavigate={() => setOpenMenu(null)}
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
              <img src="/logo.png" alt="Estude Loterias" className="w-8 h-8 rounded-lg" />
              <span className="text-lg" style={{ fontFamily: "'Poppins', sans-serif" }}>
                <span className="text-[#009640] font-normal">estude</span>
                <span className="text-foreground font-bold">loterias</span>
              </span>
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

            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-3">
                Mega-Sena — Informações
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

            {/* Lotofácil — tools */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider mb-2 px-3" style={{ color: "#930089" }}>
                Lotofácil
              </div>
              <div className="space-y-1">
                {lotofacilTools.map(item => {
                  const Icon = item.icon;
                  const active = bestMatch(location, lotofacilAll)?.href === item.href;
                  return (
                    <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                      className={cn("flex items-center gap-3 p-3 rounded-lg text-sm font-medium",
                        active ? "" : "text-foreground hover:bg-muted")}
                      style={active ? { backgroundColor: "#9300891a", color: "#930089" } : {}}>
                      <Icon className="w-4 h-4" /> {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-3">
                Lotofácil — Informações
              </div>
              <div className="space-y-1">
                {lotofacilInfo.map(item => {
                  const Icon = item.icon;
                  const active = location === item.href;
                  return (
                    <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                      className={cn("flex items-center gap-3 p-3 rounded-lg text-sm font-medium",
                        active ? "" : "text-foreground hover:bg-muted")}
                      style={active ? { backgroundColor: "#9300891a", color: "#930089" } : {}}>
                      <Icon className="w-4 h-4" /> {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Quina — tools (only shown when a Quina page is active) */}
            {quinaActive && (
              <>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider mb-2 px-3" style={{ color: "#260085" }}>
                    Quina
                  </div>
                  <div className="space-y-1">
                    {quinaTools.map(item => {
                      const Icon = item.icon;
                      const active = bestMatch(location, quinaAll)?.href === item.href;
                      return (
                        <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                          className={cn("flex items-center gap-3 p-3 rounded-lg text-sm font-medium",
                            active ? "" : "text-foreground hover:bg-muted")}
                          style={active ? { backgroundColor: "#26008519", color: "#260085" } : {}}>
                          <Icon className="w-4 h-4" /> {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-3">
                    Quina — Informações
                  </div>
                  <div className="space-y-1">
                    {quinaInfo.map(item => {
                      const Icon = item.icon;
                      const active = location === item.href;
                      return (
                        <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                          className={cn("flex items-center gap-3 p-3 rounded-lg text-sm font-medium",
                            active ? "" : "text-foreground hover:bg-muted")}
                          style={active ? { backgroundColor: "#26008519", color: "#260085" } : {}}>
                          <Icon className="w-4 h-4" /> {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* Dia de Sorte — tools (only shown when a Dia de Sorte page is active) */}
            {diaDeSorteActive && (
              <>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider mb-2 px-3" style={{ color: "#cb852b" }}>
                    Dia de Sorte
                  </div>
                  <div className="space-y-1">
                    {diaDeSorteTools.map(item => {
                      const Icon = item.icon;
                      const active = bestMatch(location, diaDeSorteAll)?.href === item.href;
                      return (
                        <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                          className={cn("flex items-center gap-3 p-3 rounded-lg text-sm font-medium",
                            active ? "" : "text-foreground hover:bg-muted")}
                          style={active ? { backgroundColor: "#cb852b1a", color: "#cb852b" } : {}}>
                          <Icon className="w-4 h-4" /> {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-3">
                    Dia de Sorte — Informações
                  </div>
                  <div className="space-y-1">
                    {diaDeSorteInfo.map(item => {
                      const Icon = item.icon;
                      const active = location === item.href;
                      return (
                        <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                          className={cn("flex items-center gap-3 p-3 rounded-lg text-sm font-medium",
                            active ? "" : "text-foreground hover:bg-muted")}
                          style={active ? { backgroundColor: "#cb852b1a", color: "#cb852b" } : {}}>
                          <Icon className="w-4 h-4" /> {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* Outras Loterias */}
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-3">
                Outras Loterias
              </div>
              {/* Lotomania — tools (only shown when a Lotomania page is active) */}
            {lotomaniaActive && (
              <>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider mb-2 px-3" style={{ color: "#f8901c" }}>
                    Lotomania
                  </div>
                  <div className="space-y-1">
                    {lotomaniaTools.map(item => {
                      const Icon = item.icon;
                      const active = bestMatch(location, lotomaniaAll)?.href === item.href;
                      return (
                        <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                          className={cn("flex items-center gap-3 p-3 rounded-lg text-sm font-medium",
                            active ? "" : "text-foreground hover:bg-muted")}
                          style={active ? { backgroundColor: "#f8901c1a", color: "#f8901c" } : {}}>
                          <Icon className="w-4 h-4" /> {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-3">
                    Lotomania — Informações
                  </div>
                  <div className="space-y-1">
                    {lotomaniaInfo.map(item => {
                      const Icon = item.icon;
                      const active = location === item.href;
                      return (
                        <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                          className={cn("flex items-center gap-3 p-3 rounded-lg text-sm font-medium",
                            active ? "" : "text-foreground hover:bg-muted")}
                          style={active ? { backgroundColor: "#f8901c1a", color: "#f8901c" } : {}}>
                          <Icon className="w-4 h-4" /> {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* Timemania — tools (only shown when a Timemania page is active) */}
            {timemaniaActive && (
              <>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider mb-2 px-3" style={{ color: "#049645" }}>
                    Timemania
                  </div>
                  <div className="space-y-1">
                    {timemaniaTools.map(item => {
                      const Icon = item.icon;
                      const active = bestMatch(location, timemaniaAll)?.href === item.href;
                      return (
                        <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                          className={cn("flex items-center gap-3 p-3 rounded-lg text-sm font-medium",
                            active ? "" : "text-foreground hover:bg-muted")}
                          style={active ? { backgroundColor: "#0496451a", color: "#049645" } : {}}>
                          <Icon className="w-4 h-4" /> {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-3">
                    Timemania — Informações
                  </div>
                  <div className="space-y-1">
                    {timemaniaInfo.map(item => {
                      const Icon = item.icon;
                      const active = location === item.href;
                      return (
                        <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                          className={cn("flex items-center gap-3 p-3 rounded-lg text-sm font-medium",
                            active ? "" : "text-foreground hover:bg-muted")}
                          style={active ? { backgroundColor: "#0496451a", color: "#049645" } : {}}>
                          <Icon className="w-4 h-4" /> {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1">
                {visibleOutrasLoterias.map(loteria =>
                  loteria.href ? (
                    <Link
                      key={loteria.label}
                      href={loteria.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-lg text-sm font-medium text-foreground hover:bg-muted"
                    >
                      <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: loteria.cor }} />
                      {loteria.label}
                    </Link>
                  ) : (
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
                  )
                )}
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
