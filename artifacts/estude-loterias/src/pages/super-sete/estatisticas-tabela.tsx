import { useState } from "react";
import { Link, useSearch } from "wouter";
import { useGetSuperSeteEstatisticas } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AdUnit } from "@/components/ui/AdUnit";
import {
  Table as Table2, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { LotteryBall } from "@/components/ui/lottery-ball";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Table as TableIcon } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";

const COR = "#a8cf45";
const BALL_BG = "#a8cf45";
const BALL_TEXT = "#ffffff";

type Tab = "mais" | "menos" | "atrasadas";
type SortFreq = "frequencia" | "digito";
type SortAtr  = "atraso" | "digito";

const TABS: { id: Tab; label: string }[] = [
  { id: "mais",      label: "Mais Sorteadas"  },
  { id: "menos",     label: "Menos Sorteadas" },
  { id: "atrasadas", label: "Mais Atrasadas"  },
];

const SORT_FREQ: { id: SortFreq; label: string }[] = [
  { id: "frequencia", label: "Por Frequência" },
  { id: "digito",     label: "Por Número"     },
];

const SORT_ATR: { id: SortAtr; label: string }[] = [
  { id: "atraso", label: "Por Atraso" },
  { id: "digito", label: "Por Número" },
];

const POSICOES = ["Todas", "1", "2", "3", "4", "5", "6", "7"] as const;

function UltimaVezLink({ concurso }: { concurso: number | null }) {
  if (!concurso) return <span className="text-muted-foreground">–</span>;
  return (
    <Link href={`/super-sete/resultado/${concurso}`} className="font-semibold hover:underline whitespace-nowrap" style={{ color: COR }}>
      Concurso {concurso} →
    </Link>
  );
}

