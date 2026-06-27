import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  useGetMegaSenaUltimoResultado,
  useGetMegaSenaResultadoConcurso,
} from "@workspace/api-client-react";
import type { ResultadoMegaSena } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LotteryBall } from "@/components/ui/lottery-ball";
import { formatCurrency, formatDateShort } from "@/lib/formatters";
import { CheckCircle2, ClipboardCheck, Loader2, RotateCcw, XCircle } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";

const COR = "#009640";
const DEZENAS = Array.from({ length: 60 }, (_, i) => i + 1);

// ── Prize tier lookup ─────────────────────────────────────────────────────────
// faixa 1 = sena (6), 2 = quina (5), 3 = quadra (4)
function getPremio(resultado: ResultadoMegaSena, acertos: number) {
  const faixa = acertos === 6 ? 1 : acertos === 5 ? 2 : acertos === 4 ? 3 : null;
  if (!faixa) return null;
  return resultado.premios.find((p) => p.faixa === faixa) ?? null;
}

function acertosLabel(n: number): { label: string; color: string; bg: string } {
  if (n === 6) return { label: "Sena!", color: "text-amber-600", bg: "bg-amber-50 border-amber-300" };
  if (n === 5) return { label: "Quina!", color: "text-violet-600", bg: "bg-violet-50 border-violet-300" };
  if (n === 4) return { label: "Quadra!", color: "text-blue-600", bg: "bg-blue-50 border-blue-300" };
  if (n === 3) return { label: "3 acertos", color: "text-muted-foreground", bg: "bg-muted border-border" };
  if (n === 2) return { label: "2 acertos", color: "text-muted-foreground", bg: "bg-muted border-border" };
  if (n === 1) return { label: "1 acerto", color: "text-muted-foreground", bg: "bg-muted border-border" };
  return { label: "Nenhum acerto", color: "text-muted-foreground", bg: "bg-muted border-border" };
}

// ── Number picker grid ────────────────────────────────────────────────────────
function NumericGrid({
  selecionadas,
  acertadas,
  showResult,
  onToggle,
}: {
  selecionadas: Set<number>;
  acertadas: Set<number>;
  showResult: boolean;
  onToggle: (n: number) => void;
}) {
  return (
    <div className="grid grid-cols-10 gap-1.5">
      {DEZENAS.map((n) => {
        const sel = selecionadas.has(n);
        const hit = showResult && acertadas.has(n);
        const miss = showResult && sel && !acertadas.has(n);
        return (
          <button
            key={n}
            onClick={() => onToggle(n)}
            disabled={!sel && selecionadas.size >= 15}
            className={cn(
              "w-full aspect-square rounded-lg text-sm font-bold transition-all border",
              "flex items-center justify-center",
              hit
                ? "text-white border-[#009640]"
                : miss
                ? "text-white border-destructive bg-destructive"
                : sel
                ? "text-white border-transparent"
                : "border-border hover:border-[#009640]/50 text-muted-foreground hover:text-foreground bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed"
            )}
            style={
              hit
                ? { backgroundColor: COR }
                : sel && !miss
                ? { backgroundColor: COR }
                : undefined
            }
          >
            {String(n).padStart(2, "0")}
          </button>
        );
      })}
    </div>
  );
}

