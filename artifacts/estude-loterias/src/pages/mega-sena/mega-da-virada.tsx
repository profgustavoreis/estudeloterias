import { Link } from "wouter";
import { useGetMegaDaVirada } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency, formatLongDate } from "@/lib/formatters";
import { LotteryBall } from "@/components/ui/lottery-ball";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdUnit } from "@/components/ui/AdUnit";
import { Gift, Calendar, Trophy } from "lucide-react";

function yearFromDate(dateStr: string): string {
  const parts = dateStr.split("/");
  return parts.length === 3 ? (parts[2] ?? "–") : "–";
}

export default function MegaDaVirada() {
  const { data: megaDaVirada, isLoading, isError } = useGetMegaDaVirada();

  if (isLoading) {
    return <div>Carregando informações...</div>;
  }

  if (isError || !megaDaVirada) {
    return <div>Erro ao carregar informações da Mega da Virada.</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-lg">
          <Gift className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-amber-500 uppercase">Mega da Virada</h1>
          <p className="text-muted-foreground mt-1 text-lg">O sorteio mais aguardado do ano que não acumula.</p>
        </div>
      </div>

      {/* Row 1: Próximo Sorteio + AdUnit */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-t-4 border-amber-500 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-500" />
              Próximo Sorteio
            </CardTitle>
            <CardDescription className="text-base font-medium text-foreground">
              {formatLongDate(megaDaVirada.dataProximaVirada)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground mb-1 uppercase font-semibold">Prêmio Estimado</div>
            <div className="text-4xl font-black text-amber-500">
              {megaDaVirada.valorEstimado ? formatCurrency(megaDaVirada.valorEstimado) : "A definir"}
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              O prêmio da Mega da Virada não acumula. Se não houver acertadores de 6 números, o prêmio será dividido entre os acertadores de 5 números.
            </p>
          </CardContent>
        </Card>

        <AdUnit slot="1122334456" format="rectangle" className="min-h-[250px]" />
      </div>

      {/* Histórico */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Histórico de Sorteios
          </CardTitle>
          <CardDescription>Todos os resultados da Mega da Virada desde 2009.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[80px]">Ano</TableHead>
                  <TableHead className="w-[110px]">Concurso</TableHead>
                  <TableHead className="text-center min-w-[280px]">Dezenas Sorteadas</TableHead>
                  <TableHead className="text-right">Prêmio Principal</TableHead>
                  <TableHead className="text-right">Apostas com 6 acertos</TableHead>
                  <TableHead className="text-right">Rateio por Ganhador</TableHead>
                  <TableHead className="w-[130px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {megaDaVirada.historico.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-24">Nenhum histórico encontrado.</TableCell>
                  </TableRow>
                ) : (
                  megaDaVirada.historico.map((sorteio) => {
                    const premioSena = sorteio.premios.find(p => p.faixa === 1);
                    return (
                      <TableRow key={sorteio.concurso}>
                        <TableCell className="font-bold">{yearFromDate(sorteio.data)}</TableCell>
                        <TableCell className="text-muted-foreground font-mono">{sorteio.concurso}</TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-1.5 flex-wrap">
                            {sorteio.dezenas.map((num, i) => (
                              <LotteryBall key={i} number={num} size="sm" className="bg-amber-500 text-white border-amber-600" />
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-bold text-[#009640]">
                          {formatCurrency(
                            premioSena && premioSena.ganhadores > 0
                              ? premioSena.valorPremio * premioSena.ganhadores
                              : premioSena?.valorPremio
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {premioSena?.ganhadores ?? 0}
                        </TableCell>
                        <TableCell className="text-right font-bold text-amber-600">
                          {formatCurrency(premioSena?.valorPremio)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link
                            href={`/mega-sena/resultado/${sorteio.concurso}`}
                            className="text-sm font-semibold text-[#009640] hover:underline whitespace-nowrap"
                          >
                            Ver detalhes →
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
    </div>
  );
}
