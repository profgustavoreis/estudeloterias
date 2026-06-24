import { useGetMegaSenaCalendario } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency, formatDateShort } from "@/lib/formatters";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar as CalendarIcon, Star } from "lucide-react";

export default function MegaSenaCalendario() {
  const { data: sorteios, isLoading, isError } = useGetMegaSenaCalendario();

  if (isLoading) {
    return <div>Carregando calendário...</div>;
  }

  if (isError || !sorteios) {
    return <div>Erro ao carregar calendário.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#009640]">Calendário de Sorteios</h1>
        <p className="text-muted-foreground mt-1">Programe suas apostas para os próximos concursos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sorteios.map((sorteio, i) => {
          const isNext = i === 0;
          return (
            <Card key={i} className={isNext ? "border-[#009640] shadow-md ring-1 ring-[#009640]/20" : ""}>
              <CardHeader className={isNext ? "bg-[#009640]/5 pb-4" : "pb-4"}>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                      {sorteio.diaSemana}
                    </CardTitle>
                    <CardDescription className="mt-1 font-medium text-foreground">
                      {formatDateShort(sorteio.data)}
                      {sorteio.concursoEstimado && (
                        <span className="ml-2 text-xs text-muted-foreground font-normal">
                          — Concurso {sorteio.concursoEstimado}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  {sorteio.especial && (
                    <div className="bg-amber-100 text-amber-800 p-1.5 rounded-full" title="Sorteio Especial">
                      <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-4 border-t border-border">
                {sorteio.valorEstimado ? (
                  <div className="text-2xl font-bold text-[#009640]">
                    {formatCurrency(sorteio.valorEstimado)}
                  </div>
                ) : (
                  <div className="text-lg font-medium text-muted-foreground italic">
                    Prêmio a definir
                  </div>
                )}
                
                {sorteio.descricao && (
                  <div className="mt-3 text-sm bg-muted p-2 rounded text-muted-foreground">
                    {sorteio.descricao}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
