import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  useSimularMegaSena,
  SimulacaoResultado,
  SimuladorInputFiltro,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LotteryBall } from "@/components/ui/lottery-ball";
import { formatCurrency, formatDateShort } from "@/lib/formatters";
import { FlaskConical, RotateCcw, Loader2, Trophy } from "lucide-react";

const COR = "#009640";

const FILTRO_LABELS: Record<SimuladorInputFiltro, string> = {
  todos: "Todos os Concursos",
  premiados: "Todos Premiados (4+ acertos)",
  sena: "Sena (6 acertos)",
  quina: "Quina (5 acertos)",
  quadra: "Quadra (4 acertos)",
};

function AcertosBadge({ acertos }: { acertos: number }) {
  if (acertos === 6)
    return <Badge className="bg-[#009640] text-white hover:bg-[#007a33]">Sena</Badge>;
  if (acertos === 5)
    return <Badge className="bg-blue-600 text-white hover:bg-blue-700">Quina</Badge>;
  if (acertos === 4)
    return <Badge className="bg-amber-500 text-white hover:bg-amber-600">Quadra</Badge>;
  return <span className="text-muted-foreground text-sm">{acertos}</span>;
}

export default function MegaSenaSimulador() {
  const [selecionadas, setSelecionadas] = useState<Set<number>>(new Set());
  const [filtro, setFiltro] = useState<SimuladorInputFiltro>(SimuladorInputFiltro.premiados);
  const [resultado, setResultado] = useState<SimulacaoResultado | null>(null);

  const simular = useSimularMegaSena({
    mutation: {
      onSuccess: (data) => setResultado(data),
    },
  });

  const toggleDezena = (n: number) => {
    setSelecionadas((prev) => {
      const next = new Set(prev);
      if (next.has(n)) {
        next.delete(n);
      } else if (next.size < 20) {
        next.add(n);
      }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center text-white flex-shrink-0"
          style={{ backgroundColor: COR }}
        >
          <FlaskConical className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: COR }}>
            Simulador
          </h1>
          <p className="text-muted-foreground mt-1">
            Selecione de 6 a 20 dezenas e descubra quantos prêmios você teria ganho em todos os
            sorteios anteriores.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Coluna esquerda: grade + controles ── */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-t-4" style={{ borderTopColor: COR }}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Escolha suas dezenas</CardTitle>
                <span
                  className={cn(
                    "text-sm font-semibold tabular-nums",
                    count < 6 ? "text-muted-foreground" : "text-[#009640]"
                  )}
                >
                  {count}/20 selecionadas
                </span>
              </div>
              <CardDescription>
                Mínimo de 6 • Máximo de 20
                {count >= 20 && (
                  <span className="ml-2 text-amber-600 font-medium">Limite atingido</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Grade 6×10 */}
              <div className="grid grid-cols-10 gap-1.5">
                {Array.from({ length: 60 }, (_, i) => i + 1).map((n) => {
                  const sel = selecionadas.has(n);
                  return (
                    <button
                      key={n}
                      onClick={() => toggleDezena(n)}
                      disabled={!sel && count >= 20}
                      className={cn(
                        "aspect-square rounded-lg text-sm font-bold transition-all duration-150 select-none",
                        sel
                          ? "bg-[#009640] text-white shadow-md ring-2 ring-[#009640]/40 scale-105"
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

              {/* Dezenas selecionadas (preview) */}
              {count > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1 border-t">
                  {Array.from(selecionadas)
                    .sort((a, b) => a - b)
                    .map((n) => (
                      <LotteryBall key={n} number={n} size="sm" />
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Filtro + botões */}
          <Card>
            <CardContent className="pt-5 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Mostrar na tabela de concursos:
                </label>
                <select
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value as SimuladorInputFiltro)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#009640]"
                >
                  {Object.entries(FILTRO_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  Na Mega-Sena, prêmios a partir de 4 acertos (Quadra).
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
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Simulando…
                    </>
                  ) : (
                    <>
                      <FlaskConical className="w-4 h-4 mr-2" />
                      Simular
                    </>
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
        </div>

        {/* ── Coluna direita: publicidade / info ── */}
        <div className="hidden lg:block space-y-4">
          <Card className="bg-muted/20">
            <CardContent className="pt-6 space-y-3 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">Como funciona?</p>
              <ol className="space-y-2 list-decimal list-inside">
                <li>Escolha de 6 a 20 números no volante.</li>
                <li>Defina quais concursos quer ver na lista de resultados.</li>
                <li>Clique em <strong>Simular</strong>.</li>
                <li>
                  O sistema varre todos os sorteios anteriores e mostra quantos
                  prêmios você teria acertado.
                </li>
              </ol>
              <p className="pt-2 text-xs">
                Os valores de prêmio exibidos correspondem ao montante pago por apostador
                ganhador em cada faixa no concurso original.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Resultados ── */}
      {resultado && (
        <div className="space-y-6">
          {/* Resumo geral */}
          <Card className="border-t-4" style={{ borderTopColor: COR }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" style={{ color: COR }} />
                Resultado da Simulação
              </CardTitle>
              <CardDescription>
                Varredura de{" "}
                <strong className="text-foreground">
                  {resultado.totalConcursos.toLocaleString("pt-BR")}
                </strong>{" "}
                concursos •{" "}
                {acertosGanhadores > 0 ? (
                  <span className="text-[#009640] font-semibold">
                    {acertosGanhadores} premiado{acertosGanhadores > 1 ? "s" : ""}
                  </span>
                ) : (
                  <span className="text-muted-foreground">nenhum premiado</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tabela de acertos */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center">Acertos</TableHead>
                      <TableHead className="text-center">Concursos</TableHead>
                      <TableHead className="text-center">Situação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resultado.resumo.map((r) => (
                      <TableRow
                        key={r.acertos}
                        className={cn(r.acertos >= 4 && "bg-[#009640]/5 font-semibold")}
                      >
                        <TableCell className="text-center font-bold text-base">
                          {r.acertos}
                        </TableCell>
                        <TableCell className="text-center text-base">
                          {r.contagem.toLocaleString("pt-BR")}
                        </TableCell>
                        <TableCell className="text-center">
                          {r.acertos === 6 && r.contagem > 0 ? (
                            <span className="text-[#009640] font-semibold">Sena 🏆</span>
                          ) : r.acertos === 5 && r.contagem > 0 ? (
                            <span className="text-blue-600 font-semibold">Quina</span>
                          ) : r.acertos === 4 && r.contagem > 0 ? (
                            <span className="text-amber-600 font-semibold">Quadra</span>
                          ) : r.acertos >= 4 ? (
                            <span className="text-muted-foreground">—</span>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Total de prêmios */}
                <div className="flex flex-col justify-center items-center gap-2 p-6 rounded-xl bg-[#009640]/8 border border-[#009640]/20">
                  <p className="text-sm text-muted-foreground text-center">
                    Total que você teria ganho
                  </p>
                  <p className="text-3xl font-bold text-center" style={{ color: COR }}>
                    {formatCurrency(resultado.totalPremio)}
                  </p>
                  <p className="text-xs text-muted-foreground text-center">
                    Somando todos os prêmios de 4, 5 e 6 acertos.
                  </p>
                  {acertosGanhadores === 0 && (
                    <p className="text-sm text-muted-foreground text-center mt-2">
                      Você não teria ganho nenhum prêmio com esta combinação. 😔
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabela de concursos */}
          {resultado.concursos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Concursos — {FILTRO_LABELS[filtro]}
                </CardTitle>
                <CardDescription>
                  {resultado.concursos.length.toLocaleString("pt-BR")} concurso
                  {resultado.concursos.length !== 1 ? "s" : ""} encontrado
                  {resultado.concursos.length !== 1 ? "s" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-center">Concurso</TableHead>
                        <TableHead className="text-center">Data</TableHead>
                        <TableHead>Dezenas Sorteadas</TableHead>
                        <TableHead className="text-center">Acertos</TableHead>
                        <TableHead className="text-right">Prêmio</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {resultado.concursos.map((c) => (
                        <TableRow key={c.concurso}>
                          <TableCell className="text-center font-semibold">
                            {c.concurso}
                          </TableCell>
                          <TableCell className="text-center text-muted-foreground whitespace-nowrap">
                            {formatDateShort(c.data)}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {c.dezenas.map((d) => {
                                const numD = parseInt(d, 10);
                                const acertou = selecionadas.has(numD);
                                return (
                                  <span
                                    key={d}
                                    className={cn(
                                      "inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold",
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
                          <TableCell className="text-center">
                            <AcertosBadge acertos={c.acertos} />
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {c.premioGanho > 0 ? (
                              <span style={{ color: COR }}>{formatCurrency(c.premioGanho)}</span>
                            ) : (
                              <span className="text-muted-foreground text-sm">—</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {resultado.concursos.length === 0 && (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                Nenhum concurso encontrado para o filtro selecionado.
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
