import { useState } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useSimularMaismilionaria, SimulacaoResultado } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LotteryBall } from "@/components/ui/lottery-ball";
import { formatDateShort } from "@/lib/formatters";
import { AdUnit } from "@/components/ui/AdUnit";
import { FlaskConical, RotateCcw, Loader2, Trophy, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";

const COR = "#2E3078";
const BALL_BG = "#2E3078";
const BALL_TEXT = "#ffffff";
const TOTAL_DEZENAS = 6;
const TOTAL_TREVOS = 2;
const PAGE_SIZE = 20;

type Filtro = "todos" | "premiados" | "seis" | "cinco" | "quatro" | "tres";

const FILTRO_LABELS: Record<Filtro, string> = {
  todos:       "Todos os concursos",
  premiados:   "Somente concursos premiados",
  seis:        "Somente faixas com 6 acertos (6+2, 6+1 ou 6+0)",
  cinco:       "Somente faixas com 5 acertos (5+2, 5+1 ou 5+0)",
  quatro:      "Somente faixas com 4 acertos (4+2, 4+1 ou 4+0)",
  tres:        "Somente faixas com 3 acertos (3+2, 3+1)",
};

export default function MaismilionariaSimulador() {
  const [selecionadas, setSelecionadas] = useState<Set<number>>(new Set());
  const [trevosSelecionados, setTrevosSelecionados] = useState<Set<number>>(new Set());
  const [filtro, setFiltro] = useState<Filtro>("premiados");
  const [resultado, setResultado] = useState<SimulacaoResultado | null>(null);
  const [infoAberta, setInfoAberta] = useState(false);
  const [paginaTabela, setPaginaTabela] = useState(1);

  const simular = useSimularMaismilionaria({ mutation: { onSuccess: data => { setResultado(data); setPaginaTabela(1); } } });

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

  const handleSimular = () => {
    const dezenas = Array.from(selecionadas).sort((a, b) => a - b).map(n => String(n).padStart(2, "0"));
    const trevos = Array.from(trevosSelecionados).sort((a, b) => a - b).map(n => String(n));
    simular.mutate({ data: { dezenas, trevos, filtro } });
  };

  const handleLimpar = () => { setSelecionadas(new Set()); setTrevosSelecionados(new Set()); setResultado(null); simular.reset(); };

  const podeSimular = selecionadas.size === TOTAL_DEZENAS && trevosSelecionados.size === TOTAL_TREVOS;
  const count = selecionadas.size;
  const countTrevos = trevosSelecionados.size;

  const faixas = resultado?.faixas ?? [];
  const totalPremiados = resultado?.faixas?.reduce((acc, f) => acc + f.contagem, 0) ?? 0;
  const totalConcursos = resultado?.concursos.length ?? 0;
  const totalPaginasTabela = Math.max(1, Math.ceil(totalConcursos / PAGE_SIZE));
  const paginaAtual = Math.min(paginaTabela, totalPaginasTabela);
  const concursosPagina = resultado?.concursos.slice((paginaAtual - 1) * PAGE_SIZE, paginaAtual * PAGE_SIZE) ?? [];

  function faixaLabel(acertos: number, acertosTrevos: number): string {
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
    return `${acertos}+${acertosTrevos}`;
  }

  return (
    <div className="space-y-6">
      <PageSEO
        title="Simulador Histórico da +Milionária — Teste sua Aposta no Histórico"
        description="Escolha suas 6 dezenas e 2 trevos da sorte e descubra em quantos sorteios da +Milionária você teria ganhado. Simulador histórico gratuito e completo."
        canonical="/maismilionaria/simulador"
      />
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: COR }}>
          <FlaskConical className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: COR }}>+Milionária · Simulador Histórico</h1>
          <p className="text-muted-foreground mt-1">Selecione exatamente 6 dezenas e 2 trevos da sorte e descubra em quantos sorteios anteriores você teria acertado.</p>
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
          <CardContent>
            <div className="grid grid-cols-10 gap-1">
              {Array.from({ length: 50 }, (_, i) => i + 1).map(n => {
                const sel = selecionadas.has(n);
                return (
                  <button key={n} onClick={() => toggleDezena(n)} disabled={!sel && count >= TOTAL_DEZENAS}
                    className={cn("aspect-square rounded text-[10px] font-bold transition-all duration-150 select-none",
                      sel ? "text-white shadow-sm ring-1 scale-105" : count >= TOTAL_DEZENAS ? "bg-muted/30 text-muted-foreground/40 cursor-not-allowed" : "bg-muted/60 text-foreground border border-border hover:scale-105")}
                    style={sel ? { backgroundColor: COR } : {}}
                    onMouseEnter={e => { if (!sel && count < TOTAL_DEZENAS) (e.currentTarget as HTMLElement).style.backgroundColor = COR + "26"; }}
                    onMouseLeave={e => { if (!sel && count < TOTAL_DEZENAS) (e.currentTarget as HTMLElement).style.backgroundColor = ""; }}>
                    {String(n).padStart(2, "0")}
                  </button>
                );
              })}
            </div>
            {count > 0 && (
              <div className="pt-2 border-t mt-3 space-y-1.5">
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
                return (
                  <button key={n} onClick={() => toggleTrevo(n)} disabled={!sel && countTrevos >= TOTAL_TREVOS}
                    className={cn("w-12 h-12 rounded-full text-sm font-bold transition-all duration-150 select-none",
                      sel ? "text-white shadow-sm ring-1 scale-105" : countTrevos >= TOTAL_TREVOS ? "bg-muted/30 text-muted-foreground/40 cursor-not-allowed" : "bg-muted/60 text-foreground border border-border hover:scale-105")}
                    style={sel ? { backgroundColor: COR } : {}}
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
                <span className="font-semibold text-foreground">Como usar o simulador?</span>
                <ChevronDown className={cn("w-4 h-4 transition-transform shrink-0", infoAberta ? "rotate-180" : "")} />
              </button>
              {infoAberta && (
                <ol className="mt-3 space-y-1.5 list-decimal list-inside">
                  <li>Marque exatamente <strong>6 números</strong> no volante à esquerda (01 a 50).</li>
                  <li>Marque exatamente <strong>2 trevos da sorte</strong> (1 a 6).</li>
                  <li>Defina quais concursos quer ver na tabela de resultados.</li>
                  <li>Clique em <strong>Simular</strong>.</li>
                  <li>O sistema varre todos os sorteios anteriores e indica em quantos você teria acertado cada faixa de premiação, considerando suas dezenas e trevos.</li>
                </ol>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Mostrar na tabela:</label>
                <select value={filtro} onChange={e => setFiltro(e.target.value as Filtro)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2" style={{ "--tw-ring-color": COR } as React.CSSProperties}>
                  {Object.entries(FILTRO_LABELS).map(([value, label]) => (<option key={value} value={value}>{label}</option>))}
                </select>
                <p className="text-xs text-muted-foreground">Na +Milionária, as faixas de premiação combinam acertos nas dezenas (D) e nos trevos (T).</p>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleSimular} disabled={!podeSimular || simular.isPending} className="flex-1 text-white font-semibold" style={{ backgroundColor: COR }}>
                  {simular.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Simulando…</> : <><FlaskConical className="w-4 h-4 mr-2" />Simular</>}
                </Button>
                <Button variant="outline" onClick={handleLimpar} disabled={simular.isPending}><RotateCcw className="w-4 h-4 mr-2" />Limpar</Button>
              </div>

              {!podeSimular && (count > 0 || countTrevos > 0) && (
                <p className="text-sm text-amber-600 text-center">
                  {count < TOTAL_DEZENAS && `Selecione mais ${TOTAL_DEZENAS - count} dezena${TOTAL_DEZENAS - count > 1 ? "s" : ""}`}
                  {count < TOTAL_DEZENAS && countTrevos < TOTAL_TREVOS && " e "}
                  {countTrevos < TOTAL_TREVOS && `mais ${TOTAL_TREVOS - countTrevos} trevo${TOTAL_TREVOS - countTrevos > 1 ? "s" : ""}`}
                  {" para simular."}
                </p>
              )}
              {count === 0 && countTrevos === 0 && <p className="text-sm text-muted-foreground text-center">Selecione 6 números e 2 trevos e clique em Simular.</p>}
            </CardContent>
          </Card>

          {resultado && (
            <Card className="border-t-4" style={{ borderTopColor: COR }}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base"><Trophy className="w-4 h-4" style={{ color: COR }} />Resultado da Simulação</CardTitle>
                <CardDescription>
                  6 dezenas • 2 trevos • {resultado.totalConcursos.toLocaleString("pt-BR")} concursos •{" "}
                  {totalPremiados > 0 ? <span className="font-semibold" style={{ color: COR }}>{totalPremiados} faixa{totalPremiados > 1 ? "s" : ""} premiada{totalPremiados > 1 ? "s" : ""}</span> : "nenhuma faixa premiada"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center w-24">Faixa (D+T)</TableHead>
                      <TableHead className="text-center">Probabilidade</TableHead>
                      <TableHead className="text-center w-24">Concursos</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {faixas.map(f => (
                      <TableRow key={f.label} className={cn(f.contagem > 0 ? "font-semibold" : "text-muted-foreground")} style={f.contagem > 0 ? { backgroundColor: COR + "0d" } : {}}>
                        <TableCell className="text-center font-bold">{f.label}</TableCell>
                        <TableCell className="text-center text-sm tabular-nums">{f.probabilidade}</TableCell>
                        <TableCell className="text-center">{f.contagem.toLocaleString("pt-BR")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <p className="mt-3 text-xs text-muted-foreground leading-snug border-t pt-3">Probabilidades calculadas sobre o espaço amostral completo da +Milionária: C(50,6) × C(6,2) = 238.360.500 combinações possíveis.</p>
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
                            <TableHead className="text-center">Trevos</TableHead>
                            <TableHead className="text-center whitespace-nowrap">Acertos</TableHead>
                            <TableHead className="text-right pr-4 whitespace-nowrap"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {concursosPagina.map(c => {
                            const label = faixaLabel(c.acertos, c.acertosTrevos ?? 0);
                            const isPremiado = c.acertos >= 2;
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
                                          style={acertou ? { backgroundColor: COR, color: "white" } : { backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }}>{d}</span>
                                      );
                                    })}
                                  </div>
                                </TableCell>
                                <TableCell className="text-center">
                                  {c.trevos && c.trevos.length > 0 ? (
                                    <div className="flex justify-center gap-0.5">
                                      {c.trevos.map(t => {
                                        const acertou = trevosSelecionados.has(parseInt(t, 10));
                                        return (
                                          <span key={t} className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[9px] font-bold"
                                            style={acertou ? { backgroundColor: COR, color: "white" } : { backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }}>{t}</span>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <span className="text-[9px] text-muted-foreground">—</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-center whitespace-nowrap">
                                  <span className={cn("font-semibold tabular-nums", !isPremiado && "text-muted-foreground font-normal")}>{label}</span>
                                </TableCell>
                                <TableCell className="text-right pr-4 whitespace-nowrap">
                                  <Link href={`/maismilionaria/resultado/${c.concurso}`} className="text-sm font-semibold hover:underline" style={{ color: COR }}>Ver detalhes →</Link>
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
                      <Button variant="outline" size="sm" onClick={() => setPaginaTabela(p => Math.max(1, p - 1))} disabled={paginaAtual === 1}><ChevronLeft className="w-4 h-4 mr-1" /> Anterior</Button>
                      <Button variant="outline" size="sm" onClick={() => setPaginaTabela(p => Math.min(totalPaginasTabela, p + 1))} disabled={paginaAtual === totalPaginasTabela}><ChevronRight className="w-4 h-4 ml-1" /> Próxima</Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <Card><CardContent className="flex items-center justify-center py-16 text-muted-foreground">Nenhum concurso encontrado para o filtro selecionado.</CardContent></Card>
            )}
          </div>
          <div className="flex flex-col gap-4">
            <AdUnit slot="8899001133" format="rectangle" className="w-full" />
          </div>
        </div>
      )}
    </div>
  );
}
