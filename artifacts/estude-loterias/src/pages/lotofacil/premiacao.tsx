import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trophy, Target } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";

const COR = "#930089";

export default function LotofacilPremiacao() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageSEO
        title="Premiação da Lotofácil — Faixas e Probabilidades"
        description="Conheça as faixas de premiação da Lotofácil: quantos acertos são necessários para ganhar, percentuais do fundo de prêmios e probabilidades de cada faixa."
        canonical="/lotofacil/premiacao"
      />
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: COR }}>
          <Trophy className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: COR }}>Lotofácil · Premiação</h1>
          <p className="text-muted-foreground mt-1">Faixas de prêmios, percentuais e probabilidades da Lotofácil.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Distribuição do Prêmio Bruto</CardTitle>
          <CardDescription>O prêmio bruto corresponde a 43,79% da arrecadação.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-muted-foreground">
          <p>
            Desse valor, primeiro são pagos os prêmios fixos das faixas de 11, 12 e 13 acertos.
            O restante (valor variável) é distribuído da seguinte forma:
          </p>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
              <div className="text-2xl font-bold w-20 text-center" style={{ color: COR }}>62%</div>
              <div>
                <div className="font-semibold text-foreground">15 acertos (1ª faixa)</div>
                <div className="text-sm">Distribuídos entre os acertadores dos 15 números sorteados.</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
              <div className="text-2xl font-bold w-20 text-center" style={{ color: COR }}>13%</div>
              <div>
                <div className="font-semibold text-foreground">14 acertos (2ª faixa)</div>
                <div className="text-sm">Distribuídos entre os acertadores de 14 números.</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
              <div className="text-2xl font-bold w-20 text-center" style={{ color: COR }}>10%</div>
              <div>
                <div className="font-semibold text-foreground">Acumulado para Finais 0</div>
                <div className="text-sm">Ficam acumulados e são distribuídos aos acertadores dos 15 números nos concursos de final 0.</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 border rounded-lg bg-amber-500/10 border-amber-500/30">
              <div className="text-2xl font-bold text-amber-600 w-20 text-center">15%</div>
              <div>
                <div className="font-semibold text-foreground">Lotofácil da Independência</div>
                <div className="text-sm">Ficam acumulados para a 1ª faixa (15 acertos) do concurso especial realizado em setembro.</div>
              </div>
            </div>
          </div>

          <p className="text-sm">
            <strong>Prêmios fixos:</strong> antes da divisão percentual acima, são deduzidos R$ 7,00 por aposta
            com 11 acertos, R$ 14,00 com 12 acertos e R$ 35,00 com 13 acertos. Nos concursos de final 0,
            os percentuais da divisão variável mudam para 72% (15 acertos), 13% (14 acertos) e 15% (Lotofácil da Independência).
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Faixas de Premiação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-semibold">Faixa</th>
                  <th className="text-center py-3 px-4 font-semibold">Acertos</th>
                  <th className="text-right py-3 px-4 font-semibold">Prêmio</th>
                  <th className="text-right py-3 px-4 font-semibold">Probabilidade (aposta simples)</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                {[
                  { faixa: "1ª",  acertos: 15, pct: "62% do valor variável",  prob: "1 em 3.268.760" },
                  { faixa: "2ª",  acertos: 14, pct: "13% do valor variável",  prob: "1 em 21.792" },
                  { faixa: "3ª",  acertos: 13, pct: "R$ 35,00 (fixo)",        prob: "1 em 692" },
                  { faixa: "4ª",  acertos: 12, pct: "R$ 14,00 (fixo)",        prob: "1 em 60" },
                  { faixa: "5ª",  acertos: 11, pct: "R$ 7,00 (fixo)",         prob: "1 em 11" },
                ].map(({ faixa, acertos, pct, prob }) => (
                  <tr key={faixa} className="border-b">
                    <td className="py-3 px-4 font-medium">{faixa} faixa</td>
                    <td className="py-3 px-4 text-center font-bold" style={{ color: COR }}>{acertos} acertos</td>
                    <td className="py-3 px-4 text-right">{pct}</td>
                    <td className="py-3 px-4 text-right font-mono">{prob}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Nos concursos de final 0, o percentual da 1ª faixa sobe para 72% do valor variável.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Target className="w-5 h-5" style={{ color: COR }} />
            Regras de Acumulação
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4">
          <p>
            Não havendo ganhador em qualquer faixa de premiação, o valor correspondente acumula para o
            concurso seguinte, sempre na faixa de 15 acertos (1ª faixa).
          </p>
          <p>
            Os prêmios prescrevem 90 dias após a data do sorteio. Após esse prazo, os valores são
            repassados ao Tesouro Nacional para aplicação no FIES (Fundo de Financiamento Estudantil).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
