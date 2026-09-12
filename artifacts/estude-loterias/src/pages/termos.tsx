import { PageSEO } from "@/components/seo/PageSEO";

export default function Termos() {
  const updated = "11 de setembro de 2026";

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <PageSEO
        title="Termos de Uso"
        description="Termos de Uso do Estude Loterias. Leia as condições de uso do site de estatísticas e ferramentas para loterias da Caixa, incluindo afiliação e publicidade."
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
            informativo, não realiza vendas de apostas e não possui qualquer vínculo
            com a Caixa Econômica Federal. A manutenção do serviço é viabilizada, entre outras
            formas, por publicidade e por links de afiliado, conforme as seções 6 e 7.
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
          <h2 className="text-base font-semibold">5. Jogo responsável (18+)</h2>
          <p>
            As loterias são jogos de azar regulamentados pelo governo federal brasileiro.
            A participação é permitida <strong>apenas para pessoas maiores de 18 anos</strong>.
            Nenhuma análise, estatística ou ferramenta deste site garante resultados futuros.
            Cada sorteio é um evento aleatório e independente, e não há qualquer promessa,
            garantia ou probabilidade de prêmio. Jogue com responsabilidade e dentro de suas
            possibilidades financeiras. O Estude Loterias é um site independente e{" "}
            <strong>não possui vínculo com a Caixa Econômica Federal</strong> nem com qualquer
            órgão governamental.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold">6. Afiliação e publicidade</h2>
          <p>
            O Estude Loterias é um site gratuito que pode exibir publicidade e conter{" "}
            <strong>links de afiliado</strong> para parceiros comerciais (por exemplo, Clube
            Lotosport e Portal Net Sorte). Ao clicar em um desses links e contratar um
            serviço no site do parceiro, podemos receber uma <strong>comissão</strong>, sem
            qualquer custo adicional para você.
          </p>
          <p>
            Esses links são sinalizados com o atributo <code>rel="sponsored"</code> e podem
            conter parâmetros de campanha pseudônimos (como <code>subid</code> e{" "}
            <code>utm_*</code>) apenas para medir o desempenho das parcerias. A indicação de um
            parceiro não representa endosso, garantia de resultado, de prêmio ou de qualidade do
            serviço oferecido. Ao clicar, você deixa o Estude Loterias e passa a se relacionar
            diretamente com o parceiro, sob os termos e a política de privacidade dele.
          </p>
          <p>
            O tratamento de dados relacionado a cookies, análise e afiliação está descrito na
            nossa{" "}
            <a href="/privacidade" className="text-[#009640] hover:underline">
              Política de Privacidade
            </a>
            .
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold">7. Limitação de responsabilidade</h2>
          <p>
            O Estude Loterias não se responsabiliza por decisões de apostas tomadas com base
            nas informações ou ferramentas disponibilizadas, nem por eventuais imprecisões
            nos dados fornecidos pela API da Caixa. Também não respondemos por serviços,
            conteúdos, termos ou práticas de privacidade de sites de parceiros e anunciantes
            acessados por links de saída.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold">8. Propriedade intelectual</h2>
          <p>
            O design, layout, código-fonte e textos originais do Estude Loterias são protegidos
            pelos direitos autorais de seus respectivos titulares. Os dados dos sorteios são
            de domínio público, obtidos da Caixa Econômica Federal.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold">9. Alterações nos termos</h2>
          <p>
            Reservamo-nos o direito de modificar estes Termos de Uso a qualquer momento.
            Alterações relevantes serão comunicadas por meio da atualização da data nesta página.
            O uso continuado do site após as alterações implica concordância com os novos termos.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold">10. Lei aplicável</h2>
          <p>
            Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil.
            Fica eleito o foro da comarca de domicílio do operador do site para resolução de
            eventuais disputas.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold">11. Contato</h2>
          <p>
            Para dúvidas sobre estes termos, acesse nossa página de{" "}
             <a href="https://estudematematica.com.br/contato" target="_blank" rel="noopener noreferrer" className="text-[#009640] hover:underline">Contato</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
