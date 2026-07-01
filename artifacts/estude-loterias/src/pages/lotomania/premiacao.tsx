import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trophy, Target } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";

const COR = "#f8901c";

export default function LotomaniaPremiacao() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageSEO
        title="Premiação da Lotomania — Faixas e Probabilidades"
        description="Conheça as faixas de premiação da Lotomania: 20, 19, 18, 17, 16, 15 e 0 acertos, percentuais do fundo de prêmios e probabilidades de cada faixa."
        canonical="/lotomania/premiacao"
      />
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: COR }}>
          <Trophy className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: COR }}>Lotomania · Premiação</h1>
          <p className="text-muted-foreground mt-1">Faixas de prêmios, percentuais e probabilidades da Lotomania.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Distribuição do Prêmio Bruto</CardTitle>
          <CardDescription>O prêmio bruto corresponde a 43,79% da arrecadação.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-muted-foreground">
          <p>
            Desse valor, o fundo de premiação é dividido entre as sete faixas de acerto — incluindo uma faixa
            especial para quem não acerta nenhum número:
          </p>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
              <div className="text-2xl font-bold w-20 text-center" style={{ color: COR }}>45%</div>
              <div>
                <div className="font-semibold text-foreground">20 acertos — 1ª faixa</div>
                <div className="text-sm">Distribuídos entre os acertadores dos 20 números sorteados.</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
              <div className="text-2xl font-bold w-20 text-center" style={{ color: COR }}>16%</div>
              <div>
                <div className="font-semibold text-foreground">19 acertos — 2ª faixa</div>
                <div className="text-sm">Distribuídos entre os acertadores de 19 dos 20 números sorteados.</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
              <div className="text-2xl font-bold w-20 text-center" style={{ color: COR }}>10%</div>
              <div>
                <div className="font-semibold text-foreground">18 acertos — 3ª faixa</div>
                <div className="text-sm">Distribuídos entre os acertadores de 18 números.</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
              <div className="text-2xl font-bold w-20 text-center" style={{ color: COR }}>7%</div>
              <div>
                <div className="font-semibold text-foreground">17 acertos — 4ª faixa</div>
                <div className="text-sm">Distribuídos entre os acertadores de 17 números.</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
              <div className="text-2xl font-bold w-20 text-center" style={{ color: COR }}>7%</div>
              <div>
                <div className="font-semibold text-foreground">16 acertos — 5ª faixa</div>
                <div className="text-sm">Distribuídos entre os acertadores de 16 números.</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
              <div className="text-2xl font-bold w-20 text-center" style={{ color: COR }}>7%</div>
              <div>
                <div className="font-semibold text-foreground">15 acertos — 6ª faixa</div>
                <div className="text-sm">Distribuídos entre os acertadores de 15 números.</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 border rounded-lg bg-amber-500/10 border-amber-500/30">
              <div className="text-2xl font-bold text-amber-600 w-20 text-center">8%</div>
              <div>
                <div className="font-semibold text-foreground">0 acertos — 7ª faixa</div>
                <div className="text-sm">Distribuídos entre os acertadores de nenhum dos 20 números sorteados — uma faixa exclusiva da Lotomania!</div>
              </div>
            </div>
          </div>

          <p className="text-sm">
            A Lotomania é a única loteria da Caixa que premia também quem não acerta nenhum número. Por isso,
            são sete faixas de premiação no total.
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
                  <th className="text-right py-3 px-4 font-semibold">Probabilidade (aposta de 50 dezenas)</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                {[
                  { faixa: "1ª", acertos: 20, pct: "45% do fundo de premiação", prob: "1 em 11.372.635" },
                  { faixa: "2ª", acertos: 19, pct: "16% do fundo de premiação", prob: "1 em 352.551" },
                  { faixa: "3ª", acertos: 18, pct: "10% do fundo de premiação", prob: "1 em 24.235" },
                  { faixa: "4ª", acertos: 17, pct: "7% do fundo de premiação", prob: "1 em 2.776" },
                  { faixa: "5ª", acertos: 16, pct: "7% do fundo de premiação", prob: "1 em 472" },
                  { faixa: "6ª", acertos: 15, pct: "7% do fundo de premiação", prob: "1 em 112" },
                  { faixa: "7ª", acertos: 0,  pct: "8% do fundo de premiação", prob: "1 em 11.372.635" },
                ].map(({ faixa, acertos, pct, prob }) => (
                  <tr key={faixa} className="border-b">
                    <td className="py-3 px-4 font-medium">{faixa} faixa</td>
                    <td className="py-3 px-4 text-center font-bold" style={{ color: COR }}>{acertos === 0 ? "0 (nenhum)" : acertos}</td>
                    <td className="py-3 px-4 text-right">{pct}</td>
                    <td className="py-3 px-4 text-right font-mono">{prob}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            As probabilidades acima consideram uma aposta de 50 dezenas. Note que a probabilidade de acertar 0 números
            é igual à de acertar os 20 — por isso ambas são 1 em 11.372.635.
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
            Não existindo aposta premiada na 7ª faixa (0 acertos), o prêmio acumula para o concurso subsequente,
            na 1ª faixa de premiação (20 acertos). Nas demais faixas, o prêmio acumula na respectiva faixa de premiação.
          </p>
          <p>
            A Lotomania não possui sorteio especial (como a Mega da Virada ou a Quina de São João). Todos os concursos
            seguem as mesmas regras de premiação.
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