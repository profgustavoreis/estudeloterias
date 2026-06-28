import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useGetLotofacilUltimoResultado, useGetLotofacilResultadoConcurso } from "@workspace/api-client-react";
import type { ResultadoLotofacil } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LotteryBall } from "@/components/ui/lottery-ball";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDateShort } from "@/lib/formatters";
import { CheckCircle2, ClipboardCheck, Loader2, RotateCcw, XCircle, ChevronDown, Trophy } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";

const COR = "#930089";
const PRECO_SIMPLES = 3.0;

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
  quinze: number;
  quatorze: number;
  treze: number;
  doze: number;
  onze: number;
}

function calcular(N: number, K: number): Premiacao {
  const NK = N - K;
  return {
    apostasSimples: C(N, 15),
    valorAposta: C(N, 15) * PRECO_SIMPLES,
    quinze:   C(K, 15),
    quatorze: C(K, 14) * C(NK, 1),
    treze:    C(K, 13) * C(NK, 2),
    doze:     C(K, 12) * C(NK, 3),
    onze:     C(K, 11) * C(NK, 4),
  };
}

function Legenda() {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-1.5 pt-2 border-t text-xs text-muted-foreground">
      {[
        { bg: COR,         text: "text-white", icon: <CheckCircle2 className="w-3 h-3" />, label: "Acerto" },
        { bg: "bg-destructive", text: "text-white", icon: <XCircle className="w-3 h-3" />, label: "Erro" },
        { bg: null, text: null, icon: null, label: "Sorteada (não marcada)" },
      ].map(({ bg, text, icon, label }) => (
        <span key={label} className="flex items-center gap-1.5">
          <span className={cn("w-5 h-5 rounded flex items-center justify-center font-bold", typeof bg === "string" && bg.startsWith("bg-") ? bg : "", text ?? "")}
            style={bg && !bg.startsWith("bg-") ? { backgroundColor: bg + "26", color: bg, border: `1px solid ${bg}66` } : bg && !bg.startsWith("#") ? {} : {}}>
            {icon ?? <span className="text-[9px]">◉</span>}
          </span>
          {label}
        </span>
      ))}
    </div>
  );
}

