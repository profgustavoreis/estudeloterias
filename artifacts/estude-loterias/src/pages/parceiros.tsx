import { PageSEO } from "@/components/seo/PageSEO";
import { AFFILIATE_NAMES } from "@/lib/affiliate";

/**
 * Página institucional que explica a monetização por afiliação do site.
 * Copy comercial (o que cada parceiro oferece) sinalizada para revisão.
 */
const parceiros: Array<{ nome: string; descricao: string }> = [
  {
    nome: AFFILIATE_NAMES.clube_lotosport,
    descricao:
      "Plataforma de bolões. Ao comprar cotas, você entra em jogos com mais dezenas dividindo o custo com outros participantes — o prêmio é proporcional às suas cotas e os jogos são registrados em lotérica oficial.",
  },
  {
    nome: AFFILIATE_NAMES.net_sorte,
    descricao:
      "Portal com ferramentas de fechamento e análise para montar jogos com mais dezenas gastando menos. Oferece garantia de 7 dias para os serviços contratados.",
  },
  {
    nome: AFFILIATE_NAMES.lotosport,
    descricao:
      "Plataforma de ferramentas e estratégias para as loterias, com planos de acesso anual e vitalício.",
  },
];

export default function Parceiros() {
  const updated = "11 de setembro de 2026";

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <PageSEO
        title="Parceiros e como ganhamos dinheiro"
        description="O Estude Loterias é gratuito e se mantém com links de afiliado. Conheça nossos parceiros (Clube Lotosport, Portal Net Sorte e Lotosport) e entenda como a parceria funciona."
        canonical="/parceiros"
      />

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#009640]">
          Parceiros e como ganhamos dinheiro
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Última atualização: {updated}
        </p>
      </div>

      <div className="space-y-6 text-sm leading-relaxed text-foreground/90">

        <section className="space-y-3">
          <h2 className="text-base font-semibold">1. Um site gratuito</h2>
          <p>
            O <strong>Estude Loterias</strong> oferece resultados, estatísticas e ferramentas
            para as loterias da Caixa <strong>sem cobrar nada</strong> e sem exigir cadastro.
            Nenhuma ferramenta é bloqueada por paywall.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold">2. Como o site se mantém</h2>
          <p>
            A manutenção do serviço é viabilizada, entre outras formas, por{" "}
            <strong>links de afiliado</strong>. Em algumas páginas indicamos parceiros
            comerciais de forma identificada (com os rótulos <strong>“Parceiro”</strong> e{" "}
            <strong>“Publicidade”</strong>). Quando você clica em um desses links e contrata um
            serviço no site do parceiro, podemos receber uma <strong>comissão</strong> —{" "}
            <strong>sem nenhum custo adicional para você</strong>.
          </p>
          <p>
            Esses links são sinalizados com o atributo <code>rel="sponsored"</code> e podem
            conter parâmetros de campanha pseudônimos (como <code>subid</code> e{" "}
            <code>utm_*</code>) apenas para medir o desempenho das parcerias. Saiba mais na
            nossa{" "}
            <a href="/privacidade" className="text-[#009640] hover:underline">
              Política de Privacidade
            </a>
            .
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold">3. Nossos parceiros</h2>
          <p>
            Trabalhamos com os parceiros abaixo. Cada um é um serviço independente, com seus
            próprios termos, preços e política de privacidade.
          </p>
          <ul className="space-y-3">
            {parceiros.map((parceiro) => (
              <li key={parceiro.nome} className="rounded-lg border border-border p-4">
                <p className="text-sm font-semibold text-foreground">{parceiro.nome}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {parceiro.descricao}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold">4. O que a parceria não significa</h2>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>
              A indicação de um parceiro <strong>não é endosso</strong> nem recomendação de que
              o serviço é adequado a você.
            </li>
            <li>
              <strong>Não há garantia de prêmio, resultado ou lucro.</strong> Nenhum parceiro,
              análise ou ferramenta aumenta a chance de acerto de forma garantida: cada sorteio
              é um evento aleatório e independente.
            </li>
            <li>
              Preços, condições, prazos e garantias são definidos <strong>pelo parceiro</strong>{" "}
              e podem mudar sem aviso. Confira sempre as condições no site dele antes de contratar.
            </li>
            <li>
              Ao clicar, você <strong>deixa o Estude Loterias</strong> e passa a se relacionar
              diretamente com o parceiro, sob os termos e a política de privacidade dele.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold">5. Sem vínculo com a CAIXA</h2>
          <p>
            O Estude Loterias é um site <strong>independente</strong>. Não vendemos apostas e{" "}
            <strong>não temos vínculo com a Caixa Econômica Federal</strong> nem com qualquer
            órgão governamental. Os dados de resultados vêm da API pública da Caixa. Para
            informações oficiais e para apostar, procure sempre uma lotérica ou o site oficial
            em{" "}
            <a
              href="https://loterias.caixa.gov.br"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#009640] hover:underline"
            >
              loterias.caixa.gov.br
            </a>
            .
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold">6. Jogo responsável (18+)</h2>
          <p>
            As loterias são jogos de azar permitidos <strong>apenas para maiores de 18 anos</strong>.
            Jogue com responsabilidade, dentro das suas possibilidades financeiras e nunca
            aposte dinheiro que você não pode perder. Se o jogo deixar de ser diversão, procure
            ajuda.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold">7. Links úteis</h2>
          <p>
            Consulte também os nossos{" "}
            <a href="/termos" className="text-[#009640] hover:underline">
              Termos de Uso
            </a>{" "}
            e a{" "}
            <a href="/privacidade" className="text-[#009640] hover:underline">
              Política de Privacidade
            </a>
            . Dúvidas sobre parcerias podem ser enviadas pela página de{" "}
            <a
              href="https://estudematematica.com.br/contato"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#009640] hover:underline"
            >
              Contato
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
