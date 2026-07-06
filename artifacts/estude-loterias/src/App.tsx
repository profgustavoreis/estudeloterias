import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/AppLayout";
import NotFound from "@/pages/not-found";

import Home from "@/pages/home";
import MegaSenaHub from "@/pages/mega-sena/hub";
import MegaSenaUltimoResultado from "@/pages/mega-sena/ultimo-resultado";
import MegaSenaResultadosAnteriores from "@/pages/mega-sena/resultados";
import MegaSenaEstatisticas from "@/pages/mega-sena/estatisticas";
import MegaSenaEstatisticasTabela from "@/pages/mega-sena/estatisticas-tabela";
import MegaSenaGerador from "@/pages/mega-sena/gerador";
import MegaDaVirada from "@/pages/mega-sena/mega-da-virada";
import MegaSenaComoJogar from "@/pages/mega-sena/como-jogar";
import MegaSenaPremiacao from "@/pages/mega-sena/premiacao";
import MegaSenaFAQ from "@/pages/mega-sena/faq";
import MegaSenaSimulador from "@/pages/mega-sena/simulador";
import MegaSenaConferidor from "@/pages/mega-sena/conferidor";

import LotofacilHub from "@/pages/lotofacil/hub";
import LotofacilUltimoResultado from "@/pages/lotofacil/ultimo-resultado";
import LotofacilResultadosAnteriores from "@/pages/lotofacil/resultados";
import LotofacilEstatisticas from "@/pages/lotofacil/estatisticas";
import LotofacilEstatisticasTabela from "@/pages/lotofacil/estatisticas-tabela";
import LotofacilGerador from "@/pages/lotofacil/gerador";
import LotofacilDaIndependencia from "@/pages/lotofacil/lotofacil-da-independencia";
import LotofacilSimulador from "@/pages/lotofacil/simulador";
import LotofacilConferidor from "@/pages/lotofacil/conferidor";
import LotofacilComoJogar from "@/pages/lotofacil/como-jogar";
import LotofacilPremiacao from "@/pages/lotofacil/premiacao";
import LotofacilFAQ from "@/pages/lotofacil/faq";

import QuinaHub from "@/pages/quina/hub";
import QuinaUltimoResultado from "@/pages/quina/ultimo-resultado";
import QuinaResultadosAnteriores from "@/pages/quina/resultados";
import QuinaEstatisticas from "@/pages/quina/estatisticas";
import QuinaEstatisticasTabela from "@/pages/quina/estatisticas-tabela";
import QuinaGerador from "@/pages/quina/gerador";
import QuinaDeSaoJoao from "@/pages/quina/quina-de-sao-joao";
import QuinaSimulador from "@/pages/quina/simulador";
import QuinaConferidor from "@/pages/quina/conferidor";
import QuinaComoJogar from "@/pages/quina/como-jogar";
import QuinaPremiacao from "@/pages/quina/premiacao";
import QuinaFAQ from "@/pages/quina/faq";

import LotomaniaHub from "@/pages/lotomania/hub";
import LotomaniaUltimoResultado from "@/pages/lotomania/ultimo-resultado";
import LotomaniaResultadosAnteriores from "@/pages/lotomania/resultados";
import LotomaniaEstatisticas from "@/pages/lotomania/estatisticas";
import LotomaniaEstatisticasTabela from "@/pages/lotomania/estatisticas-tabela";
import LotomaniaGerador from "@/pages/lotomania/gerador";
import LotomaniaSimulador from "@/pages/lotomania/simulador";
import LotomaniaConferidor from "@/pages/lotomania/conferidor";
import LotomaniaComoJogar from "@/pages/lotomania/como-jogar";
import LotomaniaPremiacao from "@/pages/lotomania/premiacao";
import LotomaniaFAQ from "@/pages/lotomania/faq";

import TimemaniaHub from "@/pages/timemania/hub";
import TimemaniaUltimoResultado from "@/pages/timemania/ultimo-resultado";
import TimemaniaResultadosAnteriores from "@/pages/timemania/resultados";
import TimemaniaEstatisticas from "@/pages/timemania/estatisticas";
import TimemaniaEstatisticasTabela from "@/pages/timemania/estatisticas-tabela";
import TimemaniaGerador from "@/pages/timemania/gerador";
import TimemaniaSimulador from "@/pages/timemania/simulador";
import TimemaniaConferidor from "@/pages/timemania/conferidor";
import TimemaniaComoJogar from "@/pages/timemania/como-jogar";
import TimemaniaPremiacao from "@/pages/timemania/premiacao";
import TimemaniaFAQ from "@/pages/timemania/faq";

