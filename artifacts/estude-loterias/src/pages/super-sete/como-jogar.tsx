import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Info, HelpCircle, Trophy } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";

const COR = "#a8cf45";

export default function SuperSeteComoJogar() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageSEO
        title="Como Jogar na Super Sete"
        description="Saiba como funciona a Super Sete: regras, formas de apostar, valores, dias de sorteio, prêmios e tudo que você precisa para fazer sua aposta."
        canonical="/super-sete/como-jogar"
      />
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: COR }}>
          <BookOpen className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: COR }}>Super Sete · Como Jogar</h1>
          <p className="text-muted-foreground mt-2 text-lg">Tudo o que você precisa saber para realizar a sua aposta.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">O que é a Super Sete?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            A Super Sete é uma loteria de prognósticos numéricos que oferece várias formas de ganhar. O volante
            contém <strong>7 colunas</strong>, cada uma com <strong>10 números (de 0 a 9)</strong>. Você escolhe
            um número por coluna — ou seja, <strong>7 números no total</strong> — e concorre a prêmios em
            <strong>três sorteios semanais</strong>.
          </p>
          <p>
            Ganha quem acertar 7, 6, 5, 4 ou 3 números na posição correta. A faixa de 3 acertos tem prêmio
            fixo de <strong>R$ 6,00</strong>, enquanto as demais faixas dividem percentuais da arrecadação.
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
              <li>O volante contém 7 colunas com 10 números (de 0 a 9) em cada uma.</li>
              <li>Na aposta simples, você marca <strong>1 número por coluna</strong> (7 números no total).</li>
              <li>São sorteados <strong>7 números</strong>, um por coluna, a cada concurso.</li>
              <li>Ganha prêmio quem acertar <strong>7, 6, 5, 4 ou 3 números</strong> na posição correta.</li>
              <li>O preço da aposta simples é <strong>R$ 3,00</strong>.</li>
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
              <strong>Dias de Sorteio:</strong> Os sorteios da Super Sete são realizados às{" "}
              <strong>segundas, quartas e sextas-feiras</strong>, a partir das <strong>21h</strong> (horário
              de Brasília) — três sorteios por semana.
            </p>
            <p>
              <strong>Valor da Aposta:</strong> A aposta simples (7 números) custa <strong>R$ 3,00</strong>.
              Apostas com mais números têm preços proporcionais — veja a seção de apostas múltiplas abaixo.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Apostas Múltiplas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Além da aposta simples, você pode marcar <strong>2 ou 3 números por coluna</strong>, aumentando
              suas chances de acerto. É possível marcar de <strong>8 a 21 números</strong> no total:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li><strong>8 a 14 números:</strong> no mínimo 1 e no máximo 2 números por coluna.</li>
              <li><strong>15 a 21 números:</strong> no mínimo 2 e no máximo 3 números por coluna.</li>
            </ul>
            <p>
              O preço varia conforme a quantidade de números: de <strong>R$ 6,00</strong> (8 números) até{" "}
              <strong>R$ 6.561,00</strong> (21 números). Use nosso{" "}
              <a href="/super-sete/simulador" className="font-medium underline" style={{ color: COR }}>
                Simulador de Apostas
              </a>{" "}
              para calcular o valor exato.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Facilite sua Aposta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              <strong>Surpresinha:</strong> Deixe que o sistema escolha todos os números para você
              aleatoriamente. Use nosso{" "}
              <a href="/super-sete/gerador" className="font-medium underline" style={{ color: COR }}>
                Gerador de Jogos
              </a>{" "}
              gratuito para criar suas apostas.
            </p>
            <p>
              <strong>Teimosinha:</strong> Concorra com a mesma aposta por <strong>3, 6, 9 ou 12</strong>{" "}
              concursos consecutivos, sem precisar refazer a aposta a cada sorteio.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Trophy className="w-5 h-5" style={{ color: COR }} />
              Premiação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>O prêmio bruto corresponde a <strong>43,79%</strong> da arrecadação total.</p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li><strong>7 acertos:</strong> 55% do prêmio (faixa principal).</li>
              <li><strong>6 acertos:</strong> 15% do prêmio.</li>
              <li><strong>5 acertos:</strong> 15% do prêmio.</li>
              <li><strong>4 acertos:</strong> 15% do prêmio.</li>
              <li><strong>3 acertos:</strong> prêmio fixo de <strong>R$ 6,00</strong>.</li>
            </ul>
            <p>
              Não havendo ganhador em alguma faixa, o valor <strong>acumula</strong> para o concurso seguinte
              na primeira faixa.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Dicas para Apostar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              <strong>Bolão:</strong> Forme um grupo e divida o custo (e o prêmio). O Bolão da Super Sete
              tem preço mínimo de <strong>R$ 10,00</strong>, com cotas a partir de <strong>R$ 6,00</strong>,
              podendo ter de 2 a 100 cotas dependendo da quantidade de números.
            </p>
            <p>
              <strong>Onde apostar:</strong> Nas casas lotéricas credenciadas ou pelo aplicativo/site da Caixa
              Econômica Federal (Loterias Online).
            </p>
            <p>
              <strong>Conferir resultados:</strong> Use nosso{" "}
              <a href="/super-sete/conferidor" className="font-medium underline" style={{ color: COR }}>
                Conferidor de Apostas
              </a>{" "}
              para verificar se você ganhou em qualquer concurso.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
