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
        <Route path="/mega-sena/faq" component={MegaSenaFAQ} />
        <Route path="/mega-sena/simulador" component={MegaSenaSimulador} />
        <Route path="/mega-sena/conferidor" component={MegaSenaConferidor} />

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
