import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";

const COR = "#cb852b";

export default function DiaDeSorteFAQ() {
  const faqs = [
    {
      q: "Quando são realizados os sorteios do Dia de Sorte?",
      a: "Os sorteios do Dia de Sorte são realizados às segundas, quartas e sextas-feiras, a partir das 20h (horário de Brasília) — três sorteios por semana."
    },
    {
      q: "Como faço para jogar no Dia de Sorte?",
      a: "Marque de 7 a 15 números entre os 31 disponíveis no volante (01 a 31) e escolha um Mês da Sorte entre os 12 meses do ano. Você também pode deixar o sistema escolher por você na Surpresinha."
    },
    {
      q: "Quantos números preciso marcar?",
      a: "Você pode marcar de 7 a 15 números. A aposta mínima é de 7 números, mas você pode aumentar suas chances marcando até 15 números."
    },
    {
      q: "Quanto custa a aposta?",
      a: "A aposta mínima do Dia de Sorte (7 números) custa R$ 2,50. Com 8 números: R$ 20,00; 9 números: R$ 90,00; 10 números: R$ 315,00; 11 números: R$ 924,00; 12 números: R$ 2.380,00; 13 números: R$ 5.544,00; 14 números: R$ 11.880,00; 15 números: R$ 16.387,50."
    },
    {
      q: "O que é o Mês da Sorte?",
      a: "É o mês do ano sorteado junto com as dezenas. Se o mês sorteado for igual ao que você marcou no volante, você ganha um prêmio fixo de R$ 4,00 independentemente dos números acertados."
    },
    {
      q: "O que é Surpresinha?",
      a: "Surpresinha é a opção de deixar o sistema escolher seus números e o Mês da Sorte aleatoriamente. Use nosso Gerador de Jogos gratuito para uma funcionalidade semelhante."
    },
    {
      q: "O que é Teimosinha?",
      a: "Teimosinha é a opção de repetir a mesma aposta por 3, 6, 9 ou 12 concursos consecutivos, sem precisar preencher um novo volante a cada sorteio."
    },
    {
      q: "Posso participar de um Bolão?",
      a: "Sim. No Bolão CAIXA do Dia de Sorte, é possível reunir um grupo de apostadores e dividir o custo e o prêmio. O Bolão tem preço mínimo de R$ 5,00 e cada cota não pode ser inferior a R$ 2,50."
    },
    {
      q: "Quantos acertos são necessários para ganhar um prêmio?",
      a: "Você ganha prêmio ao acertar 7, 6, 5, 4 ou 3 números, ou acertar o Mês da Sorte. Os prêmios para 3 e 4 acertos e Mês da Sorte têm valores fixos de R$ 4,00."
    },
    {
      q: "Quais são as probabilidades de ganhar?",
      a: "Para uma aposta de 7 dezenas: 7 acertos, 1 em 2.629.575; 6 acertos, 1 em 36.690; 5 acertos, 1 em 1.284; 4 acertos, 1 em 93; 3 acertos, 1 em 12; e Mês da Sorte, 1 em 12."
    },
    {
      q: "O Dia de Sorte tem sorteio especial?",
      a: "Não. Diferente da Mega-Sena (Mega da Virada), da Lotofácil (Independência) e da Quina (São João), o Dia de Sorte não possui concurso especial. Todos os sorteios seguem as mesmas regras de premiação."
    },
    {
      q: "O prêmio acumula se não houver ganhador?",
      a: "Sim. Não havendo ganhador na 1ª faixa (7 acertos), o valor acumula para o concurso seguinte na 1ª faixa. Os prêmios fixos (3, 4 acertos e Mês da Sorte) não acumulam."
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
        title="Perguntas Frequentes sobre o Dia de Sorte"
        description="Respostas para as principais dúvidas sobre o Dia de Sorte: como jogar, acertos necessários, valores, prazos, Mês da Sorte e muito mais."
        canonical="/diadesorte/perguntas-frequentes"
      />
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: COR }}>
          <HelpCircle className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: COR }}>Dia de Sorte · Perguntas Frequentes</h1>
          <p className="text-muted-foreground mt-2 text-lg">Dúvidas comuns sobre o Dia de Sorte e prêmios.</p>
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
