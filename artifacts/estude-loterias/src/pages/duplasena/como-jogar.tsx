import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Info, HelpCircle, Trophy } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";

const COR = "#a61324";

export default function DuplasenaComoJogar() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageSEO
        title="Como Jogar na Dupla Sena"
        description="Saiba como funciona a Dupla Sena: regras, formas de apostar, valores, dias de sorteio, os dois sorteios por concurso e tudo que você precisa para fazer sua aposta."
        canonical="/duplasena/como-jogar"
      />
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: COR }}>
          <BookOpen className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: COR }}>Dupla Sena · Como Jogar</h1>
          <p className="text-muted-foreground mt-2 text-lg">Tudo o que você precisa saber para realizar a sua aposta.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">O que é a Dupla Sena?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            A Dupla Sena é a loteria da Caixa que oferece <strong>dois sorteios por concurso</strong>! Você escolhe de <strong>6 a 15 números</strong> entre os
            50 disponíveis (01 a 50) e concorre com a mesma aposta em dois sorteios diferentes.
          </p>
          <p>
            Com apenas R$ 3,00 você já pode concorrer a prêmios que chegam a ultrapassar R$ 10 milhões.
            É a loteria que mais dá chances de ganhar entre as loterias de 6 números!
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
              <li>O volante contém 50 números (de 01 a 50).</li>
              <li>Você pode marcar de <strong>6 a 15 números</strong> em cada aposta.</li>
              <li>São sorteados <strong>6 números em dois sorteios</strong> a cada concurso (1º e 2º sorteio).</li>
              <li>Ganha prêmio quem acertar 6, 5, 4 ou 3 números em <strong>qualquer um dos dois sorteios</strong>.</li>
              <li>O valor da aposta mínima (6 números) é: <strong>R$ 3,00</strong>.</li>
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
              <strong>Dias de Sorteio:</strong> Os sorteios da Dupla Sena são realizados às <strong>terças, quintas e sábados</strong>,
              às 20h (horário de Brasília) — três sorteios por semana.
            </p>
            <p>
              <strong>Valor da Aposta:</strong> A aposta mínima (6 dezenas) custa <strong>R$ 3,00</strong>. O preço aumenta conforme
              o número de dezenas marcadas, até R$ 15.015,00 para 15 dezenas.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Facilite sua Aposta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              <strong>Surpresinha:</strong> Deixe que o sistema escolha seus números aleatoriamente.
              Use nosso <a href="/duplasena/gerador" className="font-medium underline" style={{ color: COR }}>Gerador de Jogos</a> gratuito.
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
              O Bolão da Dupla Sena tem preço mínimo de R$ 10,00, com cotas a partir de R$ 3,00.
            </p>
            <p>
              <strong>Vantagem dos dois sorteios:</strong> Na Dupla Sena, sua aposta concorre em dois sorteios diferentes
              no mesmo concurso, dobrando suas chances de ganhar!
            </p>
            <p>
              <strong>Conferir resultados:</strong> Use nosso <a href="/duplasena/conferidor" className="font-medium underline" style={{ color: COR }}>Conferidor de Apostas</a>{" "}
              para verificar se você ganhou em qualquer concurso.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
