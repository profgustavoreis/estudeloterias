import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Info, HelpCircle, Trophy } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";

const COR = "#2E3078";

export default function MaismilionariaComoJogar() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageSEO
        title="Como Jogar na +Milionária"
        description="Saiba como funciona a +Milionária: regras, formas de apostar, valores, dias de sorteio, Trevos da Sorte e tudo que você precisa para fazer sua aposta."
        canonical="/maismilionaria/como-jogar"
      />
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: COR }}>
          <BookOpen className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: COR }}>+Milionária · Como Jogar</h1>
          <p className="text-muted-foreground mt-2 text-lg">Tudo o que você precisa saber para realizar a sua aposta.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">O que é a +Milionária?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            A +Milionária é a loteria que combina números e Trevos da Sorte! Você escolhe <strong>6 números</strong> entre os
            50 disponíveis (01 a 50) e <strong>2 Trevos da Sorte</strong> entre 1 e 6.
            Lançada em 2022, a +Milionária oferece prêmios milionários com um formato inovador.
          </p>
          <p>
            Diferente das outras loterias, a +Milionária exige que você acerte tanto os números quanto os trevos
            para levar o prêmio principal — o que torna o desafio ainda mais emocionante.
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
              <li>O volante contém 50 números (de 01 a 50) e 6 Trevos da Sorte (de 1 a 6).</li>
              <li>Você deve marcar exatamente <strong>6 números e 2 Trevos da Sorte</strong> em cada aposta mínima.</li>
              <li>São sorteados <strong>6 números</strong> e <strong>2 Trevos da Sorte</strong> a cada concurso.</li>
              <li>Ganha prêmio quem acertar 6, 5, 4 ou 3 números, combinados com os trevos.</li>
              <li>O preço da aposta é único: <strong>R$ 6,00</strong>.</li>
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
              <strong>Dias de Sorteio:</strong> Os sorteios da +Milionária são realizados aos <strong>sábados</strong>,
              às 20h (horário de Brasília) — um sorteio por semana.
            </p>
            <p>
              <strong>Valor da Aposta:</strong> A aposta mínima custa <strong>R$ 6,00</strong> para 6 dezenas e 2 trevos.
              Você pode aumentar suas chances escolhendo mais números (até 12) e mais trevos (até 6), com o preço aumentando proporcionalmente.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Facilite sua Aposta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              <strong>Surpresinha:</strong> Deixe que o sistema escolha seus 6 números e 2 Trevos da Sorte aleatoriamente.
              Use nosso <a href="/maismilionaria/gerador" className="font-medium underline" style={{ color: COR }}>Gerador de Jogos</a> gratuito.
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
              O Bolão da +Milionária tem preço mínimo de R$ 12,00, com cotas a partir de R$ 6,00.
            </p>
            <p>
              <strong>Onde apostar:</strong> Nas casas lotéricas credenciadas ou pelo aplicativo/site da Caixa Econômica Federal
              (Loterias Online).
            </p>
            <p>
              <strong>Conferir resultados:</strong> Use nosso <a href="/maismilionaria/conferidor" className="font-medium underline" style={{ color: COR }}>Conferidor de Apostas</a>{" "}
              para verificar se você ganhou em qualquer concurso.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
