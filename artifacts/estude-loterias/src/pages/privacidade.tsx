import { PageSEO } from "@/components/seo/PageSEO";

export default function Privacidade() {
  const updated = "27 de junho de 2026";

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <PageSEO
        title="Política de Privacidade — Estude Loterias"
        description="Política de Privacidade do Estude Loterias: saiba como coletamos, usamos e protegemos seus dados pessoais, em conformidade com a LGPD."
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
            dados ao usar nosso site.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold">2. Dados que coletamos</h2>
          <p className="text-sm leading-relaxed">
            O Estude Loterias não exige cadastro para uso das ferramentas. Os dados que podemos
            coletar incluem:
          </p>
          <ul className="text-sm leading-relaxed list-disc list-inside space-y-1 text-muted-foreground">
            <li>Dados de navegação (páginas acessadas, tempo de visita, dispositivo e navegador) — coletados de forma agregada e anônima via ferramentas de análise.</li>
            <li>Endereço IP — coletado automaticamente pelos servidores para fins de segurança e diagnóstico.</li>
            <li>Cookies de publicidade — quando exibimos anúncios via Google AdSense, o Google pode usar cookies para personalizar os anúncios exibidos.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold">3. Cookies</h2>
          <p className="text-sm leading-relaxed">
            Utilizamos cookies para melhorar a experiência de navegação e viabilizar a exibição
            de publicidade relevante. Os cookies podem ser de dois tipos:
          </p>
          <ul className="text-sm leading-relaxed list-disc list-inside space-y-1 text-muted-foreground">
            <li><strong>Cookies próprios:</strong> usados para preferências de navegação e funcionamento do site.</li>
            <li><strong>Cookies de terceiros:</strong> utilizados pelo Google AdSense e ferramentas de análise para medir o desempenho do site e exibir anúncios relevantes.</li>
          </ul>
          <p className="text-sm leading-relaxed">
            Você pode desativar os cookies nas configurações do seu navegador, mas isso pode
            afetar a experiência de uso do site.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold">4. Google AdSense e publicidade</h2>
          <p className="text-sm leading-relaxed">
            Este site utiliza o Google AdSense para exibição de anúncios. O Google pode usar
            cookies para exibir anúncios com base nas visitas anteriores do usuário a este e
            a outros sites. Os usuários podem optar por desativar a publicidade personalizada
            acessando as{" "}
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
          <h2 className="text-base font-semibold">5. Finalidade do tratamento dos dados</h2>
          <p className="text-sm leading-relaxed">
            Os dados coletados são utilizados exclusivamente para:
          </p>
          <ul className="text-sm leading-relaxed list-disc list-inside space-y-1 text-muted-foreground">
            <li>Manter e melhorar o funcionamento do site</li>
            <li>Analisar o desempenho e o uso das páginas (métricas agregadas)</li>
            <li>Exibir publicidade relevante para viabilizar o funcionamento gratuito do serviço</li>
            <li>Garantir a segurança e prevenir abusos</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold">6. Compartilhamento de dados</h2>
          <p className="text-sm leading-relaxed">
            Não vendemos, alugamos nem compartilhamos seus dados pessoais com terceiros, exceto
            nas seguintes situações: (a) com prestadores de serviço que nos auxiliam na operação
            do site (como serviços de hospedagem e análise), sempre sob obrigação de
            confidencialidade; (b) quando exigido por lei ou ordem judicial.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold">7. Seus direitos (LGPD)</h2>
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
          <h2 className="text-base font-semibold">8. Segurança</h2>
          <p className="text-sm leading-relaxed">
            Adotamos medidas técnicas e organizacionais adequadas para proteger seus dados
            contra acesso não autorizado, alteração, divulgação ou destruição. O site utiliza
            conexão segura (HTTPS) em todas as páginas.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold">9. Alterações nesta política</h2>
          <p className="text-sm leading-relaxed">
            Esta política pode ser atualizada periodicamente. Quando houver alterações
            relevantes, atualizaremos a data no topo desta página. Recomendamos revisitá-la
            regularmente.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold">10. Contato</h2>
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
