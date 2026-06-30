import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";

const COR = "#930089";

export default function LotofacilFAQ() {
  const faqs = [
    {
      q: "Quando são realizados os sorteios da Lotofácil?",
      a: "Os sorteios da Lotofácil são realizados de segunda a sábado, a partir das 21h (horário de Brasília) — seis sorteios por semana."
    },
    {
      q: "Como faço para jogar na Lotofácil?",
      a: "Marque de 15 a 20 números dentre os 25 disponíveis no volante, ou deixe que o sistema escolha por você na Surpresinha. Você também pode repetir a aposta em concursos seguintes com a Teimosinha."
    },
    {
      q: "Posso marcar mais de 15 números?",
      a: "Sim. Você pode marcar até 20 números no mesmo volante. Quanto mais números marcar, maior o preço da aposta (pois mais combinações são formadas) e maiores as chances de ganhar."
    },
    {
      q: "Quanto custa a aposta mínima?",
      a: "A aposta mínima, de 15 números, custa R$ 3,50. Apostas com mais números custam mais, conforme a tabela de preços."
    },
    {
      q: "O que é Surpresinha?",
      a: "Surpresinha é a opção de deixar o sistema escolher seus 15 números aleatoriamente. Use nosso Gerador de Jogos gratuito para uma funcionalidade semelhante."
    },
    {
      q: "O que é Teimosinha?",
      a: "Teimosinha é a opção de repetir a mesma aposta por 2, 3, 4, 6, 8, 9, 12, 18 ou 24 concursos consecutivos, sem precisar preencher um novo volante a cada sorteio."
    },
    {
      q: "Posso participar de um Bolão?",
      a: "Sim. No Bolão CAIXA da Lotofácil, o preço mínimo é de R$ 14,00, com cotas a partir de R$ 4,50, podendo reunir de 2 a 100 cotas, dependendo da quantidade de números marcados."
    },
    {
      q: "Quantos acertos são necessários para ganhar um prêmio?",
      a: "Você ganha prêmio ao acertar 11, 12, 13, 14 ou 15 dos números sorteados dentre os 25 disponíveis."
    },
    {
      q: "Quais são as probabilidades de ganhar?",
      a: "Para uma aposta simples de 15 números, a probabilidade de acertar os 15 números é de 1 em 3.268.760; 14 números, 1 em 21.792; 13 números, 1 em 692; 12 números, 1 em 60; e 11 números, 1 em 11."
    },
    {
      q: "Os prêmios de 11, 12 e 13 acertos são valores fixos?",
      a: "Sim. Diferentemente das faixas de 14 e 15 acertos (que recebem um percentual do prêmio), as apostas com 11, 12 e 13 acertos recebem valores fixos de R$ 7,00, R$ 14,00 e R$ 35,00, respectivamente."
    },
    {
      q: "O que é a Lotofácil da Independência?",
      a: "É o concurso especial realizado em setembro de cada ano. Parte do prêmio bruto dos concursos do ano (15%) é reservada para a faixa principal (15 acertos) desse sorteio especial."
    },
    {
      q: "Como funcionam os concursos de final 0?",
      a: "10% do valor variável destinado à premiação de cada concurso normal fica acumulado e é distribuído aos acertadores de 15 números nos concursos cujo número termina em 0."
    },
    {
      q: "O prêmio acumula se não houver ganhador?",
      a: "Sim. Não havendo ganhador em qualquer faixa de premiação, o valor correspondente acumula para o concurso seguinte, sempre na faixa de 15 acertos (1ª faixa)."
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
      q: "Estrangeiros podem jogar na Lotofácil?",
      a: "Sim. Qualquer pessoa maior de 18 anos, seja brasileiro ou estrangeiro, pode realizar apostas e resgatar prêmios nas loterias da Caixa, desde que a aposta seja feita em território nacional ou pelos canais oficiais da Caixa."
    },
    {
      q: "É possível apostar pela internet?",
      a: "Sim, pelo site e aplicativo Loterias Online CAIXA (loteriasonline.caixa.gov.br) ou pelo Internet Banking CAIXA."
    },
    {
      q: "Qual a diferença entre a Lotofácil e a Mega-Sena?",
      a: "A Lotofácil tem 25 números no volante (vs. 60 da Mega-Sena), sorteia 15 números por concurso (vs. 6) e premia quem acerta de 11 a 15 números. A aposta mínima custa R$ 3,50 (vs. R$ 6,00 da Mega-Sena), com prêmios geralmente menores, mas muito mais frequentes."
    }
  ];

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
          <p className="text-muted-foreground mt-2 text-lg">Dúvidas comuns sobre a Lotofácil e prêmios.</p>
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
