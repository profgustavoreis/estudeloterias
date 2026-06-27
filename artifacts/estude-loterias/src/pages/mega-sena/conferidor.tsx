import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  useGetMegaSenaUltimoResultado,
  useGetMegaSenaResultadoConcurso,
} from "@workspace/api-client-react";
import type { ResultadoMegaSena } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LotteryBall } from "@/components/ui/lottery-ball";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDateShort } from "@/lib/formatters";
import {
  CheckCircle2, ClipboardCheck, Loader2, RotateCcw,
  XCircle, ChevronDown, Trophy,
} from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";
import { AdUnit } from "@/components/ui/AdUnit";

const COR = "#009640";
const PRECO_SIMPLES = 5.0;

// ── Combinatória ──────────────────────────────────────────────────────────────
function C(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  let r = 1;
  for (let i = 0; i < k; i++) r = (r * (n - i)) / (i + 1);
  return Math.round(r);
}

interface Premiacao {
  apostasSimples: number;
  valorAposta: number;
  senas: number;
  quinas: number;
  quadras: number;
}

function calcular(N: number, K: number): Premiacao {
  const NK = N - K;
  return {
    apostasSimples: C(N, 6),
    valorAposta: C(N, 6) * PRECO_SIMPLES,
    senas:   C(K, 6),
    quinas:  C(K, 5) * C(NK, 1),
    quadras: C(K, 4) * C(NK, 2),
  };
}

function acertosLabel(k: number) {
  if (k === 6) return { label: "Sena!",   color: "text-amber-600" };
  if (k === 5) return { label: "Quina!",  color: "text-violet-600" };
  if (k === 4) return { label: "Quadra!", color: "text-blue-600" };
  return { label: `${k} acerto${k !== 1 ? "s" : ""}`, color: "text-muted-foreground" };
}

// ── Legenda da grade ──────────────────────────────────────────────────────────
function Legenda() {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-1.5 pt-2 border-t text-xs text-muted-foreground">
      {[
        {
          bg: "bg-[#009640]", text: "text-white",
          icon: <CheckCircle2 className="w-3 h-3" />,
          label: "Acerto",
        },
        {
          bg: "bg-destructive", text: "text-white",
          icon: <XCircle className="w-3 h-3" />,
          label: "Erro",
        },
        {
          bg: "bg-[#009640]/15 border border-[#009640]/40", text: "text-[#009640]",
          icon: null,
          label: "Sorteada (não marcada)",
        },
      ].map(({ bg, text, icon, label }) => (
        <span key={label} className="flex items-center gap-1.5">
          <span className={cn("w-5 h-5 rounded flex items-center justify-center font-bold", bg, text)}>
            {icon ?? <span className="text-[9px]">◉</span>}
          </span>
          {label}
        </span>
      ))}
    </div>
  );
}

