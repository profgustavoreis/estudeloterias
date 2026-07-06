import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { LotteryBall } from "@/components/ui/lottery-ball";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useGerarJogoSuperSete } from "@workspace/api-client-react";
import { Sparkles, Printer, RefreshCw } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";

const COR = "#a8cf45";
const BALL_BG = "#a8cf45";
const BALL_TEXT = "#ffffff";

function calcularCusto(digitosPorColunaArray: (1 | 2 | 3)[]): number {
  const product = digitosPorColunaArray.reduce((acc, n) => acc * n, 1);
  return Number((2.5 * product).toFixed(2));
}

function buildDigitosPorColunaArray(cols2: number, cols3: number): (1 | 2 | 3)[] {
  const arr: (1 | 2 | 3)[] = Array(7).fill(1);
  if (cols3 > 0) {
    arr.fill(2);
    for (let i = 0; i < cols3; i++) arr[i] = 3;
  } else if (cols2 > 0) {
    for (let i = 0; i < cols2; i++) arr[i] = 2;
  }
  return arr;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function buildRandomizedDigitosPorColunaArray(cols2: number, cols3: number): (1 | 2 | 3)[] {
  const arr: (1 | 2 | 3)[] = Array(7).fill(1);
  if (cols3 > 0) {
    arr.fill(2);
    const indices = shuffleArray(Array.from({ length: 7 }, (_, i) => i));
    for (let i = 0; i < cols3; i++) arr[indices[i]] = 3;
  } else if (cols2 > 0) {
    const indices = shuffleArray(Array.from({ length: 7 }, (_, i) => i));
    for (let i = 0; i < cols2; i++) arr[indices[i]] = 2;
  }
  return arr;
}

export default function SuperSeteGerador() {
  const [quantidade, setQuantidade] = useState(1);
  const [cols2, setCols2] = useState(0);
  const [cols3, setCols3] = useState(0);
  const [resultado, setResultado] = useState<{ jogos: number[][][]; custo: number } | null>(null);

  const gerarJogo = useGerarJogoSuperSete({
    mutation: { onSuccess: (data) => setResultado(data) },
  });

  const digitosPorColunaArray = buildDigitosPorColunaArray(cols2, cols2 < 7 ? 0 : cols3);
  const custoUnitario = calcularCusto(digitosPorColunaArray);
  const custoTotal = custoUnitario * quantidade;

  const handleGerar = () => {
    const randomizedArray = buildRandomizedDigitosPorColunaArray(cols2, cols2 < 7 ? 0 : cols3);
    gerarJogo.mutate({ data: { digitosPorColunaArray: randomizedArray, quantidade } });
  };

  const handleCols2Change = (v: number[]) => {
    setCols2(v[0]);
    if (v[0] < 7) setCols3(0);
  };

  return (
    <div className="space-y-6">
      <PageSEO
        title="Gerador de Jogos da Super Sete"
        description="Gere apostas aleatórias para a Super Sete. Configure números por coluna, quantidade de jogos e crie suas apostas gratuitamente."
        canonical="/super-sete/gerador"
      />
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: COR }}>
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: COR }}>Super Sete · Gerador de Jogos</h1>
          <p className="text-muted-foreground mt-1">Crie jogos aleatórios de 7 números para a Super Sete.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Configurar Jogos</CardTitle>
            <CardDescription>Defina os parâmetros para geração</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Quantidade de Jogos</Label>
                <span className="font-mono font-medium">{quantidade}</span>
              </div>
              <Slider value={[quantidade]} min={1} max={20} step={1} onValueChange={(v) => setQuantidade(v[0])} />
              <div className="text-xs text-muted-foreground">Gere de 1 a 20 jogos simultaneamente.</div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Colunas com 2 números</Label>
                <span className="font-mono font-medium">{cols2}</span>
              </div>
              <Slider value={[cols2]} min={0} max={7} step={1} onValueChange={handleCols2Change} />
              <div className="text-xs text-muted-foreground">
                {cols2 === 0
                  ? "Todas as colunas com 1 número (aposta simples)."
                  : cols2 === 7
                    ? "Todas as colunas com 2 números."
                    : `${cols2} colunas com 2 números, ${7 - cols2} com 1 número.`}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Colunas com 3 números</Label>
                <span className="font-mono font-medium">{cols2 < 7 ? 0 : cols3}</span>
              </div>
              <Slider
                value={[cols2 < 7 ? 0 : cols3]}
                min={0}
                max={7}
                step={1}
                disabled={cols2 < 7}
                onValueChange={(v) => setCols3(v[0])}
              />
              <div className="text-xs text-muted-foreground">
                {cols2 < 7
                  ? "Disponível quando todas as 7 colunas têm 2 números."
                  : cols3 === 0
                    ? "Nenhuma coluna com 3 números."
                    : `${cols3} colunas com 3 números, ${7 - cols3} com 2 números.`}
              </div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg border border-border space-y-1">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Custo Estimado</div>
              <p className="text-sm text-muted-foreground">
                Custo por jogo: <strong>{formatCurrency(custoUnitario)}</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                Custo total ({quantidade} {quantidade === 1 ? "jogo" : "jogos"}):{" "}
                <strong style={{ color: COR }}>{formatCurrency(custoTotal)}</strong>
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              style={{ backgroundColor: COR, color: "#fff" }}
              onClick={handleGerar}
              disabled={gerarJogo.isPending}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#95b83d")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = COR)}
            >
              {gerarJogo.isPending ? (
                "Gerando..."
              ) : (
                <><Sparkles className="w-4 h-4 mr-2" /> Gerar {quantidade} {quantidade === 1 ? "Jogo" : "Jogos"}</>
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
                    <CardContent className="p-4">
                      <div className="flex gap-3 justify-center">
                        {jogo.map((colDigitos, colIdx) => (
                          <div key={colIdx} className="flex flex-col items-center gap-0.5">
                            <span className="text-[10px] font-medium text-muted-foreground mb-0.5">
                              {colIdx + 1}°
                            </span>
                            {colDigitos.map((d, dIdx) => (
                              <LotteryBall key={dIdx} number={d} size="sm" color={BALL_BG} textColor={BALL_TEXT} padDigits={1} />
                            ))}
                          </div>
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
                Configure a quantidade de jogos e números por coluna ao lado e clique em Gerar Jogos para criar suas
                apostas.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
