import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  useGetMegaSenaUltimoResultado,
  useGetMegaSenaResultadoConcurso,
} from "@workspace/api-client-react";
import type { ResultadoMegaSena } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LotteryBall } from "@/components/ui/lottery-ball";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDateShort } from "@/lib/formatters";
import { CheckCircle2, ClipboardCheck, Loader2, RotateCcw, XCircle, ChevronDown, Trophy } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";

const COR = "#009640";
const PRECO_APOSTA_SIMPLES = 5.0; // R$ 5,00 por aposta de 6 dezenas

// ── Combinatória ──────────────────────────────────────────────────────────────
function C(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  let r = 1;
  for (let i = 0; i < k; i++) {
    r = (r * (n - i)) / (i + 1);
  }
  return Math.round(r);
}

// Para N dezenas selecionadas com K acertos sobre as 6 sorteadas:
//   senas  = C(K,6)
//   quinas = C(K,5) * C(N-K,1)
//   quadras= C(K,4) * C(N-K,2)
interface PremiacaoMultipla {
  apostasSimples: number;       // C(N,6)
  valorAposta: number;          // apostasSimples * 5,00
  senas: number;
  quinas: number;
  quadras: number;
}

function calcularPremiacaoMultipla(N: number, K: number): PremiacaoMultipla {
  const NK = N - K;
  return {
    apostasSimples: C(N, 6),
    valorAposta: C(N, 6) * PRECO_APOSTA_SIMPLES,
    senas:   C(K, 6),
    quinas:  C(K, 5) * C(NK, 1),
    quadras: C(K, 4) * C(NK, 2),
  };
}

// ── Helpers de label ──────────────────────────────────────────────────────────
function acertosLabel(n: number): { label: string; color: string } {
  if (n === 6) return { label: "Sena!", color: "text-amber-600" };
  if (n === 5) return { label: "Quina!", color: "text-violet-600" };
  if (n === 4) return { label: "Quadra!", color: "text-blue-600" };
  return { label: `${n} acerto${n !== 1 ? "s" : ""}`, color: "text-muted-foreground" };
}

