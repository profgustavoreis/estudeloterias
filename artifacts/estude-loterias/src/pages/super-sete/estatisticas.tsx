import { useState } from "react";
import { Link } from "wouter";
import { useGetSuperSeteEstatisticas } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { LotteryBall } from "@/components/ui/lottery-ball";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList,
} from "recharts";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { AdUnit } from "@/components/ui/AdUnit";
import { cn } from "@/lib/utils";
import { BarChart3 } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";

const COR = "#a8cf45";
const BALL_BG = "#a8cf45";
const BALL_TEXT = "#ffffff";

// ── Dígito badge (0-9) ───────────────────────────────────────────────────────
function DezBadge({ n, active }: { n: number; active?: boolean }) {
  return (
    <span className={cn(
      "inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold",
      active ? "text-white" : "bg-muted text-muted-foreground",
    )} style={active ? { backgroundColor: COR } : {}}>
      {n}
    </span>
  );
}

// ── Skeleton card ─────────────────────────────────────────────────────────────
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

// ── Compact data table below chart ───────────────────────────────────────────
function CompactTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: (string | number | React.ReactNode)[][];
}) {
  const lastIdx = headers.length - 1;
  return (
    <div className="mt-4 overflow-x-auto">
      <Table className="text-xs w-full">
        <TableHeader>
          <TableRow className="border-b">
            {headers.map((h, idx) => (
              <TableHead
                key={h}
                className={cn(
                  "py-1.5 text-xs h-auto font-semibold",
                  idx === 0 ? "text-center" : idx === lastIdx ? "text-right" : "text-center",
                )}
              >
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={i} className="border-b odd:bg-muted/40">
              {row.map((cell, j) => (
                <TableCell
                  key={j}
                  className={cn(
                    "py-1.5 text-xs",
                    j === 0 ? "text-center" : j === row.length - 1 ? "text-right" : "text-center",
                  )}
                >
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          ))}
          <TableRow className="border-b">
            {headers.map((_, j) => (
              <TableCell key={j} className="py-0.5"> </TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}

// ── Link helper ───────────────────────────────────────────────────────────────
function ConcursoLink({ concurso }: { concurso: number | null }) {
  if (!concurso) return <span className="text-muted-foreground">–</span>;
  return (
    <Link
      href={`/super-sete/resultado/${concurso}`}
      className="font-semibold hover:underline whitespace-nowrap"
      style={{ color: COR }}
    >
      Concurso {concurso} →
    </Link>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SuperSeteEstatisticas() {
  const { data: stats, isLoading, isError } = useGetSuperSeteEstatisticas();
  const [tabEspecial, setTabEspecial] = useState(0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <CardSkeleton h={320} />
          <CardSkeleton h={320} />
          <CardSkeleton h={320} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CardSkeleton h={260} />
          <CardSkeleton h={260} />
        </div>
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: COR }}>Super Sete · Resumo Estatístico</h1>
        <Card>
          <CardContent className="flex items-center justify-center py-16 text-muted-foreground">
            Erro ao carregar estatísticas. Tente novamente.
          </CardContent>
        </Card>
      </div>
    );
  }

  // Section 1 — top 10 per card
  const maisSorteados = [...stats.frequenciaDezenas].sort((a, b) => b.frequencia - a.frequencia).slice(0, 10);
  const menosSorteados = [...stats.frequenciaDezenas].sort((a, b) => a.frequencia - b.frequencia).slice(0, 10);
  const maisAtrasados  = [...stats.frequenciaDezenas].sort((a, b) => b.atraso - a.atraso).slice(0, 10);

  // Section 2 — totals
  const totalSorteios = stats.paresImpares.reduce((a, b) => a + b.sorteios, 0);
  const totalUnicos   = stats.digitosUnicos.reduce((a, b) => a + b.sorteios, 0);
  const totalSoma     = stats.somaDezenas.intervalos.reduce((a, b) => a + b.sorteios, 0);

  // Section 4 — especiais
  const especial    = stats.numerosEspeciais[tabEspecial];
  const especialSet = new Set(especial?.dezenas ?? []);
  const totalEspecial = especial ? especial.distribuicao.reduce((a, d) => a + d.sorteios, 0) : 0;

  return (
    <div className="space-y-8">
      <PageSEO
        title="Resumo Estatístico da Super Sete — Frequência e Análise dos Números"
        description="Análise estatística completa da Super Sete: números mais e menos sorteados por posição, pares, somas, números especiais e muito mais baseado em todo o histórico de concursos."
        canonical="/super-sete/resumo-estatistico"
      />

      {/* ── Header ── */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: COR }}>
          <BarChart3 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: COR }}>Super Sete · Resumo Estatístico</h1>
          <p className="text-muted-foreground mt-1">
            Análise completa de {stats.totalConcursos.toLocaleString("pt-BR")} concursos realizados.
          </p>
        </div>
      </div>

      <AdUnit slot="1122334455" format="horizontal" className="w-full" />

      {/* ── Seção 1: Frequência de Dígitos por Posição ── */}
      <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Frequência de Números por Posição
          </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Mais Sorteados */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Números Mais Sorteados</CardTitle>
              <CardDescription>Os 10 números com maior frequência histórica</CardDescription>
            </CardHeader>
            <CardContent>
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left">Posição</TableHead>
                    <TableHead className="text-center">Número</TableHead>
                    <TableHead className="text-center">Frequência</TableHead>
                    <TableHead className="text-right">Última vez</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {maisSorteados.map((item, i) => (
                    <TableRow key={`${item.posicao}-${item.digito}`} className="odd:bg-muted/40">
                      <TableCell className="text-left">
                        <span className="text-muted-foreground font-mono text-xs">{i + 1}º P{item.posicao}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <LotteryBall number={item.digito} size="sm" color={BALL_BG} textColor={BALL_TEXT} padDigits={1} />
                      </TableCell>
                      <TableCell className="text-center font-medium tabular-nums">
                        {item.frequencia.toLocaleString("pt-BR")} vezes
                      </TableCell>
                      <TableCell className="text-right">
                        <ConcursoLink concurso={item.ultimoConcurso ?? null} />
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="border-b">
                    <TableCell className="py-0.5"> </TableCell>
                    <TableCell className="py-0.5"> </TableCell>
                    <TableCell className="py-0.5"> </TableCell>
                    <TableCell className="py-0.5"> </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <div className="mt-3 flex justify-end">
                <Link href="/super-sete/tabela-de-dezenas?tab=mais" className="text-sm font-semibold hover:underline" style={{ color: COR }}>
                  Ver todas →
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Menos Sorteados */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Números Menos Sorteados</CardTitle>
              <CardDescription>Os 10 números com menor frequência histórica</CardDescription>
            </CardHeader>
            <CardContent>
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left">Posição</TableHead>
                    <TableHead className="text-center">Número</TableHead>
                    <TableHead className="text-center">Frequência</TableHead>
                    <TableHead className="text-right">Última vez</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {menosSorteados.map((item, i) => (
                    <TableRow key={`${item.posicao}-${item.digito}`} className="odd:bg-muted/40">
                      <TableCell className="text-left">
                        <span className="text-muted-foreground font-mono text-xs">{i + 1}º P{item.posicao}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <LotteryBall number={item.digito} size="sm" className="bg-muted text-muted-foreground" padDigits={1} />
                      </TableCell>
                      <TableCell className="text-center font-medium tabular-nums">
                        {item.frequencia.toLocaleString("pt-BR")} vezes
                      </TableCell>
                      <TableCell className="text-right">
                        <ConcursoLink concurso={item.ultimoConcurso ?? null} />
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="border-b">
                    <TableCell className="py-0.5"> </TableCell>
                    <TableCell className="py-0.5"> </TableCell>
                    <TableCell className="py-0.5"> </TableCell>
                    <TableCell className="py-0.5"> </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <div className="mt-3 flex justify-end">
                <Link href="/super-sete/tabela-de-dezenas?tab=menos" className="text-sm font-semibold hover:underline" style={{ color: COR }}>
                  Ver todas →
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Mais Atrasados */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Números Mais Atrasados</CardTitle>
              <CardDescription>Números que faz tempo que não saem!</CardDescription>
            </CardHeader>
            <CardContent>
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left">Posição</TableHead>
                    <TableHead className="text-center">Número</TableHead>
                    <TableHead className="text-center">Atraso</TableHead>
                    <TableHead className="text-right">Última vez</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {maisAtrasados.map((item, i) => (
                    <TableRow key={`${item.posicao}-${item.digito}`} className="odd:bg-muted/40">
                      <TableCell className="text-left">
                        <span className="text-muted-foreground font-mono text-xs">{i + 1}º P{item.posicao}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <LotteryBall number={item.digito} size="sm" className="bg-amber-100 text-amber-800 border border-amber-200" padDigits={1} />
                      </TableCell>
                      <TableCell className="text-center font-medium tabular-nums text-amber-600">
                        {item.atraso} sorteios
                      </TableCell>
                      <TableCell className="text-right">
                        <ConcursoLink concurso={item.ultimoConcurso ?? null} />
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="border-b">
                    <TableCell className="py-0.5"> </TableCell>
                    <TableCell className="py-0.5"> </TableCell>
                    <TableCell className="py-0.5"> </TableCell>
                    <TableCell className="py-0.5"> </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <div className="mt-3 flex justify-end">
                <Link href="/super-sete/tabela-de-dezenas?tab=atrasadas" className="text-sm font-semibold hover:underline" style={{ color: COR }}>
                  Ver todas →
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ── Seção 2: Distribuição por Concurso ── */}
      <section className="space-y-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Distribuição por Concurso
        </h2>

        {/* Row 1: Pares × Ímpares | Dígitos Únicos × Repetidos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Pares × Ímpares */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Números Pares × Ímpares</CardTitle>
              <CardDescription>
                Como os números pares e ímpares se distribuem ao longo dos sorteios?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.paresImpares} margin={{ top: 22, right: 8, left: -20, bottom: 0 }}>
                    <XAxis
                      dataKey="pares"
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `${v}P/${7 - v}I`}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                    <Tooltip
                      cursor={{ fill: "rgba(0,0,0,0.04)" }}
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0].payload as { pares: number; impares: number; sorteios: number };
                        return (
                          <div className="bg-card border rounded shadow-md px-3 py-2 text-sm">
                            <p className="font-semibold mb-0.5">
                              {d.pares} par{d.pares !== 1 ? "es" : ""} / {d.impares} impar{d.impares !== 1 ? "es" : ""}
                            </p>
                            <p className="text-muted-foreground">{d.sorteios.toLocaleString("pt-BR")} concursos</p>
                            {totalSorteios > 0 && (
                              <p className="text-muted-foreground">
                                {((d.sorteios / totalSorteios) * 100).toFixed(1)}% do total
                              </p>
                            )}
                          </div>
                        );
                      }}
                    />
                    <Bar dataKey="sorteios" fill={COR} radius={[4, 4, 0, 0]}>
                      <LabelList dataKey="sorteios" position="top" style={{ fontSize: 13, fontWeight: "bold", fill: "#333" }} formatter={(v: number) => v.toLocaleString("pt-BR")} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <CompactTable
                headers={["Pares", "Ímpares", "Concursos", "%", "Última vez"]}
                rows={stats.paresImpares
                  .filter(d => d.sorteios > 0)
                  .map(d => [
                    d.pares,
                    d.impares,
                    d.sorteios.toLocaleString("pt-BR"),
                    totalSorteios > 0
                      ? `${((d.sorteios / totalSorteios) * 100).toFixed(1)}%`
                      : "–",
                    <ConcursoLink key="link" concurso={d.ultimoConcurso ?? null} />,
                  ])}
              />
            </CardContent>
          </Card>

          {/* Dígitos Únicos × Repetidos */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Números Únicos × Repetidos</CardTitle>
              <CardDescription>
                Quantos números distintos apareceram em cada sorteio (1 = todos repetidos, 7 = todos diferentes)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.digitosUnicos} margin={{ top: 22, right: 8, left: -20, bottom: 0 }}>
                    <XAxis
                      dataKey="count"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => `${v}`}
                    />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                    <Tooltip
                      cursor={{ fill: "rgba(0,0,0,0.04)" }}
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0].payload as { count: number; sorteios: number };
                        return (
                          <div className="bg-card border rounded shadow-md px-3 py-2 text-sm">
                            <p className="font-semibold mb-0.5">{d.count} número{d.count !== 1 ? "s" : ""} único{d.count !== 1 ? "s" : ""}</p>
                            <p className="text-muted-foreground">{d.sorteios.toLocaleString("pt-BR")} concursos</p>
                            {totalUnicos > 0 && (
                              <p className="text-muted-foreground">
                                {((d.sorteios / totalUnicos) * 100).toFixed(1)}% do total
                              </p>
                            )}
                          </div>
                        );
                      }}
                    />
                    <Bar dataKey="sorteios" fill={COR} radius={[4, 4, 0, 0]}>
                      <LabelList dataKey="sorteios" position="top" style={{ fontSize: 13, fontWeight: "bold", fill: "#333" }} formatter={(v: number) => v.toLocaleString("pt-BR")} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <CompactTable
                headers={["Números Únicos", "Concursos", "%", "Última vez"]}
                rows={stats.digitosUnicos.map(d => [
                  d.count,
                  d.sorteios.toLocaleString("pt-BR"),
                  totalUnicos > 0
                    ? `${((d.sorteios / totalUnicos) * 100).toFixed(1)}%`
                    : "–",
                  <ConcursoLink key="link" concurso={d.ultimoConcurso ?? null} />,
                ])}
              />

              <Accordion type="single" collapsible className="mt-2 border rounded-md px-3 bg-muted/20">
                <AccordionItem value="digitos-unicos" className="border-b-0">
                  <AccordionTrigger className="text-xs font-medium py-2 text-muted-foreground hover:text-foreground hover:no-underline">
                    O que são números únicos e repetidos?
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p>
                        <span className="font-semibold text-foreground">Números únicos</span> é a quantidade de
                        números distintos sorteados em um mesmo concurso. Como a Super Sete tem 7 posições e cada
                        posição sorteia um número de 0 a 9, o número de números únicos varia de 1 (todos os 7
                        números repetidos) a 7 (todos os números diferentes).
                      </p>
                      <p>
                        <span className="font-semibold text-foreground">Exemplo:</span> se o sorteio foi
                        {" "}<span className="font-mono">1 2 3 4 5 6 7</span>, há 7 números únicos. Se foi
                        {" "}<span className="font-mono">5 5 5 5 5 5 5</span>, há apenas 1 número único.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>

        {/* Row 2: Soma dos Dígitos | Publicidade */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Soma dos Dígitos — horizontal bars */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Soma dos Números</CardTitle>
              <CardDescription>
                {stats.somaDezenas.menor && stats.somaDezenas.maior ? (
                  <>
                    Menor:{" "}
                    {stats.somaDezenas.menor.valor}{" "}
                    (<ConcursoLink concurso={stats.somaDezenas.menor.concurso ?? null} />)
                    {" "}•{" "}
                    Maior:{" "}
                    {stats.somaDezenas.maior.valor}{" "}
                    (<ConcursoLink concurso={stats.somaDezenas.maior.concurso ?? null} />)
                  </>
                ) : "Histograma de somas por sorteio"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.somaDezenas.intervalos.map((d) => ({ ...d, _display: Math.max(d.sorteios, 1) }))}
                    layout="vertical"
                    margin={{ top: 4, right: 52, left: 4, bottom: 0 }}
                  >
                    <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                    <YAxis
                      type="category"
                      dataKey="faixa"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11 }}
                      width={72}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(0,0,0,0.04)" }}
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0].payload as { faixa: string; sorteios: number };
                        return (
                          <div className="bg-card border rounded shadow-md px-3 py-2 text-sm">
                            <p className="font-semibold mb-0.5">Soma de {d.faixa.replace("\u2013", " a ").replace("-", " a ")}</p>
                            <p className="text-muted-foreground">{d.sorteios.toLocaleString("pt-BR")} concursos</p>
                            {totalSoma > 0 && (
                              <p className="text-muted-foreground">
                                {((d.sorteios / totalSoma) * 100).toFixed(1)}%
                              </p>
                            )}
                          </div>
                        );
                      }}
                    />
                    <Bar dataKey="_display" fill={COR} radius={[0, 3, 3, 0]}>
                      <LabelList dataKey="sorteios" position="right" style={{ fontSize: 13, fill: "#333", fontWeight: "bold" }} formatter={(v: number) => v.toLocaleString("pt-BR")} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <CompactTable
                headers={["Soma", "Concursos", "%", "Última vez"]}
                rows={stats.somaDezenas.intervalos.map(d => [
                  d.faixa.replace("\u2013", " a ").replace("-", " a "),
                  d.sorteios.toLocaleString("pt-BR"),
                  totalSoma > 0
                    ? `${((d.sorteios / totalSoma) * 100).toFixed(1)}%`
                    : "–",
                  <ConcursoLink key="link" concurso={d.ultimoConcurso ?? null} />,
                ])}
              />
            </CardContent>
          </Card>

          {/* Publicidade */}
          <div className="flex flex-col gap-4">
            <AdUnit slot="6677889900" format="rectangle" className="w-full" />
          </div>
        </div>
      </section>

      {/* ── Seção 3: Distribuição por Posição ── */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Distribuição por Posição
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {stats.distribuicaoPorPosicao.map((pos, idx) => {
            const sorted = [...pos.distribuicao].sort((a, b) => b.sorteios - a.sorteios);
            const top3 = sorted.slice(0, 3);
            const low3 = [...pos.distribuicao].sort((a, b) => a.sorteios - b.sorteios).slice(0, 3);
            const totalPos = pos.distribuicao.reduce((a, b) => a + b.sorteios, 0);
            const isLast = idx === stats.distribuicaoPorPosicao.length - 1;
            return (
              <div key={pos.posicao} className={isLast ? "lg:col-span-2" : ""}>
                <Card className={isLast ? "max-w-2xl mx-auto" : ""}>
                  <CardHeader className="pb-3">
                    <CardTitle>Posição {pos.posicao}</CardTitle>
                    <CardDescription>
                      Frequência de cada número (0-9) na {pos.posicao}ª posição
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[180px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={pos.distribuicao} margin={{ top: 22, right: 8, left: -20, bottom: 0 }}>
                          <XAxis
                            dataKey="digito"
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 11 }}
                            tickFormatter={(v) => `${v}`}
                          />
                          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                          <Tooltip
                            cursor={{ fill: "rgba(0,0,0,0.04)" }}
                            content={({ active, payload }) => {
                              if (!active || !payload?.length) return null;
                              const d = payload[0].payload as { digito: number; sorteios: number };
                              return (
                                <div className="bg-card border rounded shadow-md px-3 py-2 text-sm">
                                  <p className="font-semibold mb-0.5">Número {d.digito}</p>
                                  <p className="text-muted-foreground">{d.sorteios.toLocaleString("pt-BR")} ocorrências</p>
                                  {totalPos > 0 && (
                                    <p className="text-muted-foreground">
                                      {((d.sorteios / totalPos) * 100).toFixed(1)}%
                                    </p>
                                  )}
                                </div>
                              );
                            }}
                          />
                          <Bar dataKey="sorteios" fill={COR} radius={[3, 3, 0, 0]}>
                            <LabelList dataKey="sorteios" position="top" style={{ fontSize: 13, fontWeight: "bold", fill: "#333" }} formatter={(v: number) => v.toLocaleString("pt-BR")} />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <CompactTable
                      headers={["Número", "Ocorrências", "%"]}
                      rows={[
                        ...top3.map(d => [
                          <LotteryBall key={`top-${d.digito}`} number={d.digito} size="sm" color={BALL_BG} textColor={BALL_TEXT} padDigits={1} />,
                          d.sorteios.toLocaleString("pt-BR"),
                          totalPos > 0 ? `${((d.sorteios / totalPos) * 100).toFixed(1)}%` : "–",
                        ]),
                        ...low3.map(d => [
                          <LotteryBall key={`low-${d.digito}`} number={d.digito} size="sm" className="bg-muted text-muted-foreground" padDigits={1} />,
                          d.sorteios.toLocaleString("pt-BR"),
                          totalPos > 0 ? `${((d.sorteios / totalPos) * 100).toFixed(1)}%` : "–",
                        ]),
                      ]}
                    />

                    <Accordion type="single" collapsible className="mt-2 border rounded-md px-3 bg-muted/20">
                      <AccordionItem value={`pos-${pos.posicao}`} className="border-b-0">
                        <AccordionTrigger className="text-xs font-medium py-2 text-muted-foreground hover:text-foreground hover:no-underline">
                          Ver todos os 10 números
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            {pos.distribuicao.map(d => (
                              <div key={d.digito} className="flex items-center justify-between">
                                <span>
                                  <span className="font-semibold text-foreground">Número {d.digito}:{" "}</span>
                                  {d.sorteios.toLocaleString("pt-BR")} vezes
                                </span>
                                <span>
                                  {totalPos > 0 ? `${((d.sorteios / totalPos) * 100).toFixed(1)}%` : "–"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Seção 4: Números Especiais ── */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Números Especiais
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-0">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <CardTitle>Sequências Matemáticas</CardTitle>
                    <CardDescription className="mt-1">
                      E mais uma vez fica provado que a Matemática é a melhor de todas!
                    </CardDescription>
                  </div>
                  <div className="flex gap-1 bg-muted rounded-lg p-1">
                    {stats.numerosEspeciais.map((item, i) => (
                      <button
                        key={item.tipo}
                        onClick={() => setTabEspecial(i)}
                        className={cn(
                          "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                          tabEspecial === i
                            ? "bg-background shadow text-foreground"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </CardHeader>

              {especial && (
                <CardContent className="pt-5 space-y-5">
                  <div className="flex flex-wrap gap-x-8 gap-y-1 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total: </span>
                      <span className="font-semibold">{especial.quantidadeNaFaixa} números entre 0 e 9</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Média de ocorrências por sorteio: </span>
                      <span className="font-semibold">
                        {especial.media.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {Array.from({ length: 10 }, (_, i) => i).map(n => (
                      <DezBadge key={n} n={n} active={especialSet.has(n)} />
                    ))}
                  </div>

                  {(() => {
                    const titleMap: Record<string, string> = {
                      primos:       "Distribuição da quantidade de números primos por sorteio",
                      fibonacci:    "Distribuição da quantidade de números de Fibonacci por sorteio",
                      triangulares: "Distribuição da quantidade de números triangulares por sorteio",
                    };
                    return (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">
                          {titleMap[especial.tipo] ?? especial.label}
                        </p>
                        <div className="h-[180px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={especial.distribuicao.filter(d => d.sorteios > 0)}
                              margin={{ top: 22, right: 8, left: -20, bottom: 0 }}
                            >
                              <XAxis
                                dataKey="count"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 11 }}
                                tickFormatter={(v) => `${v}`}
                              />
                              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                              <Tooltip
                                cursor={{ fill: "rgba(0,0,0,0.04)" }}
                                content={({ active, payload }) => {
                                  if (!active || !payload?.length) return null;
                                  const d = payload[0].payload as { count: number; sorteios: number };
                                  return (
                                    <div className="bg-card border rounded shadow-md px-3 py-2 text-sm">
                                      <p className="font-semibold mb-0.5">
                                        {d.count} {especial.label.toLowerCase()} no sorteio
                                      </p>
                                      <p className="text-muted-foreground">
                                        {d.sorteios.toLocaleString("pt-BR")} concursos
                                      </p>
                                      {totalEspecial > 0 && (
                                        <p className="text-muted-foreground">
                                          {((d.sorteios / totalEspecial) * 100).toFixed(1)}% do total
                                        </p>
                                      )}
                                    </div>
                                  );
                                }}
                              />
                              <Bar dataKey="sorteios" fill={COR} radius={[4, 4, 0, 0]}>
                                <LabelList dataKey="sorteios" position="top" style={{ fontSize: 13, fontWeight: "bold", fill: "#333" }} formatter={(v: number) => v.toLocaleString("pt-BR")} />
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>

                        <CompactTable
                          headers={[especial.label, "Concursos", "%", "Última vez"]}
                          rows={especial.distribuicao.map(d => [
                            d.count,
                            d.sorteios.toLocaleString("pt-BR"),
                            totalEspecial > 0
                              ? `${((d.sorteios / totalEspecial) * 100).toFixed(1)}%`
                              : "–",
                            <ConcursoLink key="link" concurso={d.ultimoConcurso ?? null} />,
                          ])}
                        />
                      </div>
                    );
                  })()}
                </CardContent>
              )}
            </Card>
          </div>
          <div className="flex flex-col gap-6">
            <AdUnit slot="5544332211" format="rectangle" className="w-full" />
          </div>
        </div>
      </section>
    </div>
  );
}