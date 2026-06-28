import { useState } from "react";
import { Link } from "wouter";
import { useGetLotofacilEstatisticas } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LotteryBall } from "@/components/ui/lottery-ball";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from "recharts";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AdUnit } from "@/components/ui/AdUnit";
import { cn } from "@/lib/utils";
import { BarChart3, Table as TableIcon } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";

const COR = "#930089";

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

function CompactTable({ headers, rows }: { headers: string[]; rows: (string | number | React.ReactNode)[][] }) {
  const lastIdx = headers.length - 1;
  return (
    <div className="mt-4 overflow-x-auto">
      <Table className="text-xs w-full">
        <TableHeader>
          <TableRow className="border-b">
            {headers.map((h, idx) => (
              <TableHead key={h} className={cn("py-1.5 text-xs h-auto font-semibold", idx === 0 ? "text-center" : idx === lastIdx ? "text-right" : "text-center")}>
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={i} className="border-b odd:bg-muted/40">
              {row.map((cell, j) => (
                <TableCell key={j} className={cn("py-1.5 text-xs", j === 0 ? "text-center" : j === row.length - 1 ? "text-right" : "text-center")}>
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

type ViewMode = "frequencia" | "atraso";

export default function LotofacilEstatisticas() {
  const { data, isLoading } = useGetLotofacilEstatisticas();
  const [view, setView] = useState<ViewMode>("frequencia");

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-72" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} h={220} />)}
        </div>
      </div>
    );
  }

  const dezenasChart = view === "frequencia"
    ? [...data.frequenciaDezenas].sort((a, b) => parseInt(a.dezena, 10) - parseInt(b.dezena, 10)).map(d => ({
        dezena: d.dezena, valor: d.frequencia, label: d.frequencia,
      }))
    : [...data.frequenciaDezenas].sort((a, b) => parseInt(a.dezena, 10) - parseInt(b.dezena, 10)).map(d => ({
        dezena: d.dezena, valor: d.atraso, label: d.atraso,
      }));

  const top10Freq = [...data.frequenciaDezenas].sort((a, b) => b.frequencia - a.frequencia).slice(0, 10);
  const top10Atraso = [...data.frequenciaDezenas].sort((a, b) => b.atraso - a.atraso).slice(0, 10);

  return (
    <div className="space-y-6">
      <PageSEO
        title="Resumo Estatístico da Lotofácil — Frequência e Análise das Dezenas"
        description="Análise estatística completa da Lotofácil: frequência e atraso das 25 dezenas, pares e ímpares, moldura e retrato, soma das dezenas, números especiais e muito mais."
        canonical="/lotofacil/resumo-estatistico"
      />
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: COR }}>
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: COR }}>Lotofácil · Resumo Estatístico</h1>
            <p className="text-muted-foreground mt-1">Análise baseada em {data.totalConcursos} sorteios realizados.</p>
          </div>
        </div>
        <Link href="/lotofacil/tabela-de-dezenas">
          <button className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-md border border-border hover:bg-muted transition-colors">
            <TableIcon className="w-4 h-4" /> Tabela Completa das 25 Dezenas
          </button>
        </Link>
      </div>

      {/* Frequência chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle>Frequência das 25 Dezenas</CardTitle>
            <div className="flex gap-2">
              {([
                { value: "frequencia", label: "Frequência" },
                { value: "atraso",     label: "Atraso" },
              ] as const).map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setView(value)}
                  className={cn("px-3 py-1 text-xs rounded-md font-medium border transition-colors",
                    view === value ? "text-white border-transparent" : "bg-muted text-muted-foreground border-border hover:bg-muted/70"
                  )}
                  style={view === value ? { backgroundColor: COR } : {}}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <CardDescription>
            {view === "frequencia"
              ? "Quantas vezes cada dezena foi sorteada no histórico completo"
              : "Há quantos concursos cada dezena não é sorteada"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={dezenasChart} margin={{ top: 20, right: 4, left: -28, bottom: 4 }}>
              <XAxis dataKey="dezena" tick={{ fontSize: 10 }} interval={0} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                formatter={(v: number) => [v, view === "frequencia" ? "Sorteios" : "Concursos de atraso"]}
                labelFormatter={l => `Dezena ${l}`}
              />
              <Bar dataKey="valor" fill={view === "atraso" ? "#f59e0b" : COR} radius={[3, 3, 0, 0]}>
                <LabelList dataKey="label" position="top" style={{ fontSize: 8, fill: "currentColor" }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tops side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top 10 Mais Frequentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {top10Freq.map(d => (
                <div key={d.dezena} className="flex flex-col items-center gap-1">
                  <LotteryBall number={parseInt(d.dezena, 10)} size="sm" color={COR} />
                  <span className="text-xs text-muted-foreground">{d.frequencia}×</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top 10 Mais Atrasadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {top10Atraso.map(d => (
                <div key={d.dezena} className="flex flex-col items-center gap-1">
                  <LotteryBall number={parseInt(d.dezena, 10)} size="sm" color="#f59e0b" />
                  <span className="text-xs text-muted-foreground">{d.atraso} c.</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Accordion type="multiple" defaultValue={["pares", "moldura", "linhas", "soma", "especiais"]}>

        {/* Pares / Ímpares */}
        <AccordionItem value="pares">
          <AccordionTrigger className="font-semibold">Pares e Ímpares</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
              <Card>
                <CardContent className="p-0">
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={data.paresImpares.filter(p => p.sorteios > 0)} margin={{ top: 20, right: 4, left: -28, bottom: 4 }}>
                      <XAxis dataKey="pares" tickFormatter={v => `${v}P/${15 - v}I`} tick={{ fontSize: 9 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: number) => [v, "Sorteios"]} labelFormatter={l => `${l} Pares / ${15 - Number(l)} Ímpares`} />
                      <Bar dataKey="sorteios" fill={COR} radius={[3, 3, 0, 0]}>
                        <LabelList dataKey="sorteios" position="top" style={{ fontSize: 9 }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <CompactTable
                    headers={["Pares", "Ímpares", "Sorteios", "Último concurso"]}
                    rows={data.paresImpares.filter(p => p.sorteios > 0).map(p => [p.pares, p.impares, p.sorteios, p.ultimoConcurso ?? "—"])}
                  />
                </CardContent>
              </Card>
              <AdUnit slot="5566778899" format="rectangle" className="w-full" />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Moldura / Retrato */}
        <AccordionItem value="moldura">
          <AccordionTrigger className="font-semibold">Moldura e Retrato (grade 5×5)</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    <strong>Moldura</strong> = dezenas nas bordas do volante 5×5 (01–05, 21–25, 01/06/11/16/21, 05/10/15/20/25).
                    São 16 números de borda e 9 dezenas internas (Retrato).
                  </p>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={data.molduraRetrato.filter(m => m.sorteios > 0)} margin={{ top: 20, right: 4, left: -28, bottom: 4 }}>
                      <XAxis dataKey="moldura" tickFormatter={v => `${v}M/${15 - v}R`} tick={{ fontSize: 9 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: number) => [v, "Sorteios"]} labelFormatter={l => `${l} Moldura / ${15 - Number(l)} Retrato`} />
                      <Bar dataKey="sorteios" fill={COR} radius={[3, 3, 0, 0]}>
                        <LabelList dataKey="sorteios" position="top" style={{ fontSize: 9 }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <CompactTable
                    headers={["Moldura", "Retrato", "Sorteios", "Último concurso"]}
                    rows={data.molduraRetrato.filter(m => m.sorteios > 0).map(m => [m.moldura, m.retrato, m.sorteios, m.ultimoConcurso ?? "—"])}
                  />
                </CardContent>
              </Card>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Linhas e colunas */}
        <AccordionItem value="linhas">
          <AccordionTrigger className="font-semibold">Frequência por Linha e Coluna</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Por Linha (5 linhas de 5 números)</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={data.frequenciaPorLinha} margin={{ top: 20, right: 4, left: -28, bottom: 4 }}>
                      <XAxis dataKey="faixa" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: number) => [v, "Aparições"]} />
                      <Bar dataKey="sorteios" fill={COR} radius={[3, 3, 0, 0]}>
                        <LabelList dataKey="sorteios" position="top" style={{ fontSize: 9 }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Por Coluna (5 colunas)</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={data.frequenciaPorColuna} margin={{ top: 20, right: 4, left: -28, bottom: 4 }}>
                      <XAxis dataKey="coluna" tickFormatter={v => `Col ${v}`} tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: number) => [v, "Aparições"]} labelFormatter={l => `Coluna ${l}`} />
                      <Bar dataKey="sorteios" fill={COR} radius={[3, 3, 0, 0]}>
                        <LabelList dataKey="sorteios" position="top" style={{ fontSize: 9 }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Soma das dezenas */}
        <AccordionItem value="soma">
          <AccordionTrigger className="font-semibold">Soma das Dezenas</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              {(data.somaDezenas.menor || data.somaDezenas.maior) && (
                <div className="grid grid-cols-2 gap-4">
                  {data.somaDezenas.menor && (
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Menor soma</div>
                        <div className="text-2xl font-black">{data.somaDezenas.menor.valor}</div>
                        <div className="text-xs text-muted-foreground">Concurso {data.somaDezenas.menor.concurso} ({data.somaDezenas.menor.data})</div>
                      </CardContent>
                    </Card>
                  )}
                  {data.somaDezenas.maior && (
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">Maior soma</div>
                        <div className="text-2xl font-black">{data.somaDezenas.maior.valor}</div>
                        <div className="text-xs text-muted-foreground">Concurso {data.somaDezenas.maior.concurso} ({data.somaDezenas.maior.data})</div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
              <Card>
                <CardContent className="p-4">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={data.somaDezenas.intervalos.filter(i => i.sorteios > 0)} margin={{ top: 20, right: 4, left: -28, bottom: 4 }}>
                      <XAxis dataKey="faixa" tick={{ fontSize: 9 }} interval={0} angle={-25} textAnchor="end" height={40} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(v: number) => [v, "Sorteios"]} />
                      <Bar dataKey="sorteios" fill={COR} radius={[3, 3, 0, 0]}>
                        <LabelList dataKey="sorteios" position="top" style={{ fontSize: 9 }} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <CompactTable
                    headers={["Intervalo", "Sorteios", "Último concurso"]}
                    rows={data.somaDezenas.intervalos.filter(i => i.sorteios > 0).map(i => [i.faixa, i.sorteios, i.ultimoConcurso ?? "—"])}
                  />
                </CardContent>
              </Card>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Números especiais */}
        <AccordionItem value="especiais">
          <AccordionTrigger className="font-semibold">Números Especiais</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6 pt-2">
              {data.numerosEspeciais.map(ne => (
                <Card key={ne.tipo}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{ne.label}</CardTitle>
                    <CardDescription>
                      {ne.dezenas.length} número{ne.dezenas.length > 1 ? "s" : ""} no volante ·{" "}
                      Média de <strong>{ne.media.toFixed(2)}</strong> por sorteio
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {ne.dezenas.map(n => <DezBadge key={n} n={n} active />)}
                    </div>
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={ne.distribuicao.filter(d => d.sorteios > 0)} margin={{ top: 16, right: 4, left: -28, bottom: 4 }}>
                        <XAxis dataKey="count" tickFormatter={v => `${v} nº`} tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip formatter={(v: number) => [v, "Sorteios"]} labelFormatter={l => `${l} número(s) de ${ne.label}`} />
                        <Bar dataKey="sorteios" fill={COR} radius={[3, 3, 0, 0]}>
                          <LabelList dataKey="sorteios" position="top" style={{ fontSize: 9 }} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

      </Accordion>
    </div>
  );
}
