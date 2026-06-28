import { Link } from "wouter";
import { useGetLotofacilDaIndependencia } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency, formatLongDate } from "@/lib/formatters";
import { LotteryBall } from "@/components/ui/lottery-ball";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdUnit } from "@/components/ui/AdUnit";
import { Flag, Calendar, Trophy } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";

const COR = "#930089";

export default function LotofacilDaIndependencia() {
  const { data, isLoading, isError } = useGetLotofacilDaIndependencia();

  if (isLoading) {
    return <div>Carregando informações...</div>;
  }

  if (isError || !data) {
    return <div>Erro ao carregar informações da Lotofácil da Independência.</div>;
  }

  return (
    <div className="space-y-8">
      <PageSEO
        title="Lotofácil da Independência — Histórico, Resultados e Estatísticas"
        description="Todos os resultados da Lotofácil da Independência: dezenas sorteadas, prêmios, ganhadores e estatísticas do sorteio especial de 7 de setembro."
        canonical="/lotofacil/lotofacil-da-independencia"
      />
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: "#009C3B" }}>
          <Flag className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase" style={{ color: COR }}>
            Lotofácil da Independência
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">O sorteio especial de 7 de setembro que não acumula.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-t-4" style={{ borderColor: "#009C3B" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" style={{ color: "#009C3B" }} />
              Próxima Edição
            </CardTitle>
            <CardDescription className="text-base font-medium text-foreground">
              {formatLongDate(data.dataProximaEdicao)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground mb-1 uppercase font-semibold">Prêmio Estimado</div>
            <div className="text-4xl font-black" style={{ color: "#009C3B" }}>
              {data.valorEstimado ? formatCurrency(data.valorEstimado) : "A definir"}
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              O prêmio da Lotofácil da Independência não acumula. Se não houver acertadores de 15 números,
              o prêmio será dividido entre os acertadores de 14 números.
            </p>
          </CardContent>
        </Card>

        <AdUnit slot="7788990011" format="rectangle" className="min-h-[250px]" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" style={{ color: COR }} />
            Histórico de Sorteios
          </CardTitle>
          <CardDescription>Todos os resultados da Lotofácil da Independência.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-center w-[80px]">Ano</TableHead>
                  <TableHead className="text-center w-[100px]">Concurso</TableHead>
                  <TableHead className="text-center min-w-[300px]">Dezenas Sorteadas</TableHead>
                  <TableHead className="text-center">Prêmio Principal</TableHead>
                  <TableHead className="text-center">Apostas com 15 acertos</TableHead>
                  <TableHead className="text-center">Rateio por Ganhador</TableHead>
                  <TableHead className="w-[130px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.historico.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-24">Nenhum histórico encontrado.</TableCell>
                  </TableRow>
                ) : (
                  data.historico.map((sorteio) => {
                    const premioFaixa1 = sorteio.premios.find(p => p.faixa === 1);
                    const ano = sorteio.data.split("/")[2] ?? "–";
                    return (
                      <TableRow key={sorteio.concurso}>
                        <TableCell className="text-center font-bold">{ano}</TableCell>
                        <TableCell className="text-center text-muted-foreground font-mono">
                          {sorteio.concurso}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-1 flex-wrap">
                            {sorteio.dezenas.map((num, i) => (
                              <LotteryBall key={i} number={parseInt(num, 10)} size="sm" className="text-white border-0" style={{ backgroundColor: COR } as React.CSSProperties} />
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-bold" style={{ color: COR }}>
                          {formatCurrency(
                            premioFaixa1 && premioFaixa1.ganhadores > 0
                              ? premioFaixa1.valorPremio * premioFaixa1.ganhadores
                              : premioFaixa1?.valorPremio
                          )}
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          {premioFaixa1?.ganhadores ?? 0}
                        </TableCell>
                        <TableCell className="text-center font-bold" style={{ color: COR }}>
                          {formatCurrency(premioFaixa1?.valorPremio)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Link
                            href={`/lotofacil/resultado/${sorteio.concurso}`}
                            className="text-sm font-semibold hover:underline whitespace-nowrap"
                            style={{ color: COR }}
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
