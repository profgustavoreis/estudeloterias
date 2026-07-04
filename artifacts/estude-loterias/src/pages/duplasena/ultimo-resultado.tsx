import { useParams } from "wouter";
import {
  useGetDuplasenaUltimoResultado,
  useGetDuplasenaResultadoConcurso,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDateShort } from "@/lib/formatters";
import { LotteryBall } from "@/components/ui/lottery-ball";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdUnit } from "@/components/ui/AdUnit";
import { ConcursoNavigator } from "@/components/ui/ConcursoNavigator";
import type { ResultadoDuplasena } from "@workspace/api-client-react";
import { PageSEO } from "@/components/seo/PageSEO";

const COR = "#a61324";
const BALL_BG = "#a61324";
const BALL_BG_LIGHT = "#c43142";
const BALL_TEXT = "#ffffff";

function isMoldura(n: number): boolean {
  return n <= 10 || n >= 41 || n % 10 === 1 || n % 10 === 0;
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
  if (x >= 100) return `1 em ${Math.round(x).toLocaleString("pt-BR")}`;
  if (x >= 10) return `1 em ${Math.round(x).toLocaleString("pt-BR")}`;
  return `1 em ${x.toFixed(2).replace(".", ",")}`;
}

function extractAcertos(descricao: string, idx: number): number {
  const match = descricao.match(/(\d+)/);
  if (match) return parseInt(match[1], 10);
  return Math.max(6 - idx, 3);
}

function isPrime(n: number): boolean {
  if (n < 2) return false;
  for (let i = 2; i <= Math.sqrt(n); i++) if (n % i === 0) return false;
  return true;
}

const PRIMOS = new Set([2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79]);
const FIBONACCI = new Set([1, 2, 3, 5, 8, 13, 21, 34, 55]);
const TRIANGULARES = new Set([1, 3, 6, 10, 15, 21, 28, 36, 45, 55, 66, 78]);

function calcStats(dezenas: string[]) {
  const nums = dezenas.map(Number);
  const soma = nums.reduce((a, b) => a + b, 0);
  const media = soma / nums.length;
  const variance = nums.reduce((a, b) => a + (b - media) ** 2, 0) / nums.length;
  return { soma, media, desvio: Math.sqrt(variance) };
}

function Balls({ dezenas, size = "md", color }: { dezenas: string[]; size?: "sm" | "md" | "lg"; color?: string }) {
  return (
    <div className="flex flex-wrap gap-1">
      {dezenas.map((d, i) => (
        <LotteryBall key={i} number={d} size={size} color={color ?? BALL_BG} textColor={BALL_TEXT} />
      ))}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
      {children}
    </p>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b last:border-b-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-bold tabular-nums">{value}</span>
    </div>
  );
}

