import { lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageFallback } from "@/components/ui/PageFallback";

const NotFound = lazy(() => import("@/pages/not-found"));

const Home = lazy(() => import("@/pages/home"));
const MegaSenaHub = lazy(() => import("@/pages/mega-sena/hub"));
const MegaSenaUltimoResultado = lazy(() => import("@/pages/mega-sena/ultimo-resultado"));
const MegaSenaResultadosAnteriores = lazy(() => import("@/pages/mega-sena/resultados"));
const MegaSenaEstatisticas = lazy(() => import("@/pages/mega-sena/estatisticas"));
const MegaSenaEstatisticasTabela = lazy(() => import("@/pages/mega-sena/estatisticas-tabela"));
const MegaSenaGerador = lazy(() => import("@/pages/mega-sena/gerador"));
const MegaDaVirada = lazy(() => import("@/pages/mega-sena/mega-da-virada"));
const MegaSenaComoJogar = lazy(() => import("@/pages/mega-sena/como-jogar"));
const MegaSenaPremiacao = lazy(() => import("@/pages/mega-sena/premiacao"));
const MegaSenaFAQ = lazy(() => import("@/pages/mega-sena/faq"));
const MegaSenaSimulador = lazy(() => import("@/pages/mega-sena/simulador"));
const MegaSenaConferidor = lazy(() => import("@/pages/mega-sena/conferidor"));

const LotofacilHub = lazy(() => import("@/pages/lotofacil/hub"));
const LotofacilUltimoResultado = lazy(() => import("@/pages/lotofacil/ultimo-resultado"));
const LotofacilResultadosAnteriores = lazy(() => import("@/pages/lotofacil/resultados"));
const LotofacilEstatisticas = lazy(() => import("@/pages/lotofacil/estatisticas"));
const LotofacilEstatisticasTabela = lazy(() => import("@/pages/lotofacil/estatisticas-tabela"));
const LotofacilGerador = lazy(() => import("@/pages/lotofacil/gerador"));
const LotofacilDaIndependencia = lazy(() => import("@/pages/lotofacil/lotofacil-da-independencia"));
const LotofacilSimulador = lazy(() => import("@/pages/lotofacil/simulador"));
const LotofacilConferidor = lazy(() => import("@/pages/lotofacil/conferidor"));
const LotofacilComoJogar = lazy(() => import("@/pages/lotofacil/como-jogar"));
const LotofacilPremiacao = lazy(() => import("@/pages/lotofacil/premiacao"));
const LotofacilFAQ = lazy(() => import("@/pages/lotofacil/faq"));

const QuinaHub = lazy(() => import("@/pages/quina/hub"));
const QuinaUltimoResultado = lazy(() => import("@/pages/quina/ultimo-resultado"));
const QuinaResultadosAnteriores = lazy(() => import("@/pages/quina/resultados"));
const QuinaEstatisticas = lazy(() => import("@/pages/quina/estatisticas"));
const QuinaEstatisticasTabela = lazy(() => import("@/pages/quina/estatisticas-tabela"));
const QuinaGerador = lazy(() => import("@/pages/quina/gerador"));
const QuinaDeSaoJoao = lazy(() => import("@/pages/quina/quina-de-sao-joao"));
const QuinaSimulador = lazy(() => import("@/pages/quina/simulador"));
const QuinaConferidor = lazy(() => import("@/pages/quina/conferidor"));
const QuinaComoJogar = lazy(() => import("@/pages/quina/como-jogar"));
const QuinaPremiacao = lazy(() => import("@/pages/quina/premiacao"));
const QuinaFAQ = lazy(() => import("@/pages/quina/faq"));

const LotomaniaHub = lazy(() => import("@/pages/lotomania/hub"));
const LotomaniaUltimoResultado = lazy(() => import("@/pages/lotomania/ultimo-resultado"));
const LotomaniaResultadosAnteriores = lazy(() => import("@/pages/lotomania/resultados"));
const LotomaniaEstatisticas = lazy(() => import("@/pages/lotomania/estatisticas"));
const LotomaniaEstatisticasTabela = lazy(() => import("@/pages/lotomania/estatisticas-tabela"));
const LotomaniaGerador = lazy(() => import("@/pages/lotomania/gerador"));
const LotomaniaSimulador = lazy(() => import("@/pages/lotomania/simulador"));
const LotomaniaConferidor = lazy(() => import("@/pages/lotomania/conferidor"));
const LotomaniaComoJogar = lazy(() => import("@/pages/lotomania/como-jogar"));
const LotomaniaPremiacao = lazy(() => import("@/pages/lotomania/premiacao"));
const LotomaniaFAQ = lazy(() => import("@/pages/lotomania/faq"));

