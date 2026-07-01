import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trophy, Target } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";

const COR = "#260085";

export default function QuinaPremiacao() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageSEO
        title="Premiação da Quina — Faixas e Probabilidades"
        description="Conheça as faixas de premiação da Quina: quantos acertos são necessários para ganhar, percentuais do fundo de prêmios e probabilidades de cada faixa."
        canonical="/quina/premiacao"
      />
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: COR }}>
          <Trophy className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: COR }}>Quina · Premiação</h1>
          <p className="text-muted-foreground mt-1">Faixas de prêmios, percentuais e probabilidades da Quina.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Distribuição do Prêmio Bruto</CardTitle>
          <CardDescription>O prêmio bruto corresponde a 43,79% da arrecadação.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-muted-foreground">
          <p>
            Desse valor, o fundo de premiação é dividido entre as quatro faixas normais e duas parcelas
            que ficam acumuladas para os concursos especiais:
          </p>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
              <div className="text-2xl font-bold w-20 text-center" style={{ color: COR }}>35%</div>
              <div>
                <div className="font-semibold text-foreground">5 acertos — quina (1ª faixa)</div>
                <div className="text-sm">Distribuídos entre os acertadores dos 5 números sorteados.</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
              <div className="text-2xl font-bold w-20 text-center" style={{ color: COR }}>15%</div>
              <div>
                <div className="font-semibold text-foreground">4 acertos — quadra (2ª faixa)</div>
                <div className="text-sm">Distribuídos entre os acertadores de 4 números.</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
              <div className="text-2xl font-bold w-20 text-center" style={{ color: COR }}>10%</div>
              <div>
                <div className="font-semibold text-foreground">3 acertos — terno (3ª faixa)</div>
                <div className="text-sm">Distribuídos entre os acertadores de 3 números.</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
              <div className="text-2xl font-bold w-20 text-center" style={{ color: COR }}>10%</div>
              <div>
                <div className="font-semibold text-foreground">2 acertos — duque (4ª faixa)</div>
                <div className="text-sm">Distribuídos entre os acertadores de 2 números.</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 border rounded-lg bg-amber-500/10 border-amber-500/30">
              <div className="text-2xl font-bold text-amber-600 w-20 text-center">15%</div>
              <div>
                <div className="font-semibold text-foreground">Acumulado para Finais 5</div>
                <div className="text-sm">Ficam acumulados e são distribuídos aos acertadores da quina nos concursos de final 5.</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 border rounded-lg bg-amber-500/10 border-amber-500/30">
              <div className="text-2xl font-bold text-amber-600 w-20 text-center">15%</div>
              <div>
                <div className="font-semibold text-foreground">Quina de São João</div>
                <div className="text-sm">Ficam acumulados para a 1ª faixa (quina) do concurso especial realizado anualmente perto de 24 de junho.</div>
              </div>
            </div>
          </div>

          <p className="text-sm">
            Diferente da Lotofácil, a Quina não tem prêmios fixos em dinheiro nas faixas menores — todas as
            quatro faixas de acerto (2, 3, 4 e 5 números) recebem uma fatia percentual do fundo de premiação.
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
                  <th className="text-right py-3 px-4 font-semibold">Percentual</th>
                  <th className="text-right py-3 px-4 font-semibold">Probabilidade (aposta simples)</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                {[
                  { faixa: "1ª", acertos: 5, pct: "35% do fundo de premiação", prob: "1 em 24.040.016" },
                  { faixa: "2ª", acertos: 4, pct: "15% do fundo de premiação", prob: "1 em 64.107" },
                  { faixa: "3ª", acertos: 3, pct: "10% do fundo de premiação", prob: "1 em 866" },
                  { faixa: "4ª", acertos: 2, pct: "10% do fundo de premiação", prob: "1 em 36" },
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
            As probabilidades acima consideram uma aposta simples de 5 números. Apostas com mais dezenas aumentam as chances de acerto.
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
            Não havendo ganhador na 1ª faixa (quina), o valor correspondente acumula para o concurso seguinte,
            sempre na faixa de 5 acertos.
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
