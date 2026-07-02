import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Info, HelpCircle, Trophy } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";

const COR = "#049645";

export default function TimemaniaComoJogar() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageSEO
        title="Como Jogar na Timemania"
        description="Saiba como funciona a Timemania: regras, formas de apostar, valores, dias de sorteio, Time do Coração e tudo que você precisa para fazer sua aposta."
        canonical="/timemania/como-jogar"
      />
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: COR }}>
          <BookOpen className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: COR }}>Timemania · Como Jogar</h1>
          <p className="text-muted-foreground mt-2 text-lg">Tudo o que você precisa saber para realizar a sua aposta.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">O que é a Timemania?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            A Timemania é a loteria perfeita para os apaixonados por futebol! Você escolhe <strong>10 números</strong> entre os
            80 disponíveis (01 a 80) e um <strong>Time do Coração</strong> entre os 80 clubes de futebol participantes.
            A cada concurso são sorteados 7 números e um Time do Coração.
          </p>
          <p>
            Além de concorrer a prêmios em dinheiro, você ainda ajuda o seu time do coração — 22% da arrecadação
            da Timemania é destinada aos clubes de futebol brasileiros.
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
              <li>Você deve marcar exatamente <strong>10 números</strong> em cada aposta.</li>
              <li>São sorteados <strong>7 números</strong> e <strong>1 Time do Coração</strong> a cada concurso.</li>
              <li>Ganha prêmio quem acertar 7, 6, 5, 4 ou 3 números, ou o Time do Coração.</li>
              <li>O preço da aposta é único: <strong>R$ 3,50</strong>.</li>
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
              <strong>Dias de Sorteio:</strong> Os sorteios da Timemania são realizados às <strong>terças, quintas e sábados</strong>,
              às 21h (horário de Brasília) — três sorteios por semana.
            </p>
            <p>
              <strong>Valor da Aposta:</strong> A aposta custa <strong>R$ 3,50</strong>. Não há variação de preço,
              pois toda aposta é sempre de 10 números + 1 Time do Coração.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Facilite sua Aposta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              <strong>Surpresinha:</strong> Deixe que o sistema escolha seus 10 números e o Time do Coração aleatoriamente.
              Use nosso <a href="/timemania/gerador" className="font-medium underline" style={{ color: COR }}>Gerador de Jogos</a> gratuito.
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
              O Bolão da Timemania tem preço mínimo de R$ 7,00, com cotas a partir de R$ 3,50.
            </p>
            <p>
              <strong>Onde apostar:</strong> Nas casas lotéricas credenciadas ou pelo aplicativo/site da Caixa Econômica Federal
              (Loterias Online).
            </p>
            <p>
              <strong>Conferir resultados:</strong> Use nosso <a href="/timemania/conferidor" className="font-medium underline" style={{ color: COR }}>Conferidor de Apostas</a>{" "}
              para verificar se você ganhou em qualquer concurso.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
