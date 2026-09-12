import { Link } from "wouter";
import { useGetQuinaDeSaoJoao, type FaixaPremio } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { LotteryBall } from "@/components/ui/lottery-ball";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdUnit } from "@/components/ui/AdUnit";
import { PartyPopper, Trophy } from "lucide-react";
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

const COR = "#260085";
const META = SPECIAL_EDITIONS_META["sao-joao"];

interface LinhaDestaque {
  total: number;
  ganhadores: number;
  valorPremio: number;
  rotulo: string;
}

/**
 * Valores das colunas de prêmio de uma linha do histórico.
 *
 * A edição corrente usa o que o serviço já resolveu em `ultimaEdicao`
 * (`premioTotal`/`ganhadores`) — inclusive o fallback "sem quina → quadra".
 * Para edições antigas o contrato não expõe valores normalizados por linha, então
 * caímos nos `premios` da própria linha (quina ou, sem acertador, quadra).
 */
function linhaDestaque(
  sorteio: { concurso: number; premios: FaixaPremio[] },
  ultimaEdicao:
    | { concurso?: number; premioTotal?: number | null; ganhadores?: number | null }
    | null
    | undefined,
): LinhaDestaque {
  const faixa1 = sorteio.premios.find((p) => p.faixa === 1);

  if (ultimaEdicao && ultimaEdicao.concurso === sorteio.concurso) {
    const ganhadores = ultimaEdicao.ganhadores ?? 0;
    const total = ultimaEdicao.premioTotal ?? 0;
    const naQuina = (faixa1?.ganhadores ?? 0) > 0;
    return {
      total,
      ganhadores,
      valorPremio: ganhadores > 0 ? total / ganhadores : 0,
      rotulo: naQuina ? "com 5 acertos" : "com 4 acertos",
    };
  }

  const semQuina = !faixa1 || faixa1.ganhadores === 0;
  const faixa = semQuina ? sorteio.premios.find((p) => p.faixa === 2) : faixa1;
  const ganhadores = faixa?.ganhadores ?? 0;
  const valorPremio = faixa?.valorPremio ?? 0;
  return {
    total: ganhadores > 0 ? valorPremio * ganhadores : valorPremio,
    ganhadores,
    valorPremio,
    rotulo: semQuina ? "com 4 acertos" : "com 5 acertos",
  };
}

export default function QuinaDeSaoJoao() {
  const { data, isLoading, isError } = useGetQuinaDeSaoJoao();

  const fallbackSeo = buildSpecialEditionFallback(specialEditionBaseFacts("sao-joao"));

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

  if (isError || !data) {
    return (
      <div className="space-y-8">
        <PageSEO
          title={fallbackSeo.title}
          description={fallbackSeo.description}
          canonical={META.canonical}
        />
        <div>Erro ao carregar informações da Quina de São João.</div>
      </div>
    );
  }

  const view = resolveSpecialEditionView({ tipo: "sao-joao", data });
  const seo = buildSpecialEditionSeo(specialEditionFacts({ tipo: "sao-joao", data }));

  return (
    <div className="space-y-8">
      <PageSEO
        title={seo.title}
        description={seo.description}
        canonical={META.canonical}
      />
      <div className="flex items-start gap-3 sm:items-center sm:gap-4">
        <div
          className="flex h-12 w-12 shrink-0 aspect-square items-center justify-center rounded-xl text-white shadow-lg sm:h-16 sm:w-16"
          style={{ backgroundColor: COR }}
        >
          <PartyPopper className="h-6 w-6 sm:h-8 sm:w-8" />
        </div>
        <div>
          <h1 className={cn("text-2xl md:text-3xl font-black tracking-tight", view.accent.text)}>
            {view.h1}
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">O sorteio especial realizado anualmente perto de 24 de junho.</p>
        </div>
      </div>

      <SpecialEditionHero view={view} />

      <AdUnit slot="7788990022" format="rectangle" className="min-h-[250px]" />

      <Card id="historico">
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
                    const info = linhaDestaque(sorteio, data.ultimaEdicao);
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
                          {formatCurrency(info.total)}
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          <div>{info.ganhadores}</div>
                          <div className="text-xs text-muted-foreground">{info.rotulo}</div>
                        </TableCell>
                        <TableCell className="text-center font-bold" style={{ color: COR }}>
                          {formatCurrency(info.valorPremio)}
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
