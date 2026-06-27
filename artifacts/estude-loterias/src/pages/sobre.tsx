import { PageSEO } from "@/components/seo/PageSEO";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Dices, FlaskConical, Sparkles, Target } from "lucide-react";

const COR = "#009640";

const funcionalidades = [
  {
    icon: Dices,
    titulo: "Resultados Completos",
    desc: "Histórico de todos os concursos desde o primeiro sorteio. Consulte dezenas, premiação e dados de cada concurso.",
  },
  {
    icon: BarChart3,
    titulo: "Estatísticas Detalhadas",
    desc: "Frequência, atraso, pares/ímpares, moldura/retrato, soma das dezenas e muito mais — baseado no histórico real.",
  },
  {
    icon: Sparkles,
    titulo: "Gerador de Jogos",
    desc: "Crie apostas aleatórias com inteligência estatística. Escolha quantas dezenas e quantos jogos você quer gerar.",
  },
  {
    icon: FlaskConical,
    titulo: "Simulador Histórico",
    desc: "Selecione suas dezenas e descubra em quantos sorteios do passado você teria acertado cada faixa de premiação.",
  },
  {
    icon: Target,
    titulo: "Conferidor de Apostas",
    desc: "Confira rapidamente se sua aposta foi premiada em qualquer concurso da história das loterias.",
  },
];

export default function Sobre() {
  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <PageSEO
        title="Sobre o Estude Loterias — Estatísticas e Ferramentas para Loterias da Caixa"
        description="Conheça o Estude Loterias: o site com estatísticas, resultados e ferramentas gratuitas para as loterias da Caixa Econômica Federal."
        canonical="/sobre"
      />

      <div>
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: COR }}>
          Sobre o Estude Loterias
        </h1>
        <p className="text-muted-foreground mt-2">
          Estatísticas e ferramentas gratuitas para as loterias da Caixa Econômica Federal.
        </p>
      </div>

      <section className="space-y-4 text-sm leading-relaxed text-foreground/90">
        <p>
          O <strong>Estude Loterias</strong> é um site independente dedicado a fornecer dados
          estatísticos, histórico de resultados e ferramentas de análise para as principais
          loterias da Caixa Econômica Federal — Mega-Sena, Lotofácil, Quina e outras.
        </p>
        <p>
          Nossa missão é simples: tornar o universo das loterias mais transparente e acessível,
          oferecendo dados precisos e ferramentas úteis para qualquer pessoa que queira
          entender melhor as probabilidades, os padrões históricos e as regras de cada modalidade.
        </p>
        <p>
          Todos os dados são obtidos diretamente da API pública da Caixa Econômica Federal.
          Não vendemos apostas nem temos qualquer vínculo comercial com a Caixa. O Estude
          Loterias é um projeto independente de análise e estatística.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">O que você encontra aqui</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {funcionalidades.map((f) => {
            const Icon = f.icon;
            return (
              <Card key={f.titulo}>
                <CardContent className="pt-5 flex gap-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-white"
                    style={{ backgroundColor: COR }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{f.titulo}</div>
                    <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{f.desc}</div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="space-y-3 text-sm leading-relaxed">
        <h2 className="text-lg font-semibold">Aviso importante</h2>
        <p className="text-muted-foreground">
          As loterias são jogos de azar regulamentados pelo governo federal. A participação
          é permitida apenas para maiores de 18 anos. Nenhuma análise estatística garante
          resultados futuros — cada sorteio é um evento independente. Jogue com responsabilidade
          e dentro de suas possibilidades financeiras.
        </p>
      </section>
    </div>
  );
}
