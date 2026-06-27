import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { LotteryBall } from "@/components/ui/lottery-ball";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useGerarJogo, JogoGerado } from "@workspace/api-client-react";
import { Sparkles, Printer, RefreshCw } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";

export default function MegaSenaGerador() {
  const [qtdJogos, setQtdJogos] = useState(1);
  const [qtdDezenas, setQtdDezenas] = useState(6);
  const [resultado, setResultado] = useState<JogoGerado | null>(null);

  const gerarJogo = useGerarJogo({
    mutation: {
      onSuccess: (data) => {
        setResultado(data);
      },
    },
  });

  const handleGerar = () => {
    gerarJogo.mutate({ data: { quantidadeJogos: qtdJogos, quantidadeDezenas: qtdDezenas } });
  };

  return (
    <div className="space-y-6">
      <PageSEO
        title="Gerador de Jogos da Mega-Sena"
        description="Gere apostas aleatórias para a Mega-Sena escolhendo quantos jogos e quantas dezenas por jogo. Surpresinha inteligente e gratuita."
        canonical="/mega-sena/gerador"
      />
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white bg-[#009640]">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#009640]">Mega-Sena · Gerador de Jogos</h1>
          <p className="text-muted-foreground mt-1">Crie jogos aleatórios inteligentemente baseados em parâmetros estatísticos.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Configurar Jogos</CardTitle>
            <CardDescription>Defina como você quer seus jogos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between">
                <Label>Quantidade de Jogos</Label>
                <span className="font-mono font-medium">{qtdJogos}</span>
              </div>
              <Slider 
                value={[qtdJogos]} 
                min={1} 
                max={20} 
                step={1} 
                onValueChange={(v) => setQtdJogos(v[0])} 
              />
              <div className="text-xs text-muted-foreground">Gere de 1 a 20 jogos simultaneamente.</div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <Label>Dezenas por Jogo</Label>
                <span className="font-mono font-medium">{qtdDezenas}</span>
              </div>
              <Slider 
                value={[qtdDezenas]} 
                min={6} 
                max={20} 
                step={1} 
                onValueChange={(v) => setQtdDezenas(v[0])} 
              />
              <div className="text-xs text-muted-foreground">Aposta mínima: 6 dezenas (R$ 6,00). Máxima: 20 dezenas.</div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full bg-[#009640] hover:bg-[#007b34] text-white" 
              onClick={handleGerar}
              disabled={gerarJogo.isPending}
            >
              {gerarJogo.isPending ? (
                <>Gerando...</>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" /> Gerar {qtdJogos} {qtdJogos === 1 ? 'Jogo' : 'Jogos'}
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          {resultado ? (
            <>
              <div className="flex items-center justify-between bg-muted p-4 rounded-lg border border-border">
                <div>
                  <div className="text-sm text-muted-foreground">Custo Total Estimado</div>
                  <div className="text-2xl font-bold text-foreground">{formatCurrency(resultado.custo)}</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => window.print()}>
                    <Printer className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleGerar}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid gap-4">
                {resultado.jogos.map((jogo, i) => (
                  <Card key={i}>
                    <CardHeader className="py-3 px-4 border-b border-border bg-muted/20">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Jogo {i + 1}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="flex flex-wrap gap-2">
                        {jogo.sort((a,b) => a - b).map(num => (
                          <LotteryBall key={num} number={num} size="md" color="#009640" />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-muted/10 p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">Nenhum jogo gerado</h3>
              <p className="text-muted-foreground mt-1 max-w-sm">
                Configure os parâmetros ao lado e clique em Gerar Jogos para criar suas apostas.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
