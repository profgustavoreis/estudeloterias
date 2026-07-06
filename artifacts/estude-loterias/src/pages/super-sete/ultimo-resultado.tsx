import { useParams } from "wouter";
import {
  useGetSuperSeteUltimoResultado,
  useGetSuperSeteResultadoConcurso,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDateShort } from "@/lib/formatters";
import { LotteryBall } from "@/components/ui/lottery-ball";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdUnit } from "@/components/ui/AdUnit";
import { ConcursoNavigator } from "@/components/ui/ConcursoNavigator";
import type { ResultadoSuperSete } from "@workspace/api-client-react";
import { PageSEO } from "@/components/seo/PageSEO";

const COR = "#a8cf45";
const BALL_BG = "#a8cf45";
const BALL_TEXT = "#ffffff";

// Super Sete: digits 0-9 per column (7 columns)
const PRIMOS = new Set([2, 3, 5, 7]);
const FIBONACCI = new Set([0, 1, 2, 3, 5, 8]);
const TRIANGULARES = new Set([0, 1, 3, 6]);

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
        <LotteryBall key={i} number={d} size={size} color={BALL_BG} textColor={BALL_TEXT} padDigits={1} />
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

function DezenasCard({ resultado }: { resultado: ResultadoSuperSete }) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Dezenas Sorteadas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 flex-1">
        <div>
          <SectionLabel>Sequência original</SectionLabel>
          <Balls dezenas={resultado.dezenas} size="md" />
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
        <StatRow label="Soma dos números" value={soma.toLocaleString("pt-BR")} />
        <StatRow label="Média aritmética" value={media.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 2 })} />
        <StatRow label="Desvio-padrão" value={desvio.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} />
      </CardContent>
    </Card>
  );
}

function RepeticoesCard({ concurso, dezenas }: { concurso: number; dezenas: string[] }) {
  const { data: prev } = useGetSuperSeteResultadoConcurso(concurso - 1);

  // Métrica 1: dígitos repetidos na mesma posição
  const repetidosPorPosicao = prev
    ? dezenas.filter((d, i) => prev.dezenas[i] === d)
    : [];

  // Métrica 2: dígitos que aparecem em qualquer posição
  const prevSet = new Set(prev?.dezenas ?? []);
  const repetidosQualquerPosicao = prev
    ? [...new Set(dezenas.filter(d => prevSet.has(d)))]
    : [];

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2"><CardTitle className="text-base">Repetições</CardTitle></CardHeader>
      <CardContent className="space-y-4 flex-1">
        <div>
          <SectionLabel>Repetidos por posição: {prev ? repetidosPorPosicao.length : "–"}</SectionLabel>
          {prev && (repetidosPorPosicao.length > 0 ? <Balls dezenas={repetidosPorPosicao} size="sm" /> : <span className="text-sm text-muted-foreground">Nenhum</span>)}
        </div>
        <div>
          <SectionLabel>Repetidos em qualquer posição: {prev ? repetidosQualquerPosicao.length : "–"}</SectionLabel>
          {prev && (repetidosQualquerPosicao.length > 0 ? <Balls dezenas={repetidosQualquerPosicao} size="sm" /> : <span className="text-sm text-muted-foreground">Nenhum</span>)}
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
          <SectionLabel>Primos (2,3,5,7): {primos.length}</SectionLabel>
          {primos.length > 0 ? <Balls dezenas={primos} size="sm" /> : <span className="text-sm text-muted-foreground">Nenhum</span>}
        </div>
        <div>
          <SectionLabel>Fibonacci (0,1,2,3,5,8): {fibonacci.length}</SectionLabel>
          {fibonacci.length > 0 ? <Balls dezenas={fibonacci} size="sm" /> : <span className="text-sm text-muted-foreground">Nenhum</span>}
        </div>
        <div>
          <SectionLabel>Triangulares (0,1,3,6): {triangulares.length}</SectionLabel>
          {triangulares.length > 0 ? <Balls dezenas={triangulares} size="sm" /> : <span className="text-sm text-muted-foreground">Nenhum</span>}
        </div>
      </CardContent>
    </Card>
  );
}

function RateioCard({ resultado }: { resultado: ResultadoSuperSete }) {
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

function ResultadoView({ resultado, latestConcurso }: { resultado: ResultadoSuperSete; latestConcurso: number }) {
  const isLatest = resultado.concurso >= latestConcurso;
  return (
    <div className="space-y-5">
      <PageSEO
        title={`Resultado da Super Sete — Concurso ${resultado.concurso} (${resultado.data})`}
        description={`Dezenas sorteadas no concurso ${resultado.concurso} da Super Sete em ${resultado.data}: ${resultado.dezenas.join(", ")}. Confira prêmios e estatísticas completas.`}
        canonical={`/super-sete/resultado/${resultado.concurso}`}
      />
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: COR }}>
            Super Sete · Concurso {resultado.concurso}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Sorteio realizado dia {formatDateShort(resultado.data)}</p>
        </div>
        <ConcursoNavigator concurso={resultado.concurso} isLatest={isLatest} latestConcurso={latestConcurso} basePath="/super-sete/resultado" color={COR} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DezenasCard resultado={resultado} />
        <IndicesMathCard dezenas={resultado.dezenas} />
        <RepeticoesCard concurso={resultado.concurso} dezenas={resultado.dezenas} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2"><RateioCard resultado={resultado} /></div>
        <div className="flex items-start justify-center">
          <AdUnit slot="9988776622" format="rectangle" className="w-full max-w-sm" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PadroesCard dezenas={resultado.dezenas} />
      </div>
    </div>
  );
}

function LatestResultado() {
  const { data, isLoading, isError } = useGetSuperSeteUltimoResultado();
  if (isLoading) return <LoadingSkeleton />;
  if (isError || !data) return <div className="text-sm text-muted-foreground">Erro ao carregar o resultado.</div>;
  return <ResultadoView resultado={data} latestConcurso={data.concurso} />;
}

function ConcursoResultado({ concurso }: { concurso: number }) {
  const { data, isLoading, isError } = useGetSuperSeteResultadoConcurso(concurso);
  const { data: latest } = useGetSuperSeteUltimoResultado();
  if (isLoading) return <LoadingSkeleton />;
  if (isError || !data) return <div className="text-sm text-muted-foreground">Concurso {concurso} não encontrado.</div>;
  return <ResultadoView resultado={data} latestConcurso={latest?.concurso ?? concurso} />;
}

export default function SuperSeteUltimoResultado() {
  const params = useParams<{ concurso?: string }>();
  const concursoNum = params.concurso ? Number(params.concurso) : undefined;
  if (concursoNum) return <ConcursoResultado concurso={concursoNum} />;
  return <LatestResultado />;
}
