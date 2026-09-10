import { Link } from "wouter";
import { useGetDuplasenaDuplaDePascoa, type FaixaPremio } from "@workspace/api-client-react";
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

interface DestaqueLinha {
  total: number;
  ganhadores: number;
  valorPremio: number;
  rotulo: string;
}

/**
 * Faixa principal do 1º sorteio da Dupla Sena, com cascade 1 → 2
 * (6 acertos → 5 acertos). A edição corrente usa os valores já resolvidos pelo
 * serviço em `ultimaEdicao`; as edições antigas derivam dos `premios` da própria
 * linha, com a mesma regra de cascade.
 */
function linhaDestaque(
  sorteio: { concurso: number; premios: FaixaPremio[] },
  ultimaEdicao:
    | { concurso?: number; premioTotal?: number | null; ganhadores?: number | null }
    | null
    | undefined,
): DestaqueLinha {
  const faixa1 = sorteio.premios.find((p) => p.faixa === 1);
  const faixa2 = sorteio.premios.find((p) => p.faixa === 2);
  const usaFaixa1 = !!faixa1 && faixa1.ganhadores > 0;
  const rotulo = usaFaixa1 ? "com 6 acertos" : "com 5 acertos";

  if (ultimaEdicao && ultimaEdicao.concurso === sorteio.concurso && ultimaEdicao.premioTotal != null) {
    const ganhadores = ultimaEdicao.ganhadores ?? 0;
    const total = ultimaEdicao.premioTotal;
    return {
      total,
      ganhadores,
      valorPremio: ganhadores > 0 ? total / ganhadores : 0,
      rotulo,
    };
  }

  const faixa = usaFaixa1
    ? faixa1
    : faixa2 && faixa2.ganhadores > 0
      ? faixa2
      : faixa1 ?? faixa2;
  const ganhadores = faixa?.ganhadores ?? 0;
  const valorPremio = faixa?.valorPremio ?? 0;
  return {
    total: ganhadores > 0 ? valorPremio * ganhadores : valorPremio,
    ganhadores,
    valorPremio,
    rotulo,
  };
}

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
                  <TableHead className="text-center w-[80px]">Ano</TableHead>
                  <TableHead className="text-center w-[100px]">Concurso</TableHead>
                  <TableHead className="text-center min-w-[120px]">1º Sorteio</TableHead>
                  <TableHead className="text-center min-w-[120px]">2º Sorteio</TableHead>
                  <TableHead className="text-center">Prêmio Principal</TableHead>
                  <TableHead className="text-center">Ganhadores</TableHead>
                  <TableHead className="text-center">Rateio por Ganhador</TableHead>
                  <TableHead className="w-[130px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.historico.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center h-24">Nenhum histórico encontrado.</TableCell>
                  </TableRow>
                ) : (
                  data.historico.map((sorteio) => {
                    const destaque = linhaDestaque(sorteio, data.ultimaEdicao);
                    const ano = sorteio.data.split("/")[2] ?? "–";
                    const dezenas2 = sorteio.dezenas2 ?? [];
                    return (
                      <TableRow key={sorteio.concurso}>
                        <TableCell className="text-center font-bold">{ano}</TableCell>
                        <TableCell className="text-center text-muted-foreground font-mono">
                          {sorteio.concurso}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center">
                            <div className="grid grid-cols-3 gap-1">
                              {sorteio.dezenas.map((num, i) => (
                                <LotteryBall key={i} number={parseInt(num, 10)} size="sm" color={COR} />
                              ))}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {dezenas2.length > 0 ? (
                            <div className="flex justify-center">
                              <div className="grid grid-cols-3 gap-1">
                                {dezenas2.map((num, i) => (
                                  <LotteryBall key={i} number={parseInt(num, 10)} size="sm" color={COR} />
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="text-center text-xs text-muted-foreground">—</div>
                          )}
                        </TableCell>
                        <TableCell className="text-center font-bold" style={{ color: COR }}>
                          {formatCurrency(destaque.total)}
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          <div>{destaque.ganhadores}</div>
                          <div className="text-xs text-muted-foreground">{destaque.rotulo}</div>
                        </TableCell>
                        <TableCell className="text-center font-bold" style={{ color: COR }}>
                          {destaque.ganhadores > 0 ? formatCurrency(destaque.valorPremio) : "—"}
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
