import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";

const COR = "#260085";

export default function QuinaFAQ() {
  const faqs = [
    {
      q: "Quando são realizados os sorteios da Quina?",
      a: "Os sorteios da Quina são realizados de segunda a sábado, a partir das 21h (horário de Brasília) — seis sorteios por semana."
    },
    {
      q: "Como faço para jogar na Quina?",
      a: "Marque de 5 a 15 números dentre os 80 disponíveis no volante, ou deixe que o sistema escolha por você na Surpresinha. Você também pode repetir a aposta em concursos seguintes com a Teimosinha."
    },
    {
      q: "Posso marcar mais de 5 números?",
      a: "Sim. Você pode marcar até 15 números no mesmo volante. Quanto mais números marcar, maior o preço da aposta (pois mais combinações são formadas) e maiores as chances de ganhar."
    },
    {
      q: "Quanto custa a aposta mínima?",
      a: "A aposta mínima, de 5 números, custa R$ 3,00. Apostas com mais números custam mais, conforme a tabela de preços."
    },
    {
      q: "O que é Surpresinha?",
      a: "Surpresinha é a opção de deixar o sistema escolher seus 5 números aleatoriamente. Use nosso Gerador de Jogos gratuito para uma funcionalidade semelhante."
    },
    {
      q: "O que é Teimosinha?",
      a: "Teimosinha é a opção de repetir a mesma aposta por vários concursos consecutivos, sem precisar preencher um novo volante a cada sorteio."
    },
    {
      q: "Posso participar de um Bolão?",
      a: "Sim. No Bolão CAIXA da Quina, é possível reunir um grupo de apostadores e dividir o custo e o prêmio, dependendo da quantidade de números marcados."
    },
    {
      q: "Quantos acertos são necessários para ganhar um prêmio?",
      a: "Você ganha prêmio ao acertar 2 (duque), 3 (terno), 4 (quadra) ou 5 (quina) dos números sorteados dentre os 80 disponíveis."
    },
    {
      q: "Quais são as probabilidades de ganhar?",
      a: "Para uma aposta simples de 5 números, a probabilidade de acertar os 5 números (quina) é de 1 em 24.040.016; 4 números (quadra), 1 em 64.107; 3 números (terno), 1 em 866; e 2 números (duque), 1 em 36."
    },
    {
      q: "Os prêmios da Quina são valores fixos?",
      a: "Não. Diferente da Lotofácil, todas as quatro faixas de premiação da Quina (2, 3, 4 e 5 acertos) recebem uma fatia percentual do fundo de prêmios, sem valores fixos em dinheiro."
    },
    {
      q: "O que é a Quina de São João?",
      a: "É o concurso especial da Quina realizado anualmente em data próxima ao dia 24 de junho. Uma parcela do prêmio bruto arrecadado ao longo do ano (15%) fica reservada para a faixa principal (5 acertos) desse sorteio especial."
    },
    {
      q: "Como funcionam os concursos de final 5?",
      a: "Uma parcela do valor destinado à premiação de cada concurso normal (15%) fica acumulada e é distribuída aos acertadores da quina (5 acertos) nos concursos cujo número termina em 5."
    },
    {
      q: "O prêmio acumula se não houver ganhador?",
      a: "Sim. Não havendo ganhador na 1ª faixa (5 acertos), o valor correspondente acumula para o concurso seguinte, sempre na faixa de 5 acertos."
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
      q: "Estrangeiros podem jogar na Quina?",
      a: "Sim. Qualquer pessoa maior de 18 anos, seja brasileiro ou estrangeiro, pode realizar apostas e resgatar prêmios nas loterias da Caixa, desde que a aposta seja feita em território nacional ou pelos canais oficiais da Caixa."
    },
    {
      q: "É possível apostar pela internet?",
      a: "Sim, pelo site e aplicativo Loterias Online CAIXA (loteriasonline.caixa.gov.br) ou pelo Internet Banking CAIXA."
    },
    {
      q: "Qual a diferença entre a Quina e a Mega-Sena?",
      a: "A Quina tem 80 números no volante (vs. 60 da Mega-Sena), sorteia 5 números por concurso (vs. 6) e premia quem acerta de 2 a 5 números — uma faixa de premiação bem mais ampla e frequente do que a da Mega-Sena, que só premia a partir de 4 acertos."
    }
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageSEO
        title="Perguntas Frequentes sobre a Quina"
        description="Respostas para as principais dúvidas sobre a Quina: como jogar, acertos necessários, valores, prazos e muito mais."
        canonical="/quina/perguntas-frequentes"
      />
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: COR }}>
          <HelpCircle className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: COR }}>Quina · Perguntas Frequentes</h1>
          <p className="text-muted-foreground mt-2 text-lg">Dúvidas comuns sobre a Quina e prêmios.</p>
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
