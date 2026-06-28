import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";

const COR = "#930089";

const faqs = [
  {
    q: "Quantos números devo marcar na Lotofácil?",
    a: "Você deve marcar de 15 a 20 números dentre os 25 disponíveis no volante (01 a 25). A aposta mínima é de 15 números.",
  },
  {
    q: "Quantos números são sorteados a cada concurso?",
    a: "São sorteados 15 números a cada concurso da Lotofácil.",
  },
  {
    q: "Quantos acertos são necessários para ganhar um prêmio?",
    a: "Na Lotofácil você ganha prêmio acertando 11, 12, 13, 14 ou 15 números. A 5ª faixa (11 acertos) tem a probabilidade de aproximadamente 1 em 7 para uma aposta simples.",
  },
  {
    q: "Quanto custa a aposta mínima?",
    a: "A aposta mínima de 15 números custa R$ 3,00. Apostas com mais números custam mais, mas aumentam suas chances de ganhar.",
  },
  {
    q: "Quando ocorrem os sorteios da Lotofácil?",
    a: "Os sorteios da Lotofácil são realizados às segundas, quartas e sextas-feiras, às 20h (horário de Brasília). São três sorteios por semana.",
  },
  {
    q: "O prêmio da Lotofácil acumula?",
    a: "Sim. Se não houver ganhadores na 1ª faixa (15 acertos), o prêmio principal acumula para o próximo concurso. As demais faixas (11 a 14 acertos) são sempre distribuídas entre os ganhadores de cada sorteio.",
  },
  {
    q: "Qual é o prazo para resgatar um prêmio?",
    a: "Os prêmios da Lotofácil devem ser resgatados em até 90 dias corridos após a data do sorteio. Após esse prazo, o valor é repassado ao Fundo de Financiamento Estudantil (FIES).",
  },
  {
    q: "É possível apostar pela internet?",
    a: "Sim. Você pode apostar pelo site oficial Loterias Online da Caixa (loterias.caixa.gov.br) ou pelo aplicativo da Caixa. O valor mínimo para apostas online é de R$ 30,00 por sessão.",
  },
  {
    q: "O que é Surpresinha?",
    a: "Surpresinha é quando você deixa o sistema escolher seus 15 números aleatoriamente. Nosso Gerador de Jogos oferece uma funcionalidade semelhante gratuitamente.",
  },
  {
    q: "O que é Teimosinha?",
    a: "Teimosinha é quando você concorre com a mesma aposta em 2, 4 ou 8 concursos consecutivos sem precisar repetir a aposta a cada sorteio.",
  },
  {
    q: "Há incidência de Imposto de Renda sobre os prêmios?",
    a: "Sim. Prêmios acima de R$ 2.112,00 têm desconto de 13,5% de Imposto de Renda na fonte. Prêmios até esse valor são isentos de IR.",
  },
  {
    q: "Qual a diferença entre a Lotofácil e a Mega-Sena?",
    a: "A Lotofácil tem 25 números no volante (vs. 60 da Mega-Sena), sorteia 15 números por concurso (vs. 6) e premia quem acerta de 11 a 15 números. A aposta mínima custa R$ 3,00 (vs. R$ 6,00) e os prêmios são geralmente menores, mas com muito mais ganhadores.",
  },
];

export default function LotofacilFAQ() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageSEO
        title="Perguntas Frequentes sobre a Lotofácil"
        description="Respostas para as principais dúvidas sobre a Lotofácil: como jogar, acertos necessários, valores, prazos e muito mais."
        canonical="/lotofacil/perguntas-frequentes"
      />
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: COR }}>
          <HelpCircle className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: COR }}>Lotofácil · Perguntas Frequentes</h1>
          <p className="text-muted-foreground mt-1">Respostas para as principais dúvidas sobre a Lotofácil.</p>
        </div>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">{faq.q}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{faq.a}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
