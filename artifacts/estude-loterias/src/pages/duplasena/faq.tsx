import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";

const COR = "#a61324";

export default function DuplasenaFAQ() {
  const faqs = [
    {
      q: "Quando são realizados os sorteios da Dupla Sena?",
      a: "Os sorteios da Dupla Sena são realizados às terças, quintas e sábados, a partir das 20h (horário de Brasília) — três sorteios por semana."
    },
    {
      q: "Como funcionam os dois sorteios da Dupla Sena?",
      a: "Em cada concurso da Dupla Sena são realizados dois sorteios independentes de 6 números cada (1º e 2º sorteio). Sua aposta concorre automaticamente nos dois sorteios. Você ganha prêmio acertando 6, 5, 4 ou 3 números em qualquer um dos dois sorteios."
    },
    {
      q: "Quantos números preciso marcar?",
      a: "Você pode marcar de 6 a 15 números entre os 50 disponíveis no volante (01 a 50). A aposta mínima é de 6 números, mas você pode aumentar suas chances marcando até 15 números."
    },
    {
      q: "Quanto custa a aposta?",
      a: "A aposta mínima da Dupla Sena (6 números) custa R$ 3,00. Com 7 números: R$ 21,00; 8 números: R$ 84,00; 9 números: R$ 252,00; 10 números: R$ 630,00; 11 números: R$ 1.386,00; 12 números: R$ 2.772,00; 13 números: R$ 5.148,00; 14 números: R$ 9.009,00; 15 números: R$ 15.015,00."
    },
    {
      q: "Quantos acertos são necessários para ganhar um prêmio?",
      a: "Você ganha prêmio ao acertar 6 (sena), 5 (quina), 4 (quadra) ou 3 (terno) números em qualquer um dos dois sorteios. O prêmio do terno é fixo de R$ 2,00."
    },
    {
      q: "O que é Surpresinha?",
      a: "Surpresinha é a opção de deixar o sistema escolher seus números aleatoriamente. Use nosso Gerador de Jogos gratuito para uma funcionalidade semelhante."
    },
    {
      q: "O que é Teimosinha?",
      a: "Teimosinha é a opção de repetir a mesma aposta por 3, 6, 9 ou 12 concursos consecutivos, sem precisar preencher um novo volante a cada sorteio."
    },
    {
      q: "Posso participar de um Bolão?",
      a: "Sim. No Bolão CAIXA da Dupla Sena, é possível reunir um grupo de apostadores e dividir o custo e o prêmio. O Bolão tem preço mínimo de R$ 10,00 e cada cota não pode ser inferior a R$ 3,00."
    },
    {
      q: "Quais são as probabilidades de ganhar?",
      a: "Para uma aposta de 6 dezenas em um sorteio: Sena (6 acertos), 1 em 15.890.700; Quina (5 acertos), 1 em 60.104; Quadra (4 acertos), 1 em 1.120; Terno (3 acertos), 1 em 60. Como a Dupla Sena tem dois sorteios por concurso, suas chances são praticamente o dobro."
    },
    {
      q: "O prêmio acumula se não houver ganhador?",
      a: "Sim. Se não houver acertador da sena no 1º sorteio, o prêmio da 1ª faixa passa para o 2º sorteio do mesmo concurso. Se ainda assim não houver ganhador, o valor acumula para o concurso seguinte."
    },
    {
      q: "O que é a Dupla de Páscoa?",
      a: "É o sorteio especial de Páscoa da Dupla Sena. Realizado uma vez por ano, ele conta com um prêmio maior porque 15% do fundo de prêmios de cada concurso ao longo do ano é reservado para esta edição especial."
    },
    {
      q: "A Dupla de Páscoa tem regras diferentes?",
      a: "As regras do jogo são as mesmas (escolha de 6 a 15 números, dois sorteios). O diferencial é o prêmio maior, resultado da reserva acumulada ao longo do ano."
    },
    {
      q: "Qual o prazo para receber o prêmio?",
      a: "Os prêmios prescrevem 90 dias após a data do sorteio. Após esse prazo, os valores são repassados ao Tesouro Nacional para aplicação no FIES."
    },
    {
      q: "Onde posso receber meu prêmio?",
      a: "Você pode receber seu prêmio em qualquer casa lotérica credenciada ou nas agências da Caixa. Caso o prêmio bruto seja superior a R$ 2.428,80, o pagamento pode ser realizado somente nas agências da Caixa, mediante apresentação de comprovante de identidade original com CPF e recibo de aposta original e premiado."
    },
    {
      q: "Há incidência de Imposto de Renda sobre os prêmios?",
      a: "Sim. Incide alíquota de 30% de Imposto de Renda retida na fonte sobre o valor do prêmio que exceder o limite de isenção, conforme a legislação tributária vigente."
    },
    {
      q: "É possível apostar pela internet?",
      a: "Sim, pelo site e aplicativo Loterias Online CAIXA (loteriasonline.caixa.gov.br) ou pelo Internet Banking CAIXA."
    },
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageSEO
        title="Perguntas Frequentes sobre a Dupla Sena"
        description="Respostas para as principais dúvidas sobre a Dupla Sena: como jogar, os dois sorteios, acertos necessários, valores, Dupla de Páscoa e muito mais."
        canonical="/duplasena/perguntas-frequentes"
      />
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: COR }}>
          <HelpCircle className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: COR }}>Dupla Sena · Perguntas Frequentes</h1>
          <p className="text-muted-foreground mt-2 text-lg">Dúvidas comuns sobre a Dupla Sena e prêmios.</p>
        </div>
      </div>

      <Accordion type="single" collapsible className="w-full bg-card rounded-lg border px-4">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left font-medium text-lg py-4">
              {faq.q}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed">
              {faq.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
