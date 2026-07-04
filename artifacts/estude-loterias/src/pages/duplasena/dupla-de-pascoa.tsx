import { Link } from "wouter";
import { useGetDuplasenaUltimoResultado, useGetDuplasenaResultados } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { LotteryBall } from "@/components/ui/lottery-ball";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdUnit } from "@/components/ui/AdUnit";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Gift, Calendar, Trophy, Sparkles } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";

const COR = "#a61324";

export default function DuplasenaDuplaDePascoa() {
  const { data: resultado, isLoading } = useGetDuplasenaUltimoResultado();
  const { data: resultados } = useGetDuplasenaResultados({ page: 1, limit: 100, ordem: "desc" });

  const historicoConcursos = resultados?.resultados ?? [];

  const isPascoa = (concurso: number) => {
    const concursosEspeciais = historicoConcursos.filter(r => {
      const data = r.data;
      const [dia, mes] = data.split("/").map(Number);
      return mes === 3 || mes === 4;
    }).slice(0, 10);
    return concursosEspeciais.length > 0;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="w-16 h-16 rounded-xl" />
          <div><Skeleton className="h-9 w-64" /><Skeleton className="h-5 w-96 mt-1" /></div>
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageSEO
        title="Dupla de Páscoa — Sorteio Especial da Dupla Sena"
        description="Tudo sobre a Dupla de Páscoa: o sorteio especial da Dupla Sena com prêmio acumulado. Confira histórico, regras e como funciona a reserva de prêmios."
        canonical="/duplasena/dupla-de-pascoa"
      />
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: COR }}>
          <Gift className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase" style={{ color: COR }}>
            Dupla de Páscoa
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">O sorteio especial da Dupla Sena com prêmio turbinado!</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-t-4" style={{ borderColor: COR }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" style={{ color: COR }} />
              Sorteio Especial de Páscoa
            </CardTitle>
            <CardDescription className="text-base font-medium text-foreground flex items-center gap-2 flex-wrap">
              Realizado uma vez por ano, próximo à Páscoa
              <Badge variant="secondary">edição especial</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              A Dupla de Páscoa é o sorteio especial da Dupla Sena. Durante todo o ano, <strong>15% do fundo de prêmios</strong> de cada
              concurso é reservado para esta edição especial, resultando em um prêmio muito maior que o dos concursos regulares.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              As regras do jogo são as mesmas: você escolhe de 6 a 15 números entre 01 e 50, e concorre em dois sorteios.
              A diferença é o prêmio acumulado, que pode chegar a dezenas de milhões!
            </p>
          </CardContent>
        </Card>

        <AdUnit slot="7788990044" format="rectangle" className="min-h-[250px]" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" style={{ color: COR }} />
            Como Funciona a Reserva
          </CardTitle>
          <CardDescription>Entenda como o prêmio da Dupla de Páscoa é formado.</CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 border rounded-lg bg-muted/30 text-center">
              <div className="text-3xl font-black" style={{ color: COR }}>15%</div>
              <p className="text-sm mt-1">Do fundo de prêmios de cada concurso é separado para a Dupla de Páscoa</p>
            </div>
            <div className="p-4 border rounded-lg bg-muted/30 text-center">
              <div className="text-3xl font-black" style={{ color: COR }}>
                <Sparkles className="w-7 h-7 inline-block" style={{ color: COR }} />
              </div>
              <p className="text-sm mt-1">O valor acumula ao longo do ano e turbina o prêmio do sorteio especial</p>
            </div>
            <div className="p-4 border rounded-lg bg-muted/30 text-center">
              <div className="text-3xl font-black" style={{ color: COR }}>2×</div>
              <p className="text-sm mt-1">Sorteios por concurso — sua aposta concorre em dois sorteios diferentes</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" style={{ color: COR }} />
            Últimos Concursos
          </CardTitle>
          <CardDescription>Confira os resultados recentes da Dupla Sena.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-center w-[80px]">Concurso</TableHead>
                  <TableHead className="text-center w-[100px]">Data</TableHead>
                  <TableHead className="text-center">1º Sorteio</TableHead>
                  <TableHead className="text-center">2º Sorteio</TableHead>
                  <TableHead className="text-center">Prêmio Principal</TableHead>
                  <TableHead className="w-[130px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historicoConcursos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">Nenhum resultado encontrado.</TableCell>
                  </TableRow>
                ) : (
                  historicoConcursos.slice(0, 10).map((res) => {
                    const premioFaixa1 = res.premios.find(p => p.faixa === 1);
                    const dezenas2 = res.dezenas2 ?? [];
                    return (
                      <TableRow key={res.concurso}>
                        <TableCell className="text-center font-bold">{res.concurso}</TableCell>
                        <TableCell className="text-center text-muted-foreground font-mono text-sm">{res.data}</TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-1 flex-wrap">
                            {res.dezenas.map((num, i) => (
                              <LotteryBall key={i} number={parseInt(num, 10)} size="sm" color={COR} />
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-1 flex-wrap">
                            {dezenas2.length > 0 ? (
                              dezenas2.map((num, i) => (
                                <LotteryBall key={i} number={parseInt(num, 10)} size="sm" color={COR} />
                              ))
                            ) : (
                              <span className="text-muted-foreground text-xs">—</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-bold" style={{ color: COR }}>
                          {premioFaixa1 ? formatCurrency(premioFaixa1.valorPremio) : "—"}
                        </TableCell>
                        <TableCell className="text-center">
                          <Link
                            href={`/duplasena/resultado/${res.concurso}`}
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
