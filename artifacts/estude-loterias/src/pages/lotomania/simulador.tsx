import { useState } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useSimularLotomania, SimulacaoResultado } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LotteryBall } from "@/components/ui/lottery-ball";
import { formatDateShort } from "@/lib/formatters";
import { AdUnit } from "@/components/ui/AdUnit";
import { FlaskConical, RotateCcw, Loader2, Trophy, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";

const COR = "#f8901c";
const TOTAL_DEZENAS = 50;
const PAGE_SIZE = 20;

type Filtro = "todos" | "premiados" | "vinte" | "dezenove" | "dezoito" | "dezessete" | "dezesseis" | "quinze" | "zero";

const FILTRO_LABELS: Record<Filtro, string> = {
  todos:       "Todos os concursos",
  premiados:   "Somente concursos premiados (20, 19, 18, 17, 16, 15 ou 0 acertos)",
  vinte:       "Somente concursos com 20 acertos",
  dezenove:    "Somente concursos com 19 acertos",
  dezoito:     "Somente concursos com 18 acertos",
  dezessete:   "Somente concursos com 17 acertos",
  dezesseis:   "Somente concursos com 16 acertos",
  quinze:      "Somente concursos com 15 acertos",
  zero:        "Somente concursos com 0 acertos",
};

const PREMIADO_EMOJI = "⭐";

// Ordenação que coloca "00" (valor 0) na última posição, após o 99
const sortVolante = (a: number, b: number) => {
  const va = a === 0 ? 100 : a;
  const vb = b === 0 ? 100 : b;
  return va - vb;
};

// Faixas premiadas da Lotomania: 20, 19, 18, 17, 16, 15, 0
const FAIXAS_PREMIADAS = new Set([20, 19, 18, 17, 16, 15, 0]);

// ── Combinatória ─────────────────────────────────────────────────────────────
function comb(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  k = Math.min(k, n - k);
  let r = 1;
  for (let i = 0; i < k; i++) r = (r * (n - i)) / (i + 1);
  return Math.round(r);
}

// "1 em X" para k acertos com 50 dezenas escolhidas na Lotomania (100 números, sorteiam 20)
function probLotomania(k: number): string {
  const total = comb(100, 20);
  const ways = comb(50, k) * comb(50, 20 - k);
  if (ways <= 0) return "—";
  const x = total / ways;
  if (x >= 10) return `1 em ${Math.round(x).toLocaleString("pt-BR")}`;
  return `1 em ${x.toFixed(2).replace(".", ",")}`;
}

export default function LotomaniaSimulador() {
  const [selecionadas, setSelecionadas] = useState<Set<number>>(new Set());
  const [filtro, setFiltro] = useState<Filtro>("premiados");
  const [resultado, setResultado] = useState<SimulacaoResultado | null>(null);
  const [infoAberta, setInfoAberta] = useState(false);
  const [paginaTabela, setPaginaTabela] = useState(1);

  const simular = useSimularLotomania({
    mutation: {
      onSuccess: data => {
        setResultado(data);
        setPaginaTabela(1);
      },
    },
  });

  const toggleDezena = (n: number) => {
    setSelecionadas(prev => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else if (next.size < TOTAL_DEZENAS) next.add(n);
      return next;
    });
  };

  const handleSimular = () => {
    const dezenas = Array.from(selecionadas).sort(sortVolante).map(n => String(n).padStart(2, "0"));
    simular.mutate({ data: { dezenas, filtro } });
  };

  const handleLimpar = () => {
    setSelecionadas(new Set());
    setResultado(null);
    simular.reset();
  };

  const podeSimular = selecionadas.size === TOTAL_DEZENAS;
  const count = selecionadas.size;

  const acertosGanhadores = resultado?.resumo.filter(r => FAIXAS_PREMIADAS.has(r.acertos)).reduce((acc, r) => acc + r.contagem, 0) ?? 0;
  const totalConcursos = resultado?.concursos.length ?? 0;
  const totalPaginasTabela = Math.max(1, Math.ceil(totalConcursos / PAGE_SIZE));
  const paginaAtual = Math.min(paginaTabela, totalPaginasTabela);
  const concursosPagina = resultado?.concursos.slice((paginaAtual - 1) * PAGE_SIZE, paginaAtual * PAGE_SIZE) ?? [];

  // Linhas da tabela de resumo: acertos 20 → 0
  const resumoLinhas = resultado?.resumo.filter(r => r.acertos >= 0 && r.acertos <= 20) ?? [];

  return (
    <div className="space-y-6">
      <PageSEO
        title="Simulador Histórico da Lotomania — Teste sua Aposta no Histórico"
        description="Escolha suas 50 dezenas e descubra em quantos sorteios da Lotomania você teria ganhado. Simulador histórico gratuito e completo."
        canonical="/lotomania/simulador"
      />
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: COR }}>
          <FlaskConical className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: COR }}>Lotomania · Simulador Histórico</h1>
          <p className="text-muted-foreground mt-1">Selecione exatamente 50 dezenas e descubra em quantos sorteios anteriores você teria acertado.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Volante 10×10 */}
        <Card className="border-t-4" style={{ borderTopColor: COR }}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Escolha suas dezenas</CardTitle>
              <span className={cn("text-sm font-semibold tabular-nums", count < TOTAL_DEZENAS ? "text-muted-foreground" : "")} style={count >= TOTAL_DEZENAS ? { color: COR } : {}}>
                {count}/{TOTAL_DEZENAS}
              </span>
            </div>
            <CardDescription>
              Marque exatamente 50 dezenas (01 a 99 e 00)
              {count >= TOTAL_DEZENAS && <span className="ml-2 text-amber-600 font-medium">Limite atingido</span>}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-10 gap-1">
              {/* Sequência visual do volante: 01, 02, ..., 99, 00 (última posição) */}
              {[...Array.from({ length: 99 }, (_, i) => i + 1), 0].map(n => {
                const sel = selecionadas.has(n);
                return (
                  <button
                    key={n}
                    onClick={() => toggleDezena(n)}
                    disabled={!sel && count >= TOTAL_DEZENAS}
                    className={cn(
                      "aspect-square rounded text-[10px] font-bold transition-all duration-150 select-none",
                      sel
                        ? "text-white shadow-sm ring-1 scale-105"
                        : count >= TOTAL_DEZENAS
                        ? "bg-muted/30 text-muted-foreground/40 cursor-not-allowed"
                        : "bg-muted/60 text-foreground border border-border hover:scale-105"
                    )}
                    style={sel ? { backgroundColor: COR } : {}}
                    onMouseEnter={e => { if (!sel && count < TOTAL_DEZENAS) (e.currentTarget as HTMLElement).style.backgroundColor = COR + "26"; }}
                    onMouseLeave={e => { if (!sel && count < TOTAL_DEZENAS) (e.currentTarget as HTMLElement).style.backgroundColor = ""; }}
                  >
                    {String(n).padStart(2, "0")}
                  </button>
                );
              })}
            </div>

            {count > 0 && (
              <div className="pt-2 border-t space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">Dezenas escolhidas ({count}):</p>
                <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                  {Array.from(selecionadas).sort(sortVolante).map(n => (
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
                <span className="font-semibold text-foreground">Como usar o simulador?</span>
                <ChevronDown className={cn("w-4 h-4 transition-transform shrink-0", infoAberta ? "rotate-180" : "")} />
              </button>
              {infoAberta && (
                <ol className="mt-3 space-y-1.5 list-decimal list-inside">
                  <li>Marque exatamente 50 números no volante à esquerda (00 a 99).</li>
                  <li>Defina quais concursos quer ver na tabela de resultados.</li>
                  <li>Clique em <strong>Simular</strong>.</li>
                  <li>O sistema varre todos os sorteios anteriores e indica em quantos você teria acertado cada faixa de premiação (20, 19, 18, 17, 16, 15 ou 0 acertos).</li>
                </ol>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Mostrar na tabela:</label>
                <select
                  value={filtro}
                  onChange={e => setFiltro(e.target.value as Filtro)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  style={{ "--tw-ring-color": COR } as React.CSSProperties}
                >
                  {Object.entries(FILTRO_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">Na Lotomania, apostas são premiadas com 20, 19, 18, 17, 16, 15 ou 0 acertos.</p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleSimular}
                  disabled={!podeSimular || simular.isPending}
                  className="flex-1 text-white font-semibold"
                  style={{ backgroundColor: COR }}
                >
                  {simular.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Simulando…</> : <><FlaskConical className="w-4 h-4 mr-2" />Simular</>}
                </Button>
                <Button variant="outline" onClick={handleLimpar} disabled={simular.isPending}>
                  <RotateCcw className="w-4 h-4 mr-2" />Limpar
                </Button>
              </div>

              {!podeSimular && count > 0 && (
                <p className="text-sm text-amber-600 text-center">Selecione mais {TOTAL_DEZENAS - count} dezena{TOTAL_DEZENAS - count > 1 ? "s" : ""} para simular.</p>
              )}
              {count === 0 && <p className="text-sm text-muted-foreground text-center">Selecione 50 números e clique em Simular.</p>}
            </CardContent>
          </Card>

          {resultado && (
            <Card className="border-t-4" style={{ borderTopColor: COR }}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Trophy className="w-4 h-4" style={{ color: COR }} />
                  Resultado da Simulação
                </CardTitle>
                <CardDescription>
                  50 dezenas escolhidas •{" "}
                  {resultado.totalConcursos.toLocaleString("pt-BR")} concursos •{" "}
                  {acertosGanhadores > 0
                    ? <span className="font-semibold" style={{ color: COR }}>{acertosGanhadores} premiado{acertosGanhadores > 1 ? "s" : ""}</span>
                    : "nenhum premiado"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-3">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center w-20">Acertos</TableHead>
                      <TableHead className="text-center">Probabilidade</TableHead>
                      <TableHead className="text-center w-24">Concursos</TableHead>
                      <TableHead className="text-center w-20">Situação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resumoLinhas.map(r => {
                      const premiado = FAIXAS_PREMIADAS.has(r.acertos);
                      const prob = probLotomania(r.acertos);
                      return (
                        <TableRow
                          key={r.acertos}
                          className={cn(premiado && "font-semibold")}
                          style={premiado ? { backgroundColor: COR + "0d" } : {}}
                        >
                          <TableCell className="text-center font-bold">{r.acertos}</TableCell>
                          <TableCell className="text-center text-sm tabular-nums text-muted-foreground">{prob}</TableCell>
                          <TableCell className="text-center">{r.contagem.toLocaleString("pt-BR")}</TableCell>
                          <TableCell className="text-center">
                            {premiado
                              ? <span>{PREMIADO_EMOJI}</span>
                              : <span className="text-muted-foreground text-xs">—</span>}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                <p className="mt-3 text-xs text-muted-foreground leading-snug border-t pt-3">
                  As probabilidades indicadas correspondem a uma aposta de 50 dezenas na Lotomania.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {resultado && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2">
            {totalConcursos > 0 ? (
              <>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Concursos — {FILTRO_LABELS[filtro]}</CardTitle>
                    <CardDescription>{totalConcursos.toLocaleString("pt-BR")} concurso{totalConcursos !== 1 ? "s" : ""} encontrado{totalConcursos !== 1 ? "s" : ""}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table className="w-full">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-center pl-4 whitespace-nowrap">Concurso</TableHead>
                            <TableHead className="text-center whitespace-nowrap">Data</TableHead>
                            <TableHead className="text-center">Dezenas Sorteadas</TableHead>
                            <TableHead className="text-center whitespace-nowrap">Acertos</TableHead>
                            <TableHead className="text-right pr-4 whitespace-nowrap"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {concursosPagina.map(c => {
                            const premiado = FAIXAS_PREMIADAS.has(c.acertos);
                            return (
                              <TableRow key={c.concurso}>
                                <TableCell className="text-center font-semibold pl-4 whitespace-nowrap">{c.concurso}</TableCell>
                                <TableCell className="text-center text-muted-foreground whitespace-nowrap">{formatDateShort(c.data)}</TableCell>
                                <TableCell className="text-center">
                                  <div className="flex flex-wrap justify-center gap-0.5 py-0.5">
                                    {c.dezenas.map(d => {
                                      const acertou = selecionadas.has(parseInt(d, 10));
                                      return (
                                        <span key={d} className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[9px] font-bold"
                                          style={acertou ? { backgroundColor: COR, color: "white" } : { backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }}>
                                          {d}
                                        </span>
                                      );
                                    })}
                                  </div>
                                </TableCell>
                                <TableCell className="text-center whitespace-nowrap">
                                  <span className={cn("font-semibold tabular-nums", !premiado && "text-muted-foreground font-normal")}>
                                    {c.acertos}{premiado ? ` ${PREMIADO_EMOJI}` : ""}
                                  </span>
                                </TableCell>
                                <TableCell className="text-right pr-4 whitespace-nowrap">
                                  <Link href={`/lotomania/resultado/${c.concurso}`} className="text-sm font-semibold hover:underline" style={{ color: COR }}>
                                    Ver detalhes →
                                  </Link>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
                {totalPaginasTabela > 1 && (
                  <div className="flex items-center justify-between px-2 mt-2">
                    <div className="text-sm text-muted-foreground">Página {paginaAtual} de {totalPaginasTabela}</div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setPaginaTabela(p => Math.max(1, p - 1))} disabled={paginaAtual === 1}>
                        <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setPaginaTabela(p => Math.min(totalPaginasTabela, p + 1))} disabled={paginaAtual === totalPaginasTabela}>
                        Próxima <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-16 text-muted-foreground">
                  Nenhum concurso encontrado para o filtro selecionado.
                </CardContent>
              </Card>
            )}
          </div>
          <div className="flex flex-col gap-4">
            <AdUnit slot="8899001122" format="rectangle" className="w-full" />
          </div>
        </div>
      )}
    </div>
  );
}