// ── Widget 1: Dezenas sorteadas ───────────────────────────────────────────────
function ConcursoCard({ resultado }: { resultado: ResultadoMegaSena }) {
  const sorteadasNums = resultado.dezenas.map((d) => parseInt(d, 10));
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-muted-foreground">
          Concurso {resultado.concurso} · {formatDateShort(resultado.data)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {sorteadasNums.map((d) => (
            <LotteryBall key={d} number={d} size="md" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Widget 2: Resultado da conferência ────────────────────────────────────────
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
  const premiacao = calcular(N, K);

  const premioSena   = resultado.premios.find((p) => p.faixa === 1);
  const premioQuina  = resultado.premios.find((p) => p.faixa === 2);
  const premioQuadra = resultado.premios.find((p) => p.faixa === 3);

  // Acumulação: o concurso não teve ganhador na sena — a aposta não estava
  // registrada na Caixa mesmo que os 6 números coincidam.
  const senaAcumulada =
    premiacao.senas > 0 && (premioSena?.ganhadores ?? 0) === 0;

  const totalPremio =
    premiacao.senas   * (senaAcumulada ? 0 : premioSena?.valorPremio ?? 0) +
    premiacao.quinas  * (premioQuina?.valorPremio  ?? 0) +
    premiacao.quadras * (premioQuadra?.valorPremio ?? 0);

  const temPremio = K >= 4;

  // Rows para aposta múltipla
  const rowsMultipla = [
    { faixa: "6 acertos (Sena)",   qtd: premiacao.senas,   premio: premioSena,   show: K >= 6 },
    { faixa: "5 acertos (Quina)",  qtd: premiacao.quinas,  premio: premioQuina,  show: K >= 5 },
    { faixa: "4 acertos (Quadra)", qtd: premiacao.quadras, premio: premioQuadra, show: K >= 4 },
  ].filter((r) => r.show);

  // Row para aposta simples
  const rowSimples =
    K === 6 ? { faixa: "6 acertos (Sena)",   premio: premioSena,   acumulada: senaAcumulada } :
    K === 5 ? { faixa: "5 acertos (Quina)",  premio: premioQuina,  acumulada: false } :
    K === 4 ? { faixa: "4 acertos (Quadra)", premio: premioQuadra, acumulada: false } :
    null;

  return (
    <Card className="border-t-4" style={{ borderTopColor: COR }}>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <div>
            <CardTitle className="text-base font-semibold">
              Resultado da conferência
            </CardTitle>
            <CardDescription className="mt-0.5">
              {isMultipla
                ? `Aposta múltipla de ${N} dezenas · ${premiacao.apostasSimples} apostas simples · ${formatCurrency(premiacao.valorAposta)}`
                : `Aposta simples de 6 dezenas · ${formatCurrency(PRECO_SIMPLES)}`}
            </CardDescription>
          </div>
          <span className={cn("text-2xl font-black shrink-0", color)}>{label}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Acertos e erros */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
              Acertos ({K})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {K === 0 ? (
                <span className="text-sm text-muted-foreground">—</span>
              ) : (
                Array.from(acertadas).sort((a, b) => a - b).map((d) => (
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
              {N - K === 0 ? (
                <span className="text-sm text-muted-foreground">—</span>
              ) : (
                Array.from(selecionadas)
                  .sort((a, b) => a - b)
                  .filter((d) => !acertadas.has(d))
                  .map((d) => (
                    <span
                      key={d}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white bg-destructive"
                    >
                      {String(d).padStart(2, "0")}
                    </span>
                  ))
              )}
            </div>
          </div>
        </div>

        {/* Tabela de premiação */}
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
                  {isMultipla ? (
                    <>
                      {rowsMultipla.map(({ faixa, qtd, premio }) => {
                        const isSenaRow = faixa.startsWith("6");
                        const showAsterisk = isSenaRow && senaAcumulada;
                        const unit = showAsterisk ? 0 : (premio?.valorPremio ?? 0);
                        return (
                          <TableRow key={faixa}>
                            <TableCell className="font-medium py-2">{faixa}</TableCell>
                            <TableCell className="text-center py-2 font-bold"
                              style={{ color: qtd > 0 ? COR : undefined }}>
                              {qtd > 0 ? (
                                showAsterisk
                                  ? <>{qtd}&thinsp;<span className="text-muted-foreground font-normal text-xs">*</span></>
                                  : qtd
                              ) : "—"}
                            </TableCell>
                            <TableCell className="text-right py-2 text-muted-foreground">
                              {showAsterisk ? "—" : unit > 0 ? formatCurrency(unit) : "—"}
                            </TableCell>
                            <TableCell className="text-right py-2 font-semibold">
                              {showAsterisk ? "—" : qtd > 0 && unit > 0 ? formatCurrency(qtd * unit) : "—"}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      <TableRow className="border-t-2 bg-muted/20">
                        <TableCell className="py-2 font-bold">Total</TableCell>
                        <TableCell className="py-2" />
                        <TableCell className="py-2" />
                        <TableCell className="text-right py-2 font-black"
                          style={{ color: totalPremio > 0 ? COR : undefined }}>
                          {totalPremio > 0 ? formatCurrency(totalPremio) : "—"}
                        </TableCell>
                      </TableRow>
                    </>
                  ) : rowSimples ? (
                    <TableRow>
                      <TableCell className="font-medium py-2">{rowSimples.faixa}</TableCell>
                      <TableCell className="text-center py-2 font-bold" style={{ color: COR }}>
                        {rowSimples.acumulada ? (
                          <>1&thinsp;<span className="text-muted-foreground font-normal text-xs">*</span></>
                        ) : "1"}
                      </TableCell>
                      <TableCell className="text-right py-2 text-muted-foreground">
                        {rowSimples.acumulada ? "—"
                          : rowSimples.premio?.valorPremio ? formatCurrency(rowSimples.premio.valorPremio) : "—"}
                      </TableCell>
                      <TableCell className="text-right py-2 font-black" style={{ color: rowSimples.acumulada ? undefined : COR }}>
                        {rowSimples.acumulada ? "—"
                          : rowSimples.premio?.valorPremio ? formatCurrency(rowSimples.premio.valorPremio) : "—"}
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </div>
            {/* Nota de acumulação */}
            {senaAcumulada && (
              <p className="mt-2 text-xs text-muted-foreground">
                (*) O concurso {resultado.concurso} não teve ganhadores na faixa de 6 acertos.
                A aposta conferida não foi registrada pela Caixa.
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
  const [concursoSelected, setConcursoSelected] = useState<number | null>(null);
  const [concursoQuery, setConcursoQuery] = useState<number | null>(null);
  const [infoAberta, setInfoAberta] = useState(false);

  const ultimo = useGetMegaSenaUltimoResultado();
  const latestConcurso = ultimo.data?.concurso ?? null;

  // Default dropdown to latest when it loads
  useEffect(() => {
    if (latestConcurso != null && concursoSelected === null) {
      setConcursoSelected(latestConcurso);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestConcurso]);

  const effectiveConcurso = concursoSelected ?? latestConcurso;

  const concursoOptions = useMemo(
    () => latestConcurso
      ? Array.from({ length: latestConcurso }, (_, i) => latestConcurso - i)
      : [],
    [latestConcurso]
  );

  const concursoResult = useGetMegaSenaResultadoConcurso(concursoQuery ?? 0);

  const sorteadasSet = useMemo(
    () => new Set(concursoResult.data?.dezenas?.map((d) => parseInt(d, 10)) ?? []),
    [concursoResult.data]
  );

  const count = selecionadas.size;
  const podeConferir = count >= 6;
  const hasResult =
    concursoResult.isSuccess && concursoResult.data != null && count >= 6;

  const toggleDezena = (n: number) => {
    setSelecionadas((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else if (next.size < 20) next.add(n);
      return next;
    });
  };

  const handleConferir = () => {
    if (!effectiveConcurso) return;
    setConcursoQuery(effectiveConcurso);
  };

  const handleLimpar = () => {
    setSelecionadas(new Set());
    setConcursoSelected(null);
    setConcursoQuery(null);
  };

  return (
    <div className="space-y-6">
      <PageSEO
        title="Conferidor de Apostas da Mega-Sena"
        description="Confira se sua aposta da Mega-Sena ganhou! Escolha suas dezenas, selecione o concurso e veja seus acertos, apostas múltiplas e o prêmio correspondente."
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
                const drawn = hasResult && sorteadasSet.has(n);
                const hit  = drawn && sel;
                const miss = hasResult && sel && !drawn;
                const sorteadaNaoSel = drawn && !sel;

                return (
                  <button
                    key={n}
                    onClick={() => toggleDezena(n)}
                    disabled={!sel && count >= 20}
                    className={cn(
                      "relative aspect-square rounded-md text-sm font-bold",
                      "transition-all duration-150 select-none",
                      hit
                        ? "bg-[#009640] text-white shadow-sm ring-2 ring-[#009640]/30 scale-105"
                        : miss
                        ? "bg-destructive text-white scale-105"
                        : sel
                        ? "bg-[#009640] text-white shadow-sm ring-2 ring-[#009640]/30 scale-105"
                        : sorteadaNaoSel
                        ? "bg-[#009640]/15 text-[#009640] border border-[#009640]/40"
                        : count >= 20
                        ? "bg-muted/30 text-muted-foreground/40 cursor-not-allowed"
                        : "bg-muted/60 text-foreground hover:bg-[#009640]/15 hover:text-[#009640] hover:scale-105 border border-border"
                    )}
                  >
                    {String(n).padStart(2, "0")}
                    {hit && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center pointer-events-none">
                        <CheckCircle2 className="w-3 h-3 text-[#009640]" />
                      </span>
                    )}
                    {miss && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center pointer-events-none">
                        <XCircle className="w-3 h-3 text-destructive" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {hasResult && <Legenda />}

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
                  <li>Selecione o concurso que deseja conferir.</li>
                  <li>Clique em <strong>Conferir Aposta</strong>.</li>
                  <li>Acertos aparecem em verde, erros em vermelho e dezenas sorteadas não marcadas em verde claro.</li>
                  <li>Altere as dezenas ou o concurso a qualquer momento e confira novamente.</li>
                </ol>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Concurso:</label>
                {ultimo.isLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Carregando concursos…
                  </div>
                ) : (
                  <select
                    value={effectiveConcurso ?? ""}
                    onChange={(e) => setConcursoSelected(parseInt(e.target.value, 10))}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#009640]"
                  >
                    {concursoOptions.map((c, idx) => (
                      <option key={c} value={c}>
                        {c}{idx === 0 ? " (último concurso)" : ""}
                      </option>
                    ))}
                  </select>
                )}
                <p className="text-xs text-muted-foreground">
                  Na Mega-Sena, apostas são premiadas a partir de 4 acertos.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleConferir}
                  disabled={!podeConferir || concursoResult.isFetching || !effectiveConcurso}
                  className="flex-1 text-white font-semibold"
                  style={{ backgroundColor: COR }}
                >
                  {concursoResult.isFetching ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Conferindo…</>
                  ) : (
                    <><ClipboardCheck className="w-4 h-4 mr-2" />Conferir Aposta</>
                  )}
                </Button>
                <Button variant="outline" onClick={handleLimpar} disabled={concursoResult.isFetching}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Limpar
                </Button>
              </div>

              {!podeConferir && count > 0 && (
                <p className="text-sm text-amber-600 text-center">
                  Selecione pelo menos mais {6 - count} dezena{6 - count > 1 ? "s" : ""} para conferir.
                </p>
              )}
              {count === 0 && (
                <p className="text-sm text-muted-foreground text-center">
                  Selecione os números e clique em Conferir Aposta.
                </p>
              )}
              {concursoResult.isError && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <XCircle className="w-4 h-4 shrink-0" />
                  Erro ao consultar o concurso. Tente novamente.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Resultado (aparece abaixo após conferir) ── */}
      {concursoResult.isFetching && (
        <div className="flex items-center gap-3 text-muted-foreground py-4">
          <Loader2 className="w-5 h-5 animate-spin" style={{ color: COR }} />
          <span className="text-sm">Consultando o resultado…</span>
        </div>
      )}

      {hasResult && (
        <>
          {/* Widget 1: Concurso e dezenas sorteadas (full-width) */}
          <ConcursoCard resultado={concursoResult.data!} />

          {/* Widget 2 (2/3) + Publicidade (1/3) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2">
              <ResultadoCard
                resultado={concursoResult.data!}
                selecionadas={selecionadas}
              />
            </div>
            <div className="flex flex-col gap-4">
              <AdUnit slot="5586112233" format="rectangle" className="w-full" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