const TimemaniaHub = lazy(() => import("@/pages/timemania/hub"));
const TimemaniaUltimoResultado = lazy(() => import("@/pages/timemania/ultimo-resultado"));
const TimemaniaResultadosAnteriores = lazy(() => import("@/pages/timemania/resultados"));
const TimemaniaEstatisticas = lazy(() => import("@/pages/timemania/estatisticas"));
const TimemaniaEstatisticasTabela = lazy(() => import("@/pages/timemania/estatisticas-tabela"));
const TimemaniaGerador = lazy(() => import("@/pages/timemania/gerador"));
const TimemaniaSimulador = lazy(() => import("@/pages/timemania/simulador"));
const TimemaniaConferidor = lazy(() => import("@/pages/timemania/conferidor"));
const TimemaniaComoJogar = lazy(() => import("@/pages/timemania/como-jogar"));
const TimemaniaPremiacao = lazy(() => import("@/pages/timemania/premiacao"));
const TimemaniaFAQ = lazy(() => import("@/pages/timemania/faq"));

const DiaDeSorteHub = lazy(() => import("@/pages/diadesorte/hub"));
const DiaDeSorteUltimoResultado = lazy(() => import("@/pages/diadesorte/ultimo-resultado"));
const DiaDeSorteResultadosAnteriores = lazy(() => import("@/pages/diadesorte/resultados"));
const DiaDeSorteEstatisticas = lazy(() => import("@/pages/diadesorte/estatisticas"));
const DiaDeSorteEstatisticasTabela = lazy(() => import("@/pages/diadesorte/estatisticas-tabela"));
const DiaDeSorteGerador = lazy(() => import("@/pages/diadesorte/gerador"));
const DiaDeSorteSimulador = lazy(() => import("@/pages/diadesorte/simulador"));
const DiaDeSorteConferidor = lazy(() => import("@/pages/diadesorte/conferidor"));
const DiaDeSorteComoJogar = lazy(() => import("@/pages/diadesorte/como-jogar"));
const DiaDeSortePremiacao = lazy(() => import("@/pages/diadesorte/premiacao"));
const DiaDeSorteFAQ = lazy(() => import("@/pages/diadesorte/faq"));

const MaisMilionariaHub = lazy(() => import("@/pages/maismilionaria/hub"));
const MaisMilionariaUltimoResultado = lazy(() => import("@/pages/maismilionaria/ultimo-resultado"));
const MaisMilionariaResultadosAnteriores = lazy(() => import("@/pages/maismilionaria/resultados"));
const MaisMilionariaEstatisticas = lazy(() => import("@/pages/maismilionaria/estatisticas"));
const MaisMilionariaEstatisticasTabela = lazy(() => import("@/pages/maismilionaria/estatisticas-tabela"));
const MaisMilionariaGerador = lazy(() => import("@/pages/maismilionaria/gerador"));
const MaisMilionariaSimulador = lazy(() => import("@/pages/maismilionaria/simulador"));
const MaisMilionariaConferidor = lazy(() => import("@/pages/maismilionaria/conferidor"));
const MaisMilionariaComoJogar = lazy(() => import("@/pages/maismilionaria/como-jogar"));
const MaisMilionariaPremiacao = lazy(() => import("@/pages/maismilionaria/premiacao"));
const MaisMilionariaFAQ = lazy(() => import("@/pages/maismilionaria/faq"));

const DuplaSenaHub = lazy(() => import("@/pages/duplasena/hub"));
const DuplaSenaUltimoResultado = lazy(() => import("@/pages/duplasena/ultimo-resultado"));
const DuplaSenaResultadosAnteriores = lazy(() => import("@/pages/duplasena/resultados"));
const DuplaSenaEstatisticas = lazy(() => import("@/pages/duplasena/estatisticas"));
const DuplaSenaEstatisticasTabela = lazy(() => import("@/pages/duplasena/estatisticas-tabela"));
const DuplaSenaGerador = lazy(() => import("@/pages/duplasena/gerador"));
const DuplaSenaSimulador = lazy(() => import("@/pages/duplasena/simulador"));
const DuplaSenaConferidor = lazy(() => import("@/pages/duplasena/conferidor"));
const DuplaSenaComoJogar = lazy(() => import("@/pages/duplasena/como-jogar"));
const DuplaSenaPremiacao = lazy(() => import("@/pages/duplasena/premiacao"));
const DuplaSenaFAQ = lazy(() => import("@/pages/duplasena/faq"));
const DuplaSenaDuplaDePascoa = lazy(() => import("@/pages/duplasena/dupla-de-pascoa"));

