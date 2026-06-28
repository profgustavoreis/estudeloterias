import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Info, HelpCircle } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";

const COR = "#930089";

export default function LotofacilComoJogar() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageSEO
        title="Como Jogar na Lotofácil"
        description="Saiba como funciona a Lotofácil: regras, formas de apostar, valores, dias de sorteio e tudo que você precisa para fazer sua aposta."
        canonical="/lotofacil/como-jogar"
      />
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: COR }}>
          <BookOpen className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: COR }}>Lotofácil · Como Jogar</h1>
          <p className="text-muted-foreground mt-2 text-lg">Tudo o que você precisa saber para realizar a sua aposta.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">O que é a Lotofácil?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            A Lotofácil é uma das loterias mais populares do Brasil, com sorteios realizados às segundas, quartas e sextas-feiras.
            O apostador marca de 15 a 20 números dentre os 25 disponíveis no volante (de 01 a 25) e ganha
            se acertar 11, 12, 13, 14 ou 15 desses números.
          </p>
          <p>
            A facilidade de acertar prêmios (a partir de 11 acertos) e o baixo valor da aposta mínima
            tornam a Lotofácil uma das loterias com maior frequência de ganhadores no país.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Info className="w-5 h-5" style={{ color: COR }} />
              Regras Básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>O volante contém 25 números (de 01 a 25).</li>
              <li>A aposta mínima é de 15 números.</li>
              <li>Você pode marcar até 20 números no mesmo volante.</li>
              <li>São sorteados 15 números a cada concurso.</li>
              <li>Ganha prêmio quem acertar 11, 12, 13, 14 ou 15 números.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <HelpCircle className="w-5 h-5" style={{ color: COR }} />
              Sorteios e Valores
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              <strong>Dias de Sorteio:</strong> Os sorteios da Lotofácil são realizados às segundas, quartas e sextas-feiras,
              às 20h (horário de Brasília).
            </p>
            <p>
              <strong>Valor da Aposta:</strong> A aposta mínima, de 15 números, custa R$ 3,00.
              Quanto mais números marcar, maior o preço e maior a chance de ganhar.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Tabela de Preços</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-semibold">Dezenas marcadas</th>
                    <th className="text-right py-2 font-semibold">Apostas simples</th>
                    <th className="text-right py-2 font-semibold">Valor</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  {[
                    { n: 15, simples: 1,     valor: "R$ 3,00" },
                    { n: 16, simples: 16,    valor: "R$ 48,00" },
                    { n: 17, simples: 136,   valor: "R$ 408,00" },
                    { n: 18, simples: 816,   valor: "R$ 2.448,00" },
                    { n: 19, simples: 3876,  valor: "R$ 11.628,00" },
                    { n: 20, simples: 15504, valor: "R$ 46.512,00" },
                  ].map(({ n, simples, valor }) => (
                    <tr key={n} className="border-b">
                      <td className="py-2">{n} números</td>
                      <td className="text-right py-2">{simples.toLocaleString("pt-BR")}</td>
                      <td className="text-right py-2 font-medium">{valor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Dicas para Apostar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              <strong>Surpresinha:</strong> Deixe o sistema escolher seus números aleatoriamente.
              Use nosso <a href="/lotofacil/gerador" className="font-medium underline" style={{ color: COR }}>Gerador de Jogos</a> gratuito.
            </p>
            <p>
              <strong>Teimosinha:</strong> Concorra com a mesma aposta por 2, 4 ou 8 concursos consecutivos.
            </p>
            <p>
              <strong>Bolão:</strong> Forme um grupo e divida o custo (e o prêmio) com outras pessoas.
            </p>
            <p>
              <strong>Onde apostar:</strong> Nas casas lotéricas credenciadas ou pelo aplicativo/site da Caixa Econômica Federal.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
