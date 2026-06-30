import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";

export default function MegaSenaFAQ() {
  const faqs = [
    {
      q: "Quando são realizados os sorteios da Mega-Sena?",
      a: "Os sorteios da Mega-Sena são realizados três vezes por semana — às terças, quintas e sábados — a partir das 21h (horário de Brasília)."
    },
    {
      q: "Como faço para jogar na Mega-Sena?",
      a: "Marque de 6 a 20 números dentre os 60 disponíveis no volante, ou deixe que o sistema escolha por você na Surpresinha. Você também pode repetir a aposta em concursos seguintes com a Teimosinha."
    },
    {
      q: "Posso marcar mais de 6 números?",
      a: "Sim. Você pode marcar até 20 números no mesmo volante. Quanto mais números marcar, maior o preço da aposta (pois mais combinações são formadas) e maiores as chances de ganhar."
    },
    {
      q: "Quanto custa a aposta mínima?",
      a: "A aposta mínima, de 6 números, custa R$ 6,00. Apostas com mais números custam mais, conforme a tabela de preços."
    },
    {
      q: "O que é Surpresinha?",
      a: "Surpresinha é a opção de deixar o sistema escolher seus números aleatoriamente. Use nosso Gerador de Jogos gratuito para uma funcionalidade semelhante."
    },
    {
      q: "O que é Teimosinha?",
      a: "Teimosinha é a opção de repetir a mesma aposta por 2, 3, 4, 6, 8, 9 ou 12 concursos consecutivos, sem precisar preencher um novo volante a cada sorteio."
    },
    {
      q: "Posso participar de um Bolão?",
      a: "Sim. No Bolão CAIXA da Mega-Sena, o preço mínimo é de R$ 18,00, com cotas a partir de R$ 7,00, podendo reunir de 2 a 100 cotas."
    },
    {
      q: "Quantos acertos são necessários para ganhar um prêmio?",
      a: "Você ganha prêmio ao acertar 4 (Quadra), 5 (Quina) ou 6 (Sena) dos números sorteados dentre os 60 disponíveis."
    },
    {
      q: "Quais são as probabilidades de ganhar?",
      a: "Para uma aposta simples de 6 números, a probabilidade de acertar a Sena (6 números) é de 1 em 50.063.860; a Quina (5 números), de 1 em 154.518; e a Quadra (4 números), de 1 em 2.332."
    },
    {
      q: "O que é a Mega da Virada?",
      a: "É o concurso especial realizado em 31 de dezembro, com prêmio mínimo garantido. Parte do prêmio bruto dos concursos do ano (10%) é reservada para essa faixa principal, que não acumula: se ninguém acertar a Sena, o valor é dividido entre os acertadores da Quina."
    },
    {
      q: "Como funcionam os concursos de final 0 ou 5?",
      a: "22% do prêmio bruto de cada concurso normal fica acumulado e é distribuído aos acertadores da Sena nos concursos cujo número termina em 0 ou 5, tornando esses sorteios especiais."
    },
    {
      q: "O prêmio acumula se não houver ganhador?",
      a: "Sim. Não havendo acertador em determinada faixa, o valor correspondente acumula para a mesma faixa no concurso seguinte."
    },
    {
      q: "Qual o prazo para receber o prêmio?",
      a: "Os prêmios prescrevem 90 dias após a data do sorteio. Após esse prazo, os valores são repassados ao Tesouro Nacional para aplicação no FIES (Fundo de Financiamento Estudantil)."
    },
    {
      q: "Onde posso receber meu prêmio?",
      a: "Você pode receber seu prêmio em qualquer casa lotérica credenciada ou nas agências da Caixa. Caso o prêmio bruto seja superior a R$ 2.428,80, o pagamento pode ser realizado somente nas agências da Caixa, mediante apresentação de comprovante de identidade original com CPF e recibo de aposta original e premiado. Valores iguais ou acima de R$ 10.000,00 são pagos no prazo mínimo de dois dias úteis a partir de sua apresentação em Agência da Caixa."
    },
    {
      q: "Há incidência de Imposto de Renda sobre os prêmios?",
      a: "Sim. Incide alíquota de 30% de Imposto de Renda retida na fonte sobre o valor do prêmio que exceder o limite de isenção, conforme a legislação tributária vigente."
    },
    {
      q: "Estrangeiros podem jogar na Mega-Sena?",
      a: "Sim. Qualquer pessoa maior de 18 anos, seja brasileiro ou estrangeiro, pode realizar apostas e resgatar prêmios nas loterias da Caixa, desde que a aposta seja feita em território nacional ou pelos canais oficiais da Caixa."
    },
    {
      q: "É possível apostar pela internet?",
      a: "Sim, pelo site e aplicativo Loterias Online CAIXA (loteriasonline.caixa.gov.br) ou pelo Internet Banking CAIXA."
    },
    {
      q: "Qual a diferença entre a Mega-Sena e a Lotofácil?",
      a: "A Mega-Sena tem 60 números no volante (vs. 25 da Lotofácil), sorteia 6 números por concurso (vs. 15) e premia quem acerta 4, 5 ou 6 números. A aposta mínima custa R$ 6,00 (vs. R$ 3,50 da Lotofácil), com prêmios geralmente maiores, mas menos frequentes."
    }
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageSEO
        title="Perguntas Frequentes sobre a Mega-Sena"
        description="Respostas às dúvidas mais comuns sobre a Mega-Sena: prazo para resgatar prêmios, bolão, Mega da Virada, apostas online e muito mais."
        canonical="/mega-sena/perguntas-frequentes"
      />
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white bg-[#009640]">
          <HelpCircle className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#009640]">Mega-Sena · Perguntas Frequentes</h1>
          <p className="text-muted-foreground mt-2 text-lg">Dúvidas comuns sobre a Mega-Sena e prêmios.</p>
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
