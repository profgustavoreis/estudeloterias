import { useState } from "react";
import { Link } from "wouter";
import { useGetTimemaniaEstatisticas, useGetTimemaniaResumo } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LotteryBall } from "@/components/ui/lottery-ball";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from "recharts";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AdUnit } from "@/components/ui/AdUnit";
import { cn } from "@/lib/utils";
import { BarChart3 } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";

const COR = "#049645";
const BALL_BG = "#FFF600";
const BALL_TEXT = "#049645";

function DezBadge({ n, active }: { n: number; active?: boolean }) {
  return (
    <span className={cn(
      "inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold",
      active ? "text-white" : "bg-muted text-muted-foreground",
    )} style={active ? { backgroundColor: COR } : {}}>
      {String(n).padStart(2, "0")}
    </span>
  );
}

function CardSkeleton({ h = 200 }: { h?: number }) {
  return (
    <Card>
      <CardContent className="p-6">
        <Skeleton className="h-4 w-1/3 mb-4" />
        <Skeleton style={{ height: h }} className="w-full" />
      </CardContent>
    </Card>
  );
}

export default function TimemaniaEstatisticas() {
  const { data: stats, isLoading, isError } = useGetTimemaniaEstatisticas();
  const { data: resumo } = useGetTimemaniaResumo();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: COR }}>Timemania · Resumo Estatístico</h1>
        <Card><CardContent className="flex items-center justify-center py-16 text-muted-foreground">Erro ao carregar estatísticas.</CardContent></Card>
      </div>
    );
  }

  const top10 = stats.frequenciaDezenas.slice(0, 10);
  const bottom10 = stats.frequenciaDezenas.slice(-10).reverse();
  const barData = top10.map(d => ({ dezena: d.dezena, freq: d.frequencia }));
  const paresImparesData = stats.paresImpares.filter(d => d.sorteios > 0);
  const parChart = paresImparesData.map(d => ({ label: `${d.pares}P/${d.impares}I`, sorteios: d.sorteios }));

  return (
    <div className="space-y-8">
      <PageSEO
        title="Resumo Estatístico da Timemania"
        description="Análise estatística completa da Timemania: frequência das dezenas, pares/ímpares, soma, números primos, Fibonacci, triangulares e ranking dos times."
        canonical="/timemania/resumo-estatistico"
      />
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: COR }}>
          <BarChart3 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: COR }}>Timemania · Resumo Estatístico</h1>
          <p className="text-muted-foreground mt-1">Frequência, atrasos e padrões dos números da Timemania.</p>
        </div>
      </div>

      {resumo && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total de Concursos</div>
              <div className="text-2xl font-bold mt-1" style={{ color: COR }}>{resumo.totalConcursos}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Maior Prêmio</div>
              <div className="text-lg font-bold mt-1" style={{ color: COR }}>R$ {(resumo.maiorPremio / 1_000_000).toFixed(1)}M</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ganhadores 7 acertos</div>
              <div className="text-2xl font-bold mt-1" style={{ color: COR }}>{resumo.totalGanhadores7}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Acumulados</div>
              <div className="text-2xl font-bold mt-1" style={{ color: COR }}>{stats.percentualAcumulado}%</div>
            </CardContent>
          </Card>
        </div>
      )}

      <AdUnit slot="9988776633" format="horizontal" className="w-full" />

      {/* Top 10 mais frequentes */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Dezenas Mais Frequentes</CardTitle>
          <CardDescription>As dezenas que mais apareceram em {stats.totalConcursos} concursos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
                <XAxis dataKey="dezena" tick={{ fontSize: 12 }} />
                <YAxis hide />
                <Tooltip />
                <Bar dataKey="freq" fill={COR} radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="freq" position="top" style={{ fontSize: 11, fill: COR }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-1 mt-4 justify-center">
            {top10.map(d => <DezBadge key={d.dezena} n={parseInt(d.dezena)} active />)}
          </div>
        </CardContent>
      </Card>

      {/* Pares e Ímpares */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Pares e Ímpares</CardTitle>
          <CardDescription>Quantos números pares e ímpares costumam ser sorteados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={parChart} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis hide />
                <Tooltip />
                <Bar dataKey="sorteios" fill={COR} radius={[4, 4, 0, 0]}>
                  <LabelList dataKey="sorteios" position="top" style={{ fontSize: 11, fill: COR }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Ranking de Times */}
      {stats.timesRanking && stats.timesRanking.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Times do Coração Mais Sorteados</CardTitle>
            <CardDescription>Ranking dos clubes que mais apareceram como Time do Coração</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead className="text-right">Sorteios</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.timesRanking.slice(0, 10).map((t, i) => (
                    <TableRow key={t.time}>
                      <TableCell className="font-bold text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="font-medium">{t.time}</TableCell>
                      <TableCell className="text-right font-bold" style={{ color: COR }}>{t.sorteios}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <AdUnit slot="9988776644" format="horizontal" className="w-full" />

      {/* Números Especiais Accordion */}
      <Accordion type="single" collapsible className="w-full">
        {stats.numerosEspeciais.map((item) => (
          <AccordionItem key={item.tipo} value={item.tipo}>
            <AccordionTrigger className="text-lg font-semibold">
              Números {item.label} na Timemania
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Existem {item.quantidadeNaFaixa} números {item.label.toLowerCase()} entre 01 e 80.
                Média de {item.media} {item.label.toLowerCase()} por sorteio.
              </p>
              <div className="flex flex-wrap gap-1">
                {item.dezenas.map(n => <DezBadge key={n} n={n} />)}
              </div>
              <div className="rounded-md border mt-4">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="text-center">Qtd. {item.label}</TableHead>
                      <TableHead className="text-right">Sorteios</TableHead>
                      <TableHead className="text-right">%</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {item.distribuicao.filter(d => d.sorteios > 0).map(d => (
                      <TableRow key={d.count}>
                        <TableCell className="text-center font-bold">{d.count}</TableCell>
                        <TableCell className="text-right font-mono">{d.sorteios}</TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {stats.totalConcursos > 0 ? ((d.sorteios / stats.totalConcursos) * 100).toFixed(1) : "0.0"}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Soma das Dezenas */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição da Soma das Dezenas</CardTitle>
          <CardDescription>
            {stats.somaDezenas.menor && <>Menor soma: {stats.somaDezenas.menor.valor} (concurso {stats.somaDezenas.menor.concurso})</>}
            {stats.somaDezenas.maior && <> · Maior soma: {stats.somaDezenas.maior.valor} (concurso {stats.somaDezenas.maior.concurso})</>}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Intervalo</TableHead>
                  <TableHead className="text-right">Sorteios</TableHead>
                  <TableHead className="text-right">%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.somaDezenas.intervalos.map(d => (
                  <TableRow key={d.faixa}>
                    <TableCell className="font-medium">{d.faixa}</TableCell>
                    <TableCell className="text-right font-mono">{d.sorteios}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {stats.totalConcursos > 0 ? ((d.sorteios / stats.totalConcursos) * 100).toFixed(1) : "0.0"}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