import DiaDeSorteHub from "@/pages/diadesorte/hub";
import DiaDeSorteUltimoResultado from "@/pages/diadesorte/ultimo-resultado";
import DiaDeSorteResultadosAnteriores from "@/pages/diadesorte/resultados";
import DiaDeSorteEstatisticas from "@/pages/diadesorte/estatisticas";
import DiaDeSorteEstatisticasTabela from "@/pages/diadesorte/estatisticas-tabela";
import DiaDeSorteGerador from "@/pages/diadesorte/gerador";
import DiaDeSorteSimulador from "@/pages/diadesorte/simulador";
import DiaDeSorteConferidor from "@/pages/diadesorte/conferidor";
import DiaDeSorteComoJogar from "@/pages/diadesorte/como-jogar";
import DiaDeSortePremiacao from "@/pages/diadesorte/premiacao";
import DiaDeSorteFAQ from "@/pages/diadesorte/faq";

import MaisMilionariaHub from "@/pages/maismilionaria/hub";
import MaisMilionariaUltimoResultado from "@/pages/maismilionaria/ultimo-resultado";
import MaisMilionariaResultadosAnteriores from "@/pages/maismilionaria/resultados";
import MaisMilionariaEstatisticas from "@/pages/maismilionaria/estatisticas";
import MaisMilionariaEstatisticasTabela from "@/pages/maismilionaria/estatisticas-tabela";
import MaisMilionariaGerador from "@/pages/maismilionaria/gerador";
import MaisMilionariaSimulador from "@/pages/maismilionaria/simulador";
import MaisMilionariaConferidor from "@/pages/maismilionaria/conferidor";
import MaisMilionariaComoJogar from "@/pages/maismilionaria/como-jogar";
import MaisMilionariaPremiacao from "@/pages/maismilionaria/premiacao";
import MaisMilionariaFAQ from "@/pages/maismilionaria/faq";

import DuplaSenaHub from "@/pages/duplasena/hub";
import DuplaSenaUltimoResultado from "@/pages/duplasena/ultimo-resultado";
import DuplaSenaResultadosAnteriores from "@/pages/duplasena/resultados";
import DuplaSenaEstatisticas from "@/pages/duplasena/estatisticas";
import DuplaSenaEstatisticasTabela from "@/pages/duplasena/estatisticas-tabela";
import DuplaSenaGerador from "@/pages/duplasena/gerador";
import DuplaSenaSimulador from "@/pages/duplasena/simulador";
import DuplaSenaConferidor from "@/pages/duplasena/conferidor";
import DuplaSenaComoJogar from "@/pages/duplasena/como-jogar";
import DuplaSenaPremiacao from "@/pages/duplasena/premiacao";
import DuplaSenaFAQ from "@/pages/duplasena/faq";
import DuplaSenaDuplaDePascoa from "@/pages/duplasena/dupla-de-pascoa";

import SuperSeteHub from "@/pages/super-sete/hub";
import SuperSeteUltimoResultado from "@/pages/super-sete/ultimo-resultado";
import SuperSeteResultadosAnteriores from "@/pages/super-sete/resultados";
import SuperSeteEstatisticas from "@/pages/super-sete/estatisticas";
import SuperSeteEstatisticasTabela from "@/pages/super-sete/estatisticas-tabela";
import SuperSeteGerador from "@/pages/super-sete/gerador";
import SuperSeteSimulador from "@/pages/super-sete/simulador";
import SuperSeteConferidor from "@/pages/super-sete/conferidor";
import SuperSeteComoJogar from "@/pages/super-sete/como-jogar";
import SuperSetePremiacao from "@/pages/super-sete/premiacao";
import SuperSeteFAQ from "@/pages/super-sete/faq";

import Sobre from "@/pages/sobre";
import Privacidade from "@/pages/privacidade";
import Termos from "@/pages/termos";
import Contato from "@/pages/contato";

const queryClient = new QueryClient();

function Router() {
  return (
    <AppLayout>
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
