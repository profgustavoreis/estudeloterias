import { useGetMegaSenaUltimoResultado, useGetMegaSenaResumo } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { LotteryBall } from "@/components/ui/lottery-ball";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { BarChart3, CalendarDays, Dices, Gift, Info, List, Sparkles, Target } from "lucide-react";

export default function MegaSenaHub() {
  const { data: resultado, isLoading: loadingResultado } = useGetMegaSenaUltimoResultado();
  const { data: resumo, isLoading: loadingResumo } = useGetMegaSenaResumo();

  const loading = loadingResultado || loadingResumo;

  if (loading) {
    return <div>Loading...</div>; // TODO: better skeleton
  }

  if (!resultado || !resumo) {
    return <div>Error loading data.</div>;
  }

  const quickLinks = [
    { href: "/mega-sena/resultado", label: "Último Resultado", icon: Dices, desc: "Detalhes do último sorteio" },
    { href: "/mega-sena/resultados", label: "Resultados Anteriores", icon: List, desc: "Busque por sorteios passados" },
    { href: "/mega-sena/estatisticas", label: "Estatísticas", icon: BarChart3, desc: "Frequência de dezenas e atrasos" },
    { href: "/mega-sena/gerador", label: "Gerador de Jogos", icon: Sparkles, desc: "Gere jogos inteligentes" },
    { href: "/mega-sena/calendario", label: "Calendário", icon: CalendarDays, desc: "Datas dos próximos sorteios" },
    { href: "/mega-sena/mega-da-virada", label: "Mega da Virada", icon: Gift, desc: "Tudo sobre o sorteio especial" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-[#009640] flex items-center justify-center text-white">
          <Target className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#009640]">Mega-Sena</h1>
          <p className="text-muted-foreground mt-1">A principal loteria do Brasil.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-t-4 border-[#009640]">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Último Sorteio</CardTitle>
                <CardDescription>Concurso {resultado.concurso} • {formatDate(resultado.data)}</CardDescription>
              </div>
              {resultado.acumulado && (
                <div className="bg-destructive/10 text-destructive px-3 py-1 rounded-full text-sm font-semibold border border-destructive/20">
                  Acumulado
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex justify-center gap-3 sm:gap-4 py-8 bg-muted/30 rounded-xl border border-border/50">
              {resultado.dezenas.map((num, i) => (
                <LotteryBall key={i} number={num} size="lg" color="#009640" />
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg border border-border">
                <div className="text-sm text-muted-foreground mb-1">Prêmio Acumulado</div>
                <div className="text-2xl font-bold text-[#009640]">{formatCurrency(resultado.valorAcumulado)}</div>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg border border-border">
                <div className="text-sm text-muted-foreground mb-1">Próximo Sorteio ({formatDate(resultado.dataProximoConcurso)})</div>
                <div className="text-2xl font-bold">{formatCurrency(resultado.valorEstimadoProximoConcurso)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumo Estatístico</CardTitle>
            <CardDescription>Dados históricos desde 1996</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Total de Sorteios</span>
              <span className="font-mono font-medium">{resumo.totalConcursos}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Maior Prêmio Anual</span>
              <span className="font-medium text-[#009640]">{formatCurrency(resumo.maiorPremioAno)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Ganhadores da Sena</span>
              <span className="font-mono font-medium">{resumo.totalGanhadores6}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Ferramentas e Consultas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href}>
                <Card className="hover:border-[#009640]/50 hover:bg-muted/30 transition-colors cursor-pointer h-full">
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className="bg-[#009640]/10 p-3 rounded-lg text-[#009640]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-card-foreground">{link.label}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{link.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  );
}