function ResultadoCard({ resultado, selecionadas }: { resultado: ResultadoLotofacil; selecionadas: Set<number> }) {
  const sorteadasNums = resultado.dezenas.map(d => parseInt(d, 10));
  const acertadas = new Set(sorteadasNums.filter(d => selecionadas.has(d)));
  const N = selecionadas.size;
  const K = acertadas.size;
  const isMultipla = N > 15;
  const premiacao = calcular(N, K);

  const prFaixa = (faixa: number) => resultado.premios.find(p => p.faixa === faixa);
  const p1 = prFaixa(1), p2 = prFaixa(2), p3 = prFaixa(3), p4 = prFaixa(4), p5 = prFaixa(5);

  const totalPremio =
    premiacao.quinze   * (p1?.valorPremio ?? 0) +
    premiacao.quatorze * (p2?.valorPremio ?? 0) +
    premiacao.treze    * (p3?.valorPremio ?? 0) +
    premiacao.doze     * (p4?.valorPremio ?? 0) +
    premiacao.onze     * (p5?.valorPremio ?? 0);

  const temPremio = K >= 11;

  const rowsMultipla = [
    { faixa: "15 acertos", qtd: premiacao.quinze,   premio: p1, show: K >= 15 },
    { faixa: "14 acertos", qtd: premiacao.quatorze, premio: p2, show: K >= 14 },
    { faixa: "13 acertos", qtd: premiacao.treze,    premio: p3, show: K >= 13 },
    { faixa: "12 acertos", qtd: premiacao.doze,     premio: p4, show: K >= 12 },
    { faixa: "11 acertos", qtd: premiacao.onze,     premio: p5, show: K >= 11 },
  ].filter(r => r.show);

  const rowSimples =
    K === 15 ? { faixa: "15 acertos", premio: p1 } :
    K === 14 ? { faixa: "14 acertos", premio: p2 } :
    K === 13 ? { faixa: "13 acertos", premio: p3 } :
    K === 12 ? { faixa: "12 acertos", premio: p4 } :
    K === 11 ? { faixa: "11 acertos", premio: p5 } : null;

  return (
    <Card className="border-t-4" style={{ borderTopColor: COR }}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Resultado da conferência</CardTitle>
        <CardDescription>
          {isMultipla
            ? `Aposta múltipla de ${N} dezenas · ${premiacao.apostasSimples} apostas simples · ${formatCurrency(premiacao.valorAposta)}`
            : `Aposta simples de 15 dezenas · ${formatCurrency(PRECO_SIMPLES)}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Acertos ({K})</p>
            <div className="flex flex-wrap gap-1.5">
              {K === 0 ? <span className="text-sm text-muted-foreground">—</span> : (
                Array.from(acertadas).sort((a, b) => a - b).map(d => (
                  <span key={d} className="inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white" style={{ backgroundColor: COR }}>
                    {String(d).padStart(2, "0")}
                  </span>
                ))
              )}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Erros ({N - K})</p>
            <div className="flex flex-wrap gap-1.5">
              {N - K === 0 ? <span className="text-sm text-muted-foreground">—</span> : (
                Array.from(selecionadas).sort((a, b) => a - b).filter(d => !acertadas.has(d)).map(d => (
                  <span key={d} className="inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white bg-destructive">
                    {String(d).padStart(2, "0")}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

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
                      {rowsMultipla.map(({ faixa, qtd, premio }) => (
                        <TableRow key={faixa}>
                          <TableCell className="font-medium py-2">{faixa}</TableCell>
                          <TableCell className="text-center py-2 font-bold" style={{ color: qtd > 0 ? COR : undefined }}>{qtd > 0 ? qtd : "—"}</TableCell>
                          <TableCell className="text-right py-2 text-muted-foreground">{premio?.valorPremio ? formatCurrency(premio.valorPremio) : "—"}</TableCell>
                          <TableCell className="text-right py-2 font-semibold">{qtd > 0 && premio?.valorPremio ? formatCurrency(qtd * premio.valorPremio) : "—"}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="border-t-2 bg-muted/20">
                        <TableCell className="py-2 font-bold">Total</TableCell>
                        <TableCell className="py-2" /><TableCell className="py-2" />
                        <TableCell className="text-right py-2 font-black" style={{ color: totalPremio > 0 ? COR : undefined }}>
                          {totalPremio > 0 ? formatCurrency(totalPremio) : "—"}
                        </TableCell>
                      </TableRow>
                    </>
                  ) : rowSimples ? (
                    <TableRow>
                      <TableCell className="font-medium py-2">{rowSimples.faixa}</TableCell>
                      <TableCell className="text-center py-2 font-bold" style={{ color: COR }}>1</TableCell>
                      <TableCell className="text-right py-2 text-muted-foreground">{rowSimples.premio?.valorPremio ? formatCurrency(rowSimples.premio.valorPremio) : "—"}</TableCell>
                      <TableCell className="text-right py-2 font-black" style={{ color: COR }}>{rowSimples.premio?.valorPremio ? formatCurrency(rowSimples.premio.valorPremio) : "—"}</TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
        {!temPremio && <p className="text-sm text-muted-foreground">Nenhuma faixa de premiação atingida (mínimo de 11 acertos).</p>}
      </CardContent>
    </Card>
  );
}

export default function LotofacilConferidor() {
  const [selecionadas, setSelecionadas] = useState<Set<number>>(new Set());
  const [concursoSelected, setConcursoSelected] = useState<number | null>(null);
  const [concursoQuery, setConcursoQuery] = useState<number | null>(null);
  const [infoAberta, setInfoAberta] = useState(false);

  const ultimo = useGetLotofacilUltimoResultado();
  const latestConcurso = ultimo.data?.concurso ?? null;

  useEffect(() => {
    if (latestConcurso != null && concursoSelected === null) setConcursoSelected(latestConcurso);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestConcurso]);

  const effectiveConcurso = concursoSelected ?? latestConcurso;
  const concursoOptions = useMemo(() => latestConcurso ? Array.from({ length: Math.min(latestConcurso, 500) }, (_, i) => latestConcurso - i) : [], [latestConcurso]);

  const concursoResult = useGetLotofacilResultadoConcurso(concursoQuery ?? 0);
  const sorteadasSet = useMemo(() => new Set(concursoResult.data?.dezenas?.map(d => parseInt(d, 10)) ?? []), [concursoResult.data]);

  const count = selecionadas.size;
  const podeConferir = count >= 15;
  const hasResult = concursoResult.isSuccess && concursoResult.data != null && count >= 15;

  const toggleDezena = (n: number) => {
    setSelecionadas(prev => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else if (next.size < 20) next.add(n);
      return next;
    });
  };

  const handleConferir = () => { if (!effectiveConcurso) return; setConcursoQuery(effectiveConcurso); };
  const handleLimpar = () => { setSelecionadas(new Set()); setConcursoSelected(null); setConcursoQuery(null); };

  return (
    <div className="space-y-6">
      <PageSEO
        title="Conferidor de Apostas da Lotofácil"
        description="Confira se sua aposta da Lotofácil ganhou! Escolha suas dezenas, selecione o concurso e veja seus acertos e o prêmio correspondente."
        canonical="/lotofacil/conferidor"
      />
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: COR }}>
          <ClipboardCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: COR }}>Lotofácil · Conferidor de Apostas</h1>
          <p className="text-muted-foreground mt-1">Selecione de 15 a 20 dezenas e confira se sua aposta ganhou.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Volante 5×5 */}
        <Card className="border-t-4" style={{ borderTopColor: COR }}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Escolha suas dezenas</CardTitle>
              <span className={cn("text-sm font-semibold tabular-nums", count < 15 ? "text-muted-foreground" : "")} style={count >= 15 ? { color: COR } : {}}>
                {count}/20
              </span>
            </div>
            <CardDescription>
              Mínimo de 15 • Máximo de 20
              {count >= 20 && <span className="ml-2 text-amber-600 font-medium">Limite atingido</span>}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: 25 }, (_, i) => i + 1).map(n => {
                const sel = selecionadas.has(n);
                const drawn = hasResult && sorteadasSet.has(n);
                const hit   = drawn && sel;
                const miss  = hasResult && sel && !drawn;
                const sorteadaNaoSel = drawn && !sel;

                return (
                  <button
                    key={n}
                    onClick={() => toggleDezena(n)}
                    disabled={!sel && count >= 20}
                    className={cn(
                      "relative aspect-square rounded-md text-sm font-bold transition-all duration-150 select-none",
                      hit         ? "text-white shadow-sm ring-2 scale-105"
                      : miss      ? "bg-destructive text-white scale-105"
                      : sel       ? "text-white shadow-sm ring-2 scale-105"
                      : count >= 20 ? "bg-muted/30 text-muted-foreground/40 cursor-not-allowed"
                      : "bg-muted/60 text-foreground border border-border hover:scale-105"
                    )}
                    style={
                      hit || sel
                        ? { backgroundColor: COR, "--tw-ring-color": COR + "4d" } as React.CSSProperties
                        : sorteadaNaoSel
                        ? { backgroundColor: COR + "26", color: COR, border: `1px solid ${COR}66` }
                        : {}
                    }
                  >
                    {String(n).padStart(2, "0")}
                    {hit && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center pointer-events-none">
                        <CheckCircle2 className="w-3 h-3" style={{ color: COR }} />
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
                  {Array.from(selecionadas).sort((a, b) => a - b).map(n => (
                    <LotteryBall key={n} number={n} size="sm" color={COR} />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Controles */}
        <div className="space-y-4">
          <Card className="bg-muted/20">
            <CardContent className="pt-5 text-sm text-muted-foreground">
              <button className="flex w-full items-center justify-between" onClick={() => setInfoAberta(v => !v)}>
                <span className="font-semibold text-foreground">Como usar o conferidor?</span>
                <ChevronDown className={cn("w-4 h-4 transition-transform shrink-0", infoAberta ? "rotate-180" : "")} />
              </button>
              {infoAberta && (
                <ol className="mt-3 space-y-1.5 list-decimal list-inside">
                  <li>Escolha de 15 a 20 números no volante à esquerda.</li>
                  <li>Selecione o concurso que deseja conferir.</li>
                  <li>Clique em <strong>Conferir Aposta</strong>.</li>
                  <li>Acertos aparecem em roxo, erros em vermelho e dezenas sorteadas não marcadas em roxo claro.</li>
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
                    <Loader2 className="w-4 h-4 animate-spin" /> Carregando concursos…
                  </div>
                ) : (
                  <select
                    value={effectiveConcurso ?? ""}
                    onChange={e => setConcursoSelected(parseInt(e.target.value, 10))}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  >
                    {concursoOptions.map((c, idx) => (
                      <option key={c} value={c}>{c}{idx === 0 ? " (último concurso)" : ""}</option>
                    ))}
                  </select>
                )}
                <p className="text-xs text-muted-foreground">Na Lotofácil, apostas são premiadas a partir de 11 acertos.</p>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleConferir} disabled={!podeConferir || concursoResult.isFetching || !effectiveConcurso}
                  className="flex-1 text-white font-semibold" style={{ backgroundColor: COR }}>
                  {concursoResult.isFetching
                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Conferindo…</>
                    : <><ClipboardCheck className="w-4 h-4 mr-2" />Conferir Aposta</>}
                </Button>
                <Button variant="outline" onClick={handleLimpar} disabled={concursoResult.isFetching}>
                  <RotateCcw className="w-4 h-4 mr-2" />Limpar
                </Button>
              </div>

              {!podeConferir && count > 0 && (
                <p className="text-sm text-amber-600 text-center">Selecione pelo menos {15 - count} dezena{15 - count > 1 ? "s" : ""} para conferir.</p>
              )}
            </CardContent>
          </Card>

          {hasResult && concursoResult.data && (
            <>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Dezenas sorteadas</CardTitle>
                  <CardDescription>Concurso {concursoResult.data.concurso} · {formatDateShort(concursoResult.data.data)}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {concursoResult.data.dezenas.map(d => (
                      <LotteryBall key={d} number={parseInt(d, 10)} size="md" color={COR} />
                    ))}
                  </div>
                </CardContent>
              </Card>
              <ResultadoCard resultado={concursoResult.data} selecionadas={selecionadas} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
