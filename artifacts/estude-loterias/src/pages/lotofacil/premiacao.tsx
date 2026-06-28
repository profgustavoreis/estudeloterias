import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";
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
          <CardTitle>Faixas de Premiação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-semibold">Faixa</th>
                  <th className="text-center py-3 px-4 font-semibold">Acertos</th>
                  <th className="text-right py-3 px-4 font-semibold">% do Prêmio Líquido</th>
                  <th className="text-right py-3 px-4 font-semibold">Probabilidade (aposta simples)</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                {[
                  { faixa: "1ª",  acertos: 15, pct: "35%",  prob: "1 em 3.268.760" },
                  { faixa: "2ª",  acertos: 14, pct: "20%",  prob: "1 em 21.792" },
                  { faixa: "3ª",  acertos: 13, pct: "15%",  prob: "1 em 609" },
                  { faixa: "4ª",  acertos: 12, pct: "15%",  prob: "1 em 47" },
                  { faixa: "5ª",  acertos: 11, pct: "15%",  prob: "1 em 7" },
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
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição do Fundo de Prêmios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              O prêmio bruto corresponde a <strong>46% da arrecadação</strong> de cada concurso.
              Após a dedução de 13,5% de Imposto de Renda (para prêmios acima de R$ 2.112,00),
              o valor líquido é distribuído entre as cinco faixas de premiação.
            </p>
            <div className="space-y-2">
              {[
                { faixa: "1ª faixa (15 acertos)", pct: "35%" },
                { faixa: "2ª faixa (14 acertos)", pct: "20%" },
                { faixa: "3ª faixa (13 acertos)", pct: "15%" },
                { faixa: "4ª faixa (12 acertos)", pct: "15%" },
                { faixa: "5ª faixa (11 acertos)", pct: "15%" },
              ].map(({ faixa, pct }) => (
                <div key={faixa} className="flex justify-between items-center py-1.5 border-b last:border-0">
                  <span className="text-sm">{faixa}</span>
                  <span className="text-sm font-bold" style={{ color: COR }}>{pct}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Acumulação de Prêmios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Quando não há ganhadores na 1ª faixa (15 acertos), o prêmio acumula para o
              próximo concurso. As demais faixas não acumulam — são distribuídas entre
              os ganhadores de cada nível a cada sorteio.
            </p>
            <p>
              A probabilidade de acertar todos os 15 números com uma aposta simples é
              de aproximadamente <strong>1 em 3.268.760</strong>, o que torna a acumulação
              relativamente rara comparado a outras loterias.
            </p>
            <p>
              <strong>Prêmio mínimo garantido:</strong> Quando a 1ª faixa acumula por muitos concursos,
              a Caixa pode aplicar rateio especial para garantir um valor mínimo de premiação.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
