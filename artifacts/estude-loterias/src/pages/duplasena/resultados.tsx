import { useState } from "react";
import { Link } from "wouter";
import { useGetDuplasenaResultados } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDateShort, estimarSena2 } from "@/lib/formatters";
import { LotteryBall } from "@/components/ui/lottery-ball";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, List } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";

const COR = "#a61324";
const BALL_BG = "#a61324";
const BALL_TEXT = "#ffffff";

export default function DuplasenaResultadosAnteriores() {
  const [page, setPage] = useState(1);
  const [ano, setAno] = useState<number | null>(null);
  const [ordem, setOrdem] = useState<"asc" | "desc">("desc");
  const [sorteio, setSorteio] = useState<"1" | "2">("1");

  const { data, isLoading, isError } = useGetDuplasenaResultados({ page, limit: 20, ano, ordem });

  const today = new Date().getFullYear();
  const firstYear = 2001;
  const years = Array.from({ length: today - firstYear + 1 }, (_, i) => today - i);

  const totalCols = 6;

  return (
    <div className="space-y-6">
      <PageSEO
        title="Todos os Resultados da Dupla Sena"
        description="Consulte o histórico completo de todos os resultados da Dupla Sena. Filtre por ano, veja dezenas sorteadas (1º e 2º sorteios) e prêmios de cada concurso."
        canonical="/duplasena/resultados"
      />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: COR }}>
            <List className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: COR }}>Dupla Sena · Resultados Anteriores</h1>
            <p className="text-muted-foreground mt-1">Busque e analise os concursos passados da Dupla Sena.</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Select value={sorteio} onValueChange={v => { setSorteio(v as "1" | "2"); setPage(1); }}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Sorteio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1º Sorteio</SelectItem>
              <SelectItem value="2">2º Sorteio</SelectItem>
            </SelectContent>
          </Select>

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
                  <TableHead className="text-center">{sorteio === "1" ? "1º Sorteio" : "2º Sorteio"}</TableHead>
                  <TableHead className="text-right">Prêmio 6 acertos</TableHead>
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
                      <TableCell>
                        <div className="flex justify-center gap-0.5 flex-wrap">
                          {Array.from({ length: 6 }).map((_, j) => (
                            <Skeleton key={j} className="h-6 w-6 rounded-full" />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  ))
                ) : isError || !data ? (
                  <TableRow>
                    <TableCell colSpan={totalCols} className="h-24 text-center">
                      Erro ao carregar dados.
                    </TableCell>
                  </TableRow>
                ) : data.resultados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={totalCols} className="h-24 text-center">
                      Nenhum resultado encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.resultados.map(res => {
                    const dezenas = sorteio === "1" ? res.dezenas : (res.dezenas2 ?? []);
                    const senas = res.premios.filter(p => p.descricao === "6 acertos");
                    const sena = sorteio === "1" ? senas[0] : senas[1];
                    return (
                      <TableRow key={res.concurso}>
                        <TableCell className="font-bold">{res.concurso}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{formatDateShort(res.data)}</TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-1 flex-wrap">
                            {dezenas.length > 0 ? (
                              dezenas.map((d, i) => (
                                <LotteryBall key={i} number={d} size="sm" color={BALL_BG} textColor={BALL_TEXT} />
                              ))
                            ) : (
                              <span className="text-muted-foreground text-xs">—</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {(() => {
                            if (!sena) return "–";
                            if (sena.ganhadores > 0) return formatCurrency(sena.valorPremio * sena.ganhadores);
                            // 1º sorteio can show the accumulated amount when no winners
                            if (sorteio === "1" && res.valorAcumulado) return formatCurrency(res.valorAcumulado);
                            // 2º sorteio: estimar a partir de faixas com vencedores (Quina2/Quadra2)
                            const premLen = res.premios.length;
                            const off2 = premLen >= 8 ? 5 : premLen >= 6 ? 4 : 2;
                            const q2 = res.premios.find(p => p.faixa === off2 + 1);
                            const qd2 = res.premios.find(p => p.faixa === off2 + 2);
                            const tQ2 = q2 && q2.ganhadores > 0 ? q2.ganhadores * q2.valorPremio : null;
                            const tQd2 = qd2 && qd2.ganhadores > 0 ? qd2.ganhadores * qd2.valorPremio : null;
                            const estimativa = estimarSena2(premLen, tQ2, tQd2, res.arrecadacaoTotal, res.data);
                            if (estimativa != null) return `≈ ${formatCurrency(estimativa)}`;
                            return "—";
                          })()}
                        </TableCell>
                        <TableCell>
                          {sena == null ? (
                            <span className="text-muted-foreground text-xs">—</span>
                          ) : sena.ganhadores === 0 ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20">
                              Acumulou!
                            </span>
                          ) : (
                            <span
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border"
                              style={{ backgroundColor: COR + "1a", color: COR, borderColor: COR + "33" }}
                            >
                              Saiu!
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Link href={`/duplasena/resultado/${res.concurso}`}>
                            <Button variant="ghost" size="sm" style={{ color: COR }}>
                              Ver detalhes →
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {data && data.totalPaginas > 1 && (
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {page} de {data.totalPaginas} ({data.total} resultados)
          </span>
          <Button variant="outline" onClick={() => setPage(p => p + 1)} disabled={page >= data.totalPaginas}>
            Próxima <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
