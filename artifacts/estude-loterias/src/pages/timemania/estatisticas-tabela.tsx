import { useState } from "react";
import { Link, useSearch } from "wouter";
import { useGetTimemaniaEstatisticas } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AdUnit } from "@/components/ui/AdUnit";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LotteryBall } from "@/components/ui/lottery-ball";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Table as TableIcon } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";

const COR = "#049645";
const BALL_BG = "#FFF600";
const BALL_TEXT = "#049645";

type Tab = "mais" | "menos" | "atrasadas";
type SortFreq = "frequencia" | "dezena";
type SortAtr = "atraso" | "dezena";

const TABS: { id: Tab; label: string }[] = [
  { id: "mais", label: "Mais Sorteadas" },
  { id: "menos", label: "Menos Sorteadas" },
  { id: "atrasadas", label: "Mais Atrasadas" },
];

const SORT_FREQ: { id: SortFreq; label: string }[] = [
  { id: "frequencia", label: "Por Frequência" },
  { id: "dezena", label: "Por Dezena" },
];

const SORT_ATR: { id: SortAtr; label: string }[] = [
  { id: "atraso", label: "Por Atraso" },
  { id: "dezena", label: "Por Dezena" },
];

function UltimaVezLink({ concurso }: { concurso: number | null | undefined }) {
  if (!concurso) return <span className="text-muted-foreground">–</span>;
  return (
    <Link
      href={`/timemania/resultado/${concurso}`}
      className="font-semibold hover:underline whitespace-nowrap"
      style={{ color: COR }}
    >
      Concurso {concurso} →
    </Link>
  );
}

function SortToggle<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-1 bg-muted rounded-md p-0.5 w-fit">
      {options.map(opt => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          className={cn(
            "px-3 py-1 text-xs font-medium rounded transition-colors",
            value === opt.id
              ? "bg-background shadow text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function TimemaniaEstatisticasTabela() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const initialTab = (params.get("tab") as Tab | null) ?? "mais";

  const [tab, setTab] = useState<Tab>(
    TABS.some(t => t.id === initialTab) ? initialTab : "mais",
  );
  const [sortFreq, setSortFreq] = useState<SortFreq>("frequencia");
  const [sortAtr, setSortAtr] = useState<SortAtr>("atraso");

  const { data: stats, isLoading, isError } = useGetTimemaniaEstatisticas();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: COR }}>
          Timemania · Tabela de Dezenas
        </h1>
        <Card>
          <CardContent className="flex items-center justify-center py-16 text-muted-foreground">
            Erro ao carregar estatísticas. Tente novamente.
          </CardContent>
        </Card>
      </div>
    );
  }

  const todas = stats.frequenciaDezenas;

  const maisSorteadas = [...todas].sort((a, b) => {
    if (sortFreq === "dezena") return parseInt(a.dezena) - parseInt(b.dezena);
    return b.frequencia - a.frequencia || parseInt(a.dezena) - parseInt(b.dezena);
  });

  const menosSorteadas = [...todas].sort((a, b) => {
    if (sortFreq === "dezena") return parseInt(a.dezena) - parseInt(b.dezena);
    return a.frequencia - b.frequencia || parseInt(a.dezena) - parseInt(b.dezena);
  });

  const atrasadas = [...todas].sort((a, b) => {
    if (sortAtr === "dezena") return parseInt(a.dezena) - parseInt(b.dezena);
    return b.atraso - a.atraso || parseInt(a.dezena) - parseInt(b.dezena);
  });

  const list =
    tab === "mais" ? maisSorteadas :
    tab === "menos" ? menosSorteadas :
    atrasadas;

  const maxFreq = Math.max(...todas.map(d => d.frequencia), 1);

  return (
    <div className="space-y-6">
      <PageSEO
        title="Tabela de Dezenas da Timemania"
        description="Ranking completo das 80 dezenas da Timemania: frequência, percentual de aparição e atraso. Filtre por mais sorteadas, menos sorteadas ou mais atrasadas."
        canonical="/timemania/tabela-de-dezenas"
      />
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: COR }}>
          <TableIcon className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: COR }}>Timemania · Tabela de Dezenas</h1>
          <p className="text-muted-foreground mt-1">Ranking detalhado das 80 dezenas: frequência, percentual e atraso.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardDescription>{stats.totalConcursos} concursos analisados</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Abas */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-1 bg-muted rounded-md p-0.5">
              {TABS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "px-4 py-1.5 text-sm font-medium rounded transition-colors",
                    tab === t.id
                      ? "bg-background shadow text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <SortToggle
              options={tab === "atrasadas" ? SORT_ATR : SORT_FREQ}
              value={tab === "atrasadas" ? sortAtr : sortFreq}
              onChange={v => tab === "atrasadas" ? setSortAtr(v as SortAtr) : setSortFreq(v as SortFreq)}
            />
          </div>

          {/* Tabela */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="w-16 text-center">#</TableHead>
                  <TableHead className="w-20 text-center">Dezena</TableHead>
                  <TableHead>Frequência</TableHead>
                  <TableHead className="text-right">Percentual</TableHead>
                  <TableHead className="text-right">Atraso</TableHead>
                  <TableHead className="text-right">Última vez</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((d, i) => {
                  const pct = Math.round((d.frequencia / maxFreq) * 100);
                  return (
                    <TableRow key={d.dezena} className="group">
                      <TableCell className="text-center text-muted-foreground text-sm font-mono">{i + 1}</TableCell>
                      <TableCell className="text-center">
                        <LotteryBall number={d.dezena} size="sm" color={BALL_BG} textColor={BALL_TEXT} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm tabular-nums min-w-[3ch]">{d.frequencia}</span>
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-[120px]">
                            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: COR }} />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">{d.percentual}%</TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {d.atraso === stats.totalConcursos ? "Nunca" : d.atraso}
                      </TableCell>
                      <TableCell className="text-right">
                        <UltimaVezLink concurso={d.ultimoConcurso} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AdUnit slot="9988776655" format="horizontal" className="w-full" />
    </div>
  );
}
