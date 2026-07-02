import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";

const COR = "#049645";

export default function TimemaniaFAQ() {
  const faqs = [
    {
      q: "Quando são realizados os sorteios da Timemania?",
      a: "Os sorteios da Timemania são realizados às terças, quintas e sábados, a partir das 21h (horário de Brasília) — três sorteios por semana."
    },
    {
      q: "Como faço para jogar na Timemania?",
      a: "Marque 10 números entre os 80 disponíveis no volante (01 a 80) e escolha um Time do Coração entre os 80 clubes participantes. Você também pode deixar o sistema escolher por você na Surpresinha."
    },
    {
      q: "Quantos números preciso marcar?",
      a: "Sempre 10 números. Diferente de outras loterias, a Timemania não permite apostas com mais ou menos dezenas — toda aposta é sempre de 10 números + 1 Time do Coração."
    },
    {
      q: "Quanto custa a aposta?",
      a: "A aposta da Timemania tem preço único: R$ 3,50. Não há variação de preço, pois toda aposta é sempre de 10 números + 1 Time do Coração."
    },
    {
      q: "O que é o Time do Coração?",
      a: "É um clube de futebol que você escolhe dentre os 80 times participantes. Se o seu time for o sorteado no concurso, você ganha um prêmio fixo de R$ 8,50 independentemente dos números. Além disso, 22% da arrecadação da Timemania é destinada aos clubes de futebol."
    },
    {
      q: "O que é Surpresinha?",
      a: "Surpresinha é a opção de deixar o sistema escolher seus 10 números e o Time do Coração aleatoriamente. Use nosso Gerador de Jogos gratuito para uma funcionalidade semelhante."
    },
    {
      q: "O que é Teimosinha?",
      a: "Teimosinha é a opção de repetir a mesma aposta por 3, 6, 9 ou 12 concursos consecutivos, sem precisar preencher um novo volante a cada sorteio."
    },
    {
      q: "Posso participar de um Bolão?",
      a: "Sim. No Bolão CAIXA da Timemania, é possível reunir um grupo de apostadores e dividir o custo e o prêmio. O Bolão tem preço mínimo de R$ 7,00 e cada cota não pode ser inferior a R$ 3,50, sendo possível realizar um bolão com no mínimo 2 e no máximo 15 cotas."
    },
    {
      q: "Quantos acertos são necessários para ganhar um prêmio?",
      a: "Você ganha prêmio ao acertar 7, 6, 5, 4 ou 3 números, ou acertar o Time do Coração. Os prêmios para 3 e 4 acertos e Time do Coração têm valores fixos."
    },
    {
      q: "Quais são as probabilidades de ganhar?",
      a: "Para uma aposta de 10 dezenas: 7 acertos, 1 em 26.472.637; 6 acertos, 1 em 216.103; 5 acertos, 1 em 5.220; 4 acertos, 1 em 276; 3 acertos, 1 em 29; e Time do Coração, 1 em 80."
    },
    {
      q: "A Timemania tem sorteio especial?",
      a: "Não. Diferente da Mega-Sena (Mega da Virada), da Lotofácil (Independência) e da Quina (São João), a Timemania não possui concurso especial. Todos os sorteios seguem as mesmas regras de premiação."
    },
    {
      q: "O prêmio acumula se não houver ganhador?",
      a: "Sim. Não havendo ganhador nas 1ª, 2ª ou 3ª faixas (7, 6 ou 5 acertos), o valor acumula para o concurso seguinte na 1ª faixa (7 acertos). Os prêmios fixos (3, 4 acertos e Time do Coração) não acumulam."
    },
    {
      q: "Qual o prazo para receber o prêmio?",
      a: "Os prêmios prescrevem 90 dias após a data do sorteio. Após esse prazo, os valores são repassados ao Tesouro Nacional para aplicação no FIES (Fundo de Financiamento Estudantil)."
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
    {
      q: "Os clubes de futebol realmente recebem dinheiro da Timemania?",
      a: "Sim! 22% da arrecadação total da Timemania é destinada aos clubes de futebol brasileiros. Ao apostar, você não só concorre a prêmios como também ajuda financeiramente o futebol brasileiro."
    },
    {
      q: "Qual a diferença entre a Timemania e a Quina?",
      a: "Ambas têm 80 números no volante, mas na Timemania você marca 10 números (vs. 5 a 15 na Quina) e são sorteados 7 (vs. 5). A Timemania tem o diferencial do Time do Coração e premia 5 faixas de acerto (3 a 7) mais o time. A aposta custa R$ 3,50."
    }
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageSEO
        title="Perguntas Frequentes sobre a Timemania"
        description="Respostas para as principais dúvidas sobre a Timemania: como jogar, acertos necessários, valores, prazos, Time do Coração e muito mais."
        canonical="/timemania/perguntas-frequentes"
      />
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: COR }}>
          <HelpCircle className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: COR }}>Timemania · Perguntas Frequentes</h1>
          <p className="text-muted-foreground mt-2 text-lg">Dúvidas comuns sobre a Timemania e prêmios.</p>
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