function DezenasCard({ resultado }: { resultado: ResultadoDuplasena }) {
  const dezenasOrdem1 = resultado.dezenasOrdem?.slice(0, 6);
  const dezenasOrdem2 = resultado.dezenasOrdem?.slice(6);
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Dezenas Sorteadas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 flex-1">
        <div>
          <SectionLabel>1º Sorteio — Em ordem crescente</SectionLabel>
          <Balls dezenas={resultado.dezenas} size="md" />
        </div>
        {resultado.dezenas2 && resultado.dezenas2.length > 0 && (
          <div>
            <SectionLabel>2º Sorteio — Em ordem crescente</SectionLabel>
            <Balls dezenas={resultado.dezenas2} size="md" />
          </div>
        )}

        <div className="border-t border-muted-foreground/60" />

        {dezenasOrdem1 && dezenasOrdem1.length > 0 && (
          <div>
            <SectionLabel>1º Sorteio — Na ordem do sorteio</SectionLabel>
            <Balls dezenas={dezenasOrdem1} size="md" color={BALL_BG_LIGHT} />
          </div>
        )}
        {dezenasOrdem2 && dezenasOrdem2.length > 0 && (
          <div>
            <SectionLabel>2º Sorteio — Na ordem do sorteio</SectionLabel>
            <Balls dezenas={dezenasOrdem2} size="md" color={BALL_BG_LIGHT} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ParesImparesCard({ dezenas, dezenas2 }: { dezenas: string[]; dezenas2?: string[] }) {
  const pares = dezenas.filter(d => Number(d) % 2 === 0);
  const impares = dezenas.filter(d => Number(d) % 2 !== 0);
  const pares2 = dezenas2?.filter(d => Number(d) % 2 === 0);
  const impares2 = dezenas2?.filter(d => Number(d) % 2 !== 0);
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2"><CardTitle className="text-base">Pares e Ímpares</CardTitle></CardHeader>
      <CardContent className="space-y-4 flex-1">
        <div>
          <SectionLabel>1º Sorteio</SectionLabel>
          <div className="mb-5">
            <div className="text-sm text-muted-foreground mb-2">Pares: {pares.length}</div>
            {pares.length > 0 && <Balls dezenas={pares} size="sm" />}
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-2">Ímpares: {impares.length}</div>
            {impares.length > 0 && <Balls dezenas={impares} size="sm" />}
          </div>
        </div>
        {dezenas2 && dezenas2.length > 0 && (
          <>
            <div className="border-t border-muted-foreground/60" />
            <div>
              <SectionLabel>2º Sorteio</SectionLabel>
              <div className="mb-5">
                <div className="text-sm text-muted-foreground mb-2">Pares: {pares2!.length}</div>
                {pares2!.length > 0 && <Balls dezenas={pares2!} size="sm" />}
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-2">Ímpares: {impares2!.length}</div>
                {impares2!.length > 0 && <Balls dezenas={impares2!} size="sm" />}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function MolduraRetratoCard({ dezenas, dezenas2 }: { dezenas: string[]; dezenas2?: string[] }) {
  const moldura = dezenas.filter(d => isMoldura(Number(d)));
  const retrato = dezenas.filter(d => !isMoldura(Number(d)));
  const moldura2 = dezenas2?.filter(d => isMoldura(Number(d)));
  const retrato2 = dezenas2?.filter(d => !isMoldura(Number(d)));
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2"><CardTitle className="text-base">Moldura e Retrato</CardTitle></CardHeader>
      <CardContent className="space-y-4 flex-1">
        <div>
          <SectionLabel>1º Sorteio</SectionLabel>
          <div className="mb-5">
            <div className="text-sm text-muted-foreground mb-2">Moldura: {moldura.length}</div>
            {moldura.length > 0 && <Balls dezenas={moldura} size="sm" />}
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-2">Retrato: {retrato.length}</div>
            {retrato.length > 0 && <Balls dezenas={retrato} size="sm" />}
          </div>
        </div>
        {dezenas2 && dezenas2.length > 0 && (
          <>
            <div className="border-t border-muted-foreground/60" />
            <div>
              <SectionLabel>2º Sorteio</SectionLabel>
              <div className="mb-5">
                <div className="text-sm text-muted-foreground mb-2">Moldura: {moldura2!.length}</div>
                {moldura2!.length > 0 && <Balls dezenas={moldura2!} size="sm" />}
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-2">Retrato: {retrato2!.length}</div>
                {retrato2!.length > 0 && <Balls dezenas={retrato2!} size="sm" />}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function IndicesMathCard({ dezenas, dezenas2 }: { dezenas: string[]; dezenas2?: string[] }) {
  const stats1 = calcStats(dezenas);
  const stats2 = dezenas2 ? calcStats(dezenas2) : null;
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2"><CardTitle className="text-base">Índices Matemáticos</CardTitle></CardHeader>
      <CardContent className="flex-1">
        <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">1º Sorteio</div>
        <StatRow label="Soma das dezenas" value={stats1.soma.toLocaleString("pt-BR")} />
        <StatRow label="Média aritmética" value={stats1.media.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 2 })} />
        <StatRow label="Desvio-padrão" value={stats1.desvio.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} />
        {stats2 && (
          <>
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 mt-4">2º Sorteio</div>
            <StatRow label="Soma das dezenas" value={stats2.soma.toLocaleString("pt-BR")} />
            <StatRow label="Média aritmética" value={stats2.media.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 2 })} />
            <StatRow label="Desvio-padrão" value={stats2.desvio.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} />
          </>
        )}
      </CardContent>
    </Card>
  );
}

function RepeticoesCard({ concurso, dezenas, dezenas2 }: { concurso: number; dezenas: string[]; dezenas2?: string[] }) {
  const { data: prev } = useGetDuplasenaResultadoConcurso(concurso - 1);
  const prevSet = new Set(prev?.dezenas ?? []);
  const prevSet2 = new Set(prev?.dezenas2 ?? []);
  const repetidas = dezenas.filter(d => prevSet.has(d));
  const novas = dezenas.filter(d => !prevSet.has(d));
  const repetidas2 = dezenas2?.filter(d => prevSet2.has(d));
  const novas2 = dezenas2?.filter(d => !prevSet2.has(d));
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2"><CardTitle className="text-base">Repetições</CardTitle></CardHeader>
      <CardContent className="space-y-4 flex-1">
        <div>
          <SectionLabel>1º Sorteio</SectionLabel>
          <div className="mb-5">
            <div className="text-sm text-muted-foreground mb-2">Repetidas do concurso anterior: {prev ? repetidas.length : "–"}</div>
            {prev && repetidas.length > 0 && <Balls dezenas={repetidas} size="sm" />}
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-2">Dezenas novas: {prev ? novas.length : "–"}</div>
            {prev && novas.length > 0 && <Balls dezenas={novas} size="sm" />}
          </div>
        </div>
        {dezenas2 && dezenas2.length > 0 && (
          <>
            <div className="border-t border-muted-foreground/60" />
            <div>
              <SectionLabel>2º Sorteio</SectionLabel>
              <div className="mb-5">
                <div className="text-sm text-muted-foreground mb-2">Repetidas do concurso anterior: {prev ? repetidas2!.length : "–"}</div>
                {prev && repetidas2!.length > 0 && <Balls dezenas={repetidas2!} size="sm" />}
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-2">Dezenas novas: {prev ? novas2!.length : "–"}</div>
                {prev && novas2!.length > 0 && <Balls dezenas={novas2!} size="sm" />}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function PadroesCard({ dezenas, dezenas2 }: { dezenas: string[]; dezenas2?: string[] }) {
  const primos = dezenas.filter(d => PRIMOS.has(Number(d)));
  const fibonacci = dezenas.filter(d => FIBONACCI.has(Number(d)));
  const triangulares = dezenas.filter(d => TRIANGULARES.has(Number(d)));
  const primos2 = dezenas2?.filter(d => PRIMOS.has(Number(d)));
  const fibonacci2 = dezenas2?.filter(d => FIBONACCI.has(Number(d)));
  const triangulares2 = dezenas2?.filter(d => TRIANGULARES.has(Number(d)));
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2"><CardTitle className="text-base">Padrões Matemáticos</CardTitle></CardHeader>
      <CardContent className="space-y-4 flex-1">
        <div>
          <SectionLabel>1º Sorteio</SectionLabel>
          <div className="mb-5">
            <div className="text-sm text-muted-foreground mb-2">Primos: {primos.length}</div>
            {primos.length > 0 && <Balls dezenas={primos} size="sm" />}
          </div>
          <div className="mb-5">
            <div className="text-sm text-muted-foreground mb-2">Fibonacci: {fibonacci.length}</div>
            {fibonacci.length > 0 && <Balls dezenas={fibonacci} size="sm" />}
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-2">Triangulares: {triangulares.length}</div>
            {triangulares.length > 0 && <Balls dezenas={triangulares} size="sm" />}
          </div>
        </div>
        {dezenas2 && dezenas2.length > 0 && (
          <>
            <div className="border-t border-muted-foreground/60" />
            <div>
              <SectionLabel>2º Sorteio</SectionLabel>
              <div className="mb-5">
                <div className="text-sm text-muted-foreground mb-2">Primos: {primos2!.length}</div>
                {primos2!.length > 0 && <Balls dezenas={primos2!} size="sm" />}
              </div>
              <div className="mb-5">
                <div className="text-sm text-muted-foreground mb-2">Fibonacci: {fibonacci2!.length}</div>
                {fibonacci2!.length > 0 && <Balls dezenas={fibonacci2!} size="sm" />}
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-2">Triangulares: {triangulares2!.length}</div>
                {triangulares2!.length > 0 && <Balls dezenas={triangulares2!} size="sm" />}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function RateioCard({ resultado }: { resultado: ResultadoDuplasena }) {
  // Na era 4 premios (2001–2010) o 1º sorteio só pagava Sena (1 faixa),
  // enquanto o 2º sorteio pagava Sena, Quina e Quadra (3 faixas).
  // Nas eras seguintes as faixas se dividem igualmente entre os sorteios.
  const split = resultado.premios.length <= 4 ? 1 : resultado.premios.length / 2;
  const premios1 = resultado.premios.slice(0, split);
  const premios2 = resultado.premios.slice(split);
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-base">Rateio dos Prêmios</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div>
          <SectionLabel>1º Sorteio</SectionLabel>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Faixa</TableHead>
                  <TableHead className="text-right">Probabilidade</TableHead>
                  <TableHead className="text-right">Ganhadores</TableHead>
                  <TableHead className="text-right">Valor do Prêmio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {premios1.length > 0 ? premios1.map((p, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{p.descricao}</TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground tabular-nums">{probDuplasena(extractAcertos(p.descricao, i))}</TableCell>
                    <TableCell className="text-right">{p.ganhadores.toLocaleString("pt-BR")}</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(p.valorPremio)}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={4} className="text-sm text-muted-foreground text-center py-4">Nenhum prêmio</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        {premios2.length > 0 && (
          <>
            <div>
              <SectionLabel>2º Sorteio</SectionLabel>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Faixa</TableHead>
                      <TableHead className="text-right">Probabilidade</TableHead>
                      <TableHead className="text-right">Ganhadores</TableHead>
                      <TableHead className="text-right">Valor do Prêmio</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {premios2.map((p, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{p.descricao}</TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground tabular-nums">{probDuplasena(extractAcertos(p.descricao, split + i))}</TableCell>
                        <TableCell className="text-right">{p.ganhadores.toLocaleString("pt-BR")}</TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(p.valorPremio)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <p className="mt-3 text-xs text-muted-foreground leading-snug">
                As probabilidades indicadas correspondem a uma aposta simples de 6 dezenas.
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-5 w-56" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[0, 1, 2].map(i => (
          <Card key={i}><CardHeader><Skeleton className="h-5 w-32" /></CardHeader><CardContent><Skeleton className="h-20 w-full" /></CardContent></Card>
        ))}
      </div>
    </div>
  );
}

function ResultadoView({ resultado, latestConcurso }: { resultado: ResultadoDuplasena; latestConcurso: number }) {
  const isLatest = resultado.concurso >= latestConcurso;
  return (
    <div className="space-y-5">
      <PageSEO
        title={`Resultado da Dupla Sena — Concurso ${resultado.concurso} (${resultado.data})`}
        description={`Dezenas sorteadas no concurso ${resultado.concurso} da Dupla Sena em ${resultado.data}: ${resultado.dezenas.join(", ")} (1º sorteio). Confira também o 2º sorteio e estatísticas completas.`}
        canonical={`/duplasena/resultado/${resultado.concurso}`}
      />
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: COR }}>
            Dupla Sena · Concurso {resultado.concurso}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Sorteio realizado dia {formatDateShort(resultado.data)}</p>
        </div>
        <ConcursoNavigator concurso={resultado.concurso} isLatest={isLatest} latestConcurso={latestConcurso} basePath="/duplasena/resultado" color={COR} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DezenasCard resultado={resultado} />
        <ParesImparesCard dezenas={resultado.dezenas} dezenas2={resultado.dezenas2 ?? undefined} />
        <MolduraRetratoCard dezenas={resultado.dezenas} dezenas2={resultado.dezenas2 ?? undefined} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2"><RateioCard resultado={resultado} /></div>
        <div className="flex items-start justify-center">
          <AdUnit slot="9988776622" format="rectangle" className="w-full max-w-sm" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <IndicesMathCard dezenas={resultado.dezenas} dezenas2={resultado.dezenas2 ?? undefined} />
        <RepeticoesCard concurso={resultado.concurso} dezenas={resultado.dezenas} dezenas2={resultado.dezenas2 ?? undefined} />
        <PadroesCard dezenas={resultado.dezenas} dezenas2={resultado.dezenas2 ?? undefined} />
      </div>
    </div>
  );
}

function LatestResultado() {
  const { data, isLoading, isError } = useGetDuplasenaUltimoResultado();
  if (isLoading) return <LoadingSkeleton />;
  if (isError || !data) return <div className="text-sm text-muted-foreground">Erro ao carregar o resultado.</div>;
  return <ResultadoView resultado={data} latestConcurso={data.concurso} />;
}

function ConcursoResultado({ concurso }: { concurso: number }) {
  const { data, isLoading, isError } = useGetDuplasenaResultadoConcurso(concurso);
  const { data: latest } = useGetDuplasenaUltimoResultado();
  if (isLoading) return <LoadingSkeleton />;
  if (isError || !data) return <div className="text-sm text-muted-foreground">Concurso {concurso} não encontrado.</div>;
  return <ResultadoView resultado={data} latestConcurso={latest?.concurso ?? concurso} />;
}

export default function DuplasenaUltimoResultado() {
  const params = useParams<{ concurso?: string }>();
  const concursoNum = params.concurso ? Number(params.concurso) : undefined;
  if (concursoNum) return <ConcursoResultado concurso={concursoNum} />;
  return <LatestResultado />;
}
