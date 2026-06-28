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
import LotofacilCalendario from "@/pages/lotofacil/calendario";
import LotofacilDaIndependencia from "@/pages/lotofacil/lotofacil-da-independencia";
import LotofacilSimulador from "@/pages/lotofacil/simulador";
import LotofacilConferidor from "@/pages/lotofacil/conferidor";
import LotofacilComoJogar from "@/pages/lotofacil/como-jogar";
import LotofacilPremiacao from "@/pages/lotofacil/premiacao";
import LotofacilFAQ from "@/pages/lotofacil/faq";

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
        <Route path="/lotofacil/calendario" component={LotofacilCalendario} />
        <Route path="/lotofacil/lotofacil-da-independencia" component={LotofacilDaIndependencia} />
        <Route path="/lotofacil/simulador" component={LotofacilSimulador} />
        <Route path="/lotofacil/conferidor" component={LotofacilConferidor} />
        <Route path="/lotofacil/como-jogar" component={LotofacilComoJogar} />
        <Route path="/lotofacil/premiacao" component={LotofacilPremiacao} />
        <Route path="/lotofacil/perguntas-frequentes" component={LotofacilFAQ} />
        <Route path="/lotofacil/faq" component={LotofacilFAQ} />

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
