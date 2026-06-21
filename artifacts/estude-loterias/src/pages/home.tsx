import { useGetLoterias } from "@workspace/api-client-react";
import type { LoteriaSummary } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDateWithWeekday } from "@/lib/formatters";
import { LotteryBall } from "@/components/ui/lottery-ball";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { AdUnit } from "@/components/ui/AdUnit";

function DezenasSection({ loteria }: { loteria: LoteriaSummary }) {
  if (!loteria) return null;
  const dezenas = loteria.dezenas ?? [];
  const dezenas2 = loteria.dezenas2 ?? null;
  const nomeEspecial = loteria.nomeEspecial ?? null;
  const trevos = loteria.trevos ?? null;
  const size = dezenas.length > 10 ? "sm" : "sm";

  if (loteria.modalidade === "duplasena") {
    return (
      <div className="space-y-2">
        <div>
          <div className="text-xs text-muted-foreground mb-1 font-medium">1° Sorteio</div>
          <div className="flex flex-wrap gap-1.5">
            {dezenas.map((num, i) => (
              <LotteryBall key={i} number={num} size={size} color={loteria.cor} />
            ))}
          </div>
        </div>
        {dezenas2 && dezenas2.length > 0 && (
          <div>
            <div className="text-xs text-muted-foreground mb-1 font-medium">2° Sorteio</div>
            <div className="flex flex-wrap gap-1.5">
              {dezenas2.map((num, i) => (
                <LotteryBall key={i} number={num} size={size} color={loteria.cor} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {dezenas.map((num, i) => (
          <LotteryBall key={i} number={num} size={size} color={loteria.cor} />
        ))}
        {trevos && trevos.map((t, i) => (
          <LotteryBall key={`trevo-${i}`} number={t} size={size} color="#7b2d8b" />
        ))}
      </div>
      {nomeEspecial && (
        <div className="flex items-center gap-1.5 pt-0.5">
          <span className="text-xs text-muted-foreground font-medium">
            {loteria.modalidade === "diadesorte" ? "Mês da Sorte:" : "Time do Coração:"}
          </span>
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full text-white"
            style={{ backgroundColor: loteria.cor }}
          >
            {nomeEspecial}
          </span>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const { data: loterias, isLoading, isError } = useGetLoterias();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Visão Geral das Loterias</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <div className="flex gap-2 flex-wrap">
                  {[1,2,3,4,5,6].map(j => <Skeleton key={j} className="h-8 w-8 rounded-full" />)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !loterias) {
    return <div>Error loading data.</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Visão Geral das Loterias</h1>
        <p className="text-muted-foreground mt-2">Acompanhe os últimos resultados e prêmios acumulados.</p>
      </div>

      <AdUnit slot="1234567890" format="horizontal" className="w-full" />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loterias.map(loteria => (
          <Link key={loteria.modalidade} href={`/${loteria.modalidade === 'megasena' ? 'mega-sena' : loteria.modalidade}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-t-4 h-full flex flex-col" style={{ borderTopColor: loteria.cor }}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl" style={{ color: loteria.cor }}>{loteria.nome}</CardTitle>
                  <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded whitespace-nowrap">
                    Concurso {loteria.ultimoConcurso}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Data do sorteio: {formatDateWithWeekday(loteria.dataUltimoSorteio)}
                </p>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-3">
                  {loteria.acumulado ? (
                    <div>
                      <div className="text-sm font-semibold text-destructive uppercase tracking-wider">Acumulou!</div>
                      <div className="text-2xl font-bold">{formatCurrency(loteria.premioAcumulado)}</div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-sm font-semibold uppercase tracking-wider" style={{ color: loteria.cor }}>
                        {(() => {
                          const n = loteria.ganhadoresFaixa1 ?? 0;
                          return `Saiu! (${n} ${n === 1 ? "acertador" : "acertadores"})`;
                        })()}
                      </div>
                      {loteria.valorPremioFaixa1 != null && loteria.valorPremioFaixa1 > 0 && (
                        <div className="text-2xl font-bold">{formatCurrency(loteria.valorPremioFaixa1)}</div>
                      )}
                    </div>
                  )}

                  <div className="pt-2 border-t border-border">
                    <DezenasSection loteria={loteria} />
                  </div>

                  {(loteria.dataProximoConcurso || loteria.valorEstimadoProximoConcurso) && (
                    <div className="pt-2 border-t border-border space-y-0.5">
                      {loteria.dataProximoConcurso && (
                        <p className="text-xs text-muted-foreground">
                          Próximo sorteio: {formatDateWithWeekday(loteria.dataProximoConcurso)}
                        </p>
                      )}
                      {loteria.valorEstimadoProximoConcurso != null && loteria.valorEstimadoProximoConcurso > 0 && (
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Prêmio Estimado</div>
                          <div className="text-lg font-bold">{formatCurrency(loteria.valorEstimadoProximoConcurso)}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <AdUnit slot="0987654321" format="horizontal" className="w-full" />
    </div>
  );
}
