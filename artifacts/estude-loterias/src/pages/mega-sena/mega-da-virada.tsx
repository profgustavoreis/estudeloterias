import { Link } from "wouter";
import { useGetMegaDaVirada } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { LotteryBall } from "@/components/ui/lottery-ball";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdUnit } from "@/components/ui/AdUnit";
import { Gift, Trophy } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";
import { SpecialEditionHero } from "@/components/ui/SpecialEditionHero";
import { cn } from "@/lib/utils";
import {
  buildSpecialEditionFallback,
  buildSpecialEditionSeo,
} from "@workspace/seo-special-editions";
import {
  anoEdicaoDaData,
  resolveSpecialEditionView,
  specialEditionBaseFacts,
  specialEditionFacts,
  SPECIAL_EDITIONS_META,
} from "@/lib/special-editions";

const COR = "#009640";
const META = SPECIAL_EDITIONS_META.virada;

/**
 * Ano da edição exibido na tabela de histórico.
 *
 * A edição corrente usa o `anoEdicao` normalizado do payload. Para as demais
 * linhas aplicamos a mesma regra do serviço (`anoEdicaoDaData`): uma Virada
 * sorteada em 01/01/yyyy pertence à edição yyyy - 1 (ex.: concurso 2955,
 * sorteado em 01/01/2026, é a edição 2025). Isso mantém o ano correto mesmo
 * depois que o ciclo avança e `ultimaEdicao` passa a apontar para outra edição.
 * Pequena duplicação consciente da regra server-side.
 */
function edicaoYear(
  sorteio: { concurso: number; data: string },
  ultimaEdicao: { concurso?: number; anoEdicao?: number } | null | undefined,
): string {
  if (ultimaEdicao && ultimaEdicao.concurso === sorteio.concurso && ultimaEdicao.anoEdicao != null) {
    return String(ultimaEdicao.anoEdicao);
  }
  const ano = anoEdicaoDaData("virada", sorteio.data);
  return ano ? String(ano) : "–";
}

export default function MegaDaVirada() {
  const { data: megaDaVirada, isLoading, isError } = useGetMegaDaVirada();

  const fallbackSeo = buildSpecialEditionFallback(specialEditionBaseFacts("virada"));

  if (isLoading) {
    return (
      <div className="space-y-8">
        <PageSEO
          title={fallbackSeo.title}
          description={fallbackSeo.description}
          canonical={META.canonical}
        />
        <div>Carregando informações...</div>
      </div>
    );
  }

  if (isError || !megaDaVirada) {
    return (
      <div className="space-y-8">
        <PageSEO
          title={fallbackSeo.title}
          description={fallbackSeo.description}
          canonical={META.canonical}
        />
        <div>Erro ao carregar informações da Mega da Virada.</div>
      </div>
    );
  }

  const view = resolveSpecialEditionView({ tipo: "virada", data: megaDaVirada });
  const seo = buildSpecialEditionSeo(specialEditionFacts({ tipo: "virada", data: megaDaVirada }));

  return (
    <div className="space-y-8">
      <PageSEO
        title={seo.title}
        description={seo.description}
        canonical={META.canonical}
      />
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-xl bg-[#009640] flex items-center justify-center text-white shadow-lg">
          <Gift className="w-8 h-8" />
        </div>
        <div>
          <h1 className={cn("text-2xl md:text-3xl font-black tracking-tight", view.accent.text)}>
            {view.h1}
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">O sorteio mais aguardado do ano que não acumula.</p>
        </div>
      </div>

      <SpecialEditionHero view={view} />

      <AdUnit slot="1122334456" format="rectangle" className="min-h-[250px]" />

      {/* Histórico */}
      <Card id="historico">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#009640]" />
            Histórico de Sorteios
          </CardTitle>
          <CardDescription>Todos os resultados da Mega da Virada desde 2009.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-center w-[80px]">Ano</TableHead>
                  <TableHead className="text-center w-[100px]">Concurso</TableHead>
                  <TableHead className="text-center min-w-[280px]">Dezenas Sorteadas</TableHead>
                  <TableHead className="text-center">Prêmio Principal</TableHead>
                  <TableHead className="text-center">Apostas com 6 acertos</TableHead>
                  <TableHead className="text-center">Rateio por Ganhador</TableHead>
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
                        <TableCell className="text-center font-bold">
                          {edicaoYear(sorteio, megaDaVirada.ultimaEdicao)}
                        </TableCell>
                        <TableCell className="text-center text-muted-foreground font-mono">
                          {sorteio.concurso}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-1.5 flex-wrap">
                            {sorteio.dezenas.map((num, i) => (
                              <LotteryBall key={i} number={num} size="sm" color="#009640" />
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-bold text-[#009640]">
                          {formatCurrency(
                            premioSena && premioSena.ganhadores > 0
                              ? premioSena.valorPremio * premioSena.ganhadores
                              : premioSena?.valorPremio
                          )}
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          {premioSena?.ganhadores ?? 0}
                        </TableCell>
                        <TableCell className="text-center font-bold text-[#009640]">
                          {formatCurrency(premioSena?.valorPremio)}
                        </TableCell>
                        <TableCell className="text-center">
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
