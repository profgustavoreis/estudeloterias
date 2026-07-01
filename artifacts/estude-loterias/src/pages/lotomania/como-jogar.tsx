import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Info, HelpCircle } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";

const COR = "#f8901c";

export default function LotomaniaComoJogar() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageSEO
        title="Como Jogar na Lotomania"
        description="Saiba como funciona a Lotomania: regras, formas de apostar, valores, dias de sorteio e tudo que você precisa para fazer sua aposta."
        canonical="/lotomania/como-jogar"
      />
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: COR }}>
          <BookOpen className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: COR }}>Lotomania · Como Jogar</h1>
          <p className="text-muted-foreground mt-2 text-lg">Tudo o que você precisa saber para realizar a sua aposta.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">O que é a Lotomania?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            A Lotomania é uma das loterias da Caixa que mais premia. O apostador marca <strong>50 números</strong> dentre os
            100 disponíveis no volante (de 00 a 99) e ganha prêmios se acertar <strong>20, 19, 18, 17, 16, 15 ou nenhum</strong>
            dos 20 números sorteados — sim, na Lotomania você também ganha se não acertar nenhum número!
          </p>
          <p>
            Diferente de outras loterias, a Lotomania tem um preço único: a aposta custa sempre <strong>R$ 3,00</strong>,
            independentemente de ser surpresinha ou não. Não existem apostas múltiplas com mais dezenas — toda aposta
            é sempre de 50 números.
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
              <li>O volante contém 100 números (de 00 a 99).</li>
              <li>Você deve marcar exatamente 50 números em cada aposta.</li>
              <li>São sorteados 20 números a cada concurso.</li>
              <li>Ganha prêmio quem acertar 20, 19, 18, 17, 16, 15 ou 0 (nenhum) números.</li>
              <li>O preço da aposta é único: R$ 3,00.</li>
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
              <strong>Dias de Sorteio:</strong> Os sorteios da Lotomania são realizados às <strong>segundas, quartas e sextas-feiras</strong>,
              às 21h (horário de Brasília) — três sorteios por semana.
            </p>
            <p>
              <strong>Valor da Aposta:</strong> A aposta custa <strong>R$ 3,00</strong>. Não há variação de preço,
              pois toda aposta é sempre de 50 números.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Facilite sua Aposta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              <strong>Surpresinha:</strong> Deixe que o sistema escolha seus 50 números aleatoriamente.
              Use nosso <a href="/lotomania/gerador" className="font-medium underline" style={{ color: COR }}>Gerador de Jogos</a> gratuito.
            </p>
            <p>
              <strong>Teimosinha:</strong> Concorra com a mesma aposta por 2, 3, 4, 6, 8, 9 ou 12 concursos consecutivos.
            </p>
            <p>
              <strong>Aposta-Espelho:</strong> Faça uma nova aposta com o sistema selecionando os outros 50 números
              não registrados no jogo original — é como jogar o "complemento" da sua aposta.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Dicas para Apostar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              <strong>Bolão:</strong> Forme um grupo e divida o custo (e o prêmio) com outras pessoas.
            </p>
            <p>
              <strong>Onde apostar:</strong> Nas casas lotéricas credenciadas ou pelo aplicativo/site da Caixa Econômica Federal
              (Loterias Online).
            </p>
            <p>
              <strong>Conferir resultados:</strong> Use nosso <a href="/lotomania/conferidor" className="font-medium underline" style={{ color: COR }}>Conferidor de Apostas</a>{" "}
              para verificar se você ganhou em qualquer concurso.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}