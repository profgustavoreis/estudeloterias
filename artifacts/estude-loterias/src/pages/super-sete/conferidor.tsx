import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useGetSuperSeteUltimoResultado, useGetSuperSeteResultadoConcurso } from "@workspace/api-client-react";
import type { ResultadoSuperSete } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LotteryBall } from "@/components/ui/lottery-ball";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDateShort } from "@/lib/formatters";
import { CheckCircle2, ClipboardCheck, Loader2, RotateCcw, XCircle, ChevronDown, Trophy } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";
import { DigitColumnsPicker } from "@/components/super-sete/DigitColumnsPicker";

const COR = "#a8cf45";
const TOTAL_DEZENAS = 7;

// Faixas premiadas da Super Sete: 7→faixa1, 6→faixa2, 5→faixa3, 4→faixa4, 3→faixa5
const FAIXA_FOR_ACERTOS: Record<number, number> = { 7: 1, 6: 2, 5: 3, 4: 4, 3: 5 };
const FAIXAS_PREMIADAS = new Set([3, 4, 5, 6, 7]);

function Legenda() {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-1.5 pt-2 border-t text-xs text-muted-foreground">
      {[
        { bg: COR, text: "text-white", icon: <CheckCircle2 className="w-3 h-3" />, label: "Acerto" },
        { bg: "bg-destructive", text: "text-white", icon: <XCircle className="w-3 h-3" />, label: "Erro" },
        { bg: null, text: null, icon: null, label: "Sorteado (não marcado)" },
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

function ResultadoCard({ resultado, values, acertos }: { resultado: ResultadoSuperSete; values: (string | string[])[]; acertos: number }) {
  const sorteadas = resultado.dezenas;
  const faixaNum = FAIXA_FOR_ACERTOS[acertos] ?? null;
  const premio = faixaNum !== null ? resultado.premios.find(p => p.faixa === faixaNum) : undefined;
  const temPremio = FAIXAS_PREMIADAS.has(acertos);

  const faixaLabel = `${acertos} acerto${acertos > 1 ? "s" : ""}`;

  return (
    <Card className="border-t-4" style={{ borderTopColor: COR }}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Resultado da conferência</CardTitle>
        <CardDescription>Aposta de 7 colunas • R$ 2,50</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Positional comparison grid */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Conferência por coluna</p>
          <div className="flex items-start justify-center gap-2 sm:gap-3">
            {sorteadas.map((sorteada, colIndex) => {
              const betDigits = Array.isArray(values[colIndex]) ? values[colIndex] as string[] : values[colIndex] ? [values[colIndex] as string] : [];
              const isHit = betDigits.includes(sorteada);
              return (
                <div key={colIndex} className="flex flex-col items-center gap-1">
                  <span className="text-[10px] font-medium text-muted-foreground">Col. {colIndex + 1}</span>
                  <div className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-md text-sm font-bold transition-all",
                    isHit ? "text-white shadow-sm" : "border border-muted"
                  )} style={isHit ? { backgroundColor: COR } : {}}>
                    {sorteada}
                  </div>
                  {isHit && <CheckCircle2 className="w-3.5 h-3.5" style={{ color: COR }} />}
                  {!isHit && betDigits.length > 0 && <XCircle className="w-3.5 h-3.5 text-destructive" />}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Acertos ({acertos})</p>
            <div className="flex flex-wrap gap-1.5">
              {acertos === 0 ? <span className="text-sm text-muted-foreground">—</span> : (
                sorteadas.map((d, i) => {
                  const betDigits = Array.isArray(values[i]) ? values[i] as string[] : values[i] ? [values[i] as string] : [];
                  if (!betDigits.includes(d)) return null;
                  return (
                    <span key={i} className="inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white" style={{ backgroundColor: COR }}>{d}</span>
                  );
                })
              )}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Erros ({TOTAL_DEZENAS - acertos})</p>
            <div className="flex flex-wrap gap-1.5">
              {TOTAL_DEZENAS - acertos === 0 ? <span className="text-sm text-muted-foreground">—</span> : (
                sorteadas.map((d, i) => {
                  const betDigits = Array.isArray(values[i]) ? values[i] as string[] : values[i] ? [values[i] as string] : [];
                  if (betDigits.includes(d)) return null;
                  return (
                    <span key={i} className="inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white bg-destructive">{d}</span>
                  );
                })
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
          <p className="text-sm text-muted-foreground">Nenhuma faixa de premiação atingida. Na Super Sete, os prêmios são para 7, 6, 5, 4 ou 3 acertos.</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function SuperSeteConferidor() {
  const [values, setValues] = useState<(string | string[])[]>(Array(TOTAL_DEZENAS).fill(""));
  const [concursoSelected, setConcursoSelected] = useState<number | null>(null);
  const [concursoQuery, setConcursoQuery] = useState<number | null>(null);
  const [infoAberta, setInfoAberta] = useState(false);

  const ultimo = useGetSuperSeteUltimoResultado();
  const latestConcurso = ultimo.data?.concurso ?? null;

  useEffect(() => {
    if (latestConcurso != null && concursoSelected === null) setConcursoSelected(latestConcurso);
  }, [latestConcurso]);

  const effectiveConcurso = concursoSelected ?? latestConcurso;
  const concursoOptions = useMemo(() => latestConcurso ? Array.from({ length: Math.min(latestConcurso, 500) }, (_, i) => latestConcurso - i) : [], [latestConcurso]);

  const concursoResult = useGetSuperSeteResultadoConcurso(concursoQuery ?? 0);

  // Count positional acertos
  const acertos = useMemo(() => {
    if (!concursoResult.data?.dezenas) return 0;
    const sorteadas = concursoResult.data.dezenas;
    let count = 0;
    for (let i = 0; i < TOTAL_DEZENAS; i++) {
      const betDigits = Array.isArray(values[i]) ? values[i] : values[i] ? [values[i]] : [];
      if (betDigits.includes(sorteadas[i])) count++;
    }
    return count;
  }, [concursoResult.data, values]);

  const totalSelected = values.reduce((acc, v) => acc + (Array.isArray(v) ? v.length : v ? 1 : 0), 0);
  const podeConferir = totalSelected >= TOTAL_DEZENAS;
  const hasResult = concursoResult.isSuccess && concursoResult.data != null && totalSelected >= TOTAL_DEZENAS;

  const handleConferir = () => { if (!effectiveConcurso) return; setConcursoQuery(effectiveConcurso); };
  const handleLimpar = () => { setValues(Array(TOTAL_DEZENAS).fill("")); setConcursoSelected(null); setConcursoQuery(null); };

  return (
    <div className="space-y-6">
      <PageSEO
        title="Conferidor de Apostas da Super Sete"
        description="Confira se sua aposta da Super Sete ganhou! Escolha seus números em 7 colunas, selecione o concurso e veja seus acertos e o prêmio correspondente."
        canonical="/super-sete/conferidor"
      />
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: COR }}>
          <ClipboardCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: COR }}>Super Sete · Conferidor de Apostas</h1>
          <p className="text-muted-foreground mt-1">Selecione números em 7 colunas e confira se sua aposta ganhou.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* DigitColumnsPicker */}
        <Card className="border-t-4" style={{ borderTopColor: COR }}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Escolha seus números</CardTitle>
              <span className={cn("text-sm font-semibold tabular-nums", totalSelected < TOTAL_DEZENAS ? "text-muted-foreground" : "")} style={totalSelected >= TOTAL_DEZENAS ? { color: COR } : {}}>{totalSelected} números</span>
            </div>
            <CardDescription>
               Selecione pelo menos 1 número por coluna (0 a 9)
              {totalSelected >= TOTAL_DEZENAS && <span className="ml-2 text-amber-600 font-medium">Mínimo atingido</span>}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <DigitColumnsPicker values={values} onChange={setValues} />

            {hasResult && <Legenda />}

            {totalSelected > 0 && (
              <div className="pt-2 border-t space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">Números escolhidos:</p>
                <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                  {values.map((v, i) => {
                    const digits = Array.isArray(v) ? v : v ? [v] : [];
                    return digits.map(d => (
                      <LotteryBall key={`${i}-${d}`} number={parseInt(d, 10)} size="sm" color={COR} textColor="#fff" padDigits={1} />
                    ));
                  })}
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
                  <li>Selecione pelo menos 1 número em cada uma das 7 colunas (0 a 9).</li>
                  <li>Selecione o concurso que deseja conferir.</li>
                  <li>Clique em <strong>Conferir Aposta</strong>.</li>
                  <li>Acertos aparecem em verde, erros em vermelho e números sorteados não marcados em verde claro.</li>
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
                <p className="text-xs text-muted-foreground">Na Super Sete, apostas são premiadas com 7, 6, 5, 4 ou 3 acertos posicionais.</p>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleConferir} disabled={!podeConferir || concursoResult.isFetching || !effectiveConcurso} className="flex-1 text-white font-semibold" style={{ backgroundColor: COR }}>
                  {concursoResult.isFetching ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Conferindo…</> : <><ClipboardCheck className="w-4 h-4 mr-2" />Conferir Aposta</>}
                </Button>
                <Button variant="outline" onClick={handleLimpar} disabled={concursoResult.isFetching}><RotateCcw className="w-4 h-4 mr-2" />Limpar</Button>
              </div>

              {!podeConferir && totalSelected > 0 && <p className="text-sm text-amber-600 text-center">Selecione mais números para cobrir todas as 7 colunas.</p>}
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
                    {concursoResult.data.dezenas.map((d, i) => (
                      <LotteryBall key={`${i}-${d}`} number={parseInt(d, 10)} size="sm" color={COR} textColor="#fff" padDigits={1} />
                    ))}
                  </div>
                </CardContent>
              </Card>
              <ResultadoCard resultado={concursoResult.data} values={values} acertos={acertos} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
