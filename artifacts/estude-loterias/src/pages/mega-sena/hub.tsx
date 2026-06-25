import { useGetMegaSenaUltimoResultado } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDateShort } from "@/lib/formatters";
import { LotteryBall } from "@/components/ui/lottery-ball";
import { Skeleton } from "@/components/ui/skeleton";
import { AdUnit } from "@/components/ui/AdUnit";
import { Link } from "wouter";
import { BarChart3, Dices, FlaskConical, Gift, List, Sparkles, Target, Trophy, Wallet, TrendingUp, PartyPopper } from "lucide-react";

const COR = "#009640";

export default function MegaSenaHub() {
  const { data: resultado, isLoading } = useGetMegaSenaUltimoResultado();

  const quickLinks = [
    { href: `/mega-sena/resultado/${resultado?.concurso ?? ""}`, label: "Último Resultado", icon: Dices, desc: "Detalhes do último sorteio" },
    { href: "/mega-sena/resultados", label: "Resultados Anteriores", icon: List, desc: "Busque por sorteios passados" },
    { href: "/mega-sena/estatisticas", label: "Estatísticas", icon: BarChart3, desc: "Frequência de dezenas e atrasos" },
    { href: "/mega-sena/gerador", label: "Gerador de Jogos", icon: Sparkles, desc: "Gere jogos inteligentes" },
    { href: "/mega-sena/simulador", label: "Simulador", icon: FlaskConical, desc: "Confira sua aposta no histórico" },
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
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

        {/* ── Card principal: dezenas ── */}
        <Card className="lg:col-span-2 border-t-4" style={{ borderTopColor: COR }}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Último Sorteio</CardTitle>
                <CardDescription>Concurso {resultado.concurso} • {formatDateShort(resultado.data)}</CardDescription>
              </div>
              <Link href={`/mega-sena/resultado/${resultado.concurso}`}>
                <span className="text-sm font-semibold" style={{ color: COR }}>Ver detalhes →</span>
              </Link>
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
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Prêmio Principal
                </div>
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

        {/* ── Publicidade ── */}
        <AdUnit slot="5566778899" format="rectangle" className="w-full" />

        {/* ── Rateio dos Prêmios ── */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Rateio dos Prêmios
            </CardTitle>
            <CardDescription>Concurso {resultado.concurso}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Faixa</TableHead>
                    <TableHead className="text-right">Ganhadores</TableHead>
                    <TableHead className="text-right">Valor do Prêmio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resultado.premios.map((premio) => (
                    <TableRow key={premio.faixa}>
                      <TableCell className="font-medium">{premio.descricao}</TableCell>
                      <TableCell className="text-right">
                        {premio.ganhadores === 0
                          ? <span className="text-muted-foreground">—</span>
                          : premio.ganhadores.toLocaleString("pt-BR")}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {premio.ganhadores === 0
                          ? <span className="text-muted-foreground">—</span>
                          : formatCurrency(premio.valorPremio)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* ── Dados do Sorteio ── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              Dados do Sorteio
            </CardTitle>
            <CardDescription>Concurso {resultado.concurso}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Arrecadação Total</div>
              <div className="text-2xl font-bold">{formatCurrency(resultado.arrecadacaoTotal)}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Acumulado para o próximo concurso de final 0 ou 5
                </div>
              </div>
              <div className="text-lg font-semibold" style={{ color: COR }}>
                {formatCurrency(resultado.valorAcumuladoConcurso_0_5)}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                <div className="flex items-center gap-1">
                  <PartyPopper className="w-3 h-3" />
                  Acumulado para a Mega da Virada
                </div>
              </div>
              <div className="text-lg font-semibold" style={{ color: COR }}>
                {formatCurrency(resultado.valorAcumuladoConcursoEspecial)}
              </div>
            </div>
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
