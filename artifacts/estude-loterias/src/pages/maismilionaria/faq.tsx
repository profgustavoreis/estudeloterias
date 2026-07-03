import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";

const COR = "#2E3078";

export default function MaismilionariaFAQ() {
  const faqs = [
    {
      q: "Quando são realizados os sorteios da +Milionária?",
      a: "Os sorteios da +Milionária são realizados aos sábados, a partir das 20h (horário de Brasília) — um sorteio por semana."
    },
    {
      q: "Como faço para jogar na +Milionária?",
      a: "Marque 6 números entre os 50 disponíveis no volante (01 a 50) e escolha 2 Trevos da Sorte (1 a 6). Você também pode deixar o sistema escolher por você na Surpresinha."
    },
    {
      q: "Quantos números preciso marcar?",
      a: "Na aposta mínima, você deve marcar 6 números (01 a 50) e 2 Trevos da Sorte (1 a 6). Você pode optar por até 12 números e até 6 trevos em apostas múltiplas, com o preço aumentando proporcionalmente."
    },
    {
      q: "Quanto custa a aposta?",
      a: "A aposta mínima da +Milionária custa R$ 6,00 (6 dezenas + 2 trevos). Apostas com mais números ou mais trevos têm custo maior: até R$ 55.440,00 para 12 números + 6 trevos."
    },
    {
      q: "O que são os Trevos da Sorte?",
      a: "Os Trevos da Sorte são uma segunda categoria de números (de 1 a 6) que você precisa escolher junto com as dezenas. Para levar o prêmio principal, você precisa acertar os 6 números e os 2 Trevos da Sorte sorteados."
    },
    {
      q: "O que é Surpresinha?",
      a: "Surpresinha é a opção de deixar o sistema escolher seus 6 números e 2 Trevos da Sorte aleatoriamente. Use nosso Gerador de Jogos gratuito para uma funcionalidade semelhante."
    },
    {
      q: "O que é Teimosinha?",
      a: "Teimosinha é a opção de repetir a mesma aposta por 3, 6, 9 ou 12 concursos consecutivos, sem precisar preencher um novo volante a cada sorteio."
    },
    {
      q: "Posso participar de um Bolão?",
      a: "Sim. No Bolão CAIXA da +Milionária, é possível reunir um grupo de apostadores e dividir o custo e o prêmio. O Bolão tem preço mínimo de R$ 12,00 e cada cota não pode ser inferior a R$ 6,00, sendo possível realizar um bolão com no mínimo 2 e no máximo 50 cotas."
    },
    {
      q: "Quantos acertos são necessários para ganhar um prêmio?",
      a: "Você ganha prêmio ao acertar 6, 5, 4 ou 3 números, combinados com os Trevos da Sorte. O prêmio principal exige 6 acertos + 2 Trevos, mas há premiações para outras combinações com menos acertos e/ou menos trevos."
    },
    {
      q: "Quais são as probabilidades de ganhar?",
      a: "Para uma aposta de 6 dezenas e 2 Trevos: 6 + 2 Trevos, 1 em 158.145.470; 6 (1 ou 0 Trevos), 1 em 3.515.455; 5 + 2 Trevos, 1 em 690.136; 5 (1 ou 0 Trevos), 1 em 35.270; 4 + 2, 1 em 8.855; 4 + 1 ou 0, 1 em 677; 3 + 2, 1 em 256; 3 + 1, 1 em 36; 2 + 2, 1 em 33; 2 + 1, 1 em 7."
    },
    {
      q: "A +Milionária tem sorteio especial?",
      a: "Não. Diferente da Mega-Sena (Mega da Virada), da Lotofácil (Independência) e da Quina (São João), a +Milionária não possui concurso especial. Todos os sorteios seguem as mesmas regras de premiação."
    },
    {
      q: "O prêmio acumula se não houver ganhador?",
      a: "Sim. Não havendo ganhador na 1ª faixa (6 acertos + 2 Trevos), o valor acumula para o concurso seguinte na mesma faixa. As demais faixas com prêmios fixos não acumulam."
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
      q: "Qual a diferença entre a +Milionária e a Mega-Sena?",
      a: "Na Mega-Sena você escolhe 6 números de 01 a 60; na +Milionária são 6 números de 01 a 50 mais 2 Trevos da Sorte (1 a 6). A +Milionária tem prêmio principal mais difícil (1 em 158 milhões vs. 1 em 50 milhões), mas oferece mais faixas de premiação. Além disso, a +Milionária foi lançada em 2022 e não possui sorteio especial."
    },
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageSEO
        title="Perguntas Frequentes sobre a +Milionária"
        description="Respostas para as principais dúvidas sobre a +Milionária: como jogar, acertos necessários, valores, prazos, Trevos da Sorte e muito mais."
        canonical="/maismilionaria/perguntas-frequentes"
      />
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: COR }}>
          <HelpCircle className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: COR }}>+Milionária · Perguntas Frequentes</h1>
          <p className="text-muted-foreground mt-2 text-lg">Dúvidas comuns sobre a +Milionária e prêmios.</p>
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
