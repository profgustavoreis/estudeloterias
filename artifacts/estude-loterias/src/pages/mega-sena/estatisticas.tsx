import { useState } from "react";
import { useGetMegaSenaEstatisticas } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LotteryBall } from "@/components/ui/lottery-ball";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { AdUnit } from "@/components/ui/AdUnit";
import { cn } from "@/lib/utils";
import { formatDateShort } from "@/lib/formatters";

const COR = "#009640";
const COR_LIGHT = "#009640/10";

// ── Shared chart tooltip ─────────────────────────────────────────────────────
function ChartTooltip({
  active, payload, labelFormatter, valueLabel = "Concursos",
}: {
  active?: boolean;
  payload?: Array<{ value: number; payload: Record<string, unknown> }>;
  labelFormatter?: (p: Record<string, unknown>) => string;
  valueLabel?: string;
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="bg-card border rounded shadow-md px-3 py-2 text-sm">
      <p className="font-semibold mb-0.5">
        {labelFormatter ? labelFormatter(p.payload) : String(p.payload.faixa ?? p.payload.coluna ?? p.payload.pares)}
      </p>
      <p className="text-muted-foreground">{p.value.toLocaleString("pt-BR")} {valueLabel.toLowerCase()}</p>
    </div>
  );
}

// ── Dezena badge (small circle) ───────────────────────────────────────────────
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

