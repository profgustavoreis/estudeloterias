import { useGetMegaSenaUltimoResultado } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency, formatDateShort } from "@/lib/formatters";
import { LotteryBall } from "@/components/ui/lottery-ball";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { BarChart3, CalendarDays, Dices, Gift, List, Sparkles, Target } from "lucide-react";

const COR = "#009640";

export default function MegaSenaHub() {
  const { data: resultado, isLoading } = useGetMegaSenaUltimoResultado();

  const quickLinks = [
    { href: "/mega-sena/resultado", label: "Último Resultado", icon: Dices, desc: "Detalhes do último sorteio" },
    { href: "/mega-sena/resultados", label: "Resultados Anteriores", icon: List, desc: "Busque por sorteios passados" },
    { href: "/mega-sena/estatisticas", label: "Estatísticas", icon: BarChart3, desc: "Frequência de dezenas e atrasos" },
    { href: "/mega-sena/gerador", label: "Gerador de Jogos", icon: Sparkles, desc: "Gere jogos inteligentes" },
    { href: "/mega-sena/calendario", label: "Calendário", icon: CalendarDays, desc: "Datas dos próximos sorteios" },
    { href: "/mega-sena/mega-da-virada", label: "Mega da Virada", icon: Gift, desc: "Tudo sobre o sorteio especial" },
  ];

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Skeleton className="w-12 h-12 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!resultado) {
    return <div>Erro ao carregar dados.</div>;
  }

  const faixa1 = resultado.premios?.[0];
  const ganhadores1 = faixa1?.ganhadores ?? 0;
  const premio1 = faixa1?.valorPremio ?? 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: COR }}>
          <Target className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: COR }}>Mega-Sena</h1>
          <p className="text-muted-foreground mt-1">A principal loteria do Brasil.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Card principal: dezenas + rateio ── */}
        <Card className="lg:col-span-2 border-t-4" style={{ borderTopColor: COR }}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Último Sorteio</CardTitle>
                <CardDescription>Concurso {resultado.concurso} • {formatDateShort(resultado.data)}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Dezenas */}
            <div className="flex justify-center flex-wrap gap-3 py-6 bg-muted/30 rounded-xl border border-border/50">
              {resultado.dezenas.map((num, i) => (
                <LotteryBall key={i} number={num} size="lg" color={COR} />
              ))}
            </div>

            {/* Resultado + próximo sorteio */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Resultado */}
              <div className="p-4 bg-muted/50 rounded-lg border border-border">
                {resultado.acumulado ? (
                  <>
                    <div className="text-xs font-semibold text-destructive uppercase tracking-wider mb-1">Acumulou!</div>
                    <div className="text-2xl font-bold" style={{ color: COR }}>{formatCurrency(resultado.valorAcumulado)}</div>
                  </>
                ) : (
                  <>
                    <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: COR }}>
                      Saiu! ({ganhadores1} {ganhadores1 === 1 ? "acertador" : "acertadores"})
                    </div>
                    <div className="text-2xl font-bold">{formatCurrency(premio1)}</div>
                  </>
                )}
              </div>

              {/* Próximo sorteio */}
              <div className="p-4 bg-muted/50 rounded-lg border border-border">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Próximo Sorteio
                </div>
                <div className="text-sm text-muted-foreground mb-1">
                  Concurso {resultado.concurso + 1} • {formatDateShort(resultado.dataProximoConcurso)}
                </div>
                <div className="text-2xl font-bold">{formatCurrency(resultado.valorEstimadoProximoConcurso)}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">Prêmio Estimado</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Rateio dos Prêmios ── */}
        <Card>
          <CardHeader>
            <CardTitle>Rateio dos Prêmios</CardTitle>
            <CardDescription>Concurso {resultado.concurso}</CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-muted-foreground font-medium px-6 pb-2">Faixa</th>
                  <th className="text-center text-muted-foreground font-medium px-2 pb-2">Ganhadores</th>
                  <th className="text-right text-muted-foreground font-medium px-6 pb-2">Prêmio R$</th>
                </tr>
              </thead>
              <tbody>
                {resultado.premios.map((p) => (
                  <tr key={p.faixa} className="border-b border-border last:border-0">
                    <td className="px-6 py-3 text-left">{p.descricao}</td>
                    <td className="px-2 py-3 text-center font-mono">
                      {p.ganhadores === 0
                        ? <span className="text-muted-foreground">—</span>
                        : p.ganhadores.toLocaleString("pt-BR")}
                    </td>
                    <td className="px-6 py-3 text-right font-mono">
                      {p.ganhadores === 0
                        ? <span className="text-muted-foreground">—</span>
                        : formatCurrency(p.valorPremio)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* ── Ferramentas ── */}
      <div>
        <h2 className="text-xl font-bold mb-4">Ferramentas e Consultas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href}>
                <Card className="hover:border-[#009640]/50 hover:bg-muted/30 transition-colors cursor-pointer h-full">
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className="p-3 rounded-lg text-white" style={{ backgroundColor: COR + "20", color: COR }}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-card-foreground">{link.label}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{link.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