// ── Resultado completo ────────────────────────────────────────────────────────
function ResultadoCard({
  resultado,
  selecionadas,
}: {
  resultado: ResultadoMegaSena;
  selecionadas: Set<number>;
}) {
  const sorteadasNums = resultado.dezenas.map((d) => parseInt(d, 10));
  const acertadas = new Set(sorteadasNums.filter((d) => selecionadas.has(d)));
  const N = selecionadas.size;
  const K = acertadas.size;
  const { label, color } = acertosLabel(K);
  const isMultipla = N > 6;
  const premiacao = calcularPremiacaoMultipla(N, K);

  // prêmios unitários do concurso
  const premioSena   = resultado.premios.find((p) => p.faixa === 1);
  const premioQuina  = resultado.premios.find((p) => p.faixa === 2);
  const premioQuadra = resultado.premios.find((p) => p.faixa === 3);

  const totalPremio =
    premiacao.senas   * (premioSena?.valorPremio   ?? 0) +
    premiacao.quinas  * (premioQuina?.valorPremio  ?? 0) +
    premiacao.quadras * (premioQuadra?.valorPremio ?? 0);

  const temPremio = K >= 4;

  return (
    <Card className="border-t-4" style={{ borderTopColor: COR }}>
      {/* ── Cabeçalho ── */}
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="text-base font-semibold text-muted-foreground">
              Concurso {resultado.concurso} · {formatDateShort(resultado.data)}
            </CardTitle>
            {isMultipla && (
              <CardDescription>
                Aposta de {N} dezenas · {premiacao.apostasSimples} apostas simples ·{" "}
                {formatCurrency(premiacao.valorAposta)}
              </CardDescription>
            )}
          </div>
          <span className={cn("text-2xl font-black shrink-0", color)}>{label}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* ── Dezenas sorteadas ── */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            Dezenas sorteadas
          </p>
          <div className="flex flex-wrap gap-2">
            {sorteadasNums.map((d) => (
              <div key={d} className="relative">
                <LotteryBall
                  number={d}
                  size="md"
                  color={acertadas.has(d) ? COR : "#9ca3af"}
                />
                {acertadas.has(d) && (
                  <CheckCircle2 className="absolute -top-1 -right-1 w-3.5 h-3.5 text-[#009640] bg-white rounded-full" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Suas dezenas: acertos e erros ── */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
              Acertos ({K})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {K === 0 ? (
                <span className="text-sm text-muted-foreground">—</span>
              ) : (
                Array.from(acertadas)
                  .sort((a, b) => a - b)
                  .map((d) => (
                    <span
                      key={d}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: COR }}
                    >
                      {String(d).padStart(2, "0")}
                    </span>
                  ))
              )}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
              Erros ({N - K})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {Array.from(selecionadas)
                .sort((a, b) => a - b)
                .filter((d) => !acertadas.has(d))
                .map((d) => (
                  <span
                    key={d}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white bg-gray-400"
                  >
                    {String(d).padStart(2, "0")}
                  </span>
                ))}
            </div>
          </div>
        </div>

        {/* ── Tabela de premiação ── */}
        {temPremio && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5" style={{ color: COR }} />
              {isMultipla ? "Premiação da aposta múltipla" : "Premiação"}
            </p>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="py-2">Faixa</TableHead>
                    <TableHead className="text-center py-2">Apostas premiadas</TableHead>
                    <TableHead className="text-right py-2">Prêmio unitário</TableHead>
                    <TableHead className="text-right py-2">Prêmio total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { faixa: "6 acertos (Sena)",  qtd: premiacao.senas,   premio: premioSena,   show: K >= 6 },
                    { faixa: "5 acertos (Quina)", qtd: premiacao.quinas,  premio: premioQuina,  show: K >= 5 },
                    { faixa: "4 acertos (Quadra)",qtd: premiacao.quadras, premio: premioQuadra, show: K >= 4 },
                  ]
                    .filter((row) => row.show)
                    .map(({ faixa, qtd, premio }) => {
                      const unitario = premio?.valorPremio ?? 0;
                      return (
                        <TableRow key={faixa}>
                          <TableCell className="font-medium py-2">{faixa}</TableCell>
                          <TableCell className="text-center py-2 font-bold" style={{ color: qtd > 0 ? COR : undefined }}>
                            {qtd > 0 ? qtd : "—"}
                          </TableCell>
                          <TableCell className="text-right py-2 text-muted-foreground">
                            {unitario > 0 ? formatCurrency(unitario) : "—"}
                          </TableCell>
                          <TableCell className="text-right py-2 font-semibold">
                            {qtd > 0 && unitario > 0 ? formatCurrency(qtd * unitario) : "—"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  <TableRow className="border-t-2 bg-muted/20 font-semibold">
                    <TableCell className="py-2">Total</TableCell>
                    <TableCell className="py-2" />
                    <TableCell className="py-2" />
                    <TableCell className="text-right py-2 font-black" style={{ color: totalPremio > 0 ? COR : undefined }}>
                      {totalPremio > 0 ? formatCurrency(totalPremio) : "—"}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            {isMultipla && (
              <p className="mt-2 text-xs text-muted-foreground">
                Aposta de {N} dezenas equivale a {premiacao.apostasSimples} apostas simples de 6 dezenas
                {" "}(valor: {formatCurrency(premiacao.valorAposta)}).
              </p>
            )}
          </div>
        )}

        {!temPremio && (
          <p className="text-sm text-muted-foreground">
            Nenhuma faixa de premiação atingida (mínimo de 4 acertos).
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function MegaSenaConferidor() {
  const [selecionadas, setSelecionadas] = useState<Set<number>>(new Set());
  const [concursoInput, setConcursoInput] = useState("");
  const [concursoQuery, setConcursoQuery] = useState<number | null>(null);
  const [infoAberta, setInfoAberta] = useState(false);

  const ultimo = useGetMegaSenaUltimoResultado();
  const latestConcurso = ultimo.data?.concurso;

  const concursoResult = useGetMegaSenaResultadoConcurso(concursoQuery ?? 0);

  const count = selecionadas.size;
  const podeConferir = count >= 6;
  const hasResult = concursoResult.isSuccess && concursoResult.data != null && count >= 6;

  const toggleDezena = (n: number) => {
    setSelecionadas((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else if (next.size < 20) next.add(n);
      return next;
    });
  };

  const handleConferir = () => {
    const raw = concursoInput.trim();
    const num = raw ? parseInt(raw, 10) : (latestConcurso ?? null);
    if (!num || isNaN(num)) return;
    setConcursoQuery(num);
  };

  const handleLimpar = () => {
    setSelecionadas(new Set());
    setConcursoInput("");
    setConcursoQuery(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleConferir();
  };

  const usarUltimo = () => {
    if (latestConcurso) {
      setConcursoInput(String(latestConcurso));
    }
  };

  return (
    <div className="space-y-6">
      <PageSEO
        title="Conferidor de Apostas da Mega-Sena"
        description="Confira se sua aposta da Mega-Sena ganhou! Digite suas dezenas, escolha o concurso e veja instantaneamente seus acertos, apostas múltiplas e o prêmio correspondente."
        canonical="/mega-sena/conferidor"
      />

      {/* ── Header ── */}
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center text-white flex-shrink-0"
          style={{ backgroundColor: COR }}
        >
          <ClipboardCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: COR }}>
            Mega-Sena · Conferidor de Apostas
          </h1>
          <p className="text-muted-foreground mt-1">
            Selecione de 6 a 20 dezenas e confira se sua aposta ganhou.
          </p>
        </div>
      </div>

      {/* ── Layout 1/2 + 1/2 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Coluna 1: Volante ── */}
        <Card className="border-t-4" style={{ borderTopColor: COR }}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Escolha suas dezenas</CardTitle>
              <span className={cn(
                "text-sm font-semibold tabular-nums",
                count < 6 ? "text-muted-foreground" : "text-[#009640]"
              )}>
                {count}/20
              </span>
            </div>
            <CardDescription>
              Mínimo de 6 • Máximo de 20
              {count >= 20 && (
                <span className="ml-2 text-amber-600 font-medium">Limite atingido</span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-10 gap-1.5">
              {Array.from({ length: 60 }, (_, i) => i + 1).map((n) => {
                const sel = selecionadas.has(n);
                // when result is shown: green = hit, red = miss, unsel = gray
                const hit = hasResult && sel && concursoResult.data!.dezenas.includes(String(n).padStart(2, "0"));
                const miss = hasResult && sel && !concursoResult.data!.dezenas.includes(String(n).padStart(2, "0"));
                return (
                  <button
                    key={n}
                    onClick={() => toggleDezena(n)}
                    disabled={!sel && count >= 20}
                    className={cn(
                      "aspect-square rounded-md text-sm font-bold transition-all duration-150 select-none",
                      hit
                        ? "bg-[#009640] text-white shadow-sm ring-2 ring-[#009640]/30 scale-105"
                        : miss
                        ? "bg-destructive text-white scale-105"
                        : sel
                        ? "bg-[#009640] text-white shadow-sm ring-2 ring-[#009640]/30 scale-105"
                        : count >= 20
                        ? "bg-muted/30 text-muted-foreground/40 cursor-not-allowed"
                        : "bg-muted/60 text-foreground hover:bg-[#009640]/15 hover:text-[#009640] hover:scale-105 border border-border"
                    )}
                  >
                    {String(n).padStart(2, "0")}
                  </button>
                );
              })}
            </div>

            {count > 0 && (
              <div className="pt-2 border-t space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">Dezenas escolhidas:</p>
                <div className="flex flex-wrap gap-1.5">
                  {Array.from(selecionadas)
                    .sort((a, b) => a - b)
                    .map((n) => (
                      <LotteryBall key={n} number={n} size="sm" />
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Coluna 2: Controles ── */}
        <div className="space-y-4">

          {/* Accordion "Como usar" */}
          <Card className="bg-muted/20">
            <CardContent className="pt-5 text-sm text-muted-foreground">
              <button
                className="flex w-full items-center justify-between"
                onClick={() => setInfoAberta((v) => !v)}
              >
                <span className="font-semibold text-foreground">Como usar o conferidor?</span>
                <ChevronDown className={cn(
                  "w-4 h-4 transition-transform shrink-0",
                  infoAberta ? "rotate-180" : ""
                )} />
              </button>
              {infoAberta && (
                <ol className="mt-3 space-y-1.5 list-decimal list-inside">
                  <li>Escolha de 6 a 20 números no volante à esquerda.</li>
                  <li>Informe o número do concurso que deseja conferir, ou deixe em branco para usar o último sorteio.</li>
                  <li>Clique em <strong>Conferir aposta</strong> ou pressione Enter.</li>
                  <li>O resultado aparece abaixo com seus acertos destacados e a premiação detalhada.</li>
                  <li>Você pode alterar as dezenas ou o concurso a qualquer momento e conferir novamente.</li>
                </ol>
              )}
            </CardContent>
          </Card>

          {/* Concurso + Botões */}
          <Card>
            <CardContent className="pt-5 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Número do concurso:
                </label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="number"
                    min={1}
                    placeholder={latestConcurso ? `Último: ${latestConcurso}` : "Ex: 3023"}
                    value={concursoInput}
                    onChange={(e) => setConcursoInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="max-w-40"
                  />
                  {latestConcurso && (
                    <button
                      onClick={usarUltimo}
                      className="text-sm font-medium text-muted-foreground hover:text-[#009640] transition-colors whitespace-nowrap"
                    >
                      Usar último
                    </button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Deixe em branco para conferir no último sorteio.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleConferir}
                  disabled={!podeConferir || concursoResult.isFetching}
                  className="flex-1 text-white font-semibold"
                  style={{ backgroundColor: COR }}
                >
                  {concursoResult.isFetching ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Conferindo…</>
                  ) : (
                    <><ClipboardCheck className="w-4 h-4 mr-2" />Conferir aposta</>
                  )}
                </Button>
                <Button variant="outline" onClick={handleLimpar} disabled={concursoResult.isFetching}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Limpar
                </Button>
              </div>

              {!podeConferir && count > 0 && (
                <p className="text-sm text-amber-600 text-center">
                  Selecione pelo menos {6 - count} dezena{6 - count > 1 ? "s" : ""} para conferir.
                </p>
              )}
              {count === 0 && (
                <p className="text-sm text-muted-foreground text-center">
                  Selecione os números e clique em Conferir.
                </p>
              )}
              {concursoResult.isError && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <XCircle className="w-4 h-4 shrink-0" />
                  Concurso não encontrado. Verifique o número informado.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick result summary (no result yet) */}
          {!hasResult && !concursoResult.isFetching && concursoQuery !== null && count >= 6 && concursoResult.isSuccess && (
            <p className="text-sm text-muted-foreground text-center">
              Resultado disponível abaixo.
            </p>
          )}
        </div>
      </div>

      {/* ── Resultado completo (full-width abaixo do grid) ── */}
      {concursoResult.isFetching && (
        <div className="flex items-center gap-3 text-muted-foreground py-4">
          <Loader2 className="w-5 h-5 animate-spin" style={{ color: COR }} />
          <span className="text-sm">Consultando o resultado...</span>
        </div>
      )}
      {hasResult && (
        <ResultadoCard
          resultado={concursoResult.data!}
          selecionadas={selecionadas}
        />
      )}
    </div>
  );
}
