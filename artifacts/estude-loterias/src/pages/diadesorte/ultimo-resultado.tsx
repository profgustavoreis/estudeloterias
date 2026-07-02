import { useParams } from "wouter";
import {
  useGetDiadesorteUltimoResultado,
  useGetDiadesorteResultadoConcurso,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDateShort } from "@/lib/formatters";
import { LotteryBall } from "@/components/ui/lottery-ball";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdUnit } from "@/components/ui/AdUnit";
import { ConcursoNavigator } from "@/components/ui/ConcursoNavigator";
import type { ResultadoDiadesorte } from "@workspace/api-client-react";
import { PageSEO } from "@/components/seo/PageSEO";

const COR = "#cb852b";

function isPrime(n: number): boolean {
  if (n < 2) return false;
  for (let i = 2; i <= Math.sqrt(n); i++) if (n % i === 0) return false;
  return true;
}

const PRIMOS = new Set([2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31]);
const FIBONACCI = new Set([1, 2, 3, 5, 8, 13, 21]);
const TRIANGULARES = new Set([1, 3, 6, 10, 15, 21, 28]);

function calcStats(dezenas: string[]) {
  const nums = dezenas.map(Number);
  const soma = nums.reduce((a, b) => a + b, 0);
  const media = soma / nums.length;
  const variance = nums.reduce((a, b) => a + (b - media) ** 2, 0) / nums.length;
  return { soma, media, desvio: Math.sqrt(variance) };
}

function Balls({ dezenas, size = "md" }: { dezenas: string[]; size?: "sm" | "md" | "lg" }) {
  return (
    <div className="flex flex-wrap gap-1">
      {dezenas.map((d, i) => (
        <LotteryBall key={i} number={d} size={size} color={COR} />
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

function DezenasCard({ resultado }: { resultado: ResultadoDiadesorte }) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Dezenas Sorteadas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 flex-1">
        <div>
          <SectionLabel>Em ordem crescente</SectionLabel>
          <Balls dezenas={resultado.dezenas} size="md" />
        </div>
        {resultado.mesSorte && (
          <div className="pt-2 border-t">
            <SectionLabel>Mês da Sorte</SectionLabel>
            <span className="inline-block text-sm font-bold px-3 py-1 rounded-full text-white" style={{ backgroundColor: COR }}>{resultado.mesSorte}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ParesImparesCard({ dezenas }: { dezenas: string[] }) {
  const pares = dezenas.filter(d => Number(d) % 2 === 0);
  const impares = dezenas.filter(d => Number(d) % 2 !== 0);
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2"><CardTitle className="text-base">Pares e Ímpares</CardTitle></CardHeader>
      <CardContent className="space-y-4 flex-1">
        <div>
          <SectionLabel>Pares: {pares.length}</SectionLabel>
          {pares.length > 0 ? <Balls dezenas={pares} size="sm" /> : <span className="text-sm text-muted-foreground">Nenhum</span>}
        </div>
        <div>
          <SectionLabel>Ímpares: {impares.length}</SectionLabel>
          {impares.length > 0 ? <Balls dezenas={impares} size="sm" /> : <span className="text-sm text-muted-foreground">Nenhum</span>}
        </div>
      </CardContent>
    </Card>
  );
}

function ExtremosCard({ dezenas }: { dezenas: string[] }) {
  const nums = dezenas.map(Number).sort((a, b) => a - b);
  const menor = nums[0];
  const maior = nums[nums.length - 1];
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2"><CardTitle className="text-base">Maior e Menor</CardTitle></CardHeader>
      <CardContent className="space-y-4 flex-1">
        <div>
          <SectionLabel>Menor dezena</SectionLabel>
          <LotteryBall number={menor} size="lg" color={COR} />
        </div>
        <div>
          <SectionLabel>Maior dezena</SectionLabel>
          <LotteryBall number={maior} size="lg" color={COR} />
        </div>
      </CardContent>
    </Card>
  );
}

function IndicesMathCard({ dezenas }: { dezenas: string[] }) {
  const { soma, media, desvio } = calcStats(dezenas);
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2"><CardTitle className="text-base">Índices Matemáticos</CardTitle></CardHeader>
      <CardContent className="flex-1">
        <StatRow label="Soma das dezenas" value={soma.toLocaleString("pt-BR")} />
        <StatRow label="Média aritmética" value={media.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 2 })} />
        <StatRow label="Desvio-padrão" value={desvio.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} />
      </CardContent>
    </Card>
  );
}

function RepeticoesCard({ concurso, dezenas }: { concurso: number; dezenas: string[] }) {
  const { data: prev } = useGetDiadesorteResultadoConcurso(concurso - 1);
  const prevSet = new Set(prev?.dezenas ?? []);
  const repetidas = dezenas.filter(d => prevSet.has(d));
  const novas = dezenas.filter(d => !prevSet.has(d));
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2"><CardTitle className="text-base">Repetições</CardTitle></CardHeader>
      <CardContent className="space-y-4 flex-1">
        <div>
          <SectionLabel>Repetidas do concurso anterior: {prev ? repetidas.length : "–"}</SectionLabel>
          {prev && (repetidas.length > 0 ? <Balls dezenas={repetidas} size="sm" /> : <span className="text-sm text-muted-foreground">Nenhuma</span>)}
        </div>
        <div>
          <SectionLabel>Dezenas novas: {prev ? novas.length : "–"}</SectionLabel>
          {prev && (novas.length > 0 ? <Balls dezenas={novas} size="sm" /> : <span className="text-sm text-muted-foreground">Nenhuma</span>)}
        </div>
      </CardContent>
    </Card>
  );
}

function PadroesCard({ dezenas }: { dezenas: string[] }) {
  const primos = dezenas.filter(d => PRIMOS.has(Number(d)));
  const fibonacci = dezenas.filter(d => FIBONACCI.has(Number(d)));
  const triangulares = dezenas.filter(d => TRIANGULARES.has(Number(d)));
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2"><CardTitle className="text-base">Padrões Matemáticos</CardTitle></CardHeader>
      <CardContent className="space-y-4 flex-1">
        <div>
          <SectionLabel>Números primos: {primos.length}</SectionLabel>
          {primos.length > 0 ? <Balls dezenas={primos} size="sm" /> : <span className="text-sm text-muted-foreground">Nenhum</span>}
        </div>
        <div>
          <SectionLabel>Números de Fibonacci: {fibonacci.length}</SectionLabel>
          {fibonacci.length > 0 ? <Balls dezenas={fibonacci} size="sm" /> : <span className="text-sm text-muted-foreground">Nenhum</span>}
        </div>
        <div>
          <SectionLabel>Números triangulares: {triangulares.length}</SectionLabel>
          {triangulares.length > 0 ? <Balls dezenas={triangulares} size="sm" /> : <span className="text-sm text-muted-foreground">Nenhum</span>}
        </div>
      </CardContent>
    </Card>
  );
}

