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