// ── Resultado card ────────────────────────────────────────────────────────────
function ResultadoCard({
  resultado,
  selecionadas,
}: {
  resultado: ResultadoMegaSena;
  selecionadas: Set<number>;
}) {
  const sorteadasNums = resultado.dezenas.map((d) => parseInt(d, 10));
  const acertadas = new Set(sorteadasNums.filter((d) => selecionadas.has(d)));
  const n = acertadas.size;
  const { label, color, bg } = acertosLabel(n);
  const premio = getPremio(resultado, n);

  return (
    <Card className={cn("border-2 mt-6", bg)}>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="text-base font-semibold text-muted-foreground">
              Concurso {resultado.concurso} · {formatDateShort(resultado.data)}
            </CardTitle>
          </div>
          <span className={cn("text-2xl font-black", color)}>{label}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Sorteio balls */}
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

        {/* User's dezenas classified */}
        <div className="grid grid-cols-2 gap-4">
          {/* Hits */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
              Suas dezenas — acertos ({acertadas.size})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {acertadas.size === 0 ? (
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
          {/* Misses */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
              Suas dezenas — erros ({selecionadas.size - acertadas.size})
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

        {/* Prize info */}
        {n >= 4 && (
          <div className="rounded-lg border border-border bg-background p-4 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Prêmio estimado
            </p>
            {premio && premio.ganhadores > 0 ? (
              <>
                <p className="text-2xl font-black" style={{ color: COR }}>
                  {formatCurrency(premio.valorPremio)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {premio.ganhadores} ganhador{premio.ganhadores !== 1 ? "es" : ""} neste concurso
                </p>
              </>
            ) : premio ? (
              <p className="text-sm text-muted-foreground">
                Nenhum ganhador nesta faixa neste concurso.
              </p>
            ) : null}
          </div>
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
  const [conferido, setConferido] = useState(false);

  const ultimo = useGetMegaSenaUltimoResultado();
  const latestConcurso = ultimo.data?.concurso;

  const concursoResult = useGetMegaSenaResultadoConcurso(concursoQuery ?? 0);

  const sorteadasNums =
    concursoResult.data?.dezenas?.map((d) => parseInt(d, 10)) ?? [];
  const acertadas = new Set(sorteadasNums.filter((d) => selecionadas.has(d)));

  const toggleDezena = (n: number) => {
    if (conferido) return;
    setSelecionadas((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else if (next.size < 15) next.add(n);
      return next;
    });
  };

  const handleConferir = () => {
    const num = concursoInput.trim()
      ? parseInt(concursoInput.trim(), 10)
      : latestConcurso ?? null;
    if (!num || isNaN(num)) return;
    setConcursoQuery(num);
    setConferido(true);
  };

  const handleLimpar = () => {
    setSelecionadas(new Set());
    setConcursoInput("");
    setConcursoQuery(null);
    setConferido(false);
  };

  const usarUltimo = () => {
    if (latestConcurso) {
      setConcursoInput(String(latestConcurso));
    }
  };

  const podeConferir = selecionadas.size >= 6 && !concursoResult.isFetching;
  const count = selecionadas.size;

  return (
    <div className="space-y-6">
      <PageSEO
        title="Conferidor da Mega-Sena — Verifique seu Bilhete"
        description="Confira se seu bilhete da Mega-Sena ganhou! Digite suas dezenas, escolha o concurso e veja instantaneamente seus acertos e o prêmio correspondente."
        canonical="/mega-sena/conferidor"
      />

      {/* Header */}
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center text-white flex-shrink-0"
          style={{ backgroundColor: COR }}
        >
          <ClipboardCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: COR }}>
            Mega-Sena · Conferidor
          </h1>
          <p className="text-muted-foreground mt-1">
            Selecione suas dezenas e confira se seu bilhete ganhou.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: picker + concurso */}
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-base">
                  Suas dezenas
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({count} de 6–15)
                  </span>
                </CardTitle>
                {count > 0 && (
                  <button
                    onClick={handleLimpar}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Limpar
                  </button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <NumericGrid
                selecionadas={selecionadas}
                acertadas={acertadas}
                showResult={conferido && concursoResult.isSuccess}
                onToggle={toggleDezena}
              />
            </CardContent>
          </Card>

          {/* Concurso + action */}
          <Card>
            <CardContent className="pt-5">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 space-y-1.5">
                  <label className="text-sm font-medium">Número do concurso</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min={1}
                      placeholder={
                        latestConcurso
                          ? `Último: ${latestConcurso}`
                          : "Ex: 3020"
                      }
                      value={concursoInput}
                      onChange={(e) => {
                        setConcursoInput(e.target.value);
                        if (conferido) {
                          setConferido(false);
                          setConcursoQuery(null);
                        }
                      }}
                      className="max-w-40"
                      disabled={conferido}
                    />
                    {latestConcurso && !conferido && (
                      <button
                        onClick={usarUltimo}
                        className="text-sm font-medium text-muted-foreground hover:text-[#009640] transition-colors whitespace-nowrap"
                      >
                        Usar último
                      </button>
                    )}
                  </div>
                </div>
                <div className="sm:self-end">
                  {!conferido ? (
                    <Button
                      onClick={handleConferir}
                      disabled={!podeConferir || count < 6}
                      className="w-full sm:w-auto font-bold gap-2"
                      style={{ backgroundColor: COR }}
                    >
                      {concursoResult.isFetching ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <ClipboardCheck className="w-4 h-4" />
                      )}
                      Conferir bilhete
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={handleLimpar}
                      className="w-full sm:w-auto gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Novo jogo
                    </Button>
                  )}
                </div>
              </div>
              {count < 6 && count > 0 && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Selecione pelo menos 6 dezenas para conferir.
                </p>
              )}
              {concursoResult.isError && (
                <div className="mt-3 flex items-center gap-2 text-sm text-destructive">
                  <XCircle className="w-4 h-4" />
                  Concurso não encontrado. Verifique o número informado.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Result */}
          {conferido && concursoResult.isFetching && (
            <div className="flex items-center gap-3 text-muted-foreground py-4">
              <Loader2 className="w-5 h-5 animate-spin" style={{ color: COR }} />
              <span className="text-sm">Consultando o resultado...</span>
            </div>
          )}
          {conferido && concursoResult.isSuccess && concursoResult.data && (
            <ResultadoCard
              resultado={concursoResult.data}
              selecionadas={selecionadas}
            />
          )}
        </div>

        {/* Right: instructions */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Como usar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-3">
                <span className="font-bold text-[#009640] shrink-0">1.</span>
                <span>Clique nas dezenas do seu bilhete (de 6 a 15 números).</span>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-[#009640] shrink-0">2.</span>
                <span>
                  Informe o número do concurso ou deixe em branco para
                  usar o último sorteio.
                </span>
              </div>
              <div className="flex gap-3">
                <span className="font-bold text-[#009640] shrink-0">3.</span>
                <span>
                  Clique em <strong>Conferir bilhete</strong> e veja seus
                  acertos instantaneamente.
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Faixas de prêmio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: "Sena", n: "6 acertos", color: "text-amber-600", dot: "bg-amber-400" },
                { label: "Quina", n: "5 acertos", color: "text-violet-600", dot: "bg-violet-400" },
                { label: "Quadra", n: "4 acertos", color: "text-blue-600", dot: "bg-blue-400" },
              ].map(({ label, n, color, dot }) => (
                <div key={label} className="flex items-center gap-2 text-sm">
                  <div className={cn("w-2 h-2 rounded-full shrink-0", dot)} />
                  <span className={cn("font-semibold", color)}>{label}</span>
                  <span className="text-muted-foreground">— {n}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
