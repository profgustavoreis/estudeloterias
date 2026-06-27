import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";

export default function MegaSenaFAQ() {
  const faqs = [
    {
      q: "Onde posso receber meu prêmio?",
      a: "Você pode receber seu prêmio em qualquer casa lotérica credenciada ou nas agências da Caixa. Caso o prêmio bruto seja superior a R$ 2.428,80, o pagamento pode ser realizado somente nas agências da Caixa, mediante apresentação de comprovante de identidade original com CPF e recibo de aposta original e premiado. Valores iguais ou acima de R$ 10.000,00 são pagos no prazo mínimo de dois dias úteis a partir de sua apresentação em Agência da Caixa."
    },
    {
      q: "Qual o prazo para receber o prêmio?",
      a: "Os prêmios prescrevem 90 dias após a data do sorteio. Após esse prazo, os valores são repassados ao Tesouro Nacional para aplicação no FIES (Fundo de Financiamento ao Estudante do Ensino Superior)."
    },
    {
      q: "Estrangeiros podem jogar na Mega-Sena?",
      a: "Sim. Qualquer pessoa maior de 18 anos, seja brasileiro ou estrangeiro, pode realizar apostas e resgatar prêmios nas loterias da Caixa, desde que a aposta seja feita em território nacional ou pelos canais oficiais da Caixa."
    },
    {
      q: "O prêmio da Mega da Virada acumula?",
      a: "Não. A Mega da Virada não acumula. Se não houver ganhadores na faixa principal (6 acertos), o prêmio é dividido entre os acertadores da quina (5 acertos), e assim por diante."
    },
    {
      q: "Qual valor posso apostar online?",
      a: "No portal e aplicativo Loterias Caixa você pode efetivar apostas a partir de R$ 2,50 e no máximo o limite diário estabelecido pelo canal, que pode ser consultado no menu Minha Conta - Cadastro."
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