// ── Frequency list (shared by Mais/Menos/Atrasadas) ──────────────────────────
function FreqList({
  items, getValue, valueLabel, ballClass,
}: {
  items: { dezena: string }[];
  getValue: (item: { dezena: string }) => number;
  valueLabel: string;
  ballClass?: string;
}) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={item.dezena} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground font-mono text-xs w-5 text-right">{i + 1}º</span>
            <LotteryBall
              number={parseInt(item.dezena, 10)}
              size="sm"
              color={ballClass ? undefined : COR}
              className={ballClass}
            />
          </div>
          <div className="text-sm font-medium tabular-nums">
            {getValue(item).toLocaleString("pt-BR")} {valueLabel}
          </div>
        </div>
      ))}
    </div>
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
          <CardSkeleton h={300} />
          <CardSkeleton h={300} />
          <CardSkeleton h={300} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CardSkeleton h={220} />
          <CardSkeleton h={220} />
        </div>
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: COR }}>Estatísticas</h1>
        <Card>
          <CardContent className="flex items-center justify-center py-16 text-muted-foreground">
            Erro ao carregar estatísticas. Tente novamente.
          </CardContent>
        </Card>
      </div>
    );
  }

  const maisSorteadas = [...stats.frequenciaDezenas]
    .sort((a, b) => b.frequencia - a.frequencia)
    .slice(0, 10);
  const menosSorteadas = [...stats.frequenciaDezenas]
    .sort((a, b) => a.frequencia - b.frequencia)
    .slice(0, 10);
  const maisAtrasadas = [...stats.frequenciaDezenas]
    .sort((a, b) => b.atraso - a.atraso)
    .slice(0, 10);

  const especial = stats.numerosEspeciais[tabEspecial];
  const especialSet = new Set(especial?.dezenas ?? []);

  // Pares × Ímpares: compute totals for summary line
  const totalSorteios = stats.paresImpares.reduce((a, b) => a + b.sorteios, 0);
  const totalPares    = stats.paresImpares.reduce((a, b) => a + b.pares * b.sorteios, 0);
  const mediaPares    = totalSorteios > 0 ? (totalPares / totalSorteios).toFixed(2) : "–";

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: COR }}>Estatísticas</h1>
        <p className="text-muted-foreground mt-1">
          Análise completa de {stats.totalConcursos.toLocaleString("pt-BR")} concursos realizados.
        </p>
      </div>

      <AdUnit slot="1122334455" format="horizontal" className="w-full" />

      {/* ── Seção 1: Top 10 dezenas ── */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Frequência de Dezenas
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Dezenas Mais Sorteadas</CardTitle>
              <CardDescription>As 10 dezenas com maior frequência histórica</CardDescription>
            </CardHeader>
            <CardContent>
              <FreqList
                items={maisSorteadas}
                getValue={(item) => (item as typeof maisSorteadas[0]).frequencia}
                valueLabel="vezes"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Dezenas Menos Sorteadas</CardTitle>
              <CardDescription>As 10 dezenas com menor frequência histórica</CardDescription>
            </CardHeader>
            <CardContent>
              <FreqList
                items={menosSorteadas}
                getValue={(item) => (item as typeof menosSorteadas[0]).frequencia}
                valueLabel="vezes"
                ballClass="bg-muted text-muted-foreground"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Dezenas Mais Atrasadas</CardTitle>
              <CardDescription>Concursos sem aparecer desde a última vez</CardDescription>
            </CardHeader>
            <CardContent>
              <FreqList
                items={maisAtrasadas}
                getValue={(item) => (item as typeof maisAtrasadas[0]).atraso}
                valueLabel="sorteios"
                ballClass="bg-amber-100 text-amber-800 border border-amber-200"
              />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ── Seção 2: Pares × Ímpares + Soma das Dezenas ── */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Distribuição por Concurso
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Pares × Ímpares */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Pares × Ímpares</CardTitle>
              <CardDescription>
                Quantas dezenas pares saem em cada sorteio — média de {mediaPares} por concurso
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.paresImpares} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <XAxis
                      dataKey="pares"
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `${v}P / ${6 - v}Í`}
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
                            <p className="font-semibold mb-0.5">{d.pares} par{d.pares !== 1 ? "es" : ""} / {d.impares} ímpar{d.impares !== 1 ? "es" : ""}</p>
                            <p className="text-muted-foreground">{d.sorteios.toLocaleString("pt-BR")} concursos</p>
                            {totalSorteios > 0 && (
                              <p className="text-muted-foreground">{((d.sorteios / totalSorteios) * 100).toFixed(1)}% do total</p>
                            )}
                          </div>
                        );
                      }}
                    />
                    <Bar dataKey="sorteios" radius={[4, 4, 0, 0]}>
                      {stats.paresImpares.map((entry, i) => (
                        <Cell key={i} fill={COR} fillOpacity={0.75 + (entry.sorteios / Math.max(...stats.paresImpares.map(e => e.sorteios))) * 0.25} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Soma das Dezenas */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Soma das Dezenas</CardTitle>
              <CardDescription>
                {stats.somaDezenas.menor && stats.somaDezenas.maior ? (
                  <>
                    Menor: <span className="font-semibold">{stats.somaDezenas.menor.valor}</span> (#{stats.somaDezenas.menor.concurso}) •{" "}
                    Maior: <span className="font-semibold">{stats.somaDezenas.maior.valor}</span> (#{stats.somaDezenas.maior.concurso})
                  </>
                ) : "Histograma de somas por sorteio"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.somaDezenas.intervalos}
                    margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="faixa"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 9 }}
                      interval={2}
                    />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                    <Tooltip
                      cursor={{ fill: "rgba(0,0,0,0.04)" }}
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0].payload as { faixa: string; sorteios: number };
                        return (
                          <div className="bg-card border rounded shadow-md px-3 py-2 text-sm">
                            <p className="font-semibold mb-0.5">Soma {d.faixa}</p>
                            <p className="text-muted-foreground">{d.sorteios.toLocaleString("pt-BR")} concursos</p>
                          </div>
                        );
                      }}
                    />
                    <Bar dataKey="sorteios" fill={COR} radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ── Seção 3: Frequência por Linha e Coluna ── */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Distribuição na Grade
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Frequência por Linha */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Frequência por Linha</CardTitle>
              <CardDescription>
                Aparições acumuladas por faixa de dezenas (01–10, 11–20…)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.frequenciaPorLinha}
                    margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                    layout="vertical"
                  >
                    <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                    <YAxis
                      type="category"
                      dataKey="faixa"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11 }}
                      width={56}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(0,0,0,0.04)" }}
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0].payload as { faixa: string; sorteios: number };
                        return (
                          <div className="bg-card border rounded shadow-md px-3 py-2 text-sm">
                            <p className="font-semibold mb-0.5">Linha {d.faixa}</p>
                            <p className="text-muted-foreground">{d.sorteios.toLocaleString("pt-BR")} aparições</p>
                          </div>
                        );
                      }}
                    />
                    <Bar dataKey="sorteios" fill={COR} radius={[0, 3, 3, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
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
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.frequenciaPorColuna}
                    margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
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
                        const dezenas = [base, base+10, base+20, base+30, base+40, base+50]
                          .filter(n => n <= 60)
                          .map(n => String(n).padStart(2,"0"))
                          .join(", ");
                        return (
                          <div className="bg-card border rounded shadow-md px-3 py-2 text-sm">
                            <p className="font-semibold mb-0.5">Coluna {d.coluna}</p>
                            <p className="text-muted-foreground text-xs mb-0.5">{dezenas}</p>
                            <p className="text-muted-foreground">{d.sorteios.toLocaleString("pt-BR")} aparições</p>
                          </div>
                        );
                      }}
                    />
                    <Bar dataKey="sorteios" fill={COR} radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <AdUnit slot="6677889900" format="horizontal" className="w-full" />

      {/* ── Seção 4: Números Especiais ── */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Números Especiais
        </h2>
        <Card>
          <CardHeader className="pb-0">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <CardTitle>Sequências Matemáticas</CardTitle>
                <CardDescription className="mt-1">
                  Quantas dezenas de cada sequência aparecem por sorteio
                </CardDescription>
              </div>
              {/* Tabs */}
              <div className="flex gap-1 bg-muted rounded-lg p-1">
                {stats.numerosEspeciais.map((item, i) => (
                  <button
                    key={item.tipo}
                    onClick={() => setTabEspecial(i)}
                    className={cn(
                      "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                      tabEspecial === i
                        ? "bg-background shadow text-foreground"
                        : "text-muted-foreground hover:text-foreground"
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
              {/* Summary row */}
              <div className="flex flex-wrap gap-6 text-sm">
                <div>
                  <span className="text-muted-foreground">Na faixa 01–60: </span>
                  <span className="font-semibold">{especial.quantidadeNaFaixa} dezenas</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Média por sorteio: </span>
                  <span className="font-semibold">{especial.media}</span>
                </div>
              </div>

              {/* Dezena badges */}
              <div className="flex flex-wrap gap-1.5">
                {Array.from({ length: 60 }, (_, i) => i + 1).map(n => (
                  <DezBadge key={n} n={n} active={especialSet.has(n)} />
                ))}
              </div>

              {/* Distribution chart */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Distribuição — nº de {especial.label.toLowerCase()} por sorteio
                </p>
                <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={especial.distribuicao.filter(d => d.sorteios > 0)}
                      margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                    >
                      <XAxis
                        dataKey="count"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 11 }}
                        tickFormatter={(v) => `${v} dez.`}
                      />
                      <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                      <Tooltip
                        cursor={{ fill: "rgba(0,0,0,0.04)" }}
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const d = payload[0].payload as { count: number; sorteios: number };
                          return (
                            <div className="bg-card border rounded shadow-md px-3 py-2 text-sm">
                              <p className="font-semibold mb-0.5">{d.count} {especial.label.toLowerCase()} no sorteio</p>
                              <p className="text-muted-foreground">{d.sorteios.toLocaleString("pt-BR")} concursos</p>
                            </div>
                          );
                        }}
                      />
                      <Bar dataKey="sorteios" fill={COR} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </section>
    </div>
  );
}
