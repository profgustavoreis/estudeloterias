import React, { useState, useEffect } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { PageSEO } from "@/components/seo/PageSEO";
import { useGetBlogPosts, getGetBlogPostsQueryKey, Artigo } from "@workspace/api-client-react";
import { getModalityConfig, formatArticleDate, MODALIDADE_CONFIG } from "@/lib/blog-utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  Sparkles,
  Calendar,
  Clock,
  User,
  Tag,
  ChevronLeft,
  ChevronRight,
  FileText,
  X,
  ArrowRight,
  Newspaper,
  BookOpen,
} from "lucide-react";

const MODALIDADE_PILLS = [
  { id: "todas", label: "Todas" },
  { id: "mega-sena", label: "Mega-Sena" },
  { id: "lotofacil", label: "Lotofácil" },
  { id: "quina", label: "Quina" },
  { id: "lotomania", label: "Lotomania" },
  { id: "timemania", label: "Timemania" },
  { id: "diadesorte", label: "Dia de Sorte" },
  { id: "duplasena", label: "Dupla Sena" },
  { id: "maismilionaria", label: "+Milionária" },
  { id: "super-sete", label: "Super Sete" },
  { id: "geral", label: "Geral" },
];

export default function BlogFeedPage() {
  const searchString = useSearch();
  const [, setLocation] = useLocation();

  const searchParams = new URLSearchParams(searchString);
  const pageFromUrl = parseInt(searchParams.get("page") || "1", 10);
  const modalidadeFromUrl = searchParams.get("modalidade") || "todas";
  const tagFromUrl = searchParams.get("tag") || "";
  const qFromUrl = searchParams.get("q") || "";

  const [searchInputValue, setSearchInputValue] = useState(qFromUrl);
  const [activeModalidade, setActiveModalidade] = useState(modalidadeFromUrl);
  const [activeTag, setActiveTag] = useState(tagFromUrl);
  const [currentPage, setCurrentPage] = useState(pageFromUrl);

  // Sync state with URL if URL changes
  useEffect(() => {
    setSearchInputValue(qFromUrl);
    setActiveModalidade(modalidadeFromUrl);
    setActiveTag(tagFromUrl);
    setCurrentPage(pageFromUrl);
  }, [searchString]);

  // Function to update URL with new parameters
  const updateUrl = (params: { page?: number; modalidade?: string; tag?: string; q?: string }) => {
    const newParams = new URLSearchParams();

    const nextPage = params.page !== undefined ? params.page : currentPage;
    const nextModalidade = params.modalidade !== undefined ? params.modalidade : activeModalidade;
    const nextTag = params.tag !== undefined ? params.tag : activeTag;
    const nextQ = params.q !== undefined ? params.q : searchInputValue;

    if (nextPage > 1) newParams.set("page", nextPage.toString());
    if (nextModalidade && nextModalidade !== "todas") newParams.set("modalidade", nextModalidade);
    if (nextTag) newParams.set("tag", nextTag);
    if (nextQ.trim()) newParams.set("q", nextQ.trim());

    const queryString = newParams.toString();
    setLocation(queryString ? `/blog?${queryString}` : "/blog");
  };

  // Debounced search or submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl({ q: searchInputValue, page: 1 });
  };

  const handleModalidadeChange = (modId: string) => {
    setActiveModalidade(modId);
    setCurrentPage(1);
    updateUrl({ modalidade: modId, page: 1 });
  };

  const handleClearTag = () => {
    setActiveTag("");
    setCurrentPage(1);
    updateUrl({ tag: "", page: 1 });
  };

  const handleClearAllFilters = () => {
    setSearchInputValue("");
    setActiveModalidade("todas");
    setActiveTag("");
    setCurrentPage(1);
    setLocation("/blog");
  };

  // Query blog posts
  const queryParams = {
    page: currentPage,
    limit: 9,
    modalidade: activeModalidade === "todas" ? undefined : activeModalidade,
    tag: activeTag || undefined,
    q: searchInputValue.trim() || undefined,
  };

  const { data, isLoading, isError, refetch } = useGetBlogPosts(queryParams, {
    query: {
      queryKey: getGetBlogPostsQueryKey(queryParams),
    },
  });

  const posts = data?.resultados || [];
  const totalPages = data?.totalPaginas || 1;
  const totalPosts = data?.total || 0;

  // Decide if we feature the first article
  // Featured article is present if we are on page 1 and have at least 1 post
  const isPageOne = currentPage === 1;
  const featuredPost: Artigo | null = isPageOne && posts.length > 0 ? posts[0] : null;
  const gridPosts: Artigo[] = isPageOne && posts.length > 0 ? posts.slice(1) : posts;

  return (
    <>
      <PageSEO
        title="Blog - Análises, Dicas e Estatísticas de Loterias"
        description="Artigos educativos, estratégias de apostas, estatísticas atualizadas e análises completas para as loterias Caixa (Mega-Sena, Lotofácil, Quina e mais)."
        canonical="/blog"
      />

      <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-16">
        {/* Hero Banner Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950 text-white py-14 sm:py-20 border-b border-slate-800">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Estude Loterias Content Hub
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white max-w-3xl mx-auto leading-tight">
              Blog Estude Loterias
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
              Análises profundas, guias para apostadores, estatísticas de probabilidade e estratégias inteligentes para elevar suas chances nas loterias Caixa.
            </p>
          </div>
        </section>

        {/* Filters and Search Container */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-7 relative z-20 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-5">
            {/* Search Input Bar */}
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Buscar artigos por palavra-chave ou tema..."
                  value={searchInputValue}
                  onChange={(e) => setSearchInputValue(e.target.value)}
                  className="pl-11 pr-10 py-5 rounded-xl border-slate-200 dark:border-slate-800 text-sm focus:ring-2 focus:ring-emerald-500 bg-slate-50/50 dark:bg-slate-950"
                />
                {searchInputValue && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInputValue("");
                      updateUrl({ q: "", page: 1 });
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <Button
                type="submit"
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-5 rounded-xl transition-all shadow-md shadow-emerald-600/20"
              >
                Buscar Artigos
              </Button>
            </form>

            {/* Modalidade Chips / Pills */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Filtrar por Modalidade:
                </span>
                {(activeModalidade !== "todas" || activeTag || searchInputValue) && (
                  <button
                    onClick={handleClearAllFilters}
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" /> Limpar filtros
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
                {MODALIDADE_PILLS.map((pill) => {
                  const isActive = activeModalidade === pill.id;
                  const modConfig = getModalityConfig(pill.id);

                  return (
                    <button
                      key={pill.id}
                      onClick={() => handleModalidadeChange(pill.id)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border shrink-0 ${
                        isActive
                          ? "bg-slate-900 text-white border-slate-900 dark:bg-emerald-500 dark:text-slate-950 dark:border-emerald-500 shadow-sm"
                          : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      {pill.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Tag Pill */}
            {activeTag && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Tag ativa:</span>
                <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                  <Tag className="w-3 h-3" />
                  #{activeTag}
                  <button onClick={handleClearTag} className="hover:opacity-75 ml-1">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 mt-10 space-y-12">
          {/* Loading Skeletons */}
          {isLoading && (
            <div className="space-y-8">
              {/* Featured Skeleton */}
              <div className="h-96 w-full bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse" />
              {/* Grid Skeletons */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-80 w-full bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && posts.length === 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-12 text-center space-y-4 max-w-xl mx-auto shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <BookOpen className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                Nenhum artigo encontrado
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Não encontramos publicações correspondentes aos filtros selecionados. Tente buscar por outros termos ou explore modalidades.
              </p>
              <Button
                onClick={handleClearAllFilters}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-6 py-2.5 text-sm"
              >
                Limpar Todos os Filtros
              </Button>
            </div>
          )}

          {/* Featured Post (Only on Page 1) */}
          {!isLoading && featuredPost && (
            <div className="group relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
                {/* Image / Cover Section */}
                <div className="lg:col-span-7 relative min-h-[260px] sm:min-h-[340px] overflow-hidden bg-slate-900">
                  {featuredPost.coverImageUrl ? (
                    <img
                      src={featuredPost.coverImageUrl}
                      alt={featuredPost.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className={`w-full h-full min-h-[300px] bg-gradient-to-br ${getModalityConfig(featuredPost.modalidade).bgGradient} flex items-center justify-center p-8 text-white relative`}>
                      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />
                      <div className="text-center space-y-2 relative z-10">
                        <Newspaper className="w-16 h-16 mx-auto opacity-80" />
                        <span className="text-xs font-mono uppercase tracking-widest opacity-75">
                          {getModalityConfig(featuredPost.modalidade).label}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="absolute top-4 left-4 z-10">
                    <Badge className={`px-3 py-1 text-xs font-extrabold uppercase tracking-wider rounded-full shadow-md ${getModalityConfig(featuredPost.modalidade).badgeClass}`}>
                      Em Destaque • {getModalityConfig(featuredPost.modalidade).label}
                    </Badge>
                  </div>
                </div>

                {/* Info / Content Section */}
                <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                        {formatArticleDate(featuredPost.publishedAt || featuredPost.createdAt)}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                        {featuredPost.readingTimeMinutes || 3} min de leitura
                      </span>
                    </div>

                    <Link
                      href={`/blog/${featuredPost.slug}`}
                      className="block group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors"
                    >
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight leading-tight">
                        {featuredPost.title}
                      </h2>
                    </Link>

                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-4">
                      {featuredPost.excerpt}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-xs">
                        {featuredPost.author ? featuredPost.author.charAt(0).toUpperCase() : "E"}
                      </div>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {featuredPost.author || "Equipe Estude Loterias"}
                      </span>
                    </div>

                    <Link
                      href={`/blog/${featuredPost.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:gap-2 transition-all"
                    >
                      Ler artigo completo <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Grid of Articles */}
          {!isLoading && gridPosts.length > 0 && (
            <div className="space-y-6">
              {featuredPost && (
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-600" />
                    Mais Artigos Recentes
                  </h3>
                  <span className="text-xs font-medium text-slate-500">
                    Total: {totalPosts} {totalPosts === 1 ? "artigo" : "artigos"}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gridPosts.map((article) => {
                  const modConfig = getModalityConfig(article.modalidade);

                  return (
                    <Card
                      key={article.id}
                      className="group rounded-2xl border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between bg-white dark:bg-slate-900"
                    >
                      <div className="space-y-4">
                        {/* Article Cover Image */}
                        <Link href={`/blog/${article.slug}`} className="block relative h-48 overflow-hidden bg-slate-900">
                          {article.coverImageUrl ? (
                            <img
                              src={article.coverImageUrl}
                              alt={article.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className={`w-full h-full bg-gradient-to-br ${modConfig.bgGradient} flex items-center justify-center p-6 text-white relative`}>
                              <div className="text-center space-y-1 relative z-10">
                                <Newspaper className="w-10 h-10 mx-auto opacity-75" />
                                <span className="text-[10px] font-mono uppercase tracking-wider opacity-70">
                                  {modConfig.label}
                                </span>
                              </div>
                            </div>
                          )}

                          <div className="absolute top-3 left-3 z-10">
                            <Badge className={`px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-full shadow-sm ${modConfig.badgeClass}`}>
                              {modConfig.label}
                            </Badge>
                          </div>
                        </Link>

                        {/* Content */}
                        <CardContent className="p-5 pt-0 space-y-3">
                          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-emerald-600" />
                              {formatArticleDate(article.publishedAt || article.createdAt)}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-emerald-600" />
                              {article.readingTimeMinutes || 3} min
                            </span>
                          </div>

                          <Link href={`/blog/${article.slug}`} className="block">
                            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
                              {article.title}
                            </h3>
                          </Link>

                          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                            {article.excerpt}
                          </p>
                        </CardContent>
                      </div>

                      {/* Footer */}
                      <div className="px-5 pb-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium truncate max-w-[150px]">
                          Por {article.author || "Equipe Estude Loterias"}
                        </span>

                        <Link
                          href={`/blog/${article.slug}`}
                          className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                        >
                          Ler mais <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Pagination Controls */}
          {!isLoading && totalPages > 1 && (
            <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
              <Button
                variant="outline"
                disabled={currentPage <= 1}
                onClick={() => updateUrl({ page: currentPage - 1 })}
                className="rounded-xl border-slate-300 dark:border-slate-700 text-xs font-bold"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
              </Button>

              <div className="text-xs font-bold text-slate-600 dark:text-slate-400">
                Página {currentPage} de {totalPages}
              </div>

              <Button
                variant="outline"
                disabled={currentPage >= totalPages}
                onClick={() => updateUrl({ page: currentPage + 1 })}
                className="rounded-xl border-slate-300 dark:border-slate-700 text-xs font-bold"
              >
                Próxima <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
