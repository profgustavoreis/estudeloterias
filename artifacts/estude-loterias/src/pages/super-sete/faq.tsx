import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";

const COR = "#a8cf45";

export default function SuperSeteFAQ() {
  const faqs = [
    {
      q: "Como funciona a Super Sete?",
      a: "A Super Sete é uma loteria da Caixa onde você escolhe um número de 0 a 9 em cada uma das 7 colunas do volante, formando uma sequência de 7 números. No sorteio, são extraídos 7 números — um por coluna — e você ganha prêmio ao acertar 7, 6, 5, 4 ou 3 números na posição correta."
    },
    {
      q: "Quanto custa uma aposta simples?",
      a: "A aposta simples da Super Sete custa R$ 3,00. Nela, você seleciona exatamente 1 número em cada uma das 7 colunas."
    },
    {
      q: "O que são apostas múltiplas?",
      a: "Nas apostas múltiplas, você pode escolher 2 ou 3 números por coluna, aumentando suas chances de acerto. O preço da aposta varia conforme a quantidade de números selecionados em cada coluna, pois mais combinações são geradas."
    },
    {
      q: "Quantos números são sorteados?",
      a: "São sorteados exatamente 7 números, um para cada coluna. Cada número sorteado varia de 0 a 9, e a ordem importa: o número da coluna 1 deve corresponder à coluna 1 da sua aposta, e assim por diante."
    },
    {
      q: "Como funciona a Surpresinha?",
      a: "Surpresinha é a opção de deixar o sistema escolher aleatoriamente um número em cada uma das 7 colunas para você. Use nosso Gerador de Jogos gratuito para uma funcionalidade semelhante com mais controle."
    },
    {
      q: "Como funciona a Teimosinha?",
      a: "Teimosinha é a opção de repetir a mesma aposta por 3, 6, 9 ou 12 concursos consecutivos, sem precisar preencher um novo volante a cada sorteio."
    },
    {
      q: "Quais são os dias de sorteio?",
      a: "Os sorteios da Super Sete são realizados às segundas, quartas e sextas-feiras, a partir das 21h (horário de Brasília), exceto feriados. Confira sempre o calendário oficial da Caixa para eventuais alterações."
    },
    {
      q: "Até quando posso apostar?",
      a: "As apostas podem ser realizadas até as 19h (horário de Brasília) do dia do sorteio, em qualquer casa lotérica credenciada ou pelos canais online da Caixa."
    },
    {
      q: "Como conferir meu jogo?",
      a: "Compare os 7 números da sua aposta com os 7 números sorteados, coluna por coluna. Conte quantos números acertou na posição correta: 7 acertos (1ª faixa), 6 (2ª), 5 (3ª), 4 (4ª) ou 3 (5ª faixa). Use nosso Conferidor de Apostas para verificar automaticamente."
    },
    {
      q: "Quais são as faixas de premiação?",
      a: "A Super Sete possui 5 faixas de premiação: 1ª faixa — 7 números na posição correta; 2ª faixa — 6 números; 3ª faixa — 5 números; 4ª faixa — 4 números; 5ª faixa — 3 números. Todas as faixas premiam proporcionalmente à arrecadação e ao número de acertadores."
    },
    {
      q: "A Super Sete tem sorteio especial?",
      a: "Não. Diferente de outras loterias que possuem concursos especiais em datas comemorativas, a Super Sete não possui sorteio especial. Todos os sorteios seguem as mesmas regras de premiação e distribuição."
    },
    {
      q: "Posso jogar pela internet?",
      a: "Sim, pelo site e aplicativo Loterias Online CAIXA (loteriasonline.caixa.gov.br) ou pelo Internet Banking CAIXA."
    },
    {
      q: "Como são calculadas as probabilidades?",
      a: "Na aposta simples (1 número por coluna), a probabilidade de acertar os 7 números é de 1 em 10.000.000 (10⁷), pois cada coluna tem 10 possibilidades independentes. Para 6 acertos, a chance é de 1 em 158.730; para 5 acertos, 1 em 5.879; para 4 acertos, 1 em 392; e para 3 acertos, 1 em 43,5."
    },
    {
      q: "O que acontece se ninguém acertar 7 números?",
      a: "O prêmio da 1ª faixa (7 acertos) acumula para o concurso seguinte. As demais faixas pagam prêmio normalmente quando há acertadores."
    },
    {
      q: "Posso escolher mais de um número por coluna?",
      a: "Sim. Na aposta múltipla, você pode selecionar 2 ou 3 números em cada coluna. Isso gera mais combinações e aumenta suas chances de acerto, mas o preço da aposta é proporcional ao número de combinações geradas."
    },
    {
      q: "Qual a diferença entre a Super Sete e outras loterias?",
      a: "A Super Sete é única por usar números de 0 a 9 em 7 colunas fixas, em vez de dezenas sorteadas de um pool único. Na Mega-Sena, por exemplo, 6 números são sorteados de 60 sem posição fixa. Na Super Sete, a posição importa: acertar o número certo na coluna errada não conta como acerto."
    },
    {
      q: "Como receber o prêmio?",
      a: "Você pode receber seu prêmio em qualquer casa lotérica credenciada ou nas agências da Caixa. Caso o prêmio bruto seja superior a R$ 2.428,80, o pagamento pode ser realizado somente nas agências da Caixa, mediante apresentação de comprovante de identidade original com CPF e recibo de aposta original e premiado."
    }
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageSEO
        title="Perguntas Frequentes sobre a Super Sete"
        description="Respostas para as principais dúvidas sobre a Super Sete: como jogar, faixas de premiação, apostas múltiplas, probabilidades, prazos e muito mais."
        canonical="/super-sete/perguntas-frequentes"
      />
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: COR }}>
          <HelpCircle className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: COR }}>Super Sete · Perguntas Frequentes</h1>
          <p className="text-muted-foreground mt-2 text-lg">Dúvidas comuns sobre a Super Sete e prêmios.</p>
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
