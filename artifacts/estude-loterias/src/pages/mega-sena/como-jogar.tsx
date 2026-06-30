import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, HelpCircle, Info } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";

export default function MegaSenaComoJogar() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageSEO
        title="Como Jogar na Mega-Sena"
        description="Saiba como funciona a Mega-Sena: regras, formas de apostar, valores, dias de sorteio e tudo que você precisa para fazer sua aposta."
        canonical="/mega-sena/como-jogar"
      />
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white bg-[#009640]">
          <BookOpen className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#009640]">Mega-Sena · Como Jogar</h1>
          <p className="text-muted-foreground mt-2 text-lg">Tudo o que você precisa saber para realizar a sua aposta.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">O que é a Mega-Sena?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            A Mega-Sena é a loteria que paga milhões para o acertador dos 6 números sorteados.
            Ainda é possível ganhar prêmios ao acertar 4 ou 5 números dentre os 60 disponíveis no volante de apostas.
          </p>
          <p>
            Para apostar, você deve marcar de 6 a 20 números do volante,
            podendo deixar que o sistema escolha os números para você (Surpresinha) e/ou
            concorrer com a mesma aposta por 2, 4 ou 8 concursos consecutivos (Teimosinha).
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Info className="w-5 h-5 text-[#009640]" />
              Regras Básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
              <li>O volante contém 60 números (de 01 a 60).</li>
              <li>A aposta mínima é de 6 números.</li>
              <li>Você pode marcar até 20 números no mesmo volante.</li>
              <li>Quanto mais números marcar, maior o preço da aposta e maiores as chances de ganhar.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#009640]" />
              Sorteios e Valores
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              <strong>Dias de Sorteio:</strong> Os sorteios da Mega-Sena são realizados três vezes por semana,
              às terças, quintas e sábados, a partir das 21h.
            </p>
            <p>
              <strong>Valor da Aposta:</strong> A aposta mínima, de 6 números, custa R$ 6,00.
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
                    { n: 6,  simples: 1,     valor: "R$ 6,00" },
                    { n: 7,  simples: 7,     valor: "R$ 42,00" },
                    { n: 8,  simples: 28,    valor: "R$ 168,00" },
                    { n: 9,  simples: 84,    valor: "R$ 504,00" },
                    { n: 10, simples: 210,   valor: "R$ 1.260,00" },
                    { n: 11, simples: 462,   valor: "R$ 2.772,00" },
                    { n: 12, simples: 924,   valor: "R$ 5.544,00" },
                    { n: 13, simples: 1716,  valor: "R$ 10.296,00" },
                    { n: 14, simples: 3003,  valor: "R$ 18.018,00" },
                    { n: 15, simples: 5005,  valor: "R$ 30.030,00" },
                    { n: 16, simples: 8008,  valor: "R$ 48.048,00" },
                    { n: 17, simples: 12376, valor: "R$ 74.256,00" },
                    { n: 18, simples: 18564, valor: "R$ 111.384,00" },
                    { n: 19, simples: 27132, valor: "R$ 162.792,00" },
                    { n: 20, simples: 38760, valor: "R$ 232.560,00" },
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
              Use nosso <a href="/mega-sena/gerador" className="font-medium underline text-[#009640]">Gerador de Jogos</a> gratuito.
            </p>
            <p>
              <strong>Teimosinha:</strong> Concorra com a mesma aposta por 2, 3, 4, 6, 8, 9 ou 12 concursos consecutivos.
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
