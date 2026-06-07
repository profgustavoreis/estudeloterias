import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, HelpCircle } from "lucide-react";

export default function MegaSenaComoJogar() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#009640]">Como Jogar na Mega-Sena</h1>
        <p className="text-muted-foreground mt-2 text-lg">Tudo o que você precisa saber para realizar a sua aposta.</p>
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
            Para realizar o sonho de ser milionário, você deve marcar de 6 a 20 números do volante,
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
              às terças, quintas e sábados, a partir das 20h.
            </p>
            <p>
              <strong>Valor da Aposta:</strong> A aposta mínima, de 6 números, custa R$ 5,00.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
