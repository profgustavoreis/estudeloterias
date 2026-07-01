import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Info, HelpCircle } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";

const COR = "#260085";

export default function QuinaComoJogar() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageSEO
        title="Como Jogar na Quina"
        description="Saiba como funciona a Quina: regras, formas de apostar, valores, dias de sorteio e tudo que você precisa para fazer sua aposta."
        canonical="/quina/como-jogar"
      />
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: COR }}>
          <BookOpen className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: COR }}>Quina · Como Jogar</h1>
          <p className="text-muted-foreground mt-2 text-lg">Tudo o que você precisa saber para realizar a sua aposta.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">O que é a Quina?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            A Quina é uma das loterias mais tradicionais da Caixa, com sorteios realizados de segunda a sábado (6 sorteios por semana).
            O apostador marca de 5 a 15 números dentre os 80 disponíveis no volante (de 01 a 80) e ganha
            se acertar 2, 3, 4 ou 5 desses números — sendo o prêmio principal para quem acerta os 5 números sorteados (a "quina").
          </p>
          <p>
            Além dos concursos regulares, a Quina tem duas premiações especiais: os concursos de <strong>final 5</strong> (acumulação
            especial) e a <strong>Quina de São João</strong>, sorteio especial realizado anualmente em data próxima ao dia 24 de junho.
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
              <li>O volante contém 80 números (de 01 a 80).</li>
              <li>A aposta mínima é de 5 números.</li>
              <li>Você pode marcar até 15 números no mesmo volante.</li>
              <li>São sorteados 5 números a cada concurso.</li>
              <li>Ganha prêmio quem acertar 2 (duque), 3 (terno), 4 (quadra) ou 5 (quina) números.</li>
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
              <strong>Dias de Sorteio:</strong> Os sorteios da Quina são realizados de segunda a sábado,
              às 21h (horário de Brasília). São seis sorteios por semana.
            </p>
            <p>
              <strong>Valor da Aposta:</strong> A aposta mínima, de 5 números, custa R$ 3,00.
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
                    { n: 5,  simples: 1,    valor: "R$ 3,00" },
                    { n: 6,  simples: 6,    valor: "R$ 18,00" },
                    { n: 7,  simples: 21,   valor: "R$ 63,00" },
                    { n: 8,  simples: 56,   valor: "R$ 168,00" },
                    { n: 9,  simples: 126,  valor: "R$ 378,00" },
                    { n: 10, simples: 252,  valor: "R$ 756,00" },
                    { n: 11, simples: 462,  valor: "R$ 1.386,00" },
                    { n: 12, simples: 792,  valor: "R$ 2.376,00" },
                    { n: 13, simples: 1287, valor: "R$ 3.861,00" },
                    { n: 14, simples: 2002, valor: "R$ 6.006,00" },
                    { n: 15, simples: 3003, valor: "R$ 9.009,00" },
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
              Use nosso <a href="/quina/gerador" className="font-medium underline" style={{ color: COR }}>Gerador de Jogos</a> gratuito.
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
