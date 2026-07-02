import { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useGetTimemaniaUltimoResultado, useGetTimemaniaResultadoConcurso } from "@workspace/api-client-react";
import type { ResultadoTimemania } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LotteryBall } from "@/components/ui/lottery-ball";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDateShort } from "@/lib/formatters";
import { CheckCircle2, ClipboardCheck, Loader2, RotateCcw, XCircle, ChevronDown, Trophy } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";

const COR = "#049645";
const BALL_BG = "#FFF600";
const BALL_TEXT = "#049645";
const TOTAL_DEZENAS = 10;

// Faixas premiadas da Timemania: 3→faixa5, 4→faixa4, 5→faixa3, 6→faixa2, 7→faixa1
const FAIXA_FOR_ACERTOS: Record<number, number> = {
  7: 1, 6: 2, 5: 3, 4: 4, 3: 5,
};
const FAIXAS_PREMIADAS = new Set([7, 6, 5, 4, 3]);

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

function ResultadoCard({ resultado, selecionadas }: { resultado: ResultadoTimemania; selecionadas: Set<number> }) {
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
        <CardDescription>
          Aposta de 10 dezenas • {formatCurrency(3.5)}
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
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Erros ({TOTAL_DEZENAS - K})</p>
            <div className="flex flex-wrap gap-1.5">
              {TOTAL_DEZENAS - K === 0 ? <span className="text-sm text-muted-foreground">—</span> : (
                Array.from(selecionadas).sort((a, b) => a - b).filter(d => !acertadas.has(d)).map(d => (
                  <span key={d} className="inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white bg-destructive">
                    {String(d).padStart(2, "0")}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        {temPremio && premio ? (
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <div className="text-xs font-semibold uppercase tracking-wider text-amber-600 mb-1">
              Parabéns! Você teria ganhado um prêmio!
            </div>
            <div className="text-2xl font-bold">{formatCurrency(premio.valorPremio)}</div>
            <div className="text-sm text-muted-foreground mt-1">
              {faixaLabel} — {premio.descricao}
            </div>
          </div>
        ) : K > 0 ? (
          <div className="p-4 bg-muted/50 border border-border rounded-lg">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              {K} acerto{K > 1 ? "s" : ""}
            </div>
            <div className="text-sm text-muted-foreground">
              Infelizmente esta faixa não é premiada na Timemania (somente 3 a 7 acertos).
            </div>
          </div>
        ) : (
          <div className="p-4 bg-muted/50 border border-border rounded-lg">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              Sem acertos
            </div>
            <div className="text-sm text-muted-foreground">
              Nenhum dos seus números foi sorteado neste concurso.
            </div>
          </div>
        )}

        <Legenda />

        {/* Volante com dezenas sorteadas */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Dezenas Sorteadas</p>
          <div className="flex flex-wrap gap-1.5">
            {sorteadasNums.sort((a, b) => a - b).map(d => (
              <span key={d} className={cn(
                "inline-flex items-center justify-center w-10 h-10 rounded-full text-xs font-bold border-2",
                acertadas.has(d)
                  ? "text-white"
                  : "text-foreground/50 bg-muted/20"
              )} style={acertadas.has(d) ? { backgroundColor: COR, borderColor: COR } : { borderColor: "var(--border)" }}>
                {String(d).padStart(2, "0")}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function TimemaniaConferidor() {
  const [concurso, setConcurso] = useState("");
  const [concursoBusca, setConcursoBusca] = useState<number | null>(null);
  const [selecionadas, setSelecionadas] = useState<Set<number>>(new Set());
  const [resultadoConferido, setResultadoConferido] = useState(false);

  const { data: ultimo, isLoading: carregandoUltimo } = useGetTimemaniaUltimoResultado();
  const { data: resultado, isLoading: carregando } = useGetTimemaniaResultadoConcurso(
    concursoBusca && concursoBusca > 0 ? concursoBusca : 0,
  );

  useEffect(() => {
    if (ultimo && !concursoBusca) {
      setConcursoBusca(ultimo.concurso);
      setResultadoConferido(false);
    }
  }, [ultimo]);

  const toggleDezena = (n: number) => {
    setSelecionadas(prev => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else if (next.size < TOTAL_DEZENAS) next.add(n);
      return next;
    });
    setResultadoConferido(false);
  };

  const handleBuscar = () => {
    const n = parseInt(concurso, 10);
    if (n > 0) {
      setConcursoBusca(n);
      setResultadoConferido(false);
    }
  };

  const handleConferir = () => setResultadoConferido(true);
  const handleLimpar = () => {
    setSelecionadas(new Set());
    setResultadoConferido(false);
  };

  const isLoading = (concursoBusca === null) ? carregandoUltimo : carregando;

  return (
    <div className="space-y-6">
      <PageSEO
        title="Conferidor de Apostas da Timemania"
        description="Confira se suas dezenas da Timemania foram sorteadas em qualquer concurso. Verificação rápida e gratuita."
        canonical="/timemania/conferidor"
      />
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: COR }}>
          <ClipboardCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: COR }}>Timemania · Conferidor de Apostas</h1>
          <p className="text-muted-foreground mt-1">Verifique se suas 10 dezenas foram premiadas em qualquer concurso.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Seletor de concurso + volante */}
        <Card>
          <CardHeader>
            <CardTitle>Selecione o Concurso e as Dezenas</CardTitle>
            <CardDescription>
              {isLoading ? "Carregando..." : ultimo ? `Último concurso: ${ultimo.concurso}` : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <input
                type="number"
                className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
                placeholder="Nº do concurso"
                value={concurso}
                onChange={e => setConcurso(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleBuscar()}
              />
              <Button variant="outline" onClick={handleBuscar}>Buscar</Button>
            </div>

            <p className="text-sm font-medium">Marque suas 10 dezenas:</p>
            <div className="grid grid-cols-10 gap-1">
              {Array.from({ length: 80 }, (_, i) => i + 1).map(n => {
                const selecionado = selecionadas.has(n);
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => toggleDezena(n)}
                    disabled={!selecionado && selecionadas.size >= TOTAL_DEZENAS}
                    className={cn(
                      "w-8 h-8 text-[11px] font-bold rounded-full border transition-all",
                      selecionado
                        ? "text-white border-transparent"
                        : "text-foreground/70 border-border hover:border-foreground/30",
                      !selecionado && selecionadas.size >= TOTAL_DEZENAS && "opacity-30 cursor-not-allowed"
                    )}
                    style={selecionado ? { backgroundColor: COR } : {}}
                  >
                    {String(n).padStart(2, "0")}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleConferir}
                disabled={selecionadas.size !== TOTAL_DEZENAS || isLoading || !resultado}
                className="flex-1 text-white"
                style={{ backgroundColor: selecionadas.size === TOTAL_DEZENAS ? COR : undefined }}
              >
                <ClipboardCheck className="w-4 h-4 mr-2" /> Conferir
              </Button>
              <Button variant="outline" onClick={handleLimpar}>
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
            {selecionadas.size !== TOTAL_DEZENAS && (
              <p className="text-xs text-muted-foreground">
                Selecione exatamente {TOTAL_DEZENAS} dezenas ({selecionadas.size}/{TOTAL_DEZENAS}).
              </p>
            )}
          </CardContent>
        </Card>

        {/* Resultado */}
        <div>
          {isLoading ? (
            <Card>
              <CardContent className="p-8 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </CardContent>
            </Card>
          ) : resultado && resultadoConferido ? (
            <ResultadoCard resultado={resultado} selecionadas={selecionadas} />
          ) : resultado ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  Concurso {resultado.concurso} • {formatDateShort(resultado.data)}
                </CardTitle>
                <CardDescription>
                  {resultado.acumulado ? "Acumulou!" : "Saiu!"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Dezenas Sorteadas</p>
                <div className="flex flex-wrap gap-2">
                  {resultado.dezenas.map((d, i) => (
                    <LotteryBall key={i} number={d} size="md" color={BALL_BG} textColor={BALL_TEXT} />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Selecione suas dezenas e clique em Conferir para verificar.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center h-full flex flex-col items-center justify-center min-h-[300px]">
              <ClipboardCheck className="w-12 h-12 text-muted-foreground mb-3" />
              <h3 className="font-semibold text-lg">Conferidor de Apostas</h3>
              <p className="text-muted-foreground text-sm mt-1 max-w-xs">
                Selecione o concurso e marque suas 10 dezenas para conferir.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