const SuperSeteHub = lazy(() => import("@/pages/super-sete/hub"));
const SuperSeteUltimoResultado = lazy(() => import("@/pages/super-sete/ultimo-resultado"));
const SuperSeteResultadosAnteriores = lazy(() => import("@/pages/super-sete/resultados"));
const SuperSeteEstatisticas = lazy(() => import("@/pages/super-sete/estatisticas"));
const SuperSeteEstatisticasTabela = lazy(() => import("@/pages/super-sete/estatisticas-tabela"));
const SuperSeteGerador = lazy(() => import("@/pages/super-sete/gerador"));
const SuperSeteSimulador = lazy(() => import("@/pages/super-sete/simulador"));
const SuperSeteConferidor = lazy(() => import("@/pages/super-sete/conferidor"));
const SuperSeteComoJogar = lazy(() => import("@/pages/super-sete/como-jogar"));
const SuperSetePremiacao = lazy(() => import("@/pages/super-sete/premiacao"));
const SuperSeteFAQ = lazy(() => import("@/pages/super-sete/faq"));

const Sobre = lazy(() => import("@/pages/sobre"));
const Privacidade = lazy(() => import("@/pages/privacidade"));
const Termos = lazy(() => import("@/pages/termos"));
const Contato = lazy(() => import("@/pages/contato"));

const queryClient = new QueryClient();

