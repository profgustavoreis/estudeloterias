import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Target } from "lucide-react";

export default function MegaSenaPremiacao() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white bg-[#009640]">
          <Target className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#009640]">Mega-Sena · Premiação</h1>
          <p className="text-muted-foreground mt-2 text-lg">Entenda como o prêmio da Mega-Sena é distribuído.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Distribuição do Prêmio Bruto</CardTitle>
          <CardDescription>O prêmio bruto corresponde a 43,35% da arrecadação total do concurso.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-muted-foreground">
          <p>
            Deste percentual de 43,35% destinado à premiação, o valor é distribuído da seguinte forma:
          </p>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
              <div className="text-2xl font-bold text-[#009640] w-20 text-center">35%</div>
              <div>
                <div className="font-semibold text-foreground">Sena (6 acertos)</div>
                <div className="text-sm">São distribuídos entre os acertadores dos 6 números.</div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
              <div className="text-2xl font-bold text-[#009640] w-20 text-center">19%</div>
              <div>
                <div className="font-semibold text-foreground">Quina (5 acertos)</div>
                <div className="text-sm">São distribuídos entre os acertadores de 5 números.</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
              <div className="text-2xl font-bold text-[#009640] w-20 text-center">19%</div>
              <div>
                <div className="font-semibold text-foreground">Quadra (4 acertos)</div>
                <div className="text-sm">São distribuídos entre os acertadores de 4 números.</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
              <div className="text-2xl font-bold text-[#009640] w-20 text-center">22%</div>
              <div>
                <div className="font-semibold text-foreground">Acumulado para Finais 0 e 5</div>
                <div className="text-sm">Ficam acumulados e são distribuídos aos acertadores dos 6 números nos concursos de final 0 ou 5.</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 border rounded-lg bg-amber-500/10 border-amber-500/30">
              <div className="text-2xl font-bold text-amber-600 w-20 text-center">5%</div>
              <div>
                <div className="font-semibold text-foreground">Mega da Virada</div>
                <div className="text-sm">Ficam acumulados para a primeira faixa (sena) do último concurso do ano de final 0 ou 5 (Mega da Virada).</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Target className="w-5 h-5 text-[#009640]" />
            Acumulação
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4">
          <p>
            Não havendo acertador em qualquer faixa, o valor acumula para o concurso seguinte, na respectiva faixa de premiação.
            Os prêmios prescrevem 90 dias após a data do sorteio.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
