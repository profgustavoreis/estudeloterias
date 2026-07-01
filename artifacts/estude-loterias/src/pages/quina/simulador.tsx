import { useState } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useSimularQuina, SimulacaoResultado } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LotteryBall } from "@/components/ui/lottery-ball";
import { formatDateShort } from "@/lib/formatters";
import { AdUnit } from "@/components/ui/AdUnit";
import { FlaskConical, RotateCcw, Loader2, Trophy, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";

const COR = "#260085";

type Filtro = "todos" | "premiados" | "quina" | "quadra" | "terno" | "duque";

const FILTRO_LABELS: Record<Filtro, string> = {
  todos:     "Todos os concursos",
  premiados: "Somente concursos premiados (2 ou mais acertos)",
  quina:     "Somente concursos com 5 acertos (quina)",
  quadra:    "Somente concursos com 4 acertos (quadra)",
  terno:     "Somente concursos com 3 acertos (terno)",
  duque:     "Somente concursos com 2 acertos (duque)",
};

const PREMIADO_EMOJI = "⭐";
const PAGE_SIZE = 20;

// ── Combinatória ─────────────────────────────────────────────────────────────
function comb(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  k = Math.min(k, n - k);
  let r = 1;
  for (let i = 0; i < k; i++) r = (r * (n - i)) / (i + 1);
  return Math.round(r);
}

// "1 em X" para k acertos com N dezenas escolhidas na Quina (80 números, sorteiam 5)
function probQuina(k: number, N: number): string {
  const total = comb(80, 5);
  const ways = comb(N, k) * comb(80 - N, 5 - k);
  if (ways <= 0) return "—";
  const x = total / ways;
  if (x >= 10) return `1 em ${Math.round(x).toLocaleString("pt-BR")}`;
  return `1 em ${x.toFixed(2).replace(".", ",")}`;
}

export default function QuinaSimulador() {
  const [selecionadas, setSelecionadas] = useState<Set<number>>(new Set());
  const [filtro, setFiltro] = useState<Filtro>("premiados");
  const [resultado, setResultado] = useState<SimulacaoResultado | null>(null);
  const [nSimulado, setNSimulado] = useState<number>(5);
  const [infoAberta, setInfoAberta] = useState(false);
  const [paginaTabela, setPaginaTabela] = useState(1);

  const simular = useSimularQuina({
    mutation: {
      onSuccess: data => {
        setResultado(data);
        setNSimulado(selecionadas.size);
        setPaginaTabela(1);
      },
    },
  });

  const toggleDezena = (n: number) => {
    setSelecionadas(prev => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else if (next.size < 15) next.add(n);
      return next;
    });
  };

  const handleSimular = () => {
    const dezenas = Array.from(selecionadas).sort((a, b) => a - b).map(n => String(n).padStart(2, "0"));
    simular.mutate({ data: { dezenas, filtro } });
  };

  const handleLimpar = () => {
    setSelecionadas(new Set());
    setResultado(null);
    simular.reset();
  };

  const podeSimular = selecionadas.size >= 5;
  const count = selecionadas.size;

  const acertosGanhadores = resultado?.resumo.filter(r => r.acertos >= 2).reduce((acc, r) => acc + r.contagem, 0) ?? 0;
  const totalConcursos = resultado?.concursos.length ?? 0;
  const totalPaginasTabela = Math.max(1, Math.ceil(totalConcursos / PAGE_SIZE));
  const paginaAtual = Math.min(paginaTabela, totalPaginasTabela);
  const concursosPagina = resultado?.concursos.slice((paginaAtual - 1) * PAGE_SIZE, paginaAtual * PAGE_SIZE) ?? [];

  // Linhas da tabela de resumo: acertos 5 → 0
  const resumoLinhas = resultado?.resumo.filter(r => r.acertos >= 0 && r.acertos <= 5) ?? [];

  const rodapeProb = nSimulado === 5
    ? "As probabilidades indicadas correspondem a uma aposta simples de 5 dezenas."
    : `As probabilidades indicadas correspondem a uma aposta múltipla de ${nSimulado} dezenas.`;

  return (
    <div className="space-y-6">
      <PageSEO
        title="Simulador Histórico da Quina — Teste sua Aposta no Histórico"
        description="Escolha suas dezenas e descubra em quantos sorteios da Quina você teria ganhado. Simulador histórico gratuito e completo."
        canonical="/quina/simulador"
      />
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: COR }}>
          <FlaskConical className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: COR }}>Quina · Simulador Histórico</h1>
          <p className="text-muted-foreground mt-1">Selecione de 5 a 15 dezenas e descubra em quantos sorteios anteriores você teria acertado.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Volante 8×10 */}
        <Card className="border-t-4" style={{ borderTopColor: COR }}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Escolha suas dezenas</CardTitle>
              <span className={cn("text-sm font-semibold tabular-nums", count < 5 ? "text-muted-foreground" : "")} style={count >= 5 ? { color: COR } : {}}>
                {count}/15
              </span>
            </div>
            <CardDescription>
              Mínimo de 5 • Máximo de 15
              {count >= 15 && <span className="ml-2 text-amber-600 font-medium">Limite atingido</span>}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-10 gap-1.5">
              {Array.from({ length: 80 }, (_, i) => i + 1).map(n => {
                const sel = selecionadas.has(n);
                return (
                  <button
                    key={n}
                    onClick={() => toggleDezena(n)}
                    disabled={!sel && count >= 15}
                    className={cn(
                      "aspect-square rounded-md text-xs font-bold transition-all duration-150 select-none",
                      sel
                        ? "text-white shadow-sm ring-2 scale-105"
                        : count >= 15
                        ? "bg-muted/30 text-muted-foreground/40 cursor-not-allowed"
                        : "bg-muted/60 text-foreground border border-border hover:scale-105"
                    )}
                    style={sel ? { backgroundColor: COR } : {}}
                    onMouseEnter={e => { if (!sel && count < 15) (e.currentTarget as HTMLElement).style.backgroundColor = COR + "26"; }}
                    onMouseLeave={e => { if (!sel && count < 15) (e.currentTarget as HTMLElement).style.backgroundColor = ""; }}
                  >
                    {String(n).padStart(2, "0")}
                  </button>
                );
              })}
            </div>

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
                <span className="font-semibold text-foreground">Como usar o simulador?</span>
                <ChevronDown className={cn("w-4 h-4 transition-transform shrink-0", infoAberta ? "rotate-180" : "")} />
              </button>
              {infoAberta && (
                <ol className="mt-3 space-y-1.5 list-decimal list-inside">
                  <li>Escolha de 5 a 15 números no volante à esquerda.</li>
                  <li>Defina quais concursos quer ver na tabela de resultados.</li>
                  <li>Clique em <strong>Simular</strong>.</li>
                  <li>O sistema varre todos os sorteios anteriores e indica em quantos você teria acertado cada faixa de premiação.</li>
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
                <p className="text-xs text-muted-foreground">Na Quina, apostas são premiadas a partir de 2 acertos (duque).</p>
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
                <p className="text-sm text-amber-600 text-center">Selecione pelo menos {5 - count} dezena{5 - count > 1 ? "s" : ""} para simular.</p>
              )}
              {count === 0 && <p className="text-sm text-muted-foreground text-center">Selecione os números e clique em Simular.</p>}
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
                  {nSimulado} dezenas escolhidas •{" "}
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
                      const premiado = r.acertos >= 2;
                      const prob = probQuina(r.acertos, nSimulado);
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
                  {rodapeProb}
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
                            const premiado = c.acertos >= 2;
                            return (
                              <TableRow key={c.concurso}>
                                <TableCell className="text-center font-semibold pl-4 whitespace-nowrap">{c.concurso}</TableCell>
                                <TableCell className="text-center text-muted-foreground whitespace-nowrap">{formatDateShort(c.data)}</TableCell>
                                <TableCell className="text-center">
                                  <div className="flex flex-wrap justify-center gap-0.5 py-0.5">
                                    {c.dezenas.map(d => {
                                      const acertou = selecionadas.has(parseInt(d, 10));
                                      return (
                                        <span key={d} className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold"
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
                                  <Link href={`/quina/resultado/${c.concurso}`} className="text-sm font-semibold hover:underline" style={{ color: COR }}>
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
            <AdUnit slot="5586112233" format="rectangle" className="w-full" />
          </div>
        </div>
      )}
    </div>
  );
}
