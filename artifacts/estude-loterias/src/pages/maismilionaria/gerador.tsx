import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { LotteryBall } from "@/components/ui/lottery-ball";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useGerarJogoMaismilionaria } from "@workspace/api-client-react";
import { Sparkles, Printer, RefreshCw } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";

const COR = "#2E3078";
const BALL_BG = "#2E3078";
const BALL_TEXT = "#ffffff";
const COR_HOVER = "#25296e";
const PRECO_APOSTA = 6.0;

export default function MaismilionariaGerador() {
  const [qtdJogos, setQtdJogos] = useState(1);
  const [quantidadeDezenas, setQuantidadeDezenas] = useState(6);
  const [quantidadeTrevos, setQuantidadeTrevos] = useState(2);
  const [resultado, setResultado] = useState<{ jogos: number[][]; trevos: number[][]; custo: number } | null>(null);

  const gerarJogo = useGerarJogoMaismilionaria({
    mutation: { onSuccess: data => setResultado(data as { jogos: number[][]; trevos: number[][]; custo: number }) },
  });

  const handleGerar = () => {
    gerarJogo.mutate({ data: { quantidadeJogos: qtdJogos, quantidadeDezenas, quantidadeTrevos } });
  };

  return (
    <div className="space-y-6">
      <PageSEO
        title="Gerador de Jogos da +Milionária"
        description="Gere apostas aleatórias para a +Milionária. Surpresinha inteligente e gratuita: cada jogo tem 6 dezenas de 01 a 50 e 2 Trevos da Sorte de 1 a 6."
        canonical="/maismilionaria/gerador"
      />
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: COR }}>
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: COR }}>+Milionária · Gerador de Jogos</h1>
          <p className="text-muted-foreground mt-1">Crie jogos aleatórios de 6 dezenas e 2 Trevos da Sorte para a +Milionária.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Configurar Jogos</CardTitle>
            <CardDescription>Defina os parâmetros dos seus jogos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between">
                <Label>Quantidade de Jogos</Label>
                <span className="font-mono font-medium">{qtdJogos}</span>
              </div>
              <Slider value={[qtdJogos]} min={1} max={20} step={1} onValueChange={v => setQtdJogos(v[0])} />
              <div className="text-xs text-muted-foreground">Gere de 1 a 20 jogos simultaneamente.</div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <Label>Dezenas por jogo</Label>
                <span className="font-mono font-medium">{quantidadeDezenas}</span>
              </div>
              <Slider value={[quantidadeDezenas]} min={6} max={12} step={1} onValueChange={v => setQuantidadeDezenas(v[0])} />
              <div className="text-xs text-muted-foreground">De 6 a 12 dezenas (01 a 50).</div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <Label>Trevos da Sorte</Label>
                <span className="font-mono font-medium">{quantidadeTrevos}</span>
              </div>
              <Slider value={[quantidadeTrevos]} min={2} max={6} step={1} onValueChange={v => setQuantidadeTrevos(v[0])} />
              <div className="text-xs text-muted-foreground">De 2 a 6 Trevos (1 a 6).</div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg border border-border space-y-1">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Aposta da +Milionária</div>
              <p className="text-sm text-muted-foreground">
                Cada jogo tem <strong>6 dezenas</strong> (01 a 50) e <strong>2 Trevos</strong> (1 a 6).
              </p>
              <p className="text-sm text-muted-foreground">
                Preço por jogo: <strong>{formatCurrency(PRECO_APOSTA)}</strong>
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              style={{ backgroundColor: COR, color: "#fff" }}
              onClick={handleGerar}
              disabled={gerarJogo.isPending}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = COR_HOVER)}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = COR)}
            >
              {gerarJogo.isPending ? "Gerando..." : (
                <><Sparkles className="w-4 h-4 mr-2" /> Gerar {qtdJogos} {qtdJogos === 1 ? "Jogo" : "Jogos"}</>
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
                  <Button variant="outline" size="icon" onClick={() => window.print()}><Printer className="w-4 h-4" /></Button>
                  <Button variant="outline" size="icon" onClick={handleGerar}><RefreshCw className="w-4 h-4" /></Button>
                </div>
              </div>

              <div className="grid gap-4">
                {resultado.jogos.map((jogo, i) => (
                  <Card key={i}>
                    <CardHeader className="py-3 px-4 border-b border-border bg-muted/20">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Jogo {i + 1}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Dezenas</p>
                        <div className="flex flex-wrap gap-2">
                          {jogo.map(num => (
                            <LotteryBall key={num} number={num} size="md" color={BALL_BG} textColor={BALL_TEXT} />
                          ))}
                        </div>
                      </div>
                      {resultado.trevos[i] && (
                        <div className="pt-2 border-t">
                          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Trevos da Sorte</p>
                          <div className="flex flex-wrap gap-2">
                            {resultado.trevos[i].map(t => (
                              <LotteryBall key={t} number={t} size="md" color={COR} textColor={BALL_TEXT} />
                            ))}
                          </div>
                        </div>
                      )}
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
                Configure a quantidade de jogos, dezenas e trevos ao lado e clique em Gerar Jogos para criar suas apostas.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
