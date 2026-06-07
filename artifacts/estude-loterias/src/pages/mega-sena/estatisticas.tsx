import { useGetMegaSenaEstatisticas } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { LotteryBall } from "@/components/ui/lottery-ball";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Trophy, TrendingUp, AlertTriangle } from "lucide-react";

export default function MegaSenaEstatisticas() {
  const { data: stats, isLoading, isError } = useGetMegaSenaEstatisticas();

  if (isLoading) {
    return <div>Carregando estatísticas...</div>;
  }

  if (isError || !stats) {
    return <div>Erro ao carregar estatísticas.</div>;
  }

  const freqData = [...stats.frequenciaDezenas]
    .sort((a, b) => b.frequencia - a.frequencia)
    .slice(0, 15); // Top 15 para o gráfico

  const maisSorteadas = [...stats.frequenciaDezenas].sort((a, b) => b.frequencia - a.frequencia).slice(0, 10);
  const menosSorteadas = [...stats.frequenciaDezenas].sort((a, b) => a.frequencia - b.frequencia).slice(0, 10);
  const maisAtrasadas = [...stats.frequenciaDezenas].sort((a, b) => b.atraso - a.atraso).slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#009640]">Estatísticas</h1>
        <p className="text-muted-foreground mt-1">Análise completa de {stats.totalConcursos} concursos realizados.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary text-primary-foreground border-none">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-medium text-primary-foreground/80">Maior Prêmio da História</div>
                <div className="text-2xl font-bold">{formatCurrency(stats.maiorPremio)}</div>
                <div className="text-xs text-primary-foreground/70 mt-1">Concurso {stats.maiorPremioConcurso} ({formatDate(stats.maiorPremioData)})</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-muted rounded-lg">
                <TrendingUp className="w-6 h-6 text-[#009640]" />
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Taxa de Acumulação</div>
                <div className="text-2xl font-bold">{stats.percentualAcumulado.toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground mt-1">{stats.totalAcumulados} concursos acumulados</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-muted rounded-lg">
                <AlertTriangle className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Maior Atraso Atual</div>
                <div className="text-2xl font-bold">{maisAtrasadas[0].atraso} concursos</div>
                <div className="text-xs text-muted-foreground mt-1">Dezena {maisAtrasadas[0].dezena}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top 15 Dezenas Mais Sorteadas</CardTitle>
          <CardDescription>Frequência absoluta desde o primeiro concurso</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={freqData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="dezena" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-card p-3 border rounded shadow-md">
                          <p className="font-bold mb-1">Dezena {payload[0].payload.dezena}</p>
                          <p className="text-sm text-muted-foreground">Sorteada {payload[0].value} vezes</p>
                          <p className="text-sm text-muted-foreground">{payload[0].payload.percentual.toFixed(2)}% dos concursos</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="frequencia" radius={[4, 4, 0, 0]}>
                  {freqData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="#009640" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Mais Sorteadas</CardTitle>
            <CardDescription>As 10 dezenas mais quentes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {maisSorteadas.map((item, i) => (
                <div key={item.dezena} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground font-mono text-xs w-4">{i + 1}º</span>
                    <LotteryBall number={item.dezena} size="sm" color="#009640" />
                  </div>
                  <div className="text-sm font-medium">{item.frequencia} vezes</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Menos Sorteadas</CardTitle>
            <CardDescription>As 10 dezenas mais frias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {menosSorteadas.map((item, i) => (
                <div key={item.dezena} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground font-mono text-xs w-4">{i + 1}º</span>
                    <LotteryBall number={item.dezena} size="sm" className="bg-muted text-muted-foreground" />
                  </div>
                  <div className="text-sm font-medium">{item.frequencia} vezes</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Maiores Atrasos</CardTitle>
            <CardDescription>Concursos sem aparecer</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {maisAtrasadas.map((item, i) => (
                <div key={item.dezena} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground font-mono text-xs w-4">{i + 1}º</span>
                    <LotteryBall number={item.dezena} size="sm" className="bg-amber-100 text-amber-800 border-amber-200" />
                  </div>
                  <div className="text-sm font-medium text-amber-600">{item.atraso} sorteios</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
