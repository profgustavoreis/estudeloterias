import { useState } from "react";
import { Link } from "wouter";
import { useGetMegaSenaResultados } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDateShort } from "@/lib/formatters";
import { LotteryBall } from "@/components/ui/lottery-ball";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function MegaSenaResultadosAnteriores() {
  const [page, setPage] = useState(1);
  const [ano, setAno] = useState<number | null>(null);

  const { data, isLoading, isError } = useGetMegaSenaResultados({ page, limit: 20, ano });

  const years = Array.from({ length: new Date().getFullYear() - 1995 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#009640]">Resultados Anteriores</h1>
          <p className="text-muted-foreground mt-1">Busque e analise os concursos passados da Mega-Sena.</p>
        </div>

        <Select
          value={ano?.toString() || "todos"}
          onValueChange={(v) => {
            setAno(v === "todos" ? null : parseInt(v));
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por ano" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os anos</SelectItem>
            {years.map(y => (
              <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="rounded-md">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="w-[100px]">Concurso</TableHead>
                  <TableHead className="w-[110px]">Data</TableHead>
                  <TableHead className="text-center min-w-[280px]">Dezenas Sorteadas</TableHead>
                  <TableHead className="text-right">Situação</TableHead>
                  <TableHead className="text-right">Prêmio Principal</TableHead>
                  <TableHead className="w-[130px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-1">
                          {Array.from({ length: 6 }).map((_, j) => (
                            <Skeleton key={j} className="h-8 w-8 rounded-full" />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24 ml-auto" /></TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  ))
                ) : isError || !data ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">Erro ao carregar dados.</TableCell>
                  </TableRow>
                ) : data.resultados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">Nenhum resultado encontrado.</TableCell>
                  </TableRow>
                ) : (
                  data.resultados.map((res) => (
                    <TableRow key={res.concurso}>
                      <TableCell className="font-bold">{res.concurso}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{formatDateShort(res.data)}</TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-1.5 flex-wrap">
                          {res.dezenas.map((num, i) => (
                            <LotteryBall key={i} number={num} size="sm" color="#009640" />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {res.acumulado ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20">
                            Acumulou
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                            Saiu
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {res.acumulado
                          ? formatCurrency(res.valorAcumulado)
                          : formatCurrency(res.premios.find(p => p.faixa === 1)?.valorPremio)
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/mega-sena/resultado/${res.concurso}`}
                          className="text-sm font-semibold text-[#009640] hover:underline whitespace-nowrap"
                        >
                          Ver detalhes →
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {data && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            Página {data.pagina} de {data.totalPaginas} ({data.total} concursos)
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => p + 1)}
              disabled={page === data.totalPaginas || isLoading}
            >
              Próxima <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
