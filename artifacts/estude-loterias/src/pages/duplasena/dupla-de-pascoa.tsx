import { Link } from "wouter";
import { useGetDuplasenaDuplaDePascoa } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { LotteryBall } from "@/components/ui/lottery-ball";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdUnit } from "@/components/ui/AdUnit";
import { Skeleton } from "@/components/ui/skeleton";
import { Gift, Trophy, Sparkles } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";
import { SpecialEditionHero } from "@/components/ui/SpecialEditionHero";
import { cn } from "@/lib/utils";
import {
  buildSpecialEditionFallback,
  buildSpecialEditionSeo,
} from "@workspace/seo-special-editions";
import {
  resolveSpecialEditionView,
  specialEditionBaseFacts,
  specialEditionFacts,
  SPECIAL_EDITIONS_META,
} from "@/lib/special-editions";

const COR = "#a61324";
const META = SPECIAL_EDITIONS_META.pascoa;

export default function DuplasenaDuplaDePascoa() {
  const { data, isLoading, isError } = useGetDuplasenaDuplaDePascoa();

  const fallbackSeo = buildSpecialEditionFallback(specialEditionBaseFacts("pascoa"));

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageSEO
          title={fallbackSeo.title}
          description={fallbackSeo.description}
          canonical={META.canonical}
        />
        <div className="flex items-center gap-4">
          <Skeleton className="w-16 h-16 rounded-xl" />
          <div><Skeleton className="h-9 w-64" /><Skeleton className="h-5 w-96 mt-1" /></div>
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-6">
        <PageSEO
          title={fallbackSeo.title}
          description={fallbackSeo.description}
          canonical={META.canonical}
        />
        <div>Erro ao carregar informações da Dupla de Páscoa.</div>
      </div>
    );
  }

  const view = resolveSpecialEditionView({ tipo: "pascoa", data });
  const seo = buildSpecialEditionSeo(specialEditionFacts({ tipo: "pascoa", data }));

  return (
    <div className="space-y-8">
      <PageSEO
        title={seo.title}
        description={seo.description}
        canonical={META.canonical}
      />
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: COR }}>
          <Gift className="w-8 h-8" />
        </div>
        <div>
          <h1 className={cn("text-2xl md:text-3xl font-black tracking-tight", view.accent.text)}>
            {view.h1}
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">O sorteio especial da Dupla Sena com prêmio turbinado!</p>
        </div>
      </div>

      <SpecialEditionHero view={view} />

      <AdUnit slot="7788990044" format="rectangle" className="min-h-[250px]" />

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
              <div className="text-3xl font-black" style={{ color: COR }}>16%</div>
              <p className="text-sm mt-1">Do fundo de prêmios de cada concurso é reservado para a 1ª faixa do 1º sorteio da Dupla de Páscoa</p>
            </div>
            <div className="p-4 border rounded-lg bg-muted/30 text-center">
              <div className="text-3xl font-black" style={{ color: COR }}>
                <Sparkles className="w-7 h-7 inline-block" style={{ color: COR }} />
              </div>
              <p className="text-sm mt-1">O valor é acumulado ao longo do ano e turbina a 1ª faixa do 1º sorteio da edição especial</p>
            </div>
            <div className="p-4 border rounded-lg bg-muted/30 text-center">
              <div className="text-3xl font-black" style={{ color: COR }}>2×</div>
              <p className="text-sm mt-1">Sorteios por concurso — sua aposta concorre em dois sorteios diferentes</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card id="historico">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" style={{ color: COR }} />
            Histórico de Sorteios
          </CardTitle>
          <CardDescription>Todos os resultados da Dupla de Páscoa.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-center w-[100px]">Concurso</TableHead>
                  <TableHead className="text-center w-[110px]">Data</TableHead>
                  <TableHead className="text-center">1º Sorteio</TableHead>
                  <TableHead className="text-center">2º Sorteio</TableHead>
                  <TableHead className="text-center">Prêmio Principal</TableHead>
                  <TableHead className="w-[130px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.historico.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">Nenhum histórico encontrado.</TableCell>
                  </TableRow>
                ) : (
                  data.historico.map((sorteio) => {
                    const premioFaixa1 = sorteio.premios.find(p => p.faixa === 1);
                    const premioFaixa2 = sorteio.premios.find(p => p.faixa === 2);
                    // Prêmio principal = total pago na faixa principal do 1º sorteio,
                    // com cascade faixa 1 → faixa 2 (mesma regra do servidor).
                    const premioPrincipal =
                      premioFaixa1 && premioFaixa1.ganhadores > 0
                        ? premioFaixa1.valorPremio * premioFaixa1.ganhadores
                        : premioFaixa2 && premioFaixa2.ganhadores > 0
                          ? premioFaixa2.valorPremio * premioFaixa2.ganhadores
                          : premioFaixa1?.valorPremio;
                    const isAtual = data.ultimaEdicao?.concurso === sorteio.concurso;
                    const totalPremio =
                      isAtual && data.ultimaEdicao?.premioTotal != null
                        ? data.ultimaEdicao.premioTotal
                        : premioPrincipal;
                    const dezenas2 = sorteio.dezenas2 ?? [];
                    return (
                      <TableRow key={sorteio.concurso}>
                        <TableCell className="text-center font-bold">{sorteio.concurso}</TableCell>
                        <TableCell className="text-center text-muted-foreground font-mono text-sm">{sorteio.data}</TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-1 flex-wrap">
                            {sorteio.dezenas.map((num, i) => (
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
                          {formatCurrency(totalPremio)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Link
                            href={`/duplasena/resultado/${sorteio.concurso}`}
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
