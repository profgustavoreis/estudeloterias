import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, Target } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";

const COR = "#a61324";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
      {children}
    </p>
  );
}

function comb(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  k = Math.min(k, n - k);
  let r = 1;
  for (let i = 0; i < k; i++) r = (r * (n - i)) / (i + 1);
  return Math.round(r);
}

function probDuplasena(k: number): string {
  const total = comb(50, 6);
  const ways = comb(6, k) * comb(44, 6 - k);
  if (ways <= 0) return "—";
  const x = total / ways;
  return `1 em ${Math.round(x).toLocaleString("pt-BR")}`;
}

const FAIXAS_1 = [6, 5, 4, 3];
const FAIXAS_2 = [6, 5, 4, 3];

export default function DuplasenaPremiacao() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageSEO
        title="Premiação da Dupla Sena — Faixas e Probabilidades"
        description="Conheça as faixas de premiação da Dupla Sena: sena, quina, quadra e terno, percentuais do fundo de prêmios e probabilidades de cada faixa nos dois sorteios."
        canonical="/duplasena/premiacao"
      />
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: COR }}>
          <Trophy className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: COR }}>Dupla Sena · Premiação</h1>
          <p className="text-muted-foreground mt-1">Faixas de prêmios, percentuais e probabilidades da Dupla Sena.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Distribuição dos Prêmios</CardTitle>
          <CardDescription>O prêmio bruto corresponde a 43,79% da arrecadação (43,35% antes de nov/2024).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-muted-foreground">
          <p>
            Do valor destinado aos prêmios (prêmio bruto), são distribuídos percentuais independentes
            para cada faixa de acerto, em cada um dos dois sorteios. Não há valor fixo para nenhuma faixa —
            todos os prêmios são calculados como percentuais do prêmio bruto.
          </p>

          <div>
            <SectionLabel>1º Sorteio</SectionLabel>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
                <div className="text-2xl font-bold w-20 text-center" style={{ color: COR }}>30%</div>
                <div>
                  <div className="font-semibold text-foreground">1ª faixa – Sena (6 acertos)</div>
                  <div className="text-sm">Distribuídos entre os acertadores dos 6 números do 1º sorteio.</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
                <div className="text-2xl font-bold w-20 text-center" style={{ color: COR }}>10%</div>
                <div>
                  <div className="font-semibold text-foreground">2ª faixa – Quina (5 acertos)</div>
                  <div className="text-sm">Distribuídos entre os acertadores de 5 números do 1º sorteio.</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
                <div className="text-2xl font-bold w-20 text-center" style={{ color: COR }}>8%</div>
                <div>
                  <div className="font-semibold text-foreground">3ª faixa – Quadra (4 acertos)</div>
                  <div className="text-sm">Distribuídos entre os acertadores de 4 números do 1º sorteio.</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
                <div className="text-2xl font-bold w-20 text-center" style={{ color: COR }}>4%</div>
                <div>
                  <div className="font-semibold text-foreground">4ª faixa – Terno (3 acertos)</div>
                  <div className="text-sm">Distribuídos entre os acertadores de 3 números do 1º sorteio.</div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <SectionLabel>2º Sorteio</SectionLabel>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
                <div className="text-2xl font-bold w-20 text-center" style={{ color: COR }}>11%</div>
                <div>
                  <div className="font-semibold text-foreground">1ª faixa – Sena (6 acertos)</div>
                  <div className="text-sm">Percentual do prêmio bruto destinado à sena do 2º sorteio.</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
                <div className="text-2xl font-bold w-20 text-center" style={{ color: COR }}>9%</div>
                <div>
                  <div className="font-semibold text-foreground">2ª faixa – Quina (5 acertos)</div>
                  <div className="text-sm">Percentual do prêmio bruto destinado à quina do 2º sorteio.</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
                <div className="text-2xl font-bold w-20 text-center" style={{ color: COR }}>8%</div>
                <div>
                  <div className="font-semibold text-foreground">3ª faixa – Quadra (4 acertos)</div>
                  <div className="text-sm">Percentual do prêmio bruto destinado à quadra do 2º sorteio.</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
                <div className="text-2xl font-bold w-20 text-center" style={{ color: COR }}>4%</div>
                <div>
                  <div className="font-semibold text-foreground">4ª faixa – Terno (3 acertos)</div>
                  <div className="text-sm">Percentual do prêmio bruto destinado ao terno do 2º sorteio.</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 border rounded-lg bg-amber-500/10 border-amber-500/30">
                <div className="text-2xl font-bold text-amber-600 w-20 text-center">16%</div>
                <div>
                  <div className="font-semibold text-foreground">Reserva — Dupla de Páscoa</div>
                  <div className="text-sm">Acumulados para a 1ª faixa do 1º sorteio do concurso especial Dupla de Páscoa.</div>
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs border-t pt-4">
            Percentuais vigentes desde 2016 (8 faixas). Os totais somam 100% do prêmio bruto: 52% para o 1º sorteio,
            32% para o 2º sorteio e 16% para a Dupla de Páscoa. Entre 2010–2016 (6 faixas) os percentuais do 2º sorteio
            eram: Sena 20%, Quina 15%, Quadra 10%. Entre 2001–2010 (4 faixas): Sena 30%, Quina 20%, Quadra 20%.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Probabilidades</CardTitle>
          <CardDescription>Probabilidades de acerto para uma aposta simples de 6 dezenas, por sorteio.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <SectionLabel>1º Sorteio</SectionLabel>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-center">Acertos</TableHead>
                    <TableHead className="text-right">Probabilidade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {FAIXAS_1.map((acertos) => (
                    <TableRow key={acertos}>
                      <TableCell className="text-center font-bold" style={{ color: COR }}>{acertos}</TableCell>
                      <TableCell className="text-right font-mono text-xs text-muted-foreground tabular-nums">{probDuplasena(acertos)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div>
            <SectionLabel>2º Sorteio</SectionLabel>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-center">Acertos</TableHead>
                    <TableHead className="text-right">Probabilidade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {FAIXAS_2.map((acertos) => (
                    <TableRow key={acertos}>
                      <TableCell className="text-center font-bold" style={{ color: COR }}>{acertos}</TableCell>
                      <TableCell className="text-right font-mono text-xs text-muted-foreground tabular-nums">{probDuplasena(acertos)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Probabilidades para uma aposta simples de 6 dezenas, válidas para ambos os sorteios
            (1º e 2º sorteio têm as mesmas probabilidades de acerto).
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Target className="w-5 h-5" style={{ color: COR }} />
            Regras de Acumulação
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4">
          <p>
            <strong>Dentro do mesmo concurso:</strong> Se não houver acertador da sena (6 acertos) no 1º sorteio,
            o prêmio da 1ª faixa passa para o 2º sorteio do mesmo concurso.
          </p>
          <p>
            <strong>Entre concursos:</strong> Se não houver acertador da sena em nenhum dos dois sorteios,
            o valor acumula para o concurso seguinte na 1ª faixa de premiação.
          </p>
          <p>
            <strong>Dupla de Páscoa:</strong> Parte da arrecadação (16% do fundo de prêmios) é reservada
            para o sorteio especial Dupla de Páscoa, realizado uma vez por ano.
          </p>
          <p>
            Os prêmios prescrevem 90 dias após a data do sorteio. Após esse prazo, os valores são
            repassados ao Tesouro Nacional para aplicação no FIES (Fundo de Financiamento Estudantil).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
