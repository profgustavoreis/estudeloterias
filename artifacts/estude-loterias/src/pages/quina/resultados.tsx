import { useState } from "react";
import { Link } from "wouter";
import { useGetQuinaResultados } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDateShort } from "@/lib/formatters";
import { LotteryBall } from "@/components/ui/lottery-ball";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, List } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";

const COR = "#260085";

export default function QuinaResultadosAnteriores() {
  const [page, setPage] = useState(1);
  const [ano, setAno] = useState<number | null>(null);
  const [ordem, setOrdem] = useState<"asc" | "desc">("desc");

  const { data, isLoading, isError } = useGetQuinaResultados({ page, limit: 20, ano, ordem });

  const years = Array.from({ length: new Date().getFullYear() - 1994 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="space-y-6">
      <PageSEO
        title="Todos os Resultados da Quina"
        description="Consulte o histórico completo de todos os resultados da Quina. Filtre por ano, veja dezenas sorteadas e prêmios de cada concurso."
        canonical="/quina/resultados"
      />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: COR }}>
            <List className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: COR }}>Quina · Resultados Anteriores</h1>
            <p className="text-muted-foreground mt-1">Busque e analise os concursos passados da Quina.</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Select value={ano?.toString() || "todos"} onValueChange={v => { setAno(v === "todos" ? null : parseInt(v)); setPage(1); }}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filtrar por ano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os anos</SelectItem>
              {years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={ordem} onValueChange={v => { setOrdem(v as "asc" | "desc"); setPage(1); }}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Mais recente primeiro</SelectItem>
              <SelectItem value="asc">Mais antigo primeiro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="rounded-md">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="w-[100px]">Concurso</TableHead>
                  <TableHead className="w-[110px]">Data</TableHead>
                  <TableHead className="text-center">Dezenas Sorteadas</TableHead>
                  <TableHead className="text-right">Prêmio 5 acertos</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead className="w-[130px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell><div className="flex justify-center gap-1">{Array.from({ length: 5 }).map((_, j) => <Skeleton key={j} className="h-7 w-7 rounded-full" />)}</div></TableCell>
                      <TableCell><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  ))
                ) : isError || !data ? (
                  <TableRow><TableCell colSpan={6} className="h-24 text-center">Erro ao carregar dados.</TableCell></TableRow>
                ) : data.resultados.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="h-24 text-center">Nenhum resultado encontrado.</TableCell></TableRow>
                ) : (
                  data.resultados.map(res => (
                    <TableRow key={res.concurso}>
                      <TableCell className="font-bold">{res.concurso}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{formatDateShort(res.data)}</TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-1 flex-wrap">
                          {res.dezenas.map((num, i) => (
                            <LotteryBall key={i} number={num} size="sm" color={COR} />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {(() => {
                          if (res.acumulado) return formatCurrency(res.valorAcumulado);
                          const p1 = res.premios.find(p => p.faixa === 1);
                          if (!p1) return "–";
                          return formatCurrency(p1.valorPremio);
                        })()}
                      </TableCell>
                      <TableCell>
                        {res.acumulado ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20">Acumulou!</span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border" style={{ backgroundColor: COR + "1a", color: COR, borderColor: COR + "33" }}>Saiu!</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/quina/resultado/${res.concurso}`} className="text-sm font-semibold hover:underline whitespace-nowrap" style={{ color: COR }}>
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
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || isLoading}>
              <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page === data.totalPaginas || isLoading}>
              Próxima <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
