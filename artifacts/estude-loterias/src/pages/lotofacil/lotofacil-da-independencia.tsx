import { Link } from "wouter";
import { useGetLotofacilDaIndependencia, useGetBlogPostBySlug } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { DezenasGrid } from "@/components/ui/dezenas-grid";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AffiliateCard } from "@/components/ui/AffiliateCard";
import { Badge } from "@/components/ui/badge";
import { Flag, Trophy, Sparkles, Clock, ArrowRight, BookOpen, TrendingUp } from "lucide-react";
import { PageSEO } from "@/components/seo/PageSEO";
import { SpecialEditionHero } from "@/components/ui/SpecialEditionHero";
import { cn } from "@/lib/utils";
import {
  buildSpecialEditionFallback,
  buildSpecialEditionSeo,
} from "@workspace/seo-special-editions";
import {
  resolveSpecialEditionView,
  specialEditionBaseFacts,
  specialEditionFacts,
  SPECIAL_EDITIONS_META,
} from "@/lib/special-editions";

const COR = "#930089";
const META = SPECIAL_EDITIONS_META.independencia;

export default function LotofacilDaIndependencia() {
  const { data, isLoading, isError } = useGetLotofacilDaIndependencia();
  const { data: blogPost } = useGetBlogPostBySlug("lotofacil-da-independencia-2026-guia-completo");

  const fallbackSeo = buildSpecialEditionFallback(specialEditionBaseFacts("independencia"));

  const postSlug = blogPost?.slug || "lotofacil-da-independencia-2026-guia-completo";
  const postTitle = blogPost?.title || "Guia Completo da Lotofácil da Independência 2026: R$ 300 Milhões em Jogo!";
  const postExcerpt =
    blogPost?.excerpt ||
    "Tudo sobre as regras do sorteio especial que não acumula, probabilidades matemáticas, estatísticas históricas e as melhores estratégias para jogar.";
  const postReadingTime = blogPost?.readingTimeMinutes ?? 8;

  if (isLoading) {
    return (
      <div className="space-y-8">
        <PageSEO
          title={fallbackSeo.title}
          description={fallbackSeo.description}
          canonical={META.canonical}
        />
        <div>Carregando informações...</div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-8">
        <PageSEO
          title={fallbackSeo.title}
          description={fallbackSeo.description}
          canonical={META.canonical}
        />
        <div>Erro ao carregar informações da Lotofácil da Independência.</div>
      </div>
    );
  }

  const view = resolveSpecialEditionView({ tipo: "independencia", data });
  const seo = buildSpecialEditionSeo(specialEditionFacts({ tipo: "independencia", data }));

  return (
    <div className="space-y-8">
      <PageSEO
        title={seo.title}
        description={seo.description}
        canonical={META.canonical}
      />
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: COR }}>
          <Flag className="w-8 h-8" />
        </div>
        <div>
          <h1 className={cn("text-2xl md:text-3xl font-black tracking-tight", view.accent.text)}>
            {view.h1}
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">O concurso especial de setembro com prêmio recorde que não acumula.</p>
        </div>
      </div>

      <SpecialEditionHero view={view} />

      <div className="grid grid-cols-1 gap-6">
        <Link
          href={`/blog/${postSlug}`}
          className="group block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#930089] rounded-xl"
        >
          <Card
            className="border-t-4 h-full flex flex-col justify-between bg-gradient-to-br from-[#930089]/10 via-[#930089]/5 to-background hover:shadow-xl hover:border-[#930089] transition-all duration-300 relative overflow-hidden"
            style={{ borderColor: COR }}
          >
            {/* Ambient decorative glow */}
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#930089]/15 rounded-full blur-2xl pointer-events-none group-hover:bg-[#930089]/25 transition-all duration-500" />

            <CardHeader className="relative z-10 pb-3">
              <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Badge className="bg-[#930089]/15 text-[#930089] dark:text-purple-300 border-[#930089]/30 font-bold text-xs gap-1 py-0.5 px-2.5">
                    <Sparkles className="w-3 h-3 text-[#930089] dark:text-purple-300 fill-current" />
                    Novo no Blog
                  </Badge>
                  <Badge variant="outline" className="text-[11px] font-semibold text-muted-foreground border-border/60">
                    Guia Especial 2026
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium bg-background/60 dark:bg-card/60 backdrop-blur-xs px-2 py-0.5 rounded-md border border-border/40">
                  <Clock className="w-3.5 h-3.5 text-[#930089]" />
                  <span>{postReadingTime} min de leitura</span>
                </div>
              </div>

              <CardTitle className="text-xl md:text-2xl font-black tracking-tight text-foreground group-hover:text-[#930089] dark:group-hover:text-purple-300 transition-colors leading-snug">
                {postTitle}
              </CardTitle>
            </CardHeader>

            <CardContent className="relative z-10 flex flex-col justify-between flex-1 gap-4 pt-0">
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {postExcerpt}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-background/80 dark:bg-card/80 border text-foreground/80">
                    <BookOpen className="w-3 h-3 text-[#930089]" /> Regras Oficiais
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-background/80 dark:bg-card/80 border text-foreground/80">
                    <TrendingUp className="w-3 h-3 text-[#930089]" /> Estatísticas
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-background/80 dark:bg-card/80 border text-foreground/80">
                    <Trophy className="w-3 h-3 text-[#930089]" /> Estratégias
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <div
                  className="w-full py-2.5 px-4 rounded-lg text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm group-hover:shadow-md transition-all duration-200"
                  style={{ backgroundColor: COR }}
                >
                  <span>Ler Guia Completo</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-200" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <AffiliateCard
        afiliado="clube_lotosport"
        placement="lotofacil_independencia_inline"
        moduleId="aff_slot_7788990011"
        title="Jogar em bolão na Lotofácil da Independência"
        body="No Clube Lotosport você pode entrar em bolões com mais dezenas, dividindo o custo com outras pessoas. Veja as opções disponíveis para o próximo concurso especial."
      />

      <Card id="historico">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" style={{ color: COR }} />
            Histórico de Sorteios
          </CardTitle>
          <CardDescription>Todos os resultados da Lotofácil da Independência.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-center w-[80px]">Ano</TableHead>
                  <TableHead className="text-center w-[100px]">Concurso</TableHead>
                  <TableHead className="text-center min-w-[300px]">Dezenas Sorteadas</TableHead>
                  <TableHead className="text-center">Prêmio Principal</TableHead>
                  <TableHead className="text-center">Apostas com 15 acertos</TableHead>
                  <TableHead className="text-center">Rateio por Ganhador</TableHead>
                  <TableHead className="w-[130px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.historico.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center h-24">Nenhum histórico encontrado.</TableCell>
                  </TableRow>
                ) : (
                  data.historico.map((sorteio) => {
                    const premioFaixa1 = sorteio.premios.find(p => p.faixa === 1);
                    const ano = sorteio.data.split("/")[2] ?? "–";
                    return (
                      <TableRow key={sorteio.concurso}>
                        <TableCell className="text-center font-bold">{ano}</TableCell>
                        <TableCell className="text-center text-muted-foreground font-mono">
                          {sorteio.concurso}
                        </TableCell>
                        <TableCell>
                          <DezenasGrid dezenas={sorteio.dezenas} perRow={8} size="sm" color={COR} />
                        </TableCell>
                        <TableCell className="text-center font-bold" style={{ color: COR }}>
                          {formatCurrency(
                            premioFaixa1 && premioFaixa1.ganhadores > 0
                              ? premioFaixa1.valorPremio * premioFaixa1.ganhadores
                              : premioFaixa1?.valorPremio
                          )}
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          {premioFaixa1?.ganhadores ?? 0}
                        </TableCell>
                        <TableCell className="text-center font-bold" style={{ color: COR }}>
                          {formatCurrency(premioFaixa1?.valorPremio)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Link
                            href={`/lotofacil/resultado/${sorteio.concurso}`}
                            className="text-sm font-semibold hover:underline whitespace-nowrap"
                            style={{ color: COR }}
                          >
                            Ver detalhes →
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
