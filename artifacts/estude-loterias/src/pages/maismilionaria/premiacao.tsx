import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trophy, Target } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";

const COR = "#2E3078";

export default function MaismilionariaPremiacao() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageSEO
        title="Premiação da +Milionária — Faixas e Probabilidades"
        description="Conheça as faixas de premiação da +Milionária: 6 acertos com Trevos, 5 acertos com Trevos, 4 acertos, 3 acertos, percentuais do fundo de prêmios e probabilidades."
        canonical="/maismilionaria/premiacao"
      />
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: COR }}>
          <Trophy className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: COR }}>+Milionária · Premiação</h1>
          <p className="text-muted-foreground mt-1">Faixas de prêmios, percentuais e probabilidades da +Milionária.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Distribuição do Prêmio Bruto</CardTitle>
          <CardDescription>O prêmio bruto corresponde a 50% da arrecadação.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-muted-foreground">
          <p>
            Desse valor, são deduzidos os prêmios com valores fixos. Após a dedução dos prêmios fixos,
            o valor restante é distribuído da seguinte forma:
          </p>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
              <div className="text-2xl font-bold w-20 text-center" style={{ color: COR }}>50%</div>
              <div>
                <div className="font-semibold text-foreground">6 acertos + 2 Trevos — 1ª faixa</div>
                <div className="text-sm">Distribuídos entre os acertadores dos 6 números e 2 Trevos da Sorte.</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
              <div className="text-2xl font-bold w-20 text-center" style={{ color: COR }}>20%</div>
              <div>
                <div className="font-semibold text-foreground">6 acertos (1 ou 0 Trevos) — 2ª faixa</div>
                <div className="text-sm">Distribuídos entre os acertadores de 6 números com 1 ou nenhum trevo.</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
              <div className="text-2xl font-bold w-20 text-center" style={{ color: COR }}>20%</div>
              <div>
                <div className="font-semibold text-foreground">5 acertos + 2 Trevos — 3ª faixa</div>
                <div className="text-sm">Distribuídos entre os acertadores de 5 números e 2 Trevos da Sorte.</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 border rounded-lg bg-amber-500/10 border-amber-500/30">
              <div className="text-2xl font-bold text-amber-600 w-20 text-center">10%</div>
              <div>
                <div className="font-semibold text-foreground">5 acertos (1 ou 0 Trevos) — 4ª faixa</div>
                <div className="text-sm">Distribuídos entre os acertadores de 5 números com 1 ou nenhum trevo.</div>
              </div>
            </div>
          </div>

          <p className="text-sm">
            Além das faixas variáveis, os prêmios fixos são garantidos: <strong>R$ 10,00</strong> para 4+2,
            <strong> R$ 6,00</strong> para 4+1 ou 0, <strong>R$ 6,00</strong> para 3+2,
            <strong> R$ 6,00</strong> para 3+1, <strong>R$ 6,00</strong> para 2+2,
            <strong> R$ 6,00</strong> para 2+1.
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
                  <th className="text-right py-3 px-4 font-semibold">Tipo de Prêmio</th>
                  <th className="text-right py-3 px-4 font-semibold">Probabilidade (1 em)</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                {[
                  { faixa: "1ª", acertos: "6 + 2 Trevos", tipo: "50% do fundo (após fixos)", prob: "158.145.470" },
                  { faixa: "2ª", acertos: "6 (1 ou 0 Trevos)", tipo: "20% do fundo (após fixos)", prob: "3.515.455" },
                  { faixa: "3ª", acertos: "5 + 2 Trevos", tipo: "20% do fundo (após fixos)", prob: "690.136" },
                  { faixa: "4ª", acertos: "5 (1 ou 0 Trevos)", tipo: "10% do fundo (após fixos)", prob: "35.270" },
                  { faixa: "5ª", acertos: "4 + 2", tipo: "Fixo: R$ 10,00", prob: "8.855" },
                  { faixa: "6ª", acertos: "4 + 1 ou 0", tipo: "Fixo: R$ 6,00", prob: "677" },
                  { faixa: "7ª", acertos: "3 + 2", tipo: "Fixo: R$ 6,00", prob: "256" },
                  { faixa: "8ª", acertos: "3 + 1", tipo: "Fixo: R$ 6,00", prob: "36" },
                  { faixa: "9ª", acertos: "2 + 2", tipo: "Fixo: R$ 6,00", prob: "33" },
                  { faixa: "10ª", acertos: "2 + 1", tipo: "Fixo: R$ 6,00", prob: "7" },
                ].map(({ faixa, acertos, tipo, prob }) => (
                  <tr key={faixa} className="border-b">
                    <td className="py-3 px-4 font-medium">{faixa} faixa</td>
                    <td className="py-3 px-4 text-center font-bold" style={{ color: COR }}>{acertos}</td>
                    <td className="py-3 px-4 text-right">{tipo}</td>
                    <td className="py-3 px-4 text-right font-mono">{prob}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Probabilidades para uma aposta simples de 6 dezenas e 2 Trevos da Sorte.
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
            Não existindo aposta premiada na 1ª faixa (6 acertos + 2 Trevos), o prêmio acumula
            para o concurso subsequente, também na 1ª faixa de premiação.
          </p>
          <p>
            A +Milionária não possui sorteio especial. Todos os concursos seguem as mesmas regras de premiação.
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
