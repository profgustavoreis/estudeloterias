import { PageSEO } from "@/components/seo/PageSEO";

export default function Privacidade() {
  const updated = "11 de setembro de 2026";

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <PageSEO
        title="Política de Privacidade"
        description="Política de Privacidade do Estude Loterias: saiba como coletamos, usamos e protegemos seus dados, além de gerenciar cookies e consentimento em conformidade com a LGPD."
        canonical="/privacidade"
      />

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#009640]">
          Política de Privacidade
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Última atualização: {updated}
        </p>
      </div>

      <div className="prose prose-sm max-w-none text-foreground/90 space-y-6">

        <section className="space-y-3">
          <h2 className="text-base font-semibold">1. Quem somos</h2>
          <p className="text-sm leading-relaxed">
            O <strong>Estude Loterias</strong> (estudeloterias.com.br) é um site de estatísticas
            e ferramentas para as loterias da Caixa Econômica Federal, operado por empresa com
            CNPJ 09.631.507/0001-18. Esta Política de Privacidade descreve como tratamos seus
            dados ao usar nosso site, inclusive em relação a cookies, ferramentas de análise e
            links de afiliado.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold">2. Dados que coletamos</h2>
          <p className="text-sm leading-relaxed">
            O Estude Loterias não exige cadastro para uso das ferramentas. Os dados que podemos
            coletar incluem:
          </p>
          <ul className="text-sm leading-relaxed list-disc list-inside space-y-1 text-muted-foreground">
            <li>Dados de navegação (páginas acessadas, tempo de visita, dispositivo e navegador) — coletados de forma agregada via ferramentas de análise, quando você autoriza o uso de cookies de análise.</li>
            <li>Endereço IP — coletado automaticamente pelos servidores para fins de segurança e diagnóstico.</li>
            <li>Cookies e identificadores de publicidade — usados apenas se você autorizar as categorias correspondentes no banner de cookies. No momento <strong>não exibimos anúncios</strong>; caso passemos a exibi-los, o Google poderá usar cookies para personalizar anúncios.</li>
            <li>Dados de clique em links de afiliado (parâmetros de campanha, como <code>subid</code> e <code>utm_*</code>) — usados para medir o desempenho das parcerias, conforme a seção 7.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold">3. Cookies e tecnologias semelhantes</h2>
          <p className="text-sm leading-relaxed">
            Cookies são pequenos arquivos armazenados no seu navegador. Utilizamos cookies e
            tecnologias semelhantes nas seguintes categorias:
          </p>
          <ul className="text-sm leading-relaxed list-disc list-inside space-y-1 text-muted-foreground">
            <li><strong>Essenciais:</strong> necessários para o funcionamento básico e a segurança do site. Não podem ser desativados pelas preferências de cookies.</li>
            <li><strong>Análise (estatísticas):</strong> ajudam a medir audiência e entender como as páginas são usadas, de forma agregada. Incluem o Google Analytics 4 (seção 5).</li>
            <li><strong>Marketing/publicidade:</strong> seriam usados para medir o desempenho de campanhas e, caso venhamos a exibir anúncios, para personalização. <strong>Atualmente não há cookies de publicidade ativos</strong> e essa categoria não é solicitada no banner de consentimento; caso os anúncios sejam ativados, ela voltará a ser apresentada.</li>
          </ul>
          <p className="text-sm leading-relaxed">
            As categorias não essenciais só são ativadas com o seu consentimento e podem ser
            recusadas sem prejuízo do acesso às ferramentas do site.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold">4. Consentimento e preferências de cookies</h2>
          <p className="text-sm leading-relaxed">
            Na primeira visita, exibimos um banner de consentimento no qual você pode{" "}
            <strong>aceitar</strong> ou <strong>rejeitar</strong> cada categoria de cookies, de
            forma granular. Hoje o banner cobre apenas as categorias <strong>essenciais</strong> e
            de <strong>análise</strong>, pois não há cookies de publicidade em uso; a categoria de
            publicidade voltará a ser exibida se os anúncios forem ativados. Também utilizamos o
            Consent Mode do Google, de modo que as ferramentas de análise respeitam as suas
            escolhas.
          </p>
          <p className="text-sm leading-relaxed">
            Você pode alterar ou <strong>revogar</strong> o consentimento a qualquer momento
            pelo link <strong>“Preferências de cookies”</strong> no rodapé do site. A recusa de
            cookies não essenciais não impede o uso das ferramentas.
          </p>
          <p className="text-sm leading-relaxed">
            Tratamos o consentimento como base legal para cookies não essenciais, nos termos da
            LGPD (Lei nº 13.709/2018). As categorias essenciais são utilizadas para viabilizar o
            funcionamento e a segurança do site. Esta página tem caráter informativo e não
            constitui parecer jurídico.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold">5. Ferramentas de análise (Google Analytics 4)</h2>
          <p className="text-sm leading-relaxed">
            Utilizamos o <strong>Google Analytics 4 (GA4)</strong>, serviço de análise do Google,
            identificado pelo ID de medição <strong>G-EL1Z05CW52</strong>, para medir audiência,
            entender como as páginas são utilizadas e melhorar o site. As métricas são analisadas
            de forma agregada.
          </p>
          <p className="text-sm leading-relaxed">
            O GA4 e os identificadores associados somente são ativados conforme as suas escolhas
            no banner de consentimento e o Consent Mode. Você pode saber mais na{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#009640] hover:underline"
            >
              Política de Privacidade do Google
            </a>
            . Para desativar a coleta em qualquer site, o Google disponibiliza o{" "}
            <a
              href="https://tools.google.com/dlpage/gaoptout"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#009640] hover:underline"
            >
              complemento de desativação do Google Analytics
            </a>
            .
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold">6. Google AdSense e publicidade</h2>
          <p className="text-sm leading-relaxed">
            <strong>No momento, o Google AdSense está desativado neste site e não exibimos
            anúncios de terceiros.</strong> Caso venhamos a exibir anúncios Google no futuro, o
            Google poderá usar cookies para exibir anúncios com base nas visitas anteriores do
            usuário a este e a outros sites, sempre respeitando as suas preferências de
            consentimento.
          </p>
          <p className="text-sm leading-relaxed">
            Nesse cenário, você poderá desativar a publicidade personalizada acessando as{" "}
            <a
              href="https://www.google.com/settings/ads"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#009640] hover:underline"
            >
              Configurações de Anúncios do Google
            </a>
            .
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold">7. Links de afiliado e publicidade</h2>
          <p className="text-sm leading-relaxed">
            O Estude Loterias é gratuito e se mantém, entre outras formas, por meio de{" "}
            <strong>links de afiliado</strong>. Em nossas páginas podemos incluir links para
            parceiros comerciais — por exemplo, Clube Lotosport, Net Sorte e Lotosport. Ao
            clicar em um desses links e contratar um serviço no site do parceiro, podemos
            receber uma <strong>comissão</strong>, sem qualquer custo adicional para você.
          </p>
          <p className="text-sm leading-relaxed">
            Esses links são identificados com o atributo <code>rel="sponsored"</code>, deixando
            clara a natureza comercial da parceria. Para medir o desempenho, podemos acrescentar
            parâmetros à URL, como <code>subid</code> e <code>utm_*</code>, que são{" "}
            <strong>pseudônimos</strong> usados para atribuição de campanha e não têm a
            finalidade de identificar você diretamente.
          </p>
          <p className="text-sm leading-relaxed">
            Ao clicar em um link de parceiro, você <strong>sai do Estude Loterias</strong> e passa
            a interagir com um site de terceiro, que trata seus dados sob a{" "}
            <strong>própria política de privacidade</strong>. Não controlamos nem respondemos pelo
            tratamento de dados realizado por esses parceiros; recomendamos ler as políticas
            deles antes de contratar qualquer serviço.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold">8. Finalidade do tratamento dos dados</h2>
          <p className="text-sm leading-relaxed">
            Os dados coletados são utilizados exclusivamente para:
          </p>
          <ul className="text-sm leading-relaxed list-disc list-inside space-y-1 text-muted-foreground">
            <li>Manter e melhorar o funcionamento do site</li>
            <li>Analisar o desempenho e o uso das páginas (métricas agregadas via GA4)</li>
            <li>Medir o desempenho de parcerias e links de afiliado</li>
            <li>Exibir publicidade relevante, caso anúncios venham a ser ativados</li>
            <li>Garantir a segurança e prevenir abusos</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold">9. Compartilhamento de dados</h2>
          <p className="text-sm leading-relaxed">
            Não vendemos, alugamos nem compartilhamos seus dados pessoais com terceiros, exceto
            nas seguintes situações: (a) com prestadores de serviço que nos auxiliam na operação
            do site (como hospedagem, análise e provedores de publicidade), sempre sob obrigação
            de confidencialidade; (b) com parceiros de afiliado, apenas na forma de métricas de
            clique e atribuição de campanha; (c) quando exigido por lei ou ordem judicial.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold">10. Seus direitos (LGPD)</h2>
          <p className="text-sm leading-relaxed">
            Nos termos da Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você tem direito
            a: confirmar a existência de tratamento de seus dados; acessar os dados que mantemos
            sobre você; solicitar a correção de dados incompletos ou desatualizados; solicitar a
            exclusão dos seus dados; e revogar o consentimento a qualquer momento.
          </p>
          <p className="text-sm leading-relaxed">
            Para exercer esses direitos, entre em contato pelo nosso formulário de{" "}
            <a href="https://estudematematica.com.br/contato" target="_blank" rel="noopener noreferrer" className="text-[#009640] hover:underline">Contato</a>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold">11. Segurança</h2>
          <p className="text-sm leading-relaxed">
            Adotamos medidas técnicas e organizacionais adequadas para proteger seus dados
            contra acesso não autorizado, alteração, divulgação ou destruição. O site utiliza
            conexão segura (HTTPS) em todas as páginas.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold">12. Alterações nesta política</h2>
          <p className="text-sm leading-relaxed">
            Esta política pode ser atualizada periodicamente. Quando houver alterações
            relevantes, atualizaremos a data no topo desta página. Recomendamos revisitá-la
            regularmente.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold">13. Contato</h2>
          <p className="text-sm leading-relaxed">
            Para dúvidas sobre esta Política de Privacidade ou para exercer seus direitos,
            acesse nossa página de{" "}
            <a href="https://estudematematica.com.br/contato" target="_blank" rel="noopener noreferrer" className="text-[#009640] hover:underline">Contato</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
