import { useGetMegaSenaUltimoResultado } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency, formatLongDate, formatDate } from "@/lib/formatters";
import { LotteryBall } from "@/components/ui/lottery-ball";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MapPin, Calendar, Target, Trophy } from "lucide-react";

export default function MegaSenaUltimoResultado() {
  const { data: resultado, isLoading, isError } = useGetMegaSenaUltimoResultado();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !resultado) {
    return <div>Erro ao carregar o resultado.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#009640]">Último Resultado</h1>
        <p className="text-muted-foreground mt-1">Concurso {resultado.concurso} • {formatLongDate(resultado.data)}</p>
      </div>

      <Card className="border-t-4 border-[#009640] shadow-md">
        <CardContent className="pt-8 pb-10">
          <div className="flex flex-col items-center justify-center space-y-8">
            {resultado.acumulado ? (
              <div className="text-center">
                <h2 className="text-3xl md:text-5xl font-black text-destructive uppercase tracking-widest mb-2">Acumulou!</h2>
                <p className="text-xl text-muted-foreground">O prêmio principal acumulou para o próximo sorteio</p>
              </div>
            ) : (
              <div className="text-center">
                <h2 className="text-3xl md:text-5xl font-black text-[#009640] uppercase tracking-widest mb-2">Saiu!</h2>
                <p className="text-xl text-muted-foreground">Houve ganhadores para o prêmio principal</p>
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-3 md:gap-6 px-4 py-8 bg-muted/40 rounded-2xl border border-border w-full max-w-3xl">
              {resultado.dezenas.map((num, i) => (
                <LotteryBall key={i} number={num} size="xl" color="#009640" />
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
              <div className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl shadow-sm">
                <MapPin className="w-8 h-8 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground font-medium">Local do Sorteio</div>
                  <div className="font-semibold">{resultado.local || "Espaço da Sorte, São Paulo/SP"}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl shadow-sm">
                <Target className="w-8 h-8 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground font-medium">Arrecadação Total</div>
                  <div className="font-semibold">{formatCurrency(resultado.arrecadacaoTotal)}</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Rateio dos Prêmios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Faixa</TableHead>
                    <TableHead className="text-right">Ganhadores</TableHead>
                    <TableHead className="text-right">Valor do Prêmio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resultado.premios.map((premio, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{premio.descricao}</TableCell>
                      <TableCell className="text-right">{premio.ganhadores.toLocaleString('pt-BR')}</TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(premio.valorPremio)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Próximo Sorteio
            </CardTitle>
            <CardDescription>
              {resultado.dataProximoConcurso ? formatDate(resultado.dataProximoConcurso) : "A definir"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6 bg-muted/30 rounded-lg border border-border">
              <div className="text-sm text-muted-foreground font-medium mb-2 uppercase tracking-wide">Prêmio Estimado</div>
              <div className="text-3xl font-bold text-[#009640]">
                {formatCurrency(resultado.valorEstimadoProximoConcurso)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
