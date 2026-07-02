import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Info, HelpCircle, Trophy } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";

const COR = "#cb852b";

export default function DiaDeSorteComoJogar() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageSEO
        title="Como Jogar no Dia de Sorte"
        description="Saiba como funciona o Dia de Sorte: regras, formas de apostar, valores, dias de sorteio, Mês da Sorte e tudo que você precisa para fazer sua aposta."
        canonical="/diadesorte/como-jogar"
      />
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: COR }}>
          <BookOpen className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: COR }}>Dia de Sorte · Como Jogar</h1>
          <p className="text-muted-foreground mt-2 text-lg">Tudo o que você precisa saber para realizar a sua aposta.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">O que é o Dia de Sorte?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            O Dia de Sorte é a loteria da Caixa que combina números com meses do ano! Você escolhe de <strong>7 a 15 números</strong> entre os
            31 disponíveis (01 a 31) e um <strong>Mês da Sorte</strong> entre os 12 meses do ano.
            A cada concurso são sorteados 7 números e um Mês da Sorte.
          </p>
          <p>
            Com apenas R$ 2,50 você já pode concorrer a prêmios de até R$ 300 mil ou mais.
            É a loteria perfeita para quem gosta de datas especiais!
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
              <li>O volante contém 31 números (de 01 a 31), representando os dias do mês.</li>
              <li>Você pode marcar de <strong>7 a 15 números</strong> em cada aposta.</li>
              <li>São sorteados <strong>7 números</strong> e <strong>1 Mês da Sorte</strong> a cada concurso.</li>
              <li>Ganha prêmio quem acertar 7, 6, 5, 4 ou 3 números, ou o Mês da Sorte.</li>
              <li>O valor da aposta mínima (7 números) é: <strong>R$ 2,50</strong>.</li>
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
              <strong>Dias de Sorteio:</strong> Os sorteios do Dia de Sorte são realizados às <strong>segundas, quartas e sextas-feiras</strong>,
              às 20h (horário de Brasília) — três sorteios por semana.
            </p>
            <p>
              <strong>Valor da Aposta:</strong> A aposta mínima (7 dezenas) custa <strong>R$ 2,50</strong>. O preço aumenta conforme
               o número de dezenas marcadas, até R$ 16.387,50 para 15 dezenas.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Facilite sua Aposta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              <strong>Surpresinha:</strong> Deixe que o sistema escolha seus números e o Mês da Sorte aleatoriamente.
              Use nosso <a href="/diadesorte/gerador" className="font-medium underline" style={{ color: COR }}>Gerador de Jogos</a> gratuito.
            </p>
            <p>
              <strong>Teimosinha:</strong> Concorra com a mesma aposta por 3, 6, 9 ou 12 concursos consecutivos.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Trophy className="w-5 h-5" style={{ color: COR }} />
              Dicas para Apostar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              <strong>Bolão:</strong> Forme um grupo e divida o custo (e o prêmio) com outras pessoas.
              O Bolão do Dia de Sorte tem preço mínimo de R$ 5,00, com cotas a partir de R$ 2,50.
            </p>
            <p>
              <strong>Onde apostar:</strong> Nas casas lotéricas credenciadas ou pelo aplicativo/site da Caixa Econômica Federal
              (Loterias Online).
            </p>
            <p>
              <strong>Conferir resultados:</strong> Use nosso <a href="/diadesorte/conferidor" className="font-medium underline" style={{ color: COR }}>Conferidor de Apostas</a>{" "}
              para verificar se você ganhou em qualquer concurso.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
