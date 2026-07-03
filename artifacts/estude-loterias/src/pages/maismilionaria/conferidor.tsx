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
const TOTAL_TREVOS = 2;

// Fixed prizes for faixas 5-10 (not returned by the Caixa API)
const FIXED_PRIZES: Record<string, number> = {
  "4+2":  10,
  "4+1 ou 4+0": 6,
  "3+2":  6,
  "3+1":  6,
  "2+2":  6,
  "2+1":  6,
};

function faixaLabel(acertos: number, acertosTrevos: number): string | null {
  if (acertos === 6 && acertosTrevos === 2) return "6+2";
  if (acertos === 6) return "6+1 ou 6+0";
  if (acertos === 5 && acertosTrevos === 2) return "5+2";
  if (acertos === 5) return "5+1 ou 5+0";
  if (acertos === 4 && acertosTrevos === 2) return "4+2";
  if (acertos === 4) return "4+1 ou 4+0";
  if (acertos === 3 && acertosTrevos === 2) return "3+2";
  if (acertos === 3 && acertosTrevos === 1) return "3+1";
  if (acertos === 2 && acertosTrevos === 2) return "2+2";
  if (acertos === 2 && acertosTrevos === 1) return "2+1";
  return null;
}

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

function ResultadoCard({
  resultado,
  selecionadas,
  trevosSelecionados,
}: {
  resultado: ResultadoMaismilionaria;
  selecionadas: Set<number>;
  trevosSelecionados: Set<number>;
}) {
  const sorteadasNums = resultado.dezenas.map(d => parseInt(d, 10));
  const trevosSorteados = resultado.trevos?.map(t => parseInt(t, 10)) ?? [];
  const acertadas = new Set(sorteadasNums.filter(d => selecionadas.has(d)));
  const acertosTrevos = trevosSorteados.filter(t => trevosSelecionados.has(t)).length;
  const K = acertadas.size;
  const label = faixaLabel(K, acertosTrevos);
  const isPremiado = label !== null;

  // Look up prize
  let premioValue = 0;
  let premioLabel = "";
  if (isPremiado) {
    if (K >= 3) {
      // Variable prizes from DB — match by descricao
      const matchDesc = K === 6 && acertosTrevos === 2 ? "6 acertos + 2 Trevos"
        : K === 6 ? "6 acertos"
        : K === 5 && acertosTrevos === 2 ? "5 acertos + 2 Trevos"
        : K === 5 ? "5 acertos"
        : K === 4 ? "4 acertos"
        : K === 3 ? "3 acertos"
        : null;
      const premio = resultado.premios.find(p => matchDesc && p.descricao.includes(matchDesc));
      premioValue = premio?.valorPremio ?? 0;
      premioLabel = premio?.descricao ?? "";
    } else if (label && FIXED_PRIZES[label] !== undefined) {
      premioValue = FIXED_PRIZES[label];
      premioLabel = label;
    }
  }

  return (
    <Card className="border-t-4" style={{ borderTopColor: COR }}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Resultado da conferência</CardTitle>
        <CardDescription>Aposta de 6 dezenas + 2 trevos • {formatCurrency(6)}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Acertos nas dezenas ({K})</p>
            <div className="flex flex-wrap gap-1.5">
              {K === 0 ? <span className="text-sm text-muted-foreground">—</span> : (
                Array.from(acertadas).sort((a, b) => a - b).map(d => (
                  <span key={d} className="inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white" style={{ backgroundColor: COR }}>{String(d).padStart(2, "0")}</span>
                ))
              )}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Erros nas dezenas ({TOTAL_DEZENAS - K})</p>
            <div className="flex flex-wrap gap-1.5">
              {TOTAL_DEZENAS - K === 0 ? <span className="text-sm text-muted-foreground">—</span> : (
                Array.from(selecionadas).sort((a, b) => a - b).filter(d => !acertadas.has(d)).map(d => (
                  <span key={d} className="inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white bg-destructive">{String(d).padStart(2, "0")}</span>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Trevos escolhidos ({trevosSelecionados.size})</p>
            <div className="flex flex-wrap gap-1.5">
              {Array.from(trevosSelecionados).sort((a, b) => a - b).map(t => {
                const hit = trevosSorteados.includes(t);
                return (
                  <span key={t} className={cn("inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold", hit ? "text-white" : "text-white bg-destructive")}
                    style={hit ? { backgroundColor: COR } : {}}>{t}</span>
                );
              })}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Trevos sorteados</p>
            <div className="flex flex-wrap gap-1.5">
              {trevosSorteados.length === 0 ? <span className="text-sm text-muted-foreground">—</span> : (
                trevosSorteados.map(t => {
                  const hit = trevosSelecionados.has(t);
                  return (
                    <span key={t} className={cn("inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold", hit ? "text-white" : "")}
                      style={hit ? { backgroundColor: COR } : { backgroundColor: COR + "26", color: COR, border: `1px solid ${COR}66` }}>{t}</span>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {isPremiado && premioValue > 0 ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5" style={{ color: COR }} /> Premiação
            </p>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="py-2">Faixa (D+T)</TableHead>
                    <TableHead className="text-center py-2">Apostas premiadas</TableHead>
                    <TableHead className="text-right py-2">Prêmio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium py-2">{label}</TableCell>
                    <TableCell className="text-center py-2 font-bold" style={{ color: COR }}>1</TableCell>
                    <TableCell className="text-right py-2 font-black" style={{ color: COR }}>{formatCurrency(premioValue)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Nenhuma faixa de premiação atingida. Na +Milionária, os prêmios são para 2+1, 2+2, 3+1, 3+2, 4+1, 4+2, 5+1, 5+2, 6+0/1 e 6+2.</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function MaismilionariaConferidor() {
  const [selecionadas, setSelecionadas] = useState<Set<number>>(new Set());
  const [trevosSelecionados, setTrevosSelecionados] = useState<Set<number>>(new Set());
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
  const trevosSorteadosSet = useMemo(() => new Set(concursoResult.data?.trevos?.map(t => parseInt(t, 10)) ?? []), [concursoResult.data]);

  const count = selecionadas.size;
  const countTrevos = trevosSelecionados.size;
  const podeConferir = count === TOTAL_DEZENAS && countTrevos === TOTAL_TREVOS;
  const hasResult = concursoResult.isSuccess && concursoResult.data != null && count === TOTAL_DEZENAS && countTrevos === TOTAL_TREVOS;

  const toggleDezena = (n: number) => {
    setSelecionadas(prev => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else if (next.size < TOTAL_DEZENAS) next.add(n);
      return next;
    });
  };

  const toggleTrevo = (n: number) => {
    setTrevosSelecionados(prev => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else if (next.size < TOTAL_TREVOS) next.add(n);
      return next;
    });
  };

  const handleConferir = () => { if (!effectiveConcurso) return; setConcursoQuery(effectiveConcurso); };
  const handleLimpar = () => { setSelecionadas(new Set()); setTrevosSelecionados(new Set()); setConcursoSelected(null); setConcursoQuery(null); };

  return (
    <div className="space-y-6">
      <PageSEO
        title="Conferidor de Apostas da +Milionária"
        description="Confira se sua aposta da +Milionária ganhou! Escolha suas 6 dezenas e 2 trevos da sorte, selecione o concurso e veja seus acertos e o prêmio correspondente."
        canonical="/maismilionaria/conferidor"
      />
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: COR }}>
          <ClipboardCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: COR }}>+Milionária · Conferidor de Apostas</h1>
          <p className="text-muted-foreground mt-1">Selecione 6 dezenas e 2 trevos da sorte e confira se sua aposta ganhou.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Volantes */}
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

          <div className="border-t border-border" />

          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Trevos da Sorte</CardTitle>
              <span className={cn("text-sm font-semibold tabular-nums", countTrevos < TOTAL_TREVOS ? "text-muted-foreground" : "")} style={countTrevos >= TOTAL_TREVOS ? { color: COR } : {}}>{countTrevos}/{TOTAL_TREVOS}</span>
            </div>
            <CardDescription>
              Marque exatamente 2 trevos (1 a 6)
              {countTrevos >= TOTAL_TREVOS && <span className="ml-2 text-amber-600 font-medium">Limite atingido</span>}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 justify-center">
              {Array.from({ length: 6 }, (_, i) => i + 1).map(n => {
                const sel = trevosSelecionados.has(n);
                const drawn = hasResult && trevosSorteadosSet.has(n);
                const hit = drawn && sel;
                const miss = hasResult && sel && !drawn;
                const sorteadaNaoSel = drawn && !sel;

                return (
                  <button key={n} onClick={() => toggleTrevo(n)} disabled={!sel && countTrevos >= TOTAL_TREVOS}
                    className={cn("w-12 h-12 rounded-full text-sm font-bold transition-all duration-150 select-none",
                      hit ? "text-white shadow-sm ring-1 scale-105" : miss ? "bg-destructive text-white scale-105" : sel ? "text-white shadow-sm ring-1 scale-105" :
                      countTrevos >= TOTAL_TREVOS ? "bg-muted/30 text-muted-foreground/40 cursor-not-allowed" : "bg-muted/60 text-foreground border border-border hover:scale-105")}
                    style={hit || sel ? { backgroundColor: COR } : sorteadaNaoSel ? { backgroundColor: COR + "26", color: COR, border: `1px solid ${COR}66` } : {}}
                    onMouseEnter={e => { if (!sel && countTrevos < TOTAL_TREVOS) (e.currentTarget as HTMLElement).style.backgroundColor = COR + "26"; }}
                    onMouseLeave={e => { if (!sel && countTrevos < TOTAL_TREVOS) (e.currentTarget as HTMLElement).style.backgroundColor = ""; }}>
                    {n}
                  </button>
                );
              })}
            </div>
            {countTrevos > 0 && (
              <div className="pt-2 border-t mt-3 space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">Trevos escolhidos ({countTrevos}):</p>
                <div className="flex flex-wrap gap-1">
                  {Array.from(trevosSelecionados).sort((a, b) => a - b).map(n => (
                    <LotteryBall key={n} number={n} size="sm" color={COR} textColor={BALL_TEXT} />
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
                  <li>Marque exatamente <strong>6 números</strong> no volante à esquerda (01 a 50).</li>
                  <li>Marque exatamente <strong>2 trevos da sorte</strong> (1 a 6).</li>
                  <li>Selecione o concurso que deseja conferir.</li>
                  <li>Clique em <strong>Conferir Aposta</strong>.</li>
                  <li>Acertos aparecem em destaque, erros em vermelho e números sorteados não marcados em tom mais claro.</li>
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
                <p className="text-xs text-muted-foreground">Na +Milionária, as faixas de premiação combinam acertos nas dezenas (D) e nos trevos (T): 2+1, 2+2, 3+1, 3+2, 4+1, 4+2, 5+1, 5+2, 6+0/1 e 6+2.</p>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleConferir} disabled={!podeConferir || concursoResult.isFetching || !effectiveConcurso} className="flex-1 text-white font-semibold" style={{ backgroundColor: COR }}>
                  {concursoResult.isFetching ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Conferindo…</> : <><ClipboardCheck className="w-4 h-4 mr-2" />Conferir Aposta</>}
                </Button>
                <Button variant="outline" onClick={handleLimpar} disabled={concursoResult.isFetching}><RotateCcw className="w-4 h-4 mr-2" />Limpar</Button>
              </div>

              {!podeConferir && (count > 0 || countTrevos > 0) && (
                <p className="text-sm text-amber-600 text-center">
                  {count < TOTAL_DEZENAS && `Selecione mais ${TOTAL_DEZENAS - count} dezena${TOTAL_DEZENAS - count > 1 ? "s" : ""}`}
                  {count < TOTAL_DEZENAS && countTrevos < TOTAL_TREVOS && " e "}
                  {countTrevos < TOTAL_TREVOS && `mais ${TOTAL_TREVOS - countTrevos} trevo${TOTAL_TREVOS - countTrevos > 1 ? "s" : ""}`}
                  {" para conferir."}
                </p>
              )}
            </CardContent>
          </Card>

          {hasResult && concursoResult.data && (
            <>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Dezenas e trevos sorteados</CardTitle>
                  <CardDescription>Concurso {concursoResult.data.concurso} · {formatDateShort(concursoResult.data.data)}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Dezenas</p>
                    <div className="flex flex-wrap gap-1">
                      {concursoResult.data.dezenas.map(d => (
                        <LotteryBall key={d} number={parseInt(d, 10)} size="sm" color={BALL_BG} textColor={BALL_TEXT} />
                      ))}
                    </div>
                  </div>
                  {concursoResult.data.trevos && concursoResult.data.trevos.length > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Trevos</p>
                      <div className="flex flex-wrap gap-1">
                        {concursoResult.data.trevos.map(t => (
                          <LotteryBall key={t} number={parseInt(t, 10)} size="sm" color={COR} textColor={BALL_TEXT} />
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              <ResultadoCard resultado={concursoResult.data} selecionadas={selecionadas} trevosSelecionados={trevosSelecionados} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
