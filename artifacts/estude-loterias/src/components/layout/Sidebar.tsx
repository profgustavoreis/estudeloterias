import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Target, 
  BarChart3, 
  List, 
  CalendarDays, 
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
        { href: "/mega-sena/calendario", label: "Calendário", icon: CalendarDays },
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
