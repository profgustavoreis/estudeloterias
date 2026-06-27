import { PageSEO } from "@/components/seo/PageSEO";

export default function Termos() {
  const updated = "27 de junho de 2026";

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <PageSEO
        title="Termos de Uso — Estude Loterias"
        description="Termos de Uso do Estude Loterias. Leia as condições de uso do site de estatísticas e ferramentas para loterias da Caixa."
        canonical="/termos"
      />

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#009640]">
          Termos de Uso
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Última atualização: {updated}
        </p>
      </div>

      <div className="space-y-6 text-sm leading-relaxed text-foreground/90">

        <section className="space-y-3">
          <h2 className="text-base font-semibold">1. Aceitação dos termos</h2>
          <p>
            Ao acessar e utilizar o site <strong>Estude Loterias</strong> (estudeloterias.com.br),
            você concorda com os presentes Termos de Uso. Caso não concorde com alguma das
            condições, recomendamos que não utilize o site.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold">2. Descrição do serviço</h2>
          <p>
            O Estude Loterias oferece gratuitamente dados estatísticos, histórico de resultados
            e ferramentas de análise para as loterias da Caixa Econômica Federal. O site é
            informativo e não realiza vendas de apostas, nem possui qualquer vínculo
            com a Caixa Econômica Federal.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold">3. Uso permitido</h2>
          <p>
            O conteúdo do Estude Loterias é disponibilizado para uso pessoal e não comercial.
            É proibido:
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Reproduzir ou redistribuir o conteúdo para fins comerciais sem autorização prévia</li>
            <li>Realizar scraping automatizado em volume que sobrecarregue os servidores</li>
            <li>Usar o site para qualquer finalidade ilegal ou que viole direitos de terceiros</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold">4. Precisão das informações</h2>
          <p>
            Buscamos manter todos os dados atualizados e precisos, obtendo-os diretamente da
            API pública da Caixa Econômica Federal. Porém, não garantimos a exatidão, completude
            ou atualidade das informações exibidas. Para apostas e informações oficiais,
            consulte sempre o site oficial da Caixa em{" "}
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
          <h2 className="text-base font-semibold">5. Jogo responsável</h2>
          <p>
            As loterias são jogos de azar regulamentados pelo governo federal brasileiro.
            A participação é permitida apenas para pessoas maiores de 18 anos. Nenhuma
            análise ou ferramenta deste site garante resultados futuros — cada sorteio é
            um evento aleatório e independente. Jogue com responsabilidade e dentro de
            suas possibilidades financeiras.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold">6. Limitação de responsabilidade</h2>
          <p>
            O Estude Loterias não se responsabiliza por decisões de apostas tomadas com base
            nas informações ou ferramentas disponibilizadas, nem por eventuais imprecisões
            nos dados fornecidos pela API da Caixa.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold">7. Propriedade intelectual</h2>
          <p>
            O design, layout, código-fonte e textos originais do Estude Loterias são protegidos
            pelos direitos autorais de seus respectivos titulares. Os dados dos sorteios são
            de domínio público, obtidos da Caixa Econômica Federal.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold">8. Alterações nos termos</h2>
          <p>
            Reservamo-nos o direito de modificar estes Termos de Uso a qualquer momento.
            Alterações relevantes serão comunicadas por meio da atualização da data nesta página.
            O uso continuado do site após as alterações implica concordância com os novos termos.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold">9. Lei aplicável</h2>
          <p>
            Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil.
            Fica eleito o foro da comarca de domicílio do operador do site para resolução de
            eventuais disputas.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold">10. Contato</h2>
          <p>
            Para dúvidas sobre estes termos, acesse nossa página de{" "}
            <a href="/contato" className="text-[#009640] hover:underline">Contato</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
