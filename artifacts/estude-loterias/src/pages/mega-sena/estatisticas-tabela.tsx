import { useState } from "react";
import { Link, useSearch } from "wouter";
import { useGetMegaSenaEstatisticas } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AdUnit } from "@/components/ui/AdUnit";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { LotteryBall } from "@/components/ui/lottery-ball";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const COR = "#009640";

type Tab = "mais" | "menos" | "atrasadas";

const TABS: { id: Tab; label: string }[] = [
  { id: "mais",      label: "Mais Sorteadas"  },
  { id: "menos",     label: "Menos Sorteadas" },
  { id: "atrasadas", label: "Mais Atrasadas"  },
];

function UltimaVezLink({ concurso }: { concurso: number | null }) {
  if (!concurso) return <span className="text-muted-foreground">–</span>;
  return (
    <Link
      href={`/mega-sena/resultado/${concurso}`}
      className="font-semibold text-[#009640] hover:underline whitespace-nowrap"
    >
      Concurso {concurso} →
    </Link>
  );
}

export default function MegaSenaEstatisticasTabela() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const initialTab = (params.get("tab") as Tab | null) ?? "mais";

  const [tab, setTab] = useState<Tab>(
    TABS.some(t => t.id === initialTab) ? initialTab : "mais",
  );

  const { data: stats, isLoading, isError } = useGetMegaSenaEstatisticas();

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
          Frequência de Dezenas
        </h1>
        <Card>
          <CardContent className="flex items-center justify-center py-16 text-muted-foreground">
            Erro ao carregar estatísticas. Tente novamente.
          </CardContent>
        </Card>
      </div>
    );
  }

  const sorted = {
    mais:      [...stats.frequenciaDezenas].sort((a, b) => b.frequencia - a.frequencia),
    menos:     [...stats.frequenciaDezenas].sort((a, b) => a.frequencia - b.frequencia),
    atrasadas: [...stats.frequenciaDezenas].sort((a, b) => b.atraso - a.atraso),
  };

  const rows = sorted[tab];
  const isAtrasadas = tab === "atrasadas";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <Link href="/mega-sena/estatisticas" className="hover:underline">
            Estatísticas
          </Link>
          <span>/</span>
          <span>Frequência de Dezenas</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: COR }}>
          Frequência de Dezenas
        </h1>
        <p className="text-muted-foreground mt-1">
          Todas as 60 dezenas — {stats.totalConcursos.toLocaleString("pt-BR")} concursos analisados.
        </p>
      </div>

      {/* Tab selector */}
      <div className="flex gap-1 bg-muted rounded-lg p-1 w-fit">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md transition-colors",
              tab === t.id
                ? "bg-background shadow text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Table + Ad sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <div className="lg:col-span-2">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>
            {tab === "mais"      && "Dezenas Mais Sorteadas"}
            {tab === "menos"     && "Dezenas Menos Sorteadas"}
            {tab === "atrasadas" && "Dezenas Mais Atrasadas"}
          </CardTitle>
          <CardDescription>
            {tab === "mais"      && "Ranking de todas as dezenas por frequência histórica (maior → menor)"}
            {tab === "menos"     && "Ranking de todas as dezenas por frequência histórica (menor → maior)"}
            {tab === "atrasadas" && "Ranking de todas as dezenas por atraso (mais ausente → mais recente)"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="text-left">Dezena</TableHead>
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
                <TableRow key={item.dezena} className="odd:bg-muted/40">
                  <TableCell className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground font-mono text-xs">{i + 1}º</span>
                      {isAtrasadas ? (
                      <LotteryBall
                        number={parseInt(item.dezena, 10)}
                        size="sm"
                        className="bg-amber-100 text-amber-800 border border-amber-200"
                      />
                    ) : tab === "mais" ? (
                      <LotteryBall number={parseInt(item.dezena, 10)} size="sm" color={COR} />
                    ) : (
                      <LotteryBall
                        number={parseInt(item.dezena, 10)}
                        size="sm"
                        className="bg-muted text-muted-foreground"
                      />
                    )}
                    </div>
                  </TableCell>
                  {isAtrasadas ? (
                    <>
                      <TableCell className="text-center font-medium tabular-nums text-amber-600">
                        {item.atraso} sorteios
                      </TableCell>
                      <TableCell className="text-right">
                        <UltimaVezLink concurso={item.ultimoConcurso ?? null} />
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell className="text-center font-medium tabular-nums">
                        {item.frequencia.toLocaleString("pt-BR")} vezes
                      </TableCell>
                      <TableCell className="text-right">
                        <UltimaVezLink concurso={item.ultimoConcurso ?? null} />
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
              <TableRow className="border-b"><TableCell className="py-0.5"> </TableCell><TableCell className="py-0.5"> </TableCell><TableCell className="py-0.5"> </TableCell></TableRow>
            </TableBody>
          </Table>
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
