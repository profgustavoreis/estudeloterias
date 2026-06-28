import { useState } from "react";
import { Link } from "wouter";
import { useGetLotofacilEstatisticas } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LotteryBall } from "@/components/ui/lottery-ball";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { TableIcon, ArrowLeft } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";
import { cn } from "@/lib/utils";

const COR = "#930089";

type Sort = "frequencia" | "atraso" | "dezena";

export default function LotofacilEstatisticasTabela() {
  const { data, isLoading } = useGetLotofacilEstatisticas();
  const [sort, setSort] = useState<Sort>("frequencia");

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const sorted = [...data.frequenciaDezenas].sort((a, b) => {
    if (sort === "frequencia") return b.frequencia - a.frequencia;
    if (sort === "atraso")     return b.atraso - a.atraso;
    return parseInt(a.dezena, 10) - parseInt(b.dezena, 10);
  });

  const maxFreq = Math.max(...sorted.map(d => d.frequencia));
  const maxAtraso = Math.max(...sorted.map(d => d.atraso));

  return (
    <div className="space-y-6">
      <PageSEO
        title="Tabela de Dezenas da Lotofácil"
        description="Ranking completo das 25 dezenas da Lotofácil ordenadas por frequência ou atraso. Veja quais números saem mais e há quanto tempo cada dezena não aparece."
        canonical="/lotofacil/tabela-de-dezenas"
      />
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: COR }}>
            <TableIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: COR }}>Lotofácil · Tabela de Dezenas</h1>
            <p className="text-muted-foreground mt-1">
              Ranking de todas as 25 dezenas — {data.totalConcursos} concursos analisados.
            </p>
          </div>
        </div>
        <Link href="/lotofacil/resumo-estatistico">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" /> Resumo Estatístico
          </Button>
        </Link>
      </div>

      {/* Sort buttons */}
      <div className="flex gap-2 flex-wrap">
        {([
          { value: "frequencia", label: "Ordenar por Frequência" },
          { value: "atraso",     label: "Ordenar por Atraso" },
          { value: "dezena",     label: "Ordenar por Dezena" },
        ] as const).map(({ value, label }) => (
          <Button
            key={value}
            variant={sort === value ? "default" : "outline"}
            size="sm"
            onClick={() => setSort(value)}
            style={sort === value ? { backgroundColor: COR, color: "white" } : {}}
          >
            {label}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ranking das 25 Dezenas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-center w-12">#</TableHead>
                  <TableHead className="text-center">Dezena</TableHead>
                  <TableHead className="text-right">Frequência</TableHead>
                  <TableHead className="text-right">% de Sorteios</TableHead>
                  <TableHead className="text-right">Último Concurso</TableHead>
                  <TableHead className="text-right">Atraso (concursos)</TableHead>
                  <TableHead className="hidden md:table-cell">Frequência (barra)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((d, i) => {
                  const freqPct = maxFreq > 0 ? (d.frequencia / maxFreq) * 100 : 0;
                  const atrasoPct = maxAtraso > 0 ? (d.atraso / maxAtraso) * 100 : 0;
                  const isHighFreq = sort === "frequencia" && i < 5;
                  const isHighAtraso = sort === "atraso" && i < 5;

                  return (
                    <TableRow key={d.dezena} className={cn(isHighFreq || isHighAtraso ? "font-semibold" : "")}>
                      <TableCell className="text-center text-muted-foreground text-sm">{i + 1}</TableCell>
                      <TableCell className="text-center">
                        <LotteryBall number={parseInt(d.dezena, 10)} size="sm" color={COR} />
                      </TableCell>
                      <TableCell className="text-right font-bold">{d.frequencia}</TableCell>
                      <TableCell className="text-right">{d.percentual.toFixed(1)}%</TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {d.ultimoConcurso ?? "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={cn(isHighAtraso ? "text-amber-600" : "")}>
                          {d.atraso}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${sort === "atraso" ? atrasoPct : freqPct}%`,
                                backgroundColor: sort === "atraso" ? "#f59e0b" : COR,
                              }}
                            />
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
