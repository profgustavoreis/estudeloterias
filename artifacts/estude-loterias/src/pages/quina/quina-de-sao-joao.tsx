import { Link } from "wouter";
import { useGetQuinaDeSaoJoao } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency, formatLongDate, formatWeekday } from "@/lib/formatters";
import { LotteryBall } from "@/components/ui/lottery-ball";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdUnit } from "@/components/ui/AdUnit";
import { Badge } from "@/components/ui/badge";
import { PartyPopper, Calendar, Trophy } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";

const COR = "#260085";

export default function QuinaDeSaoJoao() {
  const { data, isLoading, isError } = useGetQuinaDeSaoJoao();

  if (isLoading) {
    return <div>Carregando informações...</div>;
  }

  if (isError || !data) {
    return <div>Erro ao carregar informações da Quina de São João.</div>;
  }

  return (
    <div className="space-y-8">
      <PageSEO
        title="Quina de São João — Histórico, Resultados e Estatísticas"
        description="Todos os resultados da Quina de São João: dezenas sorteadas, prêmios, ganhadores e estatísticas do sorteio especial realizado anualmente perto de 24 de junho."
        canonical="/quina/quina-de-sao-joao"
      />
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: COR }}>
          <PartyPopper className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase" style={{ color: COR }}>
            Quina de São João
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">O sorteio especial realizado anualmente perto de 24 de junho.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-t-4 bg-[#260085]/5" style={{ borderColor: COR }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" style={{ color: COR }} />
              Próxima Edição
            </CardTitle>
            <CardDescription className="text-base font-medium text-foreground flex items-center gap-2 flex-wrap">
              {formatLongDate(data.dataProximaEdicao)} ({formatWeekday(data.dataProximaEdicao)})
              <Badge className="bg-amber-100 text-amber-800 border border-amber-200">a confirmar</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground mb-1 uppercase font-semibold">Prêmio Estimado</div>
            <div className="text-4xl font-black" style={{ color: COR }}>
              {data.valorEstimado ? formatCurrency(data.valorEstimado) : "A definir"}
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Diferente da Mega da Virada (sempre 31 de dezembro) e da Lotofácil da Independência (sempre 7 de
              setembro), a Quina de São João não tem uma data fixa. Desde 2020, o sorteio costuma acontecer no
              sábado da semana do dia 24 de junho — mas já houve exceções, então trate a data acima como uma
              estimativa até a confirmação oficial da Caixa.
            </p>
          </CardContent>
        </Card>

        <AdUnit slot="7788990022" format="rectangle" className="min-h-[250px]" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" style={{ color: COR }} />
            Histórico de Sorteios
          </CardTitle>
          <CardDescription>Todos os resultados da Quina de São João.</CardDescription>
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
                  <TableHead className="text-center">Ganhadores</TableHead>
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
                    const faixa1 = sorteio.premios.find(p => p.faixa === 1);
                    const faixa2 = sorteio.premios.find(p => p.faixa === 2);
                    // Sorteio especial não acumula: sem ganhador na quina, o prêmio garantido
                    // desce para a faixa da quadra (4 acertos) no mesmo concurso.
                    const semQuina = !faixa1 || faixa1.ganhadores === 0;
                    const faixaPremiada = semQuina ? faixa2 : faixa1;
                    const totalPremio = faixaPremiada && faixaPremiada.ganhadores > 0
                      ? faixaPremiada.valorPremio * faixaPremiada.ganhadores
                      : faixaPremiada?.valorPremio;
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
                              <LotteryBall key={i} number={parseInt(num, 10)} size="sm" color={COR} />
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-bold" style={{ color: COR }}>
                          {formatCurrency(totalPremio)}
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          <div>{faixaPremiada?.ganhadores ?? 0}</div>
                          <div className="text-xs text-muted-foreground">
                            {semQuina ? "com 4 acertos" : "com 5 acertos"}
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-bold" style={{ color: COR }}>
                          {formatCurrency(faixaPremiada?.valorPremio)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Link
                            href={`/quina/resultado/${sorteio.concurso}`}
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
