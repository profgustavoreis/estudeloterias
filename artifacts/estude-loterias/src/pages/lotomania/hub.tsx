import { useGetLotomaniaUltimoResultado } from "@workspace/api-client-react";
import { ConcursoNavigator } from "@/components/ui/ConcursoNavigator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDateShort } from "@/lib/formatters";
import { LotteryBall } from "@/components/ui/lottery-ball";
import { Skeleton } from "@/components/ui/skeleton";
import { AdUnit } from "@/components/ui/AdUnit";
import { Link } from "wouter";
import { BarChart3, BookOpen, ClipboardCheck, Dices, FlaskConical, HelpCircle, List, Sparkles, Table as TableIcon, Target, Trophy, Wallet } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";

const COR = "#f8901c";

export default function LotomaniaHub() {
  const { data: resultado, isLoading } = useGetLotomaniaUltimoResultado();

  const quickLinks = [
    { href: `/lotomania/resultado/${resultado?.concurso ?? ""}`, label: "Último Resultado", icon: Dices, desc: "Detalhes do último sorteio" },
    { href: "/lotomania/resultados", label: "Resultados Anteriores", icon: List, desc: "Busque por sorteios passados" },
    { href: "/lotomania/resumo-estatistico", label: "Resumo Estatístico", icon: BarChart3, desc: "Frequência de dezenas e atrasos" },
    { href: "/lotomania/tabela-de-dezenas", label: "Tabela de Dezenas", icon: TableIcon, desc: "Ranking detalhado de todas as dezenas" },
    { href: "/lotomania/gerador", label: "Gerador de Jogos", icon: Sparkles, desc: "Gere jogos inteligentes" },
    { href: "/lotomania/simulador", label: "Simulador Histórico", icon: FlaskConical, desc: "Confira sua aposta no histórico" },
    { href: "/lotomania/conferidor", label: "Conferidor de Apostas", icon: ClipboardCheck, desc: "Verifique se sua aposta ganhou" },
    { href: "/lotomania/como-jogar", label: "Como Jogar", icon: BookOpen, desc: "Regras e formas de apostar" },
    { href: "/lotomania/premiacao", label: "Premiação", icon: Trophy, desc: "Faixas e percentuais de prêmio" },
    { href: "/lotomania/perguntas-frequentes", label: "Perguntas Frequentes", icon: HelpCircle, desc: "Dúvidas comuns respondidas" },
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
      <PageSEO
        title="Lotomania — Resultados, Estatísticas e Ferramentas"
        description="Tudo sobre a Lotomania: último resultado, histórico de concursos, frequência das dezenas, gerador de apostas, simulador e muito mais."
        canonical="/lotomania"
      />
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: COR }}>
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: COR }}>Lotomania · Painel Principal</h1>
            <p className="text-muted-foreground mt-1">Marque 50 números entre 00 e 99 e concorra a prêmios em 7 faixas (20, 19, 18, 17, 16, 15 ou 0 acertos).</p>
          </div>
        </div>
        <ConcursoNavigator
          concurso={resultado.concurso}
          isLatest={true}
          latestConcurso={resultado.concurso}
          basePath="/lotomania/resultado"
          color={COR}
          simple
        />
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
              <Link href={`/lotomania/resultado/${resultado.concurso}`}>
                <span className="text-sm font-semibold" style={{ color: COR }}>Ver detalhes →</span>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Dezenas */}
            <div className="flex justify-center flex-wrap gap-1.5 py-6 bg-muted/30 rounded-xl border border-border/50">
              {resultado.dezenas.map((num, i) => (
                <LotteryBall key={i} number={num} size="md" color={COR} />
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
        <AdUnit slot="7788990011" format="rectangle" className="w-full" />

        {/* ── Rateio dos Prêmios ── */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Rateio dos Prêmios
            </CardTitle>
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
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Arrecadação Total</div>
              <div className="text-2xl font-bold">{formatCurrency(resultado.arrecadacaoTotal)}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Como funciona</div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A Lotomania não possui sorteio especial. Marque 50 números dentre os 100 disponíveis (00 a 99)
                e concorra a prêmios acertando 20, 19, 18, 17, 16, 15 ou nenhum número.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Acesso Rápido ── */}
      <div>
        <h2 className="text-xl font-bold mb-4">Acesso Rápido</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href}>
                <Card className="hover:bg-muted/30 transition-colors cursor-pointer h-full" style={{ ["--hover-border" as string]: COR }}>
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className="p-3 rounded-lg" style={{ backgroundColor: COR + "20", color: COR }}>
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