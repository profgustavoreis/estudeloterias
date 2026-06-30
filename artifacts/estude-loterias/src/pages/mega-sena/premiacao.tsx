import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trophy, Target } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";

export default function MegaSenaPremiacao() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageSEO
        title="Premiação da Mega-Sena — Faixas e Distribuição de Prêmios"
        description="Entenda como o prêmio da Mega-Sena é distribuído entre as faixas de 4, 5 e 6 acertos, incluindo percentuais e regras de acumulação."
        canonical="/mega-sena/premiacao"
      />
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white bg-[#009640]">
          <Trophy className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#009640]">Mega-Sena · Premiação</h1>
          <p className="text-muted-foreground mt-2 text-lg">Entenda como o prêmio da Mega-Sena é distribuído.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Distribuição do Prêmio Bruto</CardTitle>
          <CardDescription>O prêmio bruto corresponde a 43,79% da arrecadação.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-muted-foreground">
          <p>
            Dessa porcentagem, o valor é distribuído da seguinte forma:
          </p>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
              <div className="text-2xl font-bold text-[#009640] w-20 text-center">40%</div>
              <div>
                <div className="font-semibold text-foreground">Sena (6 acertos)</div>
                <div className="text-sm">São distribuídos entre os acertadores dos 6 números sorteados (Sena).</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
              <div className="text-2xl font-bold text-[#009640] w-20 text-center">13%</div>
              <div>
                <div className="font-semibold text-foreground">Quina (5 acertos)</div>
                <div className="text-sm">São distribuídos entre os acertadores de 5 números (Quina).</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
              <div className="text-2xl font-bold text-[#009640] w-20 text-center">15%</div>
              <div>
                <div className="font-semibold text-foreground">Quadra (4 acertos)</div>
                <div className="text-sm">São distribuídos entre os acertadores de 4 números (Quadra).</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
              <div className="text-2xl font-bold text-[#009640] w-20 text-center">22%</div>
              <div>
                <div className="font-semibold text-foreground">Acumulado para Finais 0 e 5</div>
                <div className="text-sm">Ficam acumulados e são distribuídos aos acertadores dos 6 números nos concursos de final 0 ou 5.</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 border rounded-lg bg-amber-500/10 border-amber-500/30">
              <div className="text-2xl font-bold text-amber-600 w-20 text-center">10%</div>
              <div>
                <div className="font-semibold text-foreground">Mega da Virada</div>
                <div className="text-sm">Ficam acumulados para a primeira faixa (sena) do último concurso do ano de final 0 ou 5 (Mega da Virada).</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Faixas de Premiação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-semibold">Faixa</th>
                  <th className="text-center py-3 px-4 font-semibold">Acertos</th>
                  <th className="text-right py-3 px-4 font-semibold">% do Prêmio Bruto</th>
                  <th className="text-right py-3 px-4 font-semibold">Probabilidade (aposta simples)</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                {[
                  { faixa: "1ª", nome: "Sena",   acertos: 6, pct: "40%", prob: "1 em 50.063.860" },
                  { faixa: "2ª", nome: "Quina",  acertos: 5, pct: "13%", prob: "1 em 154.518" },
                  { faixa: "3ª", nome: "Quadra", acertos: 4, pct: "15%", prob: "1 em 2.332" },
                ].map(({ faixa, nome, acertos, pct, prob }) => (
                  <tr key={faixa} className="border-b">
                    <td className="py-3 px-4 font-medium">{faixa} faixa ({nome})</td>
                    <td className="py-3 px-4 text-center font-bold text-[#009640]">{acertos} acertos</td>
                    <td className="py-3 px-4 text-right">{pct}</td>
                    <td className="py-3 px-4 text-right font-mono">{prob}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Target className="w-5 h-5 text-[#009640]" />
            Regras de Acumulação
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4">
          <p>
            Não havendo acertador em qualquer faixa, o valor acumula para o concurso seguinte, na respectiva faixa de premiação.
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
