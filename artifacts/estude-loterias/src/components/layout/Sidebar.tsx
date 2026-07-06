import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Target, 
  BarChart3, 
  List, 
  Sparkles,
  HelpCircle,
  Info,
  Gift,
  Dices
} from "lucide-react";

export function Sidebar() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Visão Geral", icon: Home },
    {
      title: "Mega-Sena",
      items: [
        { href: "/mega-sena", label: "Painel Principal", icon: Target },
        { href: "/mega-sena/resultado", label: "Último Resultado", icon: Dices },
        { href: "/mega-sena/resultados", label: "Resultados Anteriores", icon: List },
        { href: "/mega-sena/resumo-estatistico", label: "Resumo Estatístico", icon: BarChart3 },
        { href: "/mega-sena/gerador", label: "Gerador de Jogos", icon: Sparkles },
      ]
    },
    {
      title: "Informações",
      items: [
        { href: "/mega-sena/como-jogar", label: "Como Jogar", icon: Info },
        { href: "/mega-sena/premiacao", label: "Premiação", icon: Target },
        { href: "/mega-sena/perguntas-frequentes", label: "Perguntas Frequentes", icon: HelpCircle },
        { href: "/mega-sena/mega-da-virada", label: "Mega da Virada", icon: Gift },
      ]
    },
    {
      title: "Lotofácil",
      items: [
        { href: "/lotofacil", label: "Painel Principal", icon: Target },
        { href: "/lotofacil/resultado", label: "Último Resultado", icon: Dices },
        { href: "/lotofacil/resultados", label: "Resultados Anteriores", icon: List },
        { href: "/lotofacil/resumo-estatistico", label: "Resumo Estatístico", icon: BarChart3 },
        { href: "/lotofacil/gerador", label: "Gerador de Jogos", icon: Sparkles },
      ]
    },
    {
      title: "Lotofácil — Info",
      items: [
        { href: "/lotofacil/como-jogar", label: "Como Jogar", icon: Info },
        { href: "/lotofacil/premiacao", label: "Premiação", icon: Target },
        { href: "/lotofacil/perguntas-frequentes", label: "Perguntas Frequentes", icon: HelpCircle },
        { href: "/lotofacil/lotofacil-da-independencia", label: "Lotofácil da Independência", icon: Gift },
      ]
    },
    {
      title: "Quina",
      items: [
        { href: "/quina", label: "Painel Principal", icon: Target },
        { href: "/quina/resultado", label: "Último Resultado", icon: Dices },
        { href: "/quina/resultados", label: "Resultados Anteriores", icon: List },
        { href: "/quina/resumo-estatistico", label: "Resumo Estatístico", icon: BarChart3 },
        { href: "/quina/gerador", label: "Gerador de Jogos", icon: Sparkles },
      ]
    },
    {
      title: "Quina — Info",
      items: [
        { href: "/quina/como-jogar", label: "Como Jogar", icon: Info },
        { href: "/quina/premiacao", label: "Premiação", icon: Target },
        { href: "/quina/perguntas-frequentes", label: "Perguntas Frequentes", icon: HelpCircle },
        { href: "/quina/quina-de-sao-joao", label: "Quina de São João", icon: Gift },
      ]
    },
    {
      title: "Lotomania",
      items: [
        { href: "/lotomania", label: "Painel Principal", icon: Target },
        { href: "/lotomania/resultado", label: "Último Resultado", icon: Dices },
        { href: "/lotomania/resultados", label: "Resultados Anteriores", icon: List },
        { href: "/lotomania/resumo-estatistico", label: "Resumo Estatístico", icon: BarChart3 },
        { href: "/lotomania/gerador", label: "Gerador de Jogos", icon: Sparkles },
      ]
    },
    {
      title: "Lotomania — Info",
      items: [
        { href: "/lotomania/como-jogar", label: "Como Jogar", icon: Info },
        { href: "/lotomania/premiacao", label: "Premiação", icon: Target },
        { href: "/lotomania/perguntas-frequentes", label: "Perguntas Frequentes", icon: HelpCircle },
      ]
    },
    {
      title: "Timemania",
      items: [
        { href: "/timemania", label: "Painel Principal", icon: Target },
        { href: "/timemania/resultado", label: "Último Resultado", icon: Dices },
        { href: "/timemania/resultados", label: "Resultados Anteriores", icon: List },
        { href: "/timemania/resumo-estatistico", label: "Resumo Estatístico", icon: BarChart3 },
        { href: "/timemania/gerador", label: "Gerador de Jogos", icon: Sparkles },
      ]
    },
    {
      title: "Timemania — Info",
      items: [
        { href: "/timemania/como-jogar", label: "Como Jogar", icon: Info },
        { href: "/timemania/premiacao", label: "Premiação", icon: Target },
        { href: "/timemania/perguntas-frequentes", label: "Perguntas Frequentes", icon: HelpCircle },
      ]
    },
    {
      title: "Dia de Sorte",
      items: [
        { href: "/diadesorte", label: "Painel Principal", icon: Target },
        { href: "/diadesorte/resultado", label: "Último Resultado", icon: Dices },
        { href: "/diadesorte/resultados", label: "Resultados Anteriores", icon: List },
        { href: "/diadesorte/resumo-estatistico", label: "Resumo Estatístico", icon: BarChart3 },
        { href: "/diadesorte/gerador", label: "Gerador de Jogos", icon: Sparkles },
      ]
    },
    {
      title: "Dia de Sorte — Info",
      items: [
        { href: "/diadesorte/como-jogar", label: "Como Jogar", icon: Info },
        { href: "/diadesorte/premiacao", label: "Premiação", icon: Target },
        { href: "/diadesorte/perguntas-frequentes", label: "Perguntas Frequentes", icon: HelpCircle },
      ]
    },
    {
      title: "+Milionária",
      items: [
        { href: "/maismilionaria", label: "Painel Principal", icon: Target },
        { href: "/maismilionaria/resultado", label: "Último Resultado", icon: Dices },
        { href: "/maismilionaria/resultados", label: "Resultados Anteriores", icon: List },
        { href: "/maismilionaria/resumo-estatistico", label: "Resumo Estatístico", icon: BarChart3 },
        { href: "/maismilionaria/gerador", label: "Gerador de Jogos", icon: Sparkles },
      ]
    },
    {
      title: "+Milionária — Info",
      items: [
        { href: "/maismilionaria/como-jogar", label: "Como Jogar", icon: Info },
        { href: "/maismilionaria/premiacao", label: "Premiação", icon: Target },
        { href: "/maismilionaria/perguntas-frequentes", label: "Perguntas Frequentes", icon: HelpCircle },
      ]
    },
    {
      title: "Dupla Sena",
      items: [
        { href: "/duplasena", label: "Painel Principal", icon: Target },
        { href: "/duplasena/resultado", label: "Último Resultado", icon: Dices },
        { href: "/duplasena/resultados", label: "Resultados Anteriores", icon: List },
        { href: "/duplasena/resumo-estatistico", label: "Resumo Estatístico", icon: BarChart3 },
        { href: "/duplasena/gerador", label: "Gerador de Jogos", icon: Sparkles },
      ]
    },
    {
      title: "Dupla Sena — Info",
      items: [
        { href: "/duplasena/como-jogar", label: "Como Jogar", icon: Info },
        { href: "/duplasena/premiacao", label: "Premiação", icon: Target },
        { href: "/duplasena/perguntas-frequentes", label: "Perguntas Frequentes", icon: HelpCircle },
        { href: "/duplasena/dupla-de-pascoa", label: "Dupla de Páscoa", icon: Gift },
      ]
    },
    {
      title: "Super Sete",
      items: [
        { href: "/super-sete", label: "Painel Principal", icon: Target },
        { href: "/super-sete/resultado", label: "Último Resultado", icon: Dices },
        { href: "/super-sete/resultados", label: "Resultados Anteriores", icon: List },
        { href: "/super-sete/resumo-estatistico", label: "Resumo Estatístico", icon: BarChart3 },
        { href: "/super-sete/gerador", label: "Gerador de Jogos", icon: Sparkles },
      ]
    },
    {
      title: "Super Sete — Info",
      items: [
        { href: "/super-sete/como-jogar", label: "Como Jogar", icon: Info },
        { href: "/super-sete/premiacao", label: "Premiação", icon: Target },
        { href: "/super-sete/perguntas-frequentes", label: "Perguntas Frequentes", icon: HelpCircle },
      ]
    }
  ];

  return (
    <div className="w-64 border-r border-border bg-sidebar h-full flex flex-col hidden md:flex shrink-0">
      <div className="p-6 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">EL</div>
          <span className="font-bold text-lg text-sidebar-foreground tracking-tight">Estude Loterias</span>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {navItems.map((section, idx) => (
          <div key={idx}>
            {section.title && (
              <h4 className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-3 px-2">
                {section.title}
              </h4>
            )}
            <div className="space-y-1">
              {(section.items || [section]).map((item) => {
                const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                      isActive 
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