function RateioCard({ resultado }: { resultado: ResultadoDiadesorte }) {
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-base">Rateio dos Prêmios</CardTitle></CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Faixa</TableHead>
                <TableHead className="text-right">Ganhadores</TableHead>
                <TableHead className="text-right">Valor do Prêmio</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resultado.premios.map((p, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{p.descricao}</TableCell>
                  <TableCell className="text-right">{p.ganhadores.toLocaleString("pt-BR")}</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(p.valorPremio)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
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

function ResultadoView({ resultado, latestConcurso }: { resultado: ResultadoDiadesorte; latestConcurso: number }) {
  const isLatest = resultado.concurso >= latestConcurso;
  return (
    <div className="space-y-5">
      <PageSEO
        title={`Resultado do Dia de Sorte — Concurso ${resultado.concurso} (${resultado.data})`}
        description={`Dezenas sorteadas no concurso ${resultado.concurso} do Dia de Sorte em ${resultado.data}: ${resultado.dezenas.join(", ")}. Confira prêmios e estatísticas completas.`}
        canonical={`/diadesorte/resultado/${resultado.concurso}`}
      />
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: COR }}>
            Dia de Sorte · Concurso {resultado.concurso}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Sorteio realizado dia {formatDateShort(resultado.data)}</p>
        </div>
        <ConcursoNavigator concurso={resultado.concurso} isLatest={isLatest} latestConcurso={latestConcurso} basePath="/diadesorte/resultado" color={COR} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DezenasCard resultado={resultado} />
        <ParesImparesCard dezenas={resultado.dezenas} />
        <ExtremosCard dezenas={resultado.dezenas} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2"><RateioCard resultado={resultado} /></div>
        <div className="flex items-start justify-center">
          <AdUnit slot="9988776622" format="rectangle" className="w-full max-w-sm" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <IndicesMathCard dezenas={resultado.dezenas} />
        <RepeticoesCard concurso={resultado.concurso} dezenas={resultado.dezenas} />
        <PadroesCard dezenas={resultado.dezenas} />
      </div>
    </div>
  );
}

function LatestResultado() {
  const { data, isLoading, isError } = useGetDiadesorteUltimoResultado();
  if (isLoading) return <LoadingSkeleton />;
  if (isError || !data) return <div className="text-sm text-muted-foreground">Erro ao carregar o resultado.</div>;
  return <ResultadoView resultado={data} latestConcurso={data.concurso} />;
}

function ConcursoResultado({ concurso }: { concurso: number }) {
  const { data, isLoading, isError } = useGetDiadesorteResultadoConcurso(concurso);
  const { data: latest } = useGetDiadesorteUltimoResultado();
  if (isLoading) return <LoadingSkeleton />;
  if (isError || !data) return <div className="text-sm text-muted-foreground">Concurso {concurso} não encontrado.</div>;
  return <ResultadoView resultado={data} latestConcurso={latest?.concurso ?? concurso} />;
}

export default function DiaDeSorteUltimoResultado() {
  const params = useParams<{ concurso?: string }>();
  const concursoNum = params.concurso ? Number(params.concurso) : undefined;
  if (concursoNum) return <ConcursoResultado concurso={concursoNum} />;
  return <LatestResultado />;
}
