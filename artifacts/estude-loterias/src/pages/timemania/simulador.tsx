import { useState } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useSimularTimemania, SimulacaoResultado } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LotteryBall } from "@/components/ui/lottery-ball";
import { formatDateShort } from "@/lib/formatters";
import { AdUnit } from "@/components/ui/AdUnit";
import { FlaskConical, RotateCcw, Loader2, Trophy, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";

const COR = "#049645";
const BALL_BG = "#FFF600";
const BALL_TEXT = "#049645";
const TOTAL_DEZENAS = 10;
const PAGE_SIZE = 20;

type Filtro = "todos" | "premiados" | "sete" | "seis" | "cinco" | "quatro" | "tres";

const FILTRO_LABELS: Record<Filtro, string> = {
  todos:       "Todos os concursos",
  premiados:   "Somente concursos premiados (7, 6, 5, 4 ou 3 acertos)",
  sete:        "Somente concursos com 7 acertos",
  seis:        "Somente concursos com 6 acertos",
  cinco:       "Somente concursos com 5 acertos",
  quatro:      "Somente concursos com 4 acertos",
  tres:        "Somente concursos com 3 acertos",
};

const PREMIADO_EMOJI = "⭐";

// Faixas premiadas da Timemania: 7, 6, 5, 4, 3
const FAIXAS_PREMIADAS = new Set([7, 6, 5, 4, 3]);

export default function TimemaniaSimulador() {
  const [selecionadas, setSelecionadas] = useState<Set<number>>(new Set());
  const [filtro, setFiltro] = useState<Filtro>("premiados");
  const [resultado, setResultado] = useState<SimulacaoResultado | null>(null);
  const [infoAberta, setInfoAberta] = useState(false);
  const [paginaTabela, setPaginaTabela] = useState(1);

  const simular = useSimularTimemania({
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
    const dezenas = Array.from(selecionadas).sort((a, b) => a - b).map(n => String(n).padStart(2, "0"));
    simular.mutate({ data: { dezenas, filtro } });
  };

  const handleLimpar = () => {
    setSelecionadas(new Set());
    setResultado(null);
    simular.reset();
  };

  const podeSimular = selecionadas.size === TOTAL_DEZENAS;

  return (
    <div className="space-y-6">
      <PageSEO
        title="Simulador Histórico da Timemania"
        description="Teste suas 10 dezenas da Timemania contra todos os concursos anteriores e veja quantos prêmios você teria ganhado."
        canonical="/timemania/simulador"
      />
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: COR }}>
          <FlaskConical className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: COR }}>Timemania · Simulador Histórico</h1>
          <p className="text-muted-foreground mt-1">Escolha 10 dezenas e confira o desempenho em todos os concursos passados.</p>
        </div>
      </div>

      <AdUnit slot="9988776611" format="horizontal" className="w-full" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Painel de seleção */}
        <Card>
          <CardHeader>
            <CardTitle>Escolha 10 dezenas</CardTitle>
            <CardDescription>Marque exatamente 10 números de 01 a 80</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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

            {/* Filtro */}
            <div className="space-y-2 pt-4 border-t">
              <label className="text-sm font-medium">Filtrar resultados:</label>
              <select
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                value={filtro}
                onChange={e => setFiltro(e.target.value as Filtro)}
              >
                {(Object.keys(FILTRO_LABELS) as Filtro[]).map(key => (
                  <option key={key} value={key}>{FILTRO_LABELS[key]}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSimular}
                disabled={!podeSimular || simular.isPending}
                style={{ backgroundColor: podeSimular ? COR : undefined }}
                className="flex-1 text-white"
              >
                {simular.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Simulando...</> : "Simular"}
              </Button>
              <Button variant="outline" onClick={handleLimpar}>
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
            {!podeSimular && (
              <p className="text-xs text-muted-foreground">
                Marque exatamente {TOTAL_DEZENAS} dezenas ({selecionadas.size}/{TOTAL_DEZENAS} selecionadas).
              </p>
            )}
          </CardContent>
        </Card>

        {/* Seção de resultados pré-seleção ou pós */}
        <div className="space-y-4">
          {!resultado ? (
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center h-full flex flex-col items-center justify-center min-h-[300px]">
              <FlaskConical className="w-12 h-12 text-muted-foreground mb-3" />
              <h3 className="font-semibold text-lg">Pronto para simular</h3>
              <p className="text-muted-foreground text-sm mt-1 max-w-xs">
                Selecione suas 10 dezenas e clique em Simular para ver o resultado.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Resumo */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    Resumo da Simulação
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    {resultado.totalConcursos} concursos analisados
                  </div>
                  {/* Tabela de acertos */}
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="text-center">Acertos</TableHead>
                          <TableHead className="text-right">Ocorrências</TableHead>
                          <TableHead className="text-right">%</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {resultado.resumo.map(({ acertos, contagem }) => (
                          <TableRow key={acertos}>
                            <TableCell className="text-center font-bold" style={FAIXAS_PREMIADAS.has(acertos) ? { color: COR } : {}}>
                              {acertos} {FAIXAS_PREMIADAS.has(acertos) ? PREMIADO_EMOJI : ""}
                            </TableCell>
                            <TableCell className="text-right font-mono">{contagem}</TableCell>
                            <TableCell className="text-right text-muted-foreground">
                              {resultado.totalConcursos > 0 ? ((contagem / resultado.totalConcursos) * 100).toFixed(2) : "0.00"}%
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Tabela de concursos filtrados */}
      {resultado && resultado.concursos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Concursos {filtro !== "todos" ? `com ${FILTRO_LABELS[filtro].toLowerCase()}` : ""}
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({resultado.concursos.length} encontrados)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-16">Concurso</TableHead>
                    <TableHead className="w-24">Data</TableHead>
                    <TableHead>Dezenas</TableHead>
                    <TableHead className="text-center w-16">Acertos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resultado.concursos
                    .slice((paginaTabela - 1) * PAGE_SIZE, paginaTabela * PAGE_SIZE)
                    .map((c) => (
                      <TableRow key={c.concurso}>
                        <TableCell>
                          <Link href={`/timemania/resultado/${c.concurso}`} className="font-medium hover:underline" style={{ color: COR }}>
                            {c.concurso}
                          </Link>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">{formatDateShort(c.data)}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {c.dezenas.map((d, i) => (
                              <LotteryBall key={i} number={d} size="sm" color={BALL_BG} textColor={BALL_TEXT} />
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-bold" style={FAIXAS_PREMIADAS.has(c.acertos) ? { color: COR } : {}}>
                          {c.acertos}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>

            {/* Paginação */}
            {resultado.concursos.length > PAGE_SIZE && (
              <div className="flex items-center justify-between mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={paginaTabela <= 1}
                  onClick={() => setPaginaTabela(p => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
                </Button>
                <span className="text-sm text-muted-foreground">
                  Página {paginaTabela} de {Math.ceil(resultado.concursos.length / PAGE_SIZE)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={paginaTabela >= Math.ceil(resultado.concursos.length / PAGE_SIZE)}
                  onClick={() => setPaginaTabela(p => p + 1)}
                >
                  Próxima <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Info Probabilidades */}
      <Card>
        <CardHeader
          className="cursor-pointer select-none"
          onClick={() => setInfoAberta(!infoAberta)}
        >
          <CardTitle className="text-base flex items-center justify-between">
            Probabilidades de acerto na Timemania
            <ChevronDown className={cn("w-5 h-5 transition-transform", infoAberta && "rotate-180")} />
          </CardTitle>
        </CardHeader>
        {infoAberta && (
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Faixa</TableHead>
                    <TableHead className="text-right">Probabilidade (1 em)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { k: 7, p: "26.472.637" },
                    { k: 6, p: "216.103" },
                    { k: 5, p: "5.220" },
                    { k: 4, p: "276" },
                    { k: 3, p: "29" },
                  ].map(({ k, p }) => (
                    <TableRow key={k}>
                      <TableCell className="font-medium">{k} acertos</TableCell>
                      <TableCell className="text-right font-mono">{p}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Probabilidades para uma aposta de 10 dezenas (aposta simples).
            </p>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
