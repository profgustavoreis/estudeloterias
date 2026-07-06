import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trophy, Target } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";

const COR = "#a8cf45";

export default function SuperSetePremiacao() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageSEO
        title="Premiação da Super Sete — Faixas e Probabilidades"
        description="Conheça as faixas de premiação da Super Sete: 7, 6, 5, 4 e 3 acertos, percentuais do fundo de prêmios e probabilidades de cada faixa."
        canonical="/super-sete/premiacao"
      />
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: COR }}>
          <Trophy className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: COR }}>Super Sete · Premiação</h1>
          <p className="text-muted-foreground mt-1">Faixas de prêmios, percentuais e probabilidades da Super Sete.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Distribuição do Prêmio Bruto</CardTitle>
          <CardDescription>O prêmio bruto corresponde a 43,79% da arrecadação total.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-muted-foreground">
          <p>
            Desse valor, é deduzido o prêmio com valor fixo: <strong>R$ 6,00</strong> para 3 acertos.
          </p>
          <p>
            Após a dedução do prêmio fixo, o valor restante é distribuído da seguinte forma:
          </p>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
              <div className="text-2xl font-bold w-20 text-center" style={{ color: COR }}>55%</div>
              <div>
                <div className="font-semibold text-foreground">7 acertos — 1ª faixa</div>
                <div className="text-sm">Distribuídos entre os acertadores dos 7 números sorteados.</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
              <div className="text-2xl font-bold w-20 text-center" style={{ color: COR }}>15%</div>
              <div>
                <div className="font-semibold text-foreground">6 acertos — 2ª faixa</div>
                <div className="text-sm">Distribuídos entre os acertadores de 6 números.</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
              <div className="text-2xl font-bold w-20 text-center" style={{ color: COR }}>15%</div>
              <div>
                <div className="font-semibold text-foreground">5 acertos — 3ª faixa</div>
                <div className="text-sm">Distribuídos entre os acertadores de 5 números.</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
              <div className="text-2xl font-bold w-20 text-center" style={{ color: COR }}>15%</div>
              <div>
                <div className="font-semibold text-foreground">4 acertos — 4ª faixa</div>
                <div className="text-sm">Distribuídos entre os acertadores de 4 números.</div>
              </div>
            </div>
          </div>

          <p className="text-sm">
            O prêmio fixo de <strong>R$ 6,00</strong> para 3 acertos é garantido independentemente do rateio do fundo de prêmios.
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
                  <th className="text-right py-3 px-4 font-semibold">Probabilidade (1 em)</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                {[
                  { faixa: "1ª", acertos: "7 números", percentual: "55% do fundo (após fixo)", prob: "10.000.000" },
                  { faixa: "2ª", acertos: "6 números", percentual: "15% do fundo (após fixo)", prob: "158.730" },
                  { faixa: "3ª", acertos: "5 números", percentual: "15% do fundo (após fixo)", prob: "5.879" },
                  { faixa: "4ª", acertos: "4 números", percentual: "15% do fundo (após fixo)", prob: "392" },
                  { faixa: "5ª", acertos: "3 números", percentual: "Fixo: R$ 6,00", prob: "43,5" },
                ].map(({ faixa, acertos, percentual, prob }) => (
                  <tr key={faixa} className="border-b">
                    <td className="py-3 px-4 font-medium">{faixa} faixa</td>
                    <td className="py-3 px-4 text-center font-bold" style={{ color: COR }}>{acertos}</td>
                    <td className="py-3 px-4 text-right">{percentual}</td>
                    <td className="py-3 px-4 text-right font-mono">{prob}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Probabilidades para uma aposta simples de 7 números (1 número por coluna).
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
            Não existindo aposta premiada em qualquer faixa de premiação, os valores acumulam para o concurso seguinte,
            na primeira faixa de premiação (apostas com 7 números certos).
          </p>
          <p>
            Apenas a 1ª faixa (7 acertos) acumula quando não há ganhador. As demais faixas (6, 5, 4 e 3 acertos)
            não acumulam — o prêmio é rateado entre os acertadores do concurso ou pago como valor fixo.
          </p>
          <p>
            A Super Sete não possui sorteio especial. Todos os concursos
            seguem as mesmas regras de premiação, com sorteios às segundas, quartas e sextas-feiras a partir das 21h.
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