function SortToggle<T extends string>({ options, value, onChange }: { options: { id: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex gap-1 bg-muted rounded-md p-0.5 w-fit">
      {options.map(opt => (
        <button key={opt.id} onClick={() => onChange(opt.id)} className={cn("px-3 py-1 text-xs font-medium rounded transition-colors", value === opt.id ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground")}>
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function SuperSeteEstatisticasTabela() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const initialTab = (params.get("tab") as Tab | null) ?? "mais";

  const [tab, setTab] = useState<Tab>(TABS.some(t => t.id === initialTab) ? initialTab : "mais");
  const [sortFreq, setSortFreq] = useState<SortFreq>("frequencia");
  const [sortAtr,  setSortAtr]  = useState<SortAtr>("atraso");
  const [posicaoFilter, setPosicaoFilter] = useState<string>("Todas");

  const { data: stats, isLoading, isError } = useGetSuperSeteEstatisticas();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div><Skeleton className="h-9 w-64 mb-2" /><Skeleton className="h-4 w-80" /></div>
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: COR }}>Super Sete · Tabela de Dezenas</h1>
        <Card><CardContent className="flex items-center justify-center py-16 text-muted-foreground">Erro ao carregar estatísticas. Tente novamente.</CardContent></Card>
      </div>
    );
  }

  const filtered = posicaoFilter === "Todas"
    ? [...stats.frequenciaDezenas]
    : stats.frequenciaDezenas.filter(d => d.posicao === parseInt(posicaoFilter, 10));

  const rows = (() => {
    if (tab === "atrasadas") {
      if (sortAtr === "digito") return filtered.sort((a, b) => a.digito - b.digito);
      return filtered.sort((a, b) => b.atraso - a.atraso);
    }
    if (sortFreq === "digito") return filtered.sort((a, b) => a.digito - b.digito);
    if (tab === "menos") return filtered.sort((a, b) => a.frequencia - b.frequencia);
    return filtered.sort((a, b) => b.frequencia - a.frequencia);
  })();

  const isAtrasadas = tab === "atrasadas";

  const cardTitle = { mais: "Números Mais Sorteados", menos: "Números Menos Sorteados", atrasadas: "Números Mais Atrasados" }[tab];
  const cardDesc = { mais: "Ranking de todos os números por frequência histórica (maior → menor)", menos: "Ranking de todos os números por frequência histórica (menor → maior)", atrasadas: "Ranking de todos os números por atraso (mais ausente → mais recente)" }[tab];

  return (
    <div className="space-y-6">
      <PageSEO
        title="Tabela de Dezenas da Super Sete — Frequência e Atraso"
        description="Ranking completo dos 70 números da Super Sete (7 posições × 10 números): veja os mais e menos sorteados, os mais atrasados e a frequência histórica."
        canonical="/super-sete/tabela-de-dezenas"
      />
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: COR }}>
          <TableIcon className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: COR }}>Super Sete · Tabela de Dezenas</h1>
          <p className="text-muted-foreground mt-1">70 combinações (7 posições × 10 números) — {stats.totalConcursos.toLocaleString("pt-BR")} concursos analisados.</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 bg-muted rounded-lg p-1 w-fit">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={cn("px-4 py-2 text-sm font-medium rounded-md transition-colors", tab === t.id ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground")}>
              {t.label}
            </button>
          ))}
        </div>

        <select
          value={posicaoFilter}
          onChange={e => setPosicaoFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {POSICOES.map(p => (
            <option key={p} value={p}>{p === "Todas" ? "Todas as Posições" : `Posição ${p}`}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle>{cardTitle}</CardTitle>
                  <CardDescription className="mt-1">{cardDesc}</CardDescription>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                  <span>Ordenar:</span>
                  {isAtrasadas ? <SortToggle options={SORT_ATR} value={sortAtr} onChange={(v) => setSortAtr(v)} /> : <SortToggle options={SORT_FREQ} value={sortFreq} onChange={(v) => setSortFreq(v)} />}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table2 className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left">Posição</TableHead>
                    <TableHead className="text-left">Número</TableHead>
                    {isAtrasadas ? (
                      <>
                        <TableHead className="text-center">Atraso</TableHead>
                        <TableHead className="text-right">Última vez</TableHead>
                      </>
                    ) : (
                      <>
                        <TableHead className="text-center">Frequência</TableHead>
                        <TableHead className="text-right">Última vez</TableHead>
                      </>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((item, i) => (
                    <TableRow key={`${item.posicao}-${item.digito}`} className="odd:bg-muted/40">
                      <TableCell className="text-left">
                        <span className="text-muted-foreground font-mono text-xs">{i + 1}º</span>
                      </TableCell>
                      <TableCell className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-muted-foreground w-6">P{item.posicao}</span>
                          {isAtrasadas ? (
                            <LotteryBall number={item.digito} size="sm" className="bg-amber-100 text-amber-800 border border-amber-200" padDigits={1} />
                          ) : tab === "mais" ? (
                            <LotteryBall number={item.digito} size="sm" color={BALL_BG} textColor={BALL_TEXT} padDigits={1} />
                          ) : (
                            <LotteryBall number={item.digito} size="sm" className="bg-muted text-muted-foreground" padDigits={1} />
                          )}
                        </div>
                      </TableCell>
                      {isAtrasadas ? (<>
                        <TableCell className="text-center font-medium tabular-nums text-amber-600">{item.atraso} sorteios</TableCell>
                        <TableCell className="text-right"><UltimaVezLink concurso={item.ultimoConcurso ?? null} /></TableCell>
                      </>) : (<>
                        <TableCell className="text-center font-medium tabular-nums">{item.frequencia.toLocaleString("pt-BR")} vezes</TableCell>
                        <TableCell className="text-right"><UltimaVezLink concurso={item.ultimoConcurso ?? null} /></TableCell>
                      </>)}
                    </TableRow>
                  ))}
                  <TableRow className="border-b"><TableCell className="py-0.5"> </TableCell><TableCell className="py-0.5"> </TableCell><TableCell className="py-0.5"> </TableCell><TableCell className="py-0.5"> </TableCell></TableRow>
                </TableBody>
              </Table2>
            </CardContent>
          </Card>
        </div>
        <div className="flex flex-col gap-6">
          <AdUnit slot="3322114455" format="rectangle" className="w-full" />
        </div>
      </div>
    </div>
  );
}
