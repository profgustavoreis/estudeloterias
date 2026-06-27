import { useState } from "react";
import { Link } from "wouter";
import { useGetMegaSenaEstatisticas } from "@workspace/api-client-react";
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

const COR = "#009640";

// ── Dezena badge ──────────────────────────────────────────────────────────────
function DezBadge({ n, active }: { n: number; active?: boolean }) {
  return (
    <span className={cn(
      "inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold",
      active ? "bg-[#009640] text-white" : "bg-muted text-muted-foreground",
    )}>
      {String(n).padStart(2, "0")}
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

// ── Main component ────────────────────────────────────────────────────────────
export default function MegaSenaEstatisticas() {
  const { data: stats, isLoading, isError } = useGetMegaSenaEstatisticas();
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
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: COR }}>Mega-Sena · Resumo Estatístico</h1>
        <Card>
          <CardContent className="flex items-center justify-center py-16 text-muted-foreground">
            Erro ao carregar estatísticas. Tente novamente.
          </CardContent>
        </Card>
      </div>
    );
  }

  const maisSorteadas = [...stats.frequenciaDezenas].sort((a, b) => b.frequencia - a.frequencia).slice(0, 10);
  const menosSorteadas = [...stats.frequenciaDezenas].sort((a, b) => a.frequencia - b.frequencia).slice(0, 10);
  const maisAtrasadas  = [...stats.frequenciaDezenas].sort((a, b) => b.atraso - a.atraso).slice(0, 10);

  const especial    = stats.numerosEspeciais[tabEspecial];
  const especialSet = new Set(especial?.dezenas ?? []);

  const totalSorteios = stats.paresImpares.reduce((a, b) => a + b.sorteios, 0);
  const totalPares    = stats.paresImpares.reduce((a, b) => a + b.pares * b.sorteios, 0);
  const mediaPares    = totalSorteios > 0 ? (totalPares / totalSorteios).toFixed(2) : "–";

  const MOLDURA_SET = new Set([
    ...Array.from({ length: 10 }, (_, i) => i + 1),
    ...Array.from({ length: 10 }, (_, i) => i + 51),
    11, 20, 21, 30, 31, 40, 41, 50,
  ]);
  const RETRATO_SET = new Set(
    Array.from({ length: 60 }, (_, i) => i + 1).filter(n => !MOLDURA_SET.has(n))
  );

  const totalFreqLinha   = stats.frequenciaPorLinha.reduce((a, b) => a + b.sorteios, 0);
  const totalFreqColuna  = stats.frequenciaPorColuna.reduce((a, b) => a + b.sorteios, 0);
  const totalSomaConcursos = stats.somaDezenas.intervalos.reduce((a, b) => a + b.sorteios, 0);

  return (
    <div className="space-y-8">
      <PageSEO
        title="Resumo Estatístico da Mega-Sena — Frequência e Análise das Dezenas"
        description="Análise estatística completa da Mega-Sena: dezenas mais e menos sorteadas, pares, sequências, somas e muito mais baseado em todo o histórico de concursos."
        canonical="/mega-sena/resumo-estatistico"
      />
      {/* ── Header ── */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: COR }}>
          <BarChart3 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: COR }}>Mega-Sena · Resumo Estatístico</h1>
          <p className="text-muted-foreground mt-1">
            Análise completa de {stats.totalConcursos.toLocaleString("pt-BR")} concursos realizados.
          </p>
        </div>
      </div>

      <AdUnit slot="1122334455" format="horizontal" className="w-full" />

      {/* ── Seção 1: Frequência de Dezenas ── */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Frequência de Dezenas
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Mais Sorteadas */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Dezenas Mais Sorteadas</CardTitle>
              <CardDescription>As 10 dezenas com maior frequência histórica</CardDescription>
            </CardHeader>
            <CardContent>
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left">Dezena</TableHead>
                    <TableHead className="text-center">Frequência</TableHead>
                    <TableHead className="text-right">Última vez</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {maisSorteadas.map((item, i) => (
                    <TableRow key={item.dezena} className="odd:bg-muted/40">
                      <TableCell className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground font-mono text-xs">{i + 1}º</span>
                          <LotteryBall number={parseInt(item.dezena, 10)} size="sm" color={COR} />
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-medium tabular-nums">
                        {item.frequencia.toLocaleString("pt-BR")} vezes
                      </TableCell>
                      <TableCell className="text-right">
                        {item.ultimoConcurso ? (
                          <Link
                            href={`/mega-sena/resultado/${item.ultimoConcurso}`}
                            className="text-xs font-semibold text-[#009640] hover:underline whitespace-nowrap"
                          >
                            Concurso {item.ultimoConcurso} →
                          </Link>
                        ) : (
                          <span className="text-xs text-muted-foreground">–</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="border-b"><TableCell className="py-0.5"> </TableCell><TableCell className="py-0.5"> </TableCell><TableCell className="py-0.5"> </TableCell></TableRow>
                </TableBody>
              </Table>
              <div className="mt-3 flex justify-end">
                <Link
                  href="/mega-sena/tabela-de-dezenas?tab=mais"
                  className="text-sm font-semibold text-[#009640] hover:underline"
                >
                  Ver todas →
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Menos Sorteadas */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Dezenas Menos Sorteadas</CardTitle>
              <CardDescription>As 10 dezenas com menor frequência histórica</CardDescription>
            </CardHeader>
            <CardContent>
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left">Dezena</TableHead>
                    <TableHead className="text-center">Frequência</TableHead>
                    <TableHead className="text-right">Última vez</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {menosSorteadas.map((item, i) => (
                    <TableRow key={item.dezena} className="odd:bg-muted/40">
                      <TableCell className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground font-mono text-xs">{i + 1}º</span>
                          <LotteryBall
                            number={parseInt(item.dezena, 10)}
                            size="sm"
                            className="bg-muted text-muted-foreground"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-medium tabular-nums">
                        {item.frequencia.toLocaleString("pt-BR")} vezes
                      </TableCell>
                      <TableCell className="text-right">
                        {item.ultimoConcurso ? (
                          <Link
                            href={`/mega-sena/resultado/${item.ultimoConcurso}`}
                            className="text-xs font-semibold text-[#009640] hover:underline whitespace-nowrap"
                          >
                            Concurso {item.ultimoConcurso} →
                          </Link>
                        ) : (
                          <span className="text-xs text-muted-foreground">–</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="border-b"><TableCell className="py-0.5"> </TableCell><TableCell className="py-0.5"> </TableCell><TableCell className="py-0.5"> </TableCell></TableRow>
                </TableBody>
              </Table>
              <div className="mt-3 flex justify-end">
                <Link
                  href="/mega-sena/tabela-de-dezenas?tab=menos"
                  className="text-sm font-semibold text-[#009640] hover:underline"
                >
                  Ver todas →
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Mais Atrasadas */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Dezenas Mais Atrasadas</CardTitle>
              <CardDescription>Números que faz tempo que não saem!</CardDescription>
            </CardHeader>
            <CardContent>
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left">Dezena</TableHead>
                    <TableHead className="text-center">Atraso</TableHead>
                    <TableHead className="text-right">Última vez</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {maisAtrasadas.map((item, i) => (
                    <TableRow key={item.dezena} className="odd:bg-muted/40">
                      <TableCell className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground font-mono text-xs">{i + 1}º</span>
                          <LotteryBall
                            number={parseInt(item.dezena, 10)}
                            size="sm"
                            className="bg-amber-100 text-amber-800 border border-amber-200"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-medium tabular-nums text-amber-600">
                        {item.atraso} sorteios
                      </TableCell>
                      <TableCell className="text-right">
                        {item.ultimoConcurso ? (
                          <Link
                            href={`/mega-sena/resultado/${item.ultimoConcurso}`}
                            className="text-xs font-semibold text-[#009640] hover:underline whitespace-nowrap"
                          >
                            Concurso {item.ultimoConcurso} →
                          </Link>
                        ) : (
                          <span className="text-xs text-muted-foreground">–</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="border-b"><TableCell className="py-0.5"> </TableCell><TableCell className="py-0.5"> </TableCell><TableCell className="py-0.5"> </TableCell></TableRow>
                </TableBody>
              </Table>
              <div className="mt-3 flex justify-end">
                <Link
                  href="/mega-sena/tabela-de-dezenas?tab=atrasadas"
                  className="text-sm font-semibold text-[#009640] hover:underline"
                >
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

        {/* Row 1: Pares × Ímpares | Moldura × Retrato */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Pares × Ímpares */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Pares × Ímpares</CardTitle>
              <CardDescription>
                Como dezenas pares e ímpares se distribuem ao longo dos sorteios?
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
                      tickFormatter={(v) => `${v}P/${6 - v}I`}
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
                      <LabelList dataKey="sorteios" position="top" style={{ fontSize: 13, fontWeight: "bold", fill: "#333" }} formatter={(v: number) => v > 0 ? v.toLocaleString("pt-BR") : ""} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <CompactTable
                headers={["Pares", "Impares", "Concursos", "%", "Última vez"]}
                rows={stats.paresImpares
                  .filter(d => d.sorteios > 0)
                  .map(d => [
                    d.pares,
                    d.impares,
                    d.sorteios.toLocaleString("pt-BR"),
                    totalSorteios > 0
                      ? `${((d.sorteios / totalSorteios) * 100).toFixed(1)}%`
                      : "–",
                    d.ultimoConcurso
                      ? <Link href={`/mega-sena/resultado/${d.ultimoConcurso}`} className="font-semibold text-[#009640] hover:underline whitespace-nowrap">Concurso {d.ultimoConcurso} →</Link>
                      : "–",
                  ])}
              />
            </CardContent>
          </Card>

          {/* Moldura × Retrato */}
          {(() => {
            const totalMoldura = (stats.molduraRetrato ?? []).reduce((a, b) => a + b.sorteios, 0);
            return (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Moldura × Retrato</CardTitle>
                  <CardDescription>
                    Quantas dezenas do sorteio caem na borda (moldura) ou no interior (retrato) do volante?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.molduraRetrato ?? []} margin={{ top: 22, right: 8, left: -20, bottom: 0 }}>
                        <XAxis
                          dataKey="moldura"
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(v) => `${v}M/${6 - v}R`}
                          tick={{ fontSize: 11 }}
                        />
                        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                        <Tooltip
                          cursor={{ fill: "rgba(0,0,0,0.04)" }}
                          content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;
                            const d = payload[0].payload as { moldura: number; retrato: number; sorteios: number };
                            return (
                              <div className="bg-card border rounded shadow-md px-3 py-2 text-sm">
                                <p className="font-semibold mb-0.5">
                                  {d.moldura} moldura / {d.retrato} retrato
                                </p>
                                <p className="text-muted-foreground">{d.sorteios.toLocaleString("pt-BR")} concursos</p>
                                {totalMoldura > 0 && (
                                  <p className="text-muted-foreground">
                                    {((d.sorteios / totalMoldura) * 100).toFixed(1)}% do total
                                  </p>
                                )}
                              </div>
                            );
                          }}
                        />
                        <Bar dataKey="sorteios" fill={COR} radius={[4, 4, 0, 0]}>
                          <LabelList dataKey="sorteios" position="top" style={{ fontSize: 13, fontWeight: "bold", fill: "#333" }} formatter={(v: number) => v > 0 ? v.toLocaleString("pt-BR") : ""} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <CompactTable
                    headers={["Moldura", "Retrato", "Concursos", "%", "Última vez"]}
                    rows={(stats.molduraRetrato ?? [])
                      .filter(d => d.sorteios > 0)
                      .map(d => [
                        d.moldura,
                        d.retrato,
                        d.sorteios.toLocaleString("pt-BR"),
                        totalMoldura > 0
                          ? `${((d.sorteios / totalMoldura) * 100).toFixed(1)}%`
                          : "–",
                        d.ultimoConcurso
                          ? <Link href={`/mega-sena/resultado/${d.ultimoConcurso}`} className="font-semibold text-[#009640] hover:underline whitespace-nowrap">Concurso {d.ultimoConcurso} →</Link>
                          : "–",
                      ])}
                  />

                  <Accordion type="single" collapsible className="mt-2 border rounded-md px-3 bg-muted/20">
                    <AccordionItem value="moldura-retrato" className="border-b-0">
                      <AccordionTrigger className="text-xs font-medium py-2 text-muted-foreground hover:text-foreground hover:no-underline">
                        Quais são as dezenas da moldura e do retrato?
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 text-xs text-muted-foreground">
                          <div>
                            <span className="font-semibold text-foreground">Moldura ({MOLDURA_SET.size} dezenas):{" "}</span>
                            {Array.from(MOLDURA_SET).sort((a, b) => a - b).map(n => String(n).padStart(2, "0")).join(", ")}
                          </div>
                          <div>
                            <span className="font-semibold text-foreground">Retrato ({RETRATO_SET.size} dezenas):{" "}</span>
                            {Array.from(RETRATO_SET).sort((a, b) => a - b).map(n => String(n).padStart(2, "0")).join(", ")}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            );
          })()}
        </div>

        {/* Row 2: Soma das Dezenas | Publicidade */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Soma das Dezenas — horizontal bars */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Soma das Dezenas</CardTitle>
              <CardDescription>
                {stats.somaDezenas.menor && stats.somaDezenas.maior ? (
                  <>
                    Menor:{" "}
                    {stats.somaDezenas.menor.valor}{" "}
                    (
                    <Link
                      href={`/mega-sena/resultado/${stats.somaDezenas.menor.concurso}`}
                      className="font-semibold text-[#009640] hover:underline"
                    >
                      Concurso {stats.somaDezenas.menor.concurso} →
                    </Link>
                    )
                    {" "}•{" "}
                    Maior:{" "}
                    {stats.somaDezenas.maior.valor}{" "}
                    (
                    <Link
                      href={`/mega-sena/resultado/${stats.somaDezenas.maior.concurso}`}
                      className="font-semibold text-[#009640] hover:underline"
                    >
                      Concurso {stats.somaDezenas.maior.concurso} →
                    </Link>
                    )
                  </>
                ) : "Histograma de somas por sorteio"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.somaDezenas.intervalos}
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
                      width={68}
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
                            {totalSomaConcursos > 0 && (
                              <p className="text-muted-foreground">
                                {((d.sorteios / totalSomaConcursos) * 100).toFixed(1)}%
                              </p>
                            )}
                          </div>
                        );
                      }}
                    />
                    <Bar dataKey="sorteios" fill={COR} radius={[0, 3, 3, 0]}>
                      <LabelList dataKey="sorteios" position="right" style={{ fontSize: 13, fill: "#333", fontWeight: "bold" }} formatter={(v: number) => v > 0 ? v.toLocaleString("pt-BR") : ""} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <CompactTable
                headers={["Soma", "Concursos", "%", "Última vez"]}
                rows={stats.somaDezenas.intervalos.map(d => [
                  d.faixa.replace("\u2013", " a ").replace("-", " a "),
                  d.sorteios.toLocaleString("pt-BR"),
                  totalSomaConcursos > 0
                    ? `${((d.sorteios / totalSomaConcursos) * 100).toFixed(1)}%`
                    : "–",
                  d.ultimoConcurso
                    ? <Link href={`/mega-sena/resultado/${d.ultimoConcurso}`} className="font-semibold text-[#009640] hover:underline whitespace-nowrap">Concurso {d.ultimoConcurso} →</Link>
                    : "–",
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

      {/* ── Seção 3: Distribuição na Grade ── */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Distribuição na Grade
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Frequência por Linha — vertical bars */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Frequência por Linha</CardTitle>
              <CardDescription>
                Ocorrências acumuladas por faixa de dezenas (01–10, 11–20…)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.frequenciaPorLinha}
                    margin={{ top: 22, right: 8, left: -20, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="faixa"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                    <Tooltip
                      cursor={{ fill: "rgba(0,0,0,0.04)" }}
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0].payload as { faixa: string; sorteios: number };
                        return (
                          <div className="bg-card border rounded shadow-md px-3 py-2 text-sm">
                            <p className="font-semibold mb-0.5">Linha {d.faixa}</p>
                            <p className="text-muted-foreground">{d.sorteios.toLocaleString("pt-BR")} ocorrências</p>
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
                headers={["Linha", "Dezenas Sorteadas", "%"]}
                rows={stats.frequenciaPorLinha.map((d, i) => [
                  `Linha ${i + 1}`,
                  d.sorteios.toLocaleString("pt-BR"),
                  totalFreqLinha > 0
                    ? `${((d.sorteios / totalFreqLinha) * 100).toFixed(1)}%`
                    : "–",
                ])}
              />

              <Accordion type="single" collapsible className="mt-2 border rounded-md px-3 bg-muted/20">
                <AccordionItem value="linhas" className="border-b-0">
                  <AccordionTrigger className="text-xs font-medium py-2 text-muted-foreground hover:text-foreground hover:no-underline">
                    Quais são as dezenas em cada linha?
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      {Array.from({ length: 6 }, (_, i) => (
                        <div key={i}>
                          <span className="font-semibold text-foreground">Linha {i + 1}:{" "}</span>
                          {Array.from({ length: 10 }, (_, j) => i * 10 + j + 1)
                            .map(n => String(n).padStart(2, "0"))
                            .join(", ")}
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Frequência por Coluna */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Frequência por Coluna</CardTitle>
              <CardDescription>
                Col. 1 = {"{"}01,11,21,31,41,51{"}"} … Col. 10 = {"{"}10,20,30,40,50,60{"}"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.frequenciaPorColuna}
                    margin={{ top: 22, right: 8, left: -20, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="coluna"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => `C${v}`}
                    />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                    <Tooltip
                      cursor={{ fill: "rgba(0,0,0,0.04)" }}
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0].payload as { coluna: number; sorteios: number };
                        const base = d.coluna === 10 ? 10 : d.coluna;
                        const dezenas = [base, base + 10, base + 20, base + 30, base + 40, base + 50]
                          .filter(n => n <= 60)
                          .map(n => String(n).padStart(2, "0"))
                          .join(", ");
                        return (
                          <div className="bg-card border rounded shadow-md px-3 py-2 text-sm">
                            <p className="font-semibold mb-0.5">Coluna {d.coluna}</p>
                            <p className="text-muted-foreground text-xs mb-0.5">{dezenas}</p>
                            <p className="text-muted-foreground">{d.sorteios.toLocaleString("pt-BR")} ocorrências</p>
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
                headers={["Coluna", "Dezenas Sorteadas", "%"]}
                rows={stats.frequenciaPorColuna.map(d => [
                  `Coluna ${d.coluna}`,
                  d.sorteios.toLocaleString("pt-BR"),
                  totalFreqColuna > 0
                    ? `${((d.sorteios / totalFreqColuna) * 100).toFixed(1)}%`
                    : "–",
                ])}
              />

              <Accordion type="single" collapsible className="mt-2 border rounded-md px-3 bg-muted/20">
                <AccordionItem value="colunas" className="border-b-0">
                  <AccordionTrigger className="text-xs font-medium py-2 text-muted-foreground hover:text-foreground hover:no-underline">
                    Quais são as dezenas em cada coluna?
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      {Array.from({ length: 10 }, (_, i) => i + 1).map(col => {
                        const base = col;
                        const dezenas = [base, base + 10, base + 20, base + 30, base + 40, base + 50]
                          .filter(n => n <= 60)
                          .map(n => String(n).padStart(2, "0"))
                          .join(", ");
                        return (
                          <div key={col}>
                            <span className="font-semibold text-foreground">Coluna {col}:{" "}</span>
                            {dezenas}
                          </div>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
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
                  <span className="font-semibold">{especial.quantidadeNaFaixa} dezenas entre 01 e 60</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Média de ocorrências por sorteio: </span>
                  <span className="font-semibold">
                    {especial.media.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {Array.from({ length: 60 }, (_, i) => i + 1).map(n => (
                  <DezBadge key={n} n={n} active={especialSet.has(n)} />
                ))}
              </div>

              {(() => {
                const titleMap: Record<string, string> = {
                  primos:       "Distribuição da quantidade de números primos por sorteio",
                  fibonacci:    "Distribuição da quantidade de números de Fibonacci por sorteio",
                  triangulares: "Distribuição da quantidade de números triangulares por sorteio",
                };
                const totalEspecial = especial.distribuicao.reduce((a, d) => a + d.sorteios, 0);
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
                        d.ultimoConcurso
                          ? <Link href={`/mega-sena/resultado/${d.ultimoConcurso}`} className="font-semibold text-[#009640] hover:underline whitespace-nowrap">Concurso {d.ultimoConcurso} →</Link>
                          : "–",
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
