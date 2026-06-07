import { useGetLoterias } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { LotteryBall } from "@/components/ui/lottery-ball";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

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
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loterias.map(loteria => (
          <Link key={loteria.modalidade} href={`/${loteria.modalidade === 'megasena' ? 'mega-sena' : loteria.modalidade}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-t-4 h-full flex flex-col" style={{ borderTopColor: loteria.cor }}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl" style={{ color: loteria.cor }}>{loteria.nome}</CardTitle>
                  <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                    Conc. {loteria.ultimoConcurso}
                  </span>
                </div>
                <CardDescription>{formatDate(loteria.dataUltimoSorteio)}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between space-y-4">
                <div>
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
                </div>
                
                <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                  {loteria.dezenas.slice(0, 6).map((num, i) => (
                    <LotteryBall key={i} number={num} size="sm" color={loteria.cor} />
                  ))}
                  {loteria.dezenas.length > 6 && (
                    <div className="text-xs text-muted-foreground flex items-center ml-1">+{loteria.dezenas.length - 6}</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
