import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";

const COR = "#f8901c";

export default function LotomaniaFAQ() {
  const faqs = [
    {
      q: "Quando são realizados os sorteios da Lotomania?",
      a: "Os sorteios da Lotomania são realizados às segundas, quartas e sextas-feiras, a partir das 21h (horário de Brasília) — três sorteios por semana."
    },
    {
      q: "Como faço para jogar na Lotomania?",
      a: "Marque exatamente 50 números dentre os 100 disponíveis no volante (de 00 a 99), ou deixe que o sistema escolha por você na Surpresinha. Você também pode repetir a aposta em concursos seguintes com a Teimosinha."
    },
    {
      q: "Quantos números preciso marcar?",
      a: "Sempre 50 números. Diferente de outras loterias, a Lotomania não permite apostas com mais ou menos dezenas — toda aposta é sempre de 50 números."
    },
    {
      q: "Quanto custa a aposta?",
      a: "A aposta da Lotomania tem preço único: R$ 3,00. Não há variação de preço, pois toda aposta é sempre de 50 números."
    },
    {
      q: "O que é Surpresinha?",
      a: "Surpresinha é a opção de deixar o sistema escolher seus 50 números aleatoriamente. Use nosso Gerador de Jogos gratuito para uma funcionalidade semelhante."
    },
    {
      q: "O que é Teimosinha?",
      a: "Teimosinha é a opção de repetir a mesma aposta por 2, 3, 4, 6, 8, 9 ou 12 concursos consecutivos, sem precisar preencher um novo volante a cada sorteio."
    },
    {
      q: "O que é Aposta-Espelho?",
      a: "É uma opção exclusiva da Lotomania: o sistema cria uma nova aposta selecionando os 50 números que não foram marcados no jogo original. É como jogar o complemento da sua aposta."
    },
    {
      q: "Posso participar de um Bolão?",
      a: "Sim. No Bolão CAIXA da Lotomania, é possível reunir um grupo de apostadores e dividir o custo e o prêmio."
    },
    {
      q: "Quantos acertos são necessários para ganhar um prêmio?",
      a: "Você ganha prêmio ao acertar 20, 19, 18, 17, 16, 15 ou nenhum (0) dos números sorteados. Sim, na Lotomania você também ganha se não acertar nenhum número!"
    },
    {
      q: "Quais são as probabilidades de ganhar?",
      a: "Para uma aposta de 50 dezenas, a probabilidade de acertar 20 números é de 1 em 11.372.635; 19 números, 1 em 352.551; 18 números, 1 em 24.235; 17 números, 1 em 2.776; 16 números, 1 em 472; 15 números, 1 em 112; e 0 números (nenhum), 1 em 11.372.635."
    },
    {
      q: "Por que a probabilidade de acertar 0 é igual à de acertar 20?",
      a: "Por simetria matemática: como você marca 50 de 100 números e são sorteados 20, a chance de nenhum dos 20 sorteados estar entre os seus 50 é igual à chance de todos os 20 estarem entre os seus 50. Ambas são 1 em 11.372.635."
    },
    {
      q: "A Lotomania tem sorteio especial?",
      a: "Não. Diferente da Mega-Sena (Mega da Virada), da Lotofácil (Independência) e da Quina (São João), a Lotomania não possui concurso especial. Todos os sorteios seguem as mesmas regras de premiação."
    },
    {
      q: "O prêmio acumula se não houver ganhador?",
      a: "Sim. Não havendo ganhador na 7ª faixa (0 acertos), o valor acumula para o concurso seguinte na 1ª faixa (20 acertos). Nas demais faixas, o prêmio acumula na respectiva faixa de premiação."
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
      q: "É possível apostar pela internet?",
      a: "Sim, pelo site e aplicativo Loterias Online CAIXA (loteriasonline.caixa.gov.br) ou pelo Internet Banking CAIXA."
    },
    {
      q: "Qual a diferença entre a Lotomania e a Quina?",
      a: "A Lotomania tem 100 números no volante (vs. 80 da Quina), você marca 50 números (vs. 5 a 15) e são sorteados 20 (vs. 5). A Lotomania premia 7 faixas (20, 19, 18, 17, 16, 15 e 0 acertos), enquanto a Quina premia 4 faixas (2 a 5 acertos). Além disso, a aposta da Lotomania tem preço único de R$ 3,00."
    }
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageSEO
        title="Perguntas Frequentes sobre a Lotomania"
        description="Respostas para as principais dúvidas sobre a Lotomania: como jogar, acertos necessários, valores, prazos e muito mais."
        canonical="/lotomania/perguntas-frequentes"
      />
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: COR }}>
          <HelpCircle className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: COR }}>Lotomania · Perguntas Frequentes</h1>
          <p className="text-muted-foreground mt-2 text-lg">Dúvidas comuns sobre a Lotomania e prêmios.</p>
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