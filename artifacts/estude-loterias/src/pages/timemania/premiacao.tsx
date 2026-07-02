import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trophy, Target } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";

const COR = "#049645";

export default function TimemaniaPremiacao() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageSEO
        title="Premiação da Timemania — Faixas e Probabilidades"
        description="Conheça as faixas de premiação da Timemania: 7, 6, 5, 4, 3 acertos e Time do Coração, percentuais do fundo de prêmios e probabilidades de cada faixa."
        canonical="/timemania/premiacao"
      />
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: COR }}>
          <Trophy className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: COR }}>Timemania · Premiação</h1>
          <p className="text-muted-foreground mt-1">Faixas de prêmios, percentuais e probabilidades da Timemania.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Distribuição do Prêmio Bruto</CardTitle>
          <CardDescription>O prêmio bruto corresponde a 50% da arrecadação.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-muted-foreground">
          <p>
            Desse valor, são deduzidos os prêmios com valores fixos: <strong>R$ 8,50</strong> para o Time do Coração,
            <strong> R$ 3,50</strong> para 3 acertos e <strong>R$ 10,50</strong> para 4 acertos.
          </p>
          <p>
            Após a dedução dos prêmios fixos, o valor restante é distribuído da seguinte forma:
          </p>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
              <div className="text-2xl font-bold w-20 text-center" style={{ color: COR }}>50%</div>
              <div>
                <div className="font-semibold text-foreground">7 acertos — 1ª faixa</div>
                <div className="text-sm">Distribuídos entre os acertadores dos 7 números sorteados.</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
              <div className="text-2xl font-bold w-20 text-center" style={{ color: COR }}>20%</div>
              <div>
                <div className="font-semibold text-foreground">6 acertos — 2ª faixa</div>
                <div className="text-sm">Distribuídos entre os acertadores de 6 números.</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
              <div className="text-2xl font-bold w-20 text-center" style={{ color: COR }}>20%</div>
              <div>
                <div className="font-semibold text-foreground">5 acertos — 3ª faixa</div>
                <div className="text-sm">Distribuídos entre os acertadores de 5 números.</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 border rounded-lg bg-amber-500/10 border-amber-500/30">
              <div className="text-2xl font-bold text-amber-600 w-20 text-center">10%</div>
              <div>
                <div className="font-semibold text-foreground">Reserva — Concursos final 0 ou 5</div>
                <div className="text-sm">Acumulados e distribuídos aos acertadores dos 7 números nos concursos de final 0 ou 5.</div>
              </div>
            </div>
          </div>

          <p className="text-sm">
            Além das faixas variáveis, os prêmios fixos são garantidos: <strong>R$ 3,50</strong> para 3 acertos,
            <strong> R$ 10,50</strong> para 4 acertos e <strong>R$ 8,50</strong> para quem acertar o Time do Coração.
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
                  { faixa: "1ª", acertos: "7 números", tipo: "50% do fundo (após fixos)", prob: "26.472.637" },
                  { faixa: "2ª", acertos: "6 números", tipo: "20% do fundo (após fixos)", prob: "216.103" },
                  { faixa: "3ª", acertos: "5 números", tipo: "20% do fundo (após fixos)", prob: "5.220" },
                  { faixa: "4ª", acertos: "4 números", tipo: "Fixo: R$ 10,50", prob: "276" },
                  { faixa: "5ª", acertos: "3 números", tipo: "Fixo: R$ 3,50", prob: "29" },
                  { faixa: "Time", acertos: "Time do Coração", tipo: "Fixo: R$ 8,50", prob: "80" },
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
            Probabilidades para uma aposta simples de 10 dezenas. A probabilidade de acertar o Time do Coração é de 1 em 80
            (um entre os 80 clubes participantes).
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
            Não existindo aposta premiada na 1ª, 2ª ou 3ª faixas de premiação (7, 6 ou 5 acertos), inclusive nos
            concursos de final 0 ou 5, o(s) prêmio(s) acumula(m) para o concurso subsequente, na
            1ª faixa de premiação (apostas com 7 números certos).
          </p>
          <p>
            A Timemania não possui sorteio especial (como a Mega da Virada ou a Quina de São João). Todos os concursos
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
