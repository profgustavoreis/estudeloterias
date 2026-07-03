import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useGetMaismilionariaUltimoResultado, useGetMaismilionariaResultadoConcurso } from "@workspace/api-client-react";
import type { ResultadoMaismilionaria } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LotteryBall } from "@/components/ui/lottery-ball";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDateShort } from "@/lib/formatters";
import { CheckCircle2, ClipboardCheck, Loader2, RotateCcw, XCircle, ChevronDown, Trophy } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";

const COR = "#2E3078";
const BALL_BG = "#2E3078";
const BALL_TEXT = "#ffffff";
const TOTAL_DEZENAS = 6;

// Faixas premiadas da +Milionária: 6→faixa1, 5→faixa2, 4→faixa3, 3→faixa4
const FAIXA_FOR_ACERTOS: Record<number, number> = { 6: 1, 5: 2, 4: 3, 3: 4 };
const FAIXAS_PREMIADAS = new Set([6, 5, 4, 3]);

function Legenda() {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-1.5 pt-2 border-t text-xs text-muted-foreground">
      {[
        { bg: COR, text: "text-white", icon: <CheckCircle2 className="w-3 h-3" />, label: "Acerto" },
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

function ResultadoCard({ resultado, selecionadas }: { resultado: ResultadoMaismilionaria; selecionadas: Set<number> }) {
  const sorteadasNums = resultado.dezenas.map(d => parseInt(d, 10));
  const acertadas = new Set(sorteadasNums.filter(d => selecionadas.has(d)));
  const K = acertadas.size;

  const faixaNum = FAIXA_FOR_ACERTOS[K] ?? null;
  const premio = faixaNum !== null ? resultado.premios.find(p => p.faixa === faixaNum) : undefined;
  const temPremio = FAIXAS_PREMIADAS.has(K);

  const faixaLabel = `${K} acerto${K > 1 ? "s" : ""}`;

  return (
    <Card className="border-t-4" style={{ borderTopColor: COR }}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Resultado da conferência</CardTitle>
        <CardDescription>Aposta de 6 dezenas • {formatCurrency(6)}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Acertos ({K})</p>
            <div className="flex flex-wrap gap-1.5">
              {K === 0 ? <span className="text-sm text-muted-foreground">—</span> : (
                Array.from(acertadas).sort((a, b) => a - b).map(d => (
                  <span key={d} className="inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white" style={{ backgroundColor: COR }}>{String(d).padStart(2, "0")}</span>
                ))
              )}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Erros ({TOTAL_DEZENAS - K})</p>
            <div className="flex flex-wrap gap-1.5">
              {TOTAL_DEZENAS - K === 0 ? <span className="text-sm text-muted-foreground">—</span> : (
                Array.from(selecionadas).sort((a, b) => a - b).filter(d => !acertadas.has(d)).map(d => (
                  <span key={d} className="inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white bg-destructive">{String(d).padStart(2, "0")}</span>
                ))
              )}
            </div>
          </div>
        </div>

        {temPremio && premio ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5" style={{ color: COR }} /> Premiação
            </p>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="py-2">Faixa</TableHead>
                    <TableHead className="text-center py-2">Apostas premiadas</TableHead>
                    <TableHead className="text-right py-2">Prêmio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium py-2">{faixaLabel}</TableCell>
                    <TableCell className="text-center py-2 font-bold" style={{ color: COR }}>1</TableCell>
                    <TableCell className="text-right py-2 font-black" style={{ color: COR }}>{premio.valorPremio ? formatCurrency(premio.valorPremio) : "—"}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Nenhuma faixa de premiação atingida. Na +Milionária, os prêmios são para 6, 5, 4 ou 3 acertos.</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function MaismilionariaConferidor() {
  const [selecionadas, setSelecionadas] = useState<Set<number>>(new Set());
  const [concursoSelected, setConcursoSelected] = useState<number | null>(null);
  const [concursoQuery, setConcursoQuery] = useState<number | null>(null);
  const [infoAberta, setInfoAberta] = useState(false);

  const ultimo = useGetMaismilionariaUltimoResultado();
  const latestConcurso = ultimo.data?.concurso ?? null;

  useEffect(() => {
    if (latestConcurso != null && concursoSelected === null) setConcursoSelected(latestConcurso);
  }, [latestConcurso]);

  const effectiveConcurso = concursoSelected ?? latestConcurso;
  const concursoOptions = useMemo(() => latestConcurso ? Array.from({ length: Math.min(latestConcurso, 500) }, (_, i) => latestConcurso - i) : [], [latestConcurso]);

  const concursoResult = useGetMaismilionariaResultadoConcurso(concursoQuery ?? 0);
  const sorteadasSet = useMemo(() => new Set(concursoResult.data?.dezenas?.map(d => parseInt(d, 10)) ?? []), [concursoResult.data]);

  const count = selecionadas.size;
  const podeConferir = count === TOTAL_DEZENAS;
  const hasResult = concursoResult.isSuccess && concursoResult.data != null && count === TOTAL_DEZENAS;

  const toggleDezena = (n: number) => {
    setSelecionadas(prev => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else if (next.size < TOTAL_DEZENAS) next.add(n);
      return next;
    });
  };

  const handleConferir = () => { if (!effectiveConcurso) return; setConcursoQuery(effectiveConcurso); };
  const handleLimpar = () => { setSelecionadas(new Set()); setConcursoSelected(null); setConcursoQuery(null); };

  return (
    <div className="space-y-6">
      <PageSEO
        title="Conferidor de Apostas da +Milionária"
        description="Confira se sua aposta da +Milionária ganhou! Escolha suas 6 dezenas, selecione o concurso e veja seus acertos e o prêmio correspondente."
        canonical="/maismilionaria/conferidor"
      />
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: COR }}>
          <ClipboardCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: COR }}>+Milionária · Conferidor de Apostas</h1>
          <p className="text-muted-foreground mt-1">Selecione 6 dezenas e confira se sua aposta ganhou.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Volante 5×10 */}
        <Card className="border-t-4" style={{ borderTopColor: COR }}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Escolha suas dezenas</CardTitle>
              <span className={cn("text-sm font-semibold tabular-nums", count < TOTAL_DEZENAS ? "text-muted-foreground" : "")} style={count >= TOTAL_DEZENAS ? { color: COR } : {}}>{count}/{TOTAL_DEZENAS}</span>
            </div>
            <CardDescription>
              Marque exatamente 6 dezenas (01 a 50)
              {count >= TOTAL_DEZENAS && <span className="ml-2 text-amber-600 font-medium">Limite atingido</span>}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-10 gap-1">
              {Array.from({ length: 50 }, (_, i) => i + 1).map(n => {
                const sel = selecionadas.has(n);
                const drawn = hasResult && sorteadasSet.has(n);
                const hit   = drawn && sel;
                const miss  = hasResult && sel && !drawn;
                const sorteadaNaoSel = drawn && !sel;

                return (
                  <button key={n} onClick={() => toggleDezena(n)} disabled={!sel && count >= TOTAL_DEZENAS}
                    className={cn("relative aspect-square rounded text-[10px] font-bold transition-all duration-150 select-none",
                      hit ? "text-white shadow-sm ring-1 scale-105" : miss ? "bg-destructive text-white scale-105" : sel ? "text-white shadow-sm ring-1 scale-105" :
                      count >= TOTAL_DEZENAS ? "bg-muted/30 text-muted-foreground/40 cursor-not-allowed" : "bg-muted/60 text-foreground border border-border hover:scale-105")}
                    style={hit || sel ? { backgroundColor: COR, "--tw-ring-color": COR + "4d" } as React.CSSProperties : sorteadaNaoSel ? { backgroundColor: COR + "26", color: COR, border: `1px solid ${COR}66` } : {}}>
                    {String(n).padStart(2, "0")}
                    {hit && (<span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center pointer-events-none"><CheckCircle2 className="w-3 h-3" style={{ color: COR }} /></span>)}
                    {miss && (<span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center pointer-events-none"><XCircle className="w-3 h-3 text-destructive" /></span>)}
                  </button>
                );
              })}
            </div>

            {hasResult && <Legenda />}

            {count > 0 && (
              <div className="pt-2 border-t space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">Dezenas escolhidas ({count}):</p>
                <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                  {Array.from(selecionadas).sort((a, b) => a - b).map(n => (
                    <LotteryBall key={n} number={n} size="sm" color={BALL_BG} textColor={BALL_TEXT} />
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
                  <li>Marque exatamente 6 números no volante à esquerda (01 a 50).</li>
                  <li>Selecione o concurso que deseja conferir.</li>
                  <li>Clique em <strong>Conferir Aposta</strong>.</li>
                  <li>Acertos aparecem em verde, erros em vermelho e dezenas sorteadas não marcadas em verde claro.</li>
                </ol>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Concurso:</label>
                {ultimo.isLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Carregando concursos…</div>
                ) : (
                  <select value={effectiveConcurso ?? ""} onChange={e => setConcursoSelected(parseInt(e.target.value, 10))} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2">
                    {concursoOptions.map((c, idx) => (<option key={c} value={c}>{c}{idx === 0 ? " (último concurso)" : ""}</option>))}
                  </select>
                )}
                <p className="text-xs text-muted-foreground">Na +Milionária, apostas são premiadas com 6, 5, 4 ou 3 acertos.</p>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleConferir} disabled={!podeConferir || concursoResult.isFetching || !effectiveConcurso} className="flex-1 text-white font-semibold" style={{ backgroundColor: COR }}>
                  {concursoResult.isFetching ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Conferindo…</> : <><ClipboardCheck className="w-4 h-4 mr-2" />Conferir Aposta</>}
                </Button>
                <Button variant="outline" onClick={handleLimpar} disabled={concursoResult.isFetching}><RotateCcw className="w-4 h-4 mr-2" />Limpar</Button>
              </div>

              {!podeConferir && count > 0 && <p className="text-sm text-amber-600 text-center">Selecione mais {TOTAL_DEZENAS - count} dezena{TOTAL_DEZENAS - count > 1 ? "s" : ""} para conferir.</p>}
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
                  <div className="flex flex-wrap gap-1">
                    {concursoResult.data.dezenas.map(d => (
                      <LotteryBall key={d} number={parseInt(d, 10)} size="sm" color={BALL_BG} textColor={BALL_TEXT} />
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
