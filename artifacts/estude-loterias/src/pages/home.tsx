import { useGetLoterias } from "@workspace/api-client-react";
import type { LoteriaSummary } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDateWithWeekday } from "@/lib/formatters";
import { LotteryBall } from "@/components/ui/lottery-ball";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { AdUnit } from "@/components/ui/AdUnit";
import { PageSEO } from "@/components/seo/PageSEO";

function DezenasSection({ loteria }: { loteria: LoteriaSummary }) {
  const dezenas = loteria.dezenas ?? [];
  const dezenas2 = loteria.dezenas2 ?? null;
  const nomeEspecial = loteria.nomeEspecial ?? null;
  const trevos = loteria.trevos ?? null;
  const size = "sm";

  // Timemania uses yellow balls with green text
  const isTimemania = loteria.modalidade === "timemania";
  // Dia de Sorte uses orange balls with white text
  const isDiaDeSorte = loteria.modalidade === "diadesorte";
  // Super Sete uses green balls with white text
  const isSupersete = loteria.modalidade === "supersete";
  const ballColor = isTimemania ? "#FFF600" : isDiaDeSorte ? "#cb852b" : isSupersete ? "#a8cf45" : loteria.cor;
  const ballTextColor = isTimemania ? "#049645" : isSupersete ? "#ffffff" : undefined;

  if (loteria.modalidade === "duplasena") {
    return (
      <div className="space-y-2.5">
        <div>
          <div className="text-xs text-muted-foreground mb-1.5 font-medium">1° Sorteio</div>
          <div className="flex flex-wrap gap-1.5">
            {dezenas.map((num, i) => (
              <LotteryBall key={i} number={num} size={size} color={ballColor} textColor={ballTextColor} />
            ))}
          </div>
        </div>
        {dezenas2 && dezenas2.length > 0 && (
          <div>
            <div className="text-xs text-muted-foreground mb-1.5 font-medium">2° Sorteio</div>
            <div className="flex flex-wrap gap-1.5">
              {dezenas2.map((num, i) => (
                <LotteryBall key={i} number={num} size={size} color={ballColor} textColor={ballTextColor} />
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
          <LotteryBall key={i} number={num} size={size} color={ballColor} textColor={ballTextColor} />
        ))}
      </div>
      {trevos && trevos.length > 0 && (
        <div>
          <div className="text-xs text-muted-foreground font-medium mb-1.5">Trevos da Sorte</div>
          <div className="flex gap-1.5">
            {trevos.map((t, i) => (
              <LotteryBall
                key={`trevo-${i}`}
                number={String(t).padStart(2, "0")}
                size={size}
                color="#7b2d8b"
              />
            ))}
          </div>
        </div>
      )}
      {nomeEspecial && (
        <div className="flex items-center gap-1.5">
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

const HOME_ORDER = [
  "megasena", "lotofacil", "quina", "maismilionaria",
  "lotomania", "duplasena", "timemania", "diadesorte", "supersete",
];

export default function Home() {
  const { data: loterias, isLoading, isError } = useGetLoterias();
  const sorted = loterias?.slice().sort(
    (a, b) => HOME_ORDER.indexOf(a.modalidade) - HOME_ORDER.indexOf(b.modalidade),
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Visão Geral das Loterias</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i}>
              <CardContent className="p-5 space-y-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
                <div className="flex gap-2 flex-wrap">
                  {[1,2,3,4,5,6].map(j => <Skeleton key={j} className="h-8 w-8 rounded-full" />)}
                </div>
                <Skeleton className="h-8 w-full" />
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
      <PageSEO
        title="Resultados e Estatísticas das Loterias da Caixa"
        description="Acompanhe os resultados de hoje, prêmios acumulados e estatísticas completas da Mega-Sena, Lotofácil, Quina e demais loterias da Caixa."
        canonical="/"
      />
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Visão Geral das Loterias</h1>
        <p className="text-muted-foreground mt-2">Acompanhe os últimos resultados e prêmios acumulados.</p>
      </div>

      <AdUnit slot="1234567890" format="horizontal" className="w-full" />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {(sorted ?? []).map(loteria => (
          <Link key={loteria.modalidade} href={`/${loteria.modalidade === 'megasena' ? 'mega-sena' : loteria.modalidade === 'supersete' ? 'super-sete' : loteria.modalidade}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-t-4 h-full flex flex-col" style={{ borderTopColor: loteria.cor }}>
              <CardContent className="p-5 flex-1 flex flex-col">

                {/* ── Cabeçalho: nome + concurso ── */}
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xl font-bold" style={{ color: loteria.cor }}>{loteria.nome}</span>
                  <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded whitespace-nowrap ml-2">
                    Concurso {loteria.ultimoConcurso}
                  </span>
                </div>

                {/* ── Data do sorteio ── */}
                <p className="text-sm text-muted-foreground mb-3">
                  Data do sorteio: <span className="font-medium text-foreground">{formatDateWithWeekday(loteria.dataUltimoSorteio)}</span>
                </p>

                {/* ── Dezenas sorteadas (imediatamente após a data) ── */}
                <div className="mb-4">
                  <DezenasSection loteria={loteria} />
                </div>

                {/* ── Resultado do sorteio (sem separador) ── */}
                <div className="flex-1">
                  {loteria.acumulado ? (
                    <div>
                      <div className="text-xs font-semibold text-destructive uppercase tracking-wider">Acumulou!</div>
                      {!(loteria.dataProximoConcurso || loteria.valorEstimadoProximoConcurso) ? (
                        <div className="flex items-baseline justify-between mt-0.5">
                          <span className="text-2xl font-bold">{formatCurrency(loteria.premioAcumulado)}</span>
                          <span className="text-sm font-semibold" style={{ color: loteria.cor }}>Ver painel →</span>
                        </div>
                      ) : (
                        <div className="text-2xl font-bold mt-0.5">{formatCurrency(loteria.premioAcumulado)}</div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: loteria.cor }}>
                        {(() => {
                          const n = loteria.ganhadoresFaixa1 ?? 0;
                          return `Saiu! (${n} ${n === 1 ? "acertador" : "acertadores"})`;
                        })()}
                      </div>
                      {loteria.valorPremioFaixa1 != null && loteria.valorPremioFaixa1 > 0 && (
                        !(loteria.dataProximoConcurso || loteria.valorEstimadoProximoConcurso) ? (
                          <div className="flex items-baseline justify-between mt-0.5">
                            <span className="text-2xl font-bold">{formatCurrency(loteria.valorPremioFaixa1)}</span>
                            <span className="text-sm font-semibold" style={{ color: loteria.cor }}>Ver painel →</span>
                          </div>
                        ) : (
                          <div className="text-2xl font-bold mt-0.5">{formatCurrency(loteria.valorPremioFaixa1)}</div>
                        )
                      )}
                    </div>
                  )}
                </div>

                {/* ── Próximo sorteio (com separador, melhor respiro) ── */}
                {(loteria.dataProximoConcurso || loteria.valorEstimadoProximoConcurso) && (
                  <div className="border-t border-border mt-4 pt-4 space-y-3">
                    {loteria.dataProximoConcurso && (
                      <div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Próximo sorteio</div>
                        <div className="text-sm font-semibold mt-0.5">
                          {formatDateWithWeekday(loteria.dataProximoConcurso)}
                        </div>
                      </div>
                    )}
                    {loteria.valorEstimadoProximoConcurso != null && loteria.valorEstimadoProximoConcurso > 0 ? (
                      <div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Prêmio estimado</div>
                        <div className="flex items-baseline justify-between mt-0.5">
                          <span className="text-lg font-bold">{formatCurrency(loteria.valorEstimadoProximoConcurso)}</span>
                          <span className="text-sm font-semibold" style={{ color: loteria.cor }}>Ver painel →</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-end">
                        <span className="text-sm font-semibold" style={{ color: loteria.cor }}>Ver painel →</span>
                      </div>
                    )}
                  </div>
                )}

              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <AdUnit slot="0987654321" format="horizontal" className="w-full" />
    </div>
  );
}
