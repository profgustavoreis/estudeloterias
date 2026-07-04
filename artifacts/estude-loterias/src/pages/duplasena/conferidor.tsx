import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useGetDuplasenaUltimoResultado, useGetDuplasenaResultadoConcurso } from "@workspace/api-client-react";
import type { ResultadoDuplasena } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LotteryBall } from "@/components/ui/lottery-ball";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDateShort } from "@/lib/formatters";
import { ClipboardCheck, Loader2, RotateCcw, ChevronDown, Trophy } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";

const COR = "#a61324";
const TOTAL_DEZENAS = 6;

const FAIXA_FOR_ACERTOS: Record<number, number> = { 6: 1, 5: 2, 4: 3, 3: 4 };
const FAIXAS_PREMIADAS = new Set([6, 5, 4, 3]);

function ResultadoCard({
  resultado, selecionadas, dezenas, sorteioLabel,
}: {
  resultado: ResultadoDuplasena; selecionadas: Set<number>; dezenas: string[]; sorteioLabel: string;
}) {
  const sorteadasNums = dezenas.map(d => parseInt(d, 10));
  const acertadas = new Set(sorteadasNums.filter(d => selecionadas.has(d)));
  const K = acertadas.size;

  const faixaNum = FAIXA_FOR_ACERTOS[K] ?? null;
  const premio = faixaNum !== null ? resultado.premios.find(p => p.faixa === faixaNum) : undefined;
  const temPremio = FAIXAS_PREMIADAS.has(K);

  const faixaLabel = `${K} acerto${K > 1 ? "s" : ""}`;

  return (
    <Card className="border-t-4" style={{ borderTopColor: COR }}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">{sorteioLabel}</CardTitle>
        <CardDescription>Concurso {resultado.concurso} · {formatDateShort(resultado.data)} · {formatCurrency(2.5)}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Dezenas sorteadas</p>
          <div className="flex flex-wrap gap-1">
            {dezenas.map(d => (
              <LotteryBall key={d} number={parseInt(d, 10)} size="sm" color={COR} />
            ))}
          </div>
        </div>

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
          <p className="text-sm text-muted-foreground">Nenhuma faixa de premiação atingida. Na Dupla Sena, os prêmios são para 6, 5, 4 ou 3 acertos.</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function DuplaSenaConferidor() {
  const [selecionadas, setSelecionadas] = useState<Set<number>>(new Set());
  const [concursoSelected, setConcursoSelected] = useState<number | null>(null);
  const [concursoQuery, setConcursoQuery] = useState<number | null>(null);
  const [infoAberta, setInfoAberta] = useState(false);

  const ultimo = useGetDuplasenaUltimoResultado();
  const latestConcurso = ultimo.data?.concurso ?? null;

  useEffect(() => {
    if (latestConcurso != null && concursoSelected === null) setConcursoSelected(latestConcurso);
  }, [latestConcurso]);

  const effectiveConcurso = concursoSelected ?? latestConcurso;
  const concursoOptions = useMemo(() => latestConcurso ? Array.from({ length: Math.min(latestConcurso, 500) }, (_, i) => latestConcurso - i) : [], [latestConcurso]);

  const concursoResult = useGetDuplasenaResultadoConcurso(concursoQuery ?? 0);

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
        title="Conferidor de Apostas da Dupla Sena"
        description="Confira se sua aposta da Dupla Sena ganhou! Escolha suas 6 dezenas, selecione o concurso e veja seus acertos e o prêmio correspondente."
        canonical="/duplasena/conferidor"
      />
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: COR }}>
          <ClipboardCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: COR }}>Dupla Sena · Conferidor de Apostas</h1>
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

                return (
                  <button key={n} onClick={() => toggleDezena(n)} disabled={!sel && count >= TOTAL_DEZENAS}
                    className={cn("aspect-square rounded text-[10px] font-bold transition-all duration-150 select-none",
                      sel ? "text-white shadow-sm ring-1 scale-105" :
                      count >= TOTAL_DEZENAS ? "bg-muted/30 text-muted-foreground/40 cursor-not-allowed" : "bg-muted/60 text-foreground border border-border hover:scale-105")}
                    style={sel ? { backgroundColor: COR } : {}}>
                    {String(n).padStart(2, "0")}
                  </button>
                );
              })}
            </div>

            {count > 0 && (
              <div className="pt-2 border-t space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">Dezenas escolhidas ({count}):</p>
                <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
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
                  <li>Marque exatamente 6 números no volante à esquerda (01 a 50).</li>
                  <li>Selecione o concurso que deseja conferir.</li>
                  <li>Clique em <strong>Conferir Aposta</strong>.</li>
                  <li>Veja no painel lateral os resultados de cada sorteio, com acertos, erros e premiação.</li>
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
                <p className="text-xs text-muted-foreground">Na Dupla Sena, apostas são premiadas com 6, 5, 4 ou 3 acertos.</p>
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
              <ResultadoCard
                resultado={concursoResult.data}
                selecionadas={selecionadas}
                dezenas={concursoResult.data.dezenas}
                sorteioLabel="Conferência - 1º Sorteio"
              />
              {concursoResult.data.dezenas2 && concursoResult.data.dezenas2.length > 0 && (
                <ResultadoCard
                  resultado={concursoResult.data}
                  selecionadas={selecionadas}
                  dezenas={concursoResult.data.dezenas2}
                  sorteioLabel="Conferência - 2º Sorteio"
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
