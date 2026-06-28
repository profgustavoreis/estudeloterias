import { useState } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import {
  useSimularMegaSena,
  SimulacaoResultado,
  SimuladorInputFiltro,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LotteryBall } from "@/components/ui/lottery-ball";
import { formatDateShort } from "@/lib/formatters";
import { AdUnit } from "@/components/ui/AdUnit";
import { FlaskConical, RotateCcw, Loader2, Trophy, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";

const COR = "#009640";

// ── Combinatória ─────────────────────────────────────────────────────────────
function comb(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  k = Math.min(k, n - k);
  let r = 1;
  for (let i = 0; i < k; i++) r = (r * (n - i)) / (i + 1);
  return Math.round(r);
}

// "1 em X" para k acertos com N dezenas escolhidas na Mega-Sena (60 números, sorteiam 6)
function probMegaSena(k: number, N: number): string {
  const total = comb(60, 6); // 50.063.860
  const ways = comb(N, k) * comb(60 - N, 6 - k);
  if (ways <= 0) return "—";
  const x = total / ways;
  if (x >= 100) return `1 em ${Math.round(x).toLocaleString("pt-BR")}`;
  if (x >= 10)  return `1 em ${Math.round(x).toLocaleString("pt-BR")}`;
  return `1 em ${x.toFixed(2).replace(".", ",")}`;
}

const FILTRO_LABELS: Record<SimuladorInputFiltro, string> = {
  todos:     "Todos os concursos",
  premiados: "Somente concursos premiados (4 ou mais acertos)",
  quadra:    "Somente concursos com 4 acertos",
  quina:     "Somente concursos com 5 acertos",
  sena:      "Somente concursos com 6 acertos",
};

const PREMIADO_EMOJI = "⭐";

export default function MegaSenaSimulador() {
  const [selecionadas, setSelecionadas] = useState<Set<number>>(new Set());
  const [filtro, setFiltro] = useState<SimuladorInputFiltro>(SimuladorInputFiltro.premiados);
  const [resultado, setResultado] = useState<SimulacaoResultado | null>(null);
  const [nSimulado, setNSimulado] = useState<number>(6);
  const [infoAberta, setInfoAberta] = useState(false);
  const [paginaTabela, setPaginaTabela] = useState(1);

  const PAGE_SIZE = 20;

  const simular = useSimularMegaSena({
    mutation: {
      onSuccess: (data) => {
        setResultado(data);
        setNSimulado(selecionadas.size);
        setPaginaTabela(1);
      },
    },
  });

  const toggleDezena = (n: number) => {
    setSelecionadas((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else if (next.size < 20) next.add(n);
      return next;
    });
  };

  const handleSimular = () => {
    const dezenas = Array.from(selecionadas)
      .sort((a, b) => a - b)
      .map((n) => String(n).padStart(2, "0"));
    simular.mutate({ data: { dezenas, filtro } });
  };

  const handleLimpar = () => {
    setSelecionadas(new Set());
    setResultado(null);
    simular.reset();
  };

  const podeSimular = selecionadas.size >= 6;
  const count = selecionadas.size;

  const acertosGanhadores = resultado?.resumo
    .filter((r) => r.acertos >= 4)
    .reduce((acc, r) => acc + r.contagem, 0) ?? 0;

  const totalConcursos = resultado?.concursos.length ?? 0;
  const totalPaginasTabela = Math.max(1, Math.ceil(totalConcursos / PAGE_SIZE));
  const paginaAtual = Math.min(paginaTabela, totalPaginasTabela);
  const concursosPagina = resultado?.concursos.slice(
    (paginaAtual - 1) * PAGE_SIZE,
    paginaAtual * PAGE_SIZE
  ) ?? [];

  return (
    <div className="space-y-6">
      <PageSEO
        title="Simulador Histórico da Mega-Sena — Teste sua Aposta no Histórico"
        description="Escolha suas dezenas e descubra em quantos dos mais de 3.000 sorteios da Mega-Sena você teria ganhado. Simulador histórico gratuito e completo."
        canonical="/mega-sena/simulador"
      />
      {/* ── Header ── */}
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center text-white flex-shrink-0"
          style={{ backgroundColor: COR }}
        >
          <FlaskConical className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: COR }}>
            Mega-Sena · Simulador Histórico
          </h1>
          <p className="text-muted-foreground mt-1">
            Selecione de 6 a 20 dezenas e descubra em quantos sorteios anteriores você teria acertado.
          </p>
        </div>
      </div>

      {/* ── Layout principal: 1/2 + 1/2 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Coluna 1: Volante ── */}
        <Card className="border-t-4" style={{ borderTopColor: COR }}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Escolha suas dezenas</CardTitle>
              <span className={cn(
                "text-sm font-semibold tabular-nums",
                count < 6 ? "text-muted-foreground" : "text-[#009640]"
              )}>
                {count}/20
              </span>
            </div>
            <CardDescription>
              Mínimo de 6 • Máximo de 20
              {count >= 20 && (
                <span className="ml-2 text-amber-600 font-medium">Limite atingido</span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-10 gap-1.5">
              {Array.from({ length: 60 }, (_, i) => i + 1).map((n) => {
                const sel = selecionadas.has(n);
                return (
                  <button
                    key={n}
                    onClick={() => toggleDezena(n)}
                    disabled={!sel && count >= 20}
                    className={cn(
                      "aspect-square rounded-md text-sm font-bold transition-all duration-150 select-none",
                      sel
                        ? "bg-[#009640] text-white shadow-sm ring-2 ring-[#009640]/30 scale-105"
                        : count >= 20
                        ? "bg-muted/30 text-muted-foreground/40 cursor-not-allowed"
                        : "bg-muted/60 text-foreground hover:bg-[#009640]/15 hover:text-[#009640] hover:scale-105 border border-border"
                    )}
                  >
                    {String(n).padStart(2, "0")}
                  </button>
                );
              })}
            </div>

            {count > 0 && (
              <div className="pt-2 border-t space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">
                  Dezenas escolhidas:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {Array.from(selecionadas)
                    .sort((a, b) => a - b)
                    .map((n) => (
                      <LotteryBall key={n} number={n} size="sm" />
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Coluna 2: Controles ── */}
        <div className="space-y-4">
          {/* Accordion "Como usar o simulador?" */}
          <Card className="bg-muted/20">
            <CardContent className="pt-5 text-sm text-muted-foreground">
              <button
                className="flex w-full items-center justify-between"
                onClick={() => setInfoAberta((v) => !v)}
              >
                <span className="font-semibold text-foreground">Como usar o simulador?</span>
                <ChevronDown className={cn(
                  "w-4 h-4 transition-transform shrink-0",
                  infoAberta ? "rotate-180" : ""
                )} />
              </button>
              {infoAberta && (
                <ol className="mt-3 space-y-1.5 list-decimal list-inside">
                  <li>Escolha de 6 a 20 números no volante à esquerda.</li>
                  <li>Defina quais concursos quer ver na tabela de resultados.</li>
                  <li>Clique em <strong>Simular</strong>.</li>
                  <li>
                    O sistema varre todos os sorteios anteriores e indica em
                    quantos você teria acertado cada faixa de premiação.
                  </li>
                </ol>
              )}
            </CardContent>
          </Card>

          {/* Filtro + Botões */}
          <Card>
            <CardContent className="pt-5 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Mostrar na tabela:
                </label>
                <select
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value as SimuladorInputFiltro)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#009640]"
                >
                  {Object.entries(FILTRO_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  Na Mega-Sena, apostas são premiadas a partir de 4 acertos.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleSimular}
                  disabled={!podeSimular || simular.isPending}
                  className="flex-1 text-white font-semibold"
                  style={{ backgroundColor: COR }}
                >
                  {simular.isPending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Simulando…</>
                  ) : (
                    <><FlaskConical className="w-4 h-4 mr-2" />Simular</>
                  )}
                </Button>
                <Button variant="outline" onClick={handleLimpar} disabled={simular.isPending}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Limpar
                </Button>
              </div>

              {!podeSimular && count > 0 && (
                <p className="text-sm text-amber-600 text-center">
                  Selecione pelo menos {6 - count} dezena{6 - count > 1 ? "s" : ""} para simular.
                </p>
              )}
              {count === 0 && (
                <p className="text-sm text-muted-foreground text-center">
                  Selecione os números e clique em Simular.
                </p>
              )}
            </CardContent>
          </Card>

          {/* ── Resultado da Simulação (aparece após simular) ── */}
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
                  {acertosGanhadores > 0 ? (
                    <span className="text-[#009640] font-semibold">
                      {acertosGanhadores} premiado{acertosGanhadores > 1 ? "s" : ""}
                    </span>
                  ) : "nenhum premiado"}
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
                    {resultado.resumo.map((r) => {
                      const premiado = r.acertos >= 4;
                      const prob = probMegaSena(r.acertos, nSimulado);
                      return (
                        <TableRow
                          key={r.acertos}
                          className={cn(premiado && "font-semibold")}
                          style={premiado ? { backgroundColor: COR + "0d" } : {}}
                        >
                          <TableCell className="text-center font-bold">{r.acertos}</TableCell>
                          <TableCell className="text-center text-sm tabular-nums text-muted-foreground">{prob}</TableCell>
                          <TableCell className="text-center">
                            {r.contagem.toLocaleString("pt-BR")}
                          </TableCell>
                          <TableCell className="text-center">
                            {premiado
                              ? <span>{PREMIADO_EMOJI}</span>
                              : <span className="text-muted-foreground text-xs">—</span>
                            }
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                <p className="mt-3 text-xs text-muted-foreground leading-snug border-t pt-3">
                  {nSimulado === 6
                    ? "As probabilidades indicadas correspondem a uma aposta simples de 6 dezenas."
                    : `As probabilidades indicadas correspondem a uma aposta múltipla de ${nSimulado} dezenas.`}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* ── Tabela de concursos + Publicidade ── */}
      {resultado && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* ── Colunas 1–2 (2/3): Tabela de concursos ── */}
          <div className="lg:col-span-2">
            {totalConcursos > 0 ? (
              <>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    Concursos — {FILTRO_LABELS[filtro]}
                  </CardTitle>
                  <CardDescription>
                    {totalConcursos.toLocaleString("pt-BR")} concurso
                    {totalConcursos !== 1 ? "s" : ""} encontrado
                    {totalConcursos !== 1 ? "s" : ""}
                  </CardDescription>
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
                        {concursosPagina.map((c) => {
                          const premiado = c.acertos >= 4;
                          return (
                            <TableRow key={c.concurso}>
                              <TableCell className="text-center font-semibold pl-4 whitespace-nowrap">
                                {c.concurso}
                              </TableCell>
                              <TableCell className="text-center text-muted-foreground whitespace-nowrap">
                                {formatDateShort(c.data)}
                              </TableCell>
                              <TableCell className="text-center">
                                {/* Mobile: 3 por linha. sm+: flex wrap centralizado */}
                                <div className="grid grid-cols-3 gap-1 py-0.5 sm:flex sm:flex-wrap sm:justify-center sm:gap-1">
                                  {c.dezenas.map((d) => {
                                    const acertou = selecionadas.has(parseInt(d, 10));
                                    return (
                                      <span
                                        key={d}
                                        className={cn(
                                          "inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold mx-auto sm:mx-0",
                                          acertou
                                            ? "bg-[#009640] text-white"
                                            : "bg-muted text-muted-foreground"
                                        )}
                                      >
                                        {d}
                                      </span>
                                    );
                                  })}
                                </div>
                              </TableCell>
                              <TableCell className="text-center whitespace-nowrap">
                                <span className={cn(
                                  "font-semibold tabular-nums",
                                  premiado ? "text-foreground" : "text-muted-foreground font-normal"
                                )}>
                                  {c.acertos}{premiado ? ` ${PREMIADO_EMOJI}` : ""}
                                </span>
                              </TableCell>
                              <TableCell className="text-right pr-4 whitespace-nowrap">
                                <Link
                                  href={`/mega-sena/resultado/${c.concurso}`}
                                  className="text-sm font-semibold text-[#009640] hover:underline"
                                >
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
                  <div className="text-sm text-muted-foreground">
                    Página {paginaAtual} de {totalPaginasTabela} ({totalConcursos.toLocaleString("pt-BR")} concursos)
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPaginaTabela(p => Math.max(1, p - 1))}
                      disabled={paginaAtual === 1}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPaginaTabela(p => Math.min(totalPaginasTabela, p + 1))}
                      disabled={paginaAtual === totalPaginasTabela}
                    >
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

          {/* ── Coluna 3 (1/3): Publicidade ── */}
          <div className="flex flex-col gap-4">
            <AdUnit slot="5586112233" format="rectangle" className="w-full" />
          </div>
        </div>
      )}
    </div>
  );
}