function Router() {
  return (
    <AppLayout>
      <Suspense fallback={<PageFallback />}>
        <Switch>
        <Route path="/" component={Home} />

        {/* Mega-Sena Routes */}
        <Route path="/mega-sena" component={MegaSenaHub} />
        <Route path="/mega-sena/resultado/:concurso" component={MegaSenaUltimoResultado} />
        <Route path="/mega-sena/resultado" component={MegaSenaUltimoResultado} />
        <Route path="/mega-sena/resultados" component={MegaSenaResultadosAnteriores} />
        <Route path="/mega-sena/tabela-de-dezenas" component={MegaSenaEstatisticasTabela} />
        <Route path="/mega-sena/resumo-estatistico" component={MegaSenaEstatisticas} />
        <Route path="/mega-sena/gerador" component={MegaSenaGerador} />
        <Route path="/mega-sena/mega-da-virada" component={MegaDaVirada} />
        <Route path="/mega-sena/como-jogar" component={MegaSenaComoJogar} />
        <Route path="/mega-sena/premiacao" component={MegaSenaPremiacao} />
        <Route path="/mega-sena/perguntas-frequentes" component={MegaSenaFAQ} />
        <Route path="/mega-sena/faq" component={MegaSenaFAQ} />
        <Route path="/mega-sena/simulador" component={MegaSenaSimulador} />
        <Route path="/mega-sena/conferidor" component={MegaSenaConferidor} />

        {/* Lotofácil Routes */}
        <Route path="/lotofacil" component={LotofacilHub} />
        <Route path="/lotofacil/resultado/:concurso" component={LotofacilUltimoResultado} />
        <Route path="/lotofacil/resultado" component={LotofacilUltimoResultado} />
        <Route path="/lotofacil/resultados" component={LotofacilResultadosAnteriores} />
        <Route path="/lotofacil/tabela-de-dezenas" component={LotofacilEstatisticasTabela} />
        <Route path="/lotofacil/resumo-estatistico" component={LotofacilEstatisticas} />
        <Route path="/lotofacil/gerador" component={LotofacilGerador} />
        <Route path="/lotofacil/lotofacil-da-independencia" component={LotofacilDaIndependencia} />
        <Route path="/lotofacil/simulador" component={LotofacilSimulador} />
        <Route path="/lotofacil/conferidor" component={LotofacilConferidor} />
        <Route path="/lotofacil/como-jogar" component={LotofacilComoJogar} />
        <Route path="/lotofacil/premiacao" component={LotofacilPremiacao} />
        <Route path="/lotofacil/perguntas-frequentes" component={LotofacilFAQ} />
        <Route path="/lotofacil/faq" component={LotofacilFAQ} />

        {/* Quina Routes */}
        <Route path="/quina" component={QuinaHub} />
        <Route path="/quina/resultado/:concurso" component={QuinaUltimoResultado} />
        <Route path="/quina/resultado" component={QuinaUltimoResultado} />
        <Route path="/quina/resultados" component={QuinaResultadosAnteriores} />
        <Route path="/quina/tabela-de-dezenas" component={QuinaEstatisticasTabela} />
        <Route path="/quina/resumo-estatistico" component={QuinaEstatisticas} />
        <Route path="/quina/gerador" component={QuinaGerador} />
        <Route path="/quina/quina-de-sao-joao" component={QuinaDeSaoJoao} />
        <Route path="/quina/simulador" component={QuinaSimulador} />
        <Route path="/quina/conferidor" component={QuinaConferidor} />
        <Route path="/quina/como-jogar" component={QuinaComoJogar} />
        <Route path="/quina/premiacao" component={QuinaPremiacao} />
        <Route path="/quina/perguntas-frequentes" component={QuinaFAQ} />
        <Route path="/quina/faq" component={QuinaFAQ} />

        {/* Lotomania Routes */}
        <Route path="/lotomania" component={LotomaniaHub} />
        <Route path="/lotomania/resultado/:concurso" component={LotomaniaUltimoResultado} />
        <Route path="/lotomania/resultado" component={LotomaniaUltimoResultado} />
        <Route path="/lotomania/resultados" component={LotomaniaResultadosAnteriores} />
        <Route path="/lotomania/tabela-de-dezenas" component={LotomaniaEstatisticasTabela} />
        <Route path="/lotomania/resumo-estatistico" component={LotomaniaEstatisticas} />
        <Route path="/lotomania/gerador" component={LotomaniaGerador} />
        <Route path="/lotomania/simulador" component={LotomaniaSimulador} />
        <Route path="/lotomania/conferidor" component={LotomaniaConferidor} />
        <Route path="/lotomania/como-jogar" component={LotomaniaComoJogar} />
        <Route path="/lotomania/premiacao" component={LotomaniaPremiacao} />
        <Route path="/lotomania/perguntas-frequentes" component={LotomaniaFAQ} />
        <Route path="/lotomania/faq" component={LotomaniaFAQ} />

        {/* Timemania Routes */}
        <Route path="/timemania" component={TimemaniaHub} />
        <Route path="/timemania/resultado/:concurso" component={TimemaniaUltimoResultado} />
        <Route path="/timemania/resultado" component={TimemaniaUltimoResultado} />
        <Route path="/timemania/resultados" component={TimemaniaResultadosAnteriores} />
        <Route path="/timemania/tabela-de-dezenas" component={TimemaniaEstatisticasTabela} />
        <Route path="/timemania/resumo-estatistico" component={TimemaniaEstatisticas} />
        <Route path="/timemania/gerador" component={TimemaniaGerador} />
        <Route path="/timemania/simulador" component={TimemaniaSimulador} />
        <Route path="/timemania/conferidor" component={TimemaniaConferidor} />
        <Route path="/timemania/como-jogar" component={TimemaniaComoJogar} />
        <Route path="/timemania/premiacao" component={TimemaniaPremiacao} />
        <Route path="/timemania/perguntas-frequentes" component={TimemaniaFAQ} />
        <Route path="/timemania/faq" component={TimemaniaFAQ} />

        {/* Dia de Sorte Routes */}
        <Route path="/diadesorte" component={DiaDeSorteHub} />
        <Route path="/diadesorte/resultado/:concurso" component={DiaDeSorteUltimoResultado} />
        <Route path="/diadesorte/resultado" component={DiaDeSorteUltimoResultado} />
        <Route path="/diadesorte/resultados" component={DiaDeSorteResultadosAnteriores} />
        <Route path="/diadesorte/tabela-de-dezenas" component={DiaDeSorteEstatisticasTabela} />
        <Route path="/diadesorte/resumo-estatistico" component={DiaDeSorteEstatisticas} />
        <Route path="/diadesorte/gerador" component={DiaDeSorteGerador} />
        <Route path="/diadesorte/simulador" component={DiaDeSorteSimulador} />
        <Route path="/diadesorte/conferidor" component={DiaDeSorteConferidor} />
        <Route path="/diadesorte/como-jogar" component={DiaDeSorteComoJogar} />
        <Route path="/diadesorte/premiacao" component={DiaDeSortePremiacao} />
        <Route path="/diadesorte/perguntas-frequentes" component={DiaDeSorteFAQ} />
        <Route path="/diadesorte/faq" component={DiaDeSorteFAQ} />

        {/* Dupla Sena Routes */}
        <Route path="/duplasena" component={DuplaSenaHub} />
        <Route path="/duplasena/resultado/:concurso" component={DuplaSenaUltimoResultado} />
        <Route path="/duplasena/resultado" component={DuplaSenaUltimoResultado} />
        <Route path="/duplasena/resultados" component={DuplaSenaResultadosAnteriores} />
        <Route path="/duplasena/tabela-de-dezenas" component={DuplaSenaEstatisticasTabela} />
        <Route path="/duplasena/resumo-estatistico" component={DuplaSenaEstatisticas} />
        <Route path="/duplasena/gerador" component={DuplaSenaGerador} />
        <Route path="/duplasena/simulador" component={DuplaSenaSimulador} />
        <Route path="/duplasena/conferidor" component={DuplaSenaConferidor} />
        <Route path="/duplasena/como-jogar" component={DuplaSenaComoJogar} />
        <Route path="/duplasena/premiacao" component={DuplaSenaPremiacao} />
        <Route path="/duplasena/perguntas-frequentes" component={DuplaSenaFAQ} />
        <Route path="/duplasena/faq" component={DuplaSenaFAQ} />
        <Route path="/duplasena/dupla-de-pascoa" component={DuplaSenaDuplaDePascoa} />

        {/* +Milionária Routes */}
        <Route path="/maismilionaria" component={MaisMilionariaHub} />
        <Route path="/maismilionaria/resultado/:concurso" component={MaisMilionariaUltimoResultado} />
        <Route path="/maismilionaria/resultado" component={MaisMilionariaUltimoResultado} />
        <Route path="/maismilionaria/resultados" component={MaisMilionariaResultadosAnteriores} />
        <Route path="/maismilionaria/tabela-de-dezenas" component={MaisMilionariaEstatisticasTabela} />
        <Route path="/maismilionaria/resumo-estatistico" component={MaisMilionariaEstatisticas} />
        <Route path="/maismilionaria/gerador" component={MaisMilionariaGerador} />
        <Route path="/maismilionaria/simulador" component={MaisMilionariaSimulador} />
        <Route path="/maismilionaria/conferidor" component={MaisMilionariaConferidor} />
        <Route path="/maismilionaria/como-jogar" component={MaisMilionariaComoJogar} />
        <Route path="/maismilionaria/premiacao" component={MaisMilionariaPremiacao} />
        <Route path="/maismilionaria/perguntas-frequentes" component={MaisMilionariaFAQ} />
        <Route path="/maismilionaria/faq" component={MaisMilionariaFAQ} />

        {/* Super Sete Routes */}
        <Route path="/super-sete" component={SuperSeteHub} />
        <Route path="/super-sete/resultado/:concurso" component={SuperSeteUltimoResultado} />
        <Route path="/super-sete/resultado" component={SuperSeteUltimoResultado} />
        <Route path="/super-sete/resultados" component={SuperSeteResultadosAnteriores} />
        <Route path="/super-sete/tabela-de-dezenas" component={SuperSeteEstatisticasTabela} />
        <Route path="/super-sete/resumo-estatistico" component={SuperSeteEstatisticas} />
        <Route path="/super-sete/gerador" component={SuperSeteGerador} />
        <Route path="/super-sete/simulador" component={SuperSeteSimulador} />
        <Route path="/super-sete/conferidor" component={SuperSeteConferidor} />
        <Route path="/super-sete/como-jogar" component={SuperSeteComoJogar} />
        <Route path="/super-sete/premiacao" component={SuperSetePremiacao} />
        <Route path="/super-sete/perguntas-frequentes" component={SuperSeteFAQ} />
        <Route path="/super-sete/faq" component={SuperSeteFAQ} />

        {/* Institutional pages */}
        <Route path="/sobre" component={Sobre} />
        <Route path="/privacidade" component={Privacidade} />
        <Route path="/termos" component={Termos} />
        <Route path="/contato" component={Contato} />

        <Route component={NotFound} />
      </Switch>
      </Suspense>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
