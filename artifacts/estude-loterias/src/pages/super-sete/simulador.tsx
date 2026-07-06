import { useState } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useSimularSuperSete, SimulacaoResultado, SimuladorInputSuperSeteFiltro } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdUnit } from "@/components/ui/AdUnit";
import { FlaskConical, RotateCcw, Loader2, Trophy, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";
import { DigitColumnsPicker } from "@/components/super-sete/DigitColumnsPicker";

const COR = "#a8cf45";

const PAGE_SIZE = 20;

const FILTRO_LABELS: Record<SimuladorInputSuperSeteFiltro, string> = {
  [SimuladorInputSuperSeteFiltro.todos]: "Todos os concursos",
  [SimuladorInputSuperSeteFiltro.premiados]: "Somente concursos premiados (3 ou mais acertos)",
  [SimuladorInputSuperSeteFiltro.NUMBER_7]: "Somente concursos com 7 acertos",
  [SimuladorInputSuperSeteFiltro.NUMBER_6]: "Somente concursos com 6 acertos",
  [SimuladorInputSuperSeteFiltro.NUMBER_5]: "Somente concursos com 5 acertos",
  [SimuladorInputSuperSeteFiltro.NUMBER_4]: "Somente concursos com 4 acertos",
  [SimuladorInputSuperSeteFiltro.NUMBER_3]: "Somente concursos com 3 acertos",
};

const FAIXAS_PREMIADAS = new Set([3, 4, 5, 6, 7]);

function computeDigitosPorColunaArray(values: (string | string[])[]): number[] {
  return values.map((v) => {
    if (Array.isArray(v)) return v.length;
    if (typeof v === "string" && v !== "") return 1;
    return 0;
  });
}

function probSuperSete(k: number, digitosPorColunaArray: number[]): string {
  const total = 10 ** 7;

  // DP: coefficient of x^k in ∏ (d_i * x + (10 - d_i))
  const dp: number[] = [1];
  for (let i = 0; i < 7; i++) {
    const d = digitosPorColunaArray[i];
    const next = new Array(dp.length + 1).fill(0);
    for (let j = 0; j < dp.length; j++) {
      next[j] += dp[j] * (10 - d);
      next[j + 1] += dp[j] * d;
    }
    dp.splice(0, dp.length, ...next);
  }

  const ways = dp[k] ?? 0;
  if (ways <= 0) return "—";
  const x = total / ways;
  if (x >= 100) return `1 em ${Math.round(x).toLocaleString("pt-BR")}`;
  if (x >= 10) return `1 em ${Math.round(x).toLocaleString("pt-BR")}`;
  return `1 em ${x.toFixed(2).replace(".", ",")}`;
}

export default function SuperSeteSimulador() {
  const [values, setValues] = useState<(string | string[])[]>(Array(7).fill(""));
  const [filtro, setFiltro] = useState<SimuladorInputSuperSeteFiltro>(SimuladorInputSuperSeteFiltro.premiados);
  const [filtroAtivo, setFiltroAtivo] = useState<SimuladorInputSuperSeteFiltro>(SimuladorInputSuperSeteFiltro.premiados);
  const [resultado, setResultado] = useState<SimulacaoResultado | null>(null);
  const [infoAberta, setInfoAberta] = useState(false);
  const [paginaTabela, setPaginaTabela] = useState(1);

  const simular = useSimularSuperSete({
    mutation: {
      onSuccess: (data) => {
        setResultado(data);
        setPaginaTabela(1);
      },
    },
  });

  const handleSimular = () => {
    const filled = values.map((v) => (typeof v === "string" && v !== "" ? [v] : Array.isArray(v) ? v : []));
    const allFilled = filled.every((f) => f.length > 0);
    if (!allFilled) return;

    setFiltroAtivo(filtro);
    simular.mutate({ data: { dezenasMultipla: filled, filtro } });
  };

  const handleLimpar = () => {
    setValues(Array(7).fill(""));
    setResultado(null);
    setPaginaTabela(1);
    simular.reset();
  };

  const allFilled = values.every((v) => {
    if (typeof v === "string") return v !== "";
    return Array.isArray(v) && v.length > 0;
  });

  const acertosGanhadores =
    resultado?.resumo.filter((r) => FAIXAS_PREMIADAS.has(r.acertos)).reduce((acc, r) => acc + r.contagem, 0) ?? 0;
  const resumoLinhas = resultado?.resumo.toSorted((a, b) => b.acertos - a.acertos) ?? [];
  const digitosPorColunaArray = computeDigitosPorColunaArray(values);

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
        title="Simulador Histórico da Super Sete — Teste sua Aposta no Histórico"
        description="Escolha seus 7 números por coluna e descubra em quantos sorteios da Super Sete você teria ganhado. Simulador histórico gratuito."
        canonical="/super-sete/simulador"
      />
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: COR }}>
          <FlaskConical className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: COR }}>Super Sete · Simulador Histórico</h1>
          <p className="text-muted-foreground mt-1">Escolha 1 a 3 números por coluna e descubra em quantos sorteios anteriores você teria acertado.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* DigitColumnsPicker */}
        <Card className="border-t-4" style={{ borderTopColor: COR }}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Escolha seus números</CardTitle>
              <span className="text-xs text-muted-foreground">7 colunas · 0–9 cada</span>
            </div>
            <CardDescription>
              Selecione de 1 a 3 números por coluna. Mais números = mais combinações = maior custo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <DigitColumnsPicker values={values} onChange={setValues} />
          </CardContent>
        </Card>

        {/* Controles */}
        <div className="space-y-4">
          <Card className="bg-muted/20">
            <CardContent className="pt-5 text-sm text-muted-foreground">
              <button className="flex w-full items-center justify-between" onClick={() => setInfoAberta((v) => !v)}>
                <span className="font-semibold text-foreground">Como usar o simulador?</span>
                <ChevronDown className={cn("w-4 h-4 transition-transform shrink-0", infoAberta ? "rotate-180" : "")} />
              </button>
              {infoAberta && (
                <ol className="mt-3 space-y-1.5 list-decimal list-inside">
                  <li>Selecione de 1 a 3 números em cada uma das 7 colunas (0 a 9).</li>
                  <li>Defina o filtro de concursos que deseja ver nos resultados.</li>
                  <li>Clique em <strong>Simular</strong>.</li>
                  <li>O sistema varre todos os sorteios anteriores e indica em quantos você teria acertado cada faixa de premiação (3 a 7 acertos).</li>
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
                  onChange={(e) => setFiltro(e.target.value as SimuladorInputSuperSeteFiltro)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  style={{ "--tw-ring-color": COR } as React.CSSProperties}
                >
                  {Object.entries(FILTRO_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">Na Super Sete, apostas são premiadas com 3, 4, 5, 6 ou 7 acertos.</p>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleSimular} disabled={!allFilled || simular.isPending} className="flex-1 text-white font-semibold" style={{ backgroundColor: COR }}>
                  {simular.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />Simulando…
                    </>
                  ) : (
                    <>
                      <FlaskConical className="w-4 h-4 mr-2" />Simular
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={handleLimpar} disabled={simular.isPending}>
                  <RotateCcw className="w-4 h-4 mr-2" />Limpar
                </Button>
              </div>

              {!allFilled && (
                <p className="text-sm text-muted-foreground text-center">Selecione pelo menos 1 número em cada coluna para simular.</p>
              )}
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
                  {resultado.totalConcursos.toLocaleString("pt-BR")} concursos varridos ·{" "}
                  {acertosGanhadores > 0 ? (
                    <span className="font-semibold" style={{ color: COR }}>
                      {acertosGanhadores} premiado{acertosGanhadores > 1 ? "s" : ""}
                    </span>
                  ) : (
                    "nenhum premiado"
                  )}
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
                    {resumoLinhas.map((r) => (
                      <TableRow key={r.acertos} className={FAIXAS_PREMIADAS.has(r.acertos) ? "font-semibold" : ""} style={FAIXAS_PREMIADAS.has(r.acertos) ? { backgroundColor: COR + "0d" } : {}}>
                        <TableCell className="text-center font-bold">{r.acertos}</TableCell>
                        <TableCell className="text-center text-sm tabular-nums text-muted-foreground">{probSuperSete(r.acertos, digitosPorColunaArray)}</TableCell>
                        <TableCell className="text-center">{r.contagem.toLocaleString("pt-BR")}</TableCell>
                        <TableCell className="text-center">
                          {FAIXAS_PREMIADAS.has(r.acertos) ? <span>⭐</span> : <span className="text-muted-foreground/50">—</span>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
                  <CardTitle className="text-base">Concursos — {FILTRO_LABELS[filtroAtivo]}</CardTitle>
                  <CardDescription>
                    {totalConcursos.toLocaleString("pt-BR")} concurso{totalConcursos !== 1 ? "s" : ""} encontrado
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
                          const premiado = FAIXAS_PREMIADAS.has(c.acertos);
                          return (
                            <TableRow key={c.concurso}>
                              <TableCell className="text-center font-semibold pl-4 whitespace-nowrap">{c.concurso}</TableCell>
                              <TableCell className="text-center text-muted-foreground whitespace-nowrap">{c.data}</TableCell>
                              <TableCell className="text-center">
                                <div className="flex flex-wrap justify-center gap-0.5 py-0.5">
                                  {c.dezenas.map((d, colIndex) => {
                                    const selected = Array.isArray(values[colIndex])
                                      ? (values[colIndex] as string[])
                                      : values[colIndex]
                                        ? [values[colIndex] as string]
                                        : [];
                                    const acertou = selected.includes(d);
                                    return (
                                      <span
                                        key={d}
                                        className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[9px] font-bold"
                                        style={acertou ? { backgroundColor: COR, color: "white" } : { backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }}
                                      >
                                        {d}
                                      </span>
                                    );
                                  })}
                                </div>
                              </TableCell>
                              <TableCell className="text-center whitespace-nowrap">
                                <span className={cn("font-semibold tabular-nums", !premiado && "text-muted-foreground font-normal")}>
                                  {c.acertos}
                                  {premiado ? " ⭐" : ""}
                                </span>
                              </TableCell>
                              <TableCell className="text-right pr-4 whitespace-nowrap">
                                <Link
                                  href={`/super-sete/resultado/${c.concurso}`}
                                  className="text-sm font-semibold hover:underline"
                                  style={{ color: COR }}
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
                <CardContent className="flex items-center justify-center py-16 text-muted-foreground">Nenhum concurso encontrado para o filtro selecionado.</CardContent>
              </Card>
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
