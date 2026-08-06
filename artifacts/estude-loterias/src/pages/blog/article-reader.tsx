import React from "react";
import { Link, useParams, useLocation } from "wouter";
import { Helmet } from "react-helmet-async";
import {
  useGetBlogPostBySlug,
  getGetBlogPostBySlugQueryKey,
  useGetBlogPosts,
  getGetBlogPostsQueryKey,
} from "@workspace/api-client-react";
import { MarkdownPreview } from "@/components/admin/MarkdownPreview";
import { getModalityConfig, formatArticleDate, isTimeSensitiveArticle } from "@/lib/blog-utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  ChevronRight,
  Home,
  Calendar,
  Clock,
  User,
  Tag,
  Share2,
  Copy,
  Check,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Newspaper,
  AlertTriangle,
} from "lucide-react";

export default function ArticleReaderPage() {
  const { slug } = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [copied, setCopied] = React.useState(false);

  const {
    data: artigo,
    isLoading,
    isError,
    error,
  } = useGetBlogPostBySlug(slug || "", {
    query: {
      queryKey: getGetBlogPostBySlugQueryKey(slug || ""),
      enabled: !!slug,
    },
  });

  // Query related posts (using same modality if available, limit 4 to filter out current)
  const relatedQueryParams = {
    limit: 4,
    modalidade: artigo?.modalidade || undefined,
  };

  const { data: relatedData } = useGetBlogPosts(relatedQueryParams, {
    query: {
      queryKey: getGetBlogPostsQueryKey(relatedQueryParams),
      enabled: !!artigo,
    },
  });

  const relatedPosts = (relatedData?.resultados || [])
    .filter((post) => post.slug !== slug)
    .slice(0, 3);

  // Query the full published list ordered by publish date so we can build a
  // real prev/next internal-linking chain between articles (server-visible <a>).
  const allQueryParams = { limit: 100 };
  const { data: allData } = useGetBlogPosts(allQueryParams, {
    query: {
      queryKey: getGetBlogPostsQueryKey(allQueryParams),
      enabled: !!artigo,
    },
  });
  const allPosts = allData?.resultados || [];
  const currentIndex = allPosts.findIndex((p) => p.slug === slug);
  const prevArticle = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const nextArticle =
    currentIndex >= 0 && currentIndex < allPosts.length - 1
      ? allPosts[currentIndex + 1]
      : null;

  const currentUrl = typeof window !== "undefined" ? window.location.href : `https://estudeloterias.com.br/blog/${slug}`;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      toast({
        title: "Link copiado!",
        description: "O link do artigo foi copiado para sua área de transferência.",
      });
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const shareTitle = artigo?.title || "Confira este artigo no Estude Loterias";
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareTitle} - ${currentUrl}`)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareTitle)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 py-12 px-4">
        <div className="max-w-3xl mx-auto space-y-8 animate-pulse">
          <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="h-12 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-6 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="h-80 w-full bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-4 w-4/6 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
        </div>
      </div>
    );
  }

  // Error / Not Found State
  if (isError || !artigo) {
    return (
      <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 py-20 px-4">
        <div className="max-w-md mx-auto text-center space-y-5 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            Artigo Não Encontrado
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            O artigo que você procurou não existe, foi removido ou está temporariamente indisponível.
          </p>
          <Button
            onClick={() => setLocation("/blog")}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-6 py-2.5"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Blog
          </Button>
        </div>
      </div>
    );
  }

  const modConfig = getModalityConfig(artigo.modalidade);
  const titleText = artigo.seoTitle || artigo.title;
  const descriptionText = artigo.seoDescription || artigo.excerpt;
  const canonicalUrl = `https://estudeloterias.com.br/blog/${artigo.slug}`;

  // Time-sensitive (noticioso / concursável) articles use NewsArticle schema;
  // evergreen analysis uses BlogPosting.
  const isNewsArticle = isTimeSensitiveArticle(artigo);
  const schemaType = isNewsArticle ? "NewsArticle" : "BlogPosting";
  const publishedAt = artigo.publishedAt || artigo.createdAt;
  const modifiedAt = artigo.updatedAt || artigo.publishedAt || artigo.createdAt;

  // Schema.org BlogPosting / NewsArticle
  const schemaJsonLd = {
    "@context": "https://schema.org",
    "@type": schemaType,
    "headline": artigo.title,
    "description": descriptionText,
    "image": artigo.coverImageUrl ? [artigo.coverImageUrl] : undefined,
    "datePublished": publishedAt,
    "dateModified": modifiedAt,
    "author": [
      {
        "@type": "Person",
        "name": artigo.author || "Equipe Estude Loterias",
      },
    ],
    "publisher": {
      "@type": "Organization",
      "name": "Estude Loterias",
      "url": "https://estudeloterias.com.br",
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
  };

  return (
    <>
      {/* Advanced SEO Helmet */}
      <Helmet>
        <title>{`${titleText} | Estude Loterias`}</title>
        <meta name="description" content={descriptionText} />
        <link rel="canonical" href={canonicalUrl} />

        {/* OpenGraph */}
        <meta property="og:title" content={titleText} />
        <meta property="og:description" content={descriptionText} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        {artigo.coverImageUrl && <meta property="og:image" content={artigo.coverImageUrl} />}
        <meta property="article:published_time" content={publishedAt} />
        <meta property="article:modified_time" content={modifiedAt} />
        <meta property="article:author" content={artigo.author || "Equipe Estude Loterias"} />

        {/* Schema.org Structured Data */}
        <script type="application/ld+json">{JSON.stringify(schemaJsonLd)}</script>
      </Helmet>

      <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pb-20">
        {/* Top Header / Breadcrumb Bar */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-4 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto flex items-center justify-between text-xs text-slate-500">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-1.5 flex-wrap">
              <Link href="/" className="hover:text-emerald-600 flex items-center gap-1 transition-colors">
                <Home className="w-3.5 h-3.5" /> Início
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <Link href="/blog" className="hover:text-emerald-600 transition-colors">
                Blog
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px] sm:max-w-[300px]">
                {artigo.title}
              </span>
            </nav>

            <Link href="/blog" className="hidden sm:flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
              <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao Feed
            </Link>
          </div>
        </div>

        {/* Article Container */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 space-y-8">
          {/* Article Header */}
          <header className="space-y-6">
            <div className="flex items-center gap-3">
              <Link href={`/blog?modalidade=${artigo.modalidade || "geral"}`}>
                <Badge className={`px-3 py-1 text-xs font-extrabold uppercase tracking-wider rounded-full cursor-pointer ${modConfig.badgeClass}`}>
                  {modConfig.label}
                </Badge>
              </Link>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-slate-50 tracking-tight leading-tight">
              {artigo.title}
            </h1>

            {/* Excerpt / Subtitle */}
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 italic leading-relaxed border-l-4 border-emerald-500 pl-4 py-1">
              {artigo.excerpt}
            </p>

            {/* Author and Metadata Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-emerald-600/20">
                  {artigo.author ? artigo.author.charAt(0).toUpperCase() : "E"}
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {artigo.author || "Equipe Estude Loterias"}
                  </div>
                  <div className="text-[11px] text-slate-400">{artigo.authorDescription || "Especialista em Loterias e Estatística"}</div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-medium">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  {formatArticleDate(artigo.publishedAt || artigo.createdAt)}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  {artigo.readingTimeMinutes || 3} min de leitura
                </span>
              </div>
            </div>
          </header>

          {/* Cover Image */}
          {artigo.coverImageUrl ? (
            <figure className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-lg bg-slate-900 max-h-[500px]">
              <img
                src={artigo.coverImageUrl}
                alt={artigo.title}
                className="w-full h-full object-cover max-h-[500px]"
              />
            </figure>
          ) : (
            <div className={`rounded-3xl bg-gradient-to-br ${modConfig.bgGradient} p-12 text-white text-center shadow-lg relative overflow-hidden`}>
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
              <Newspaper className="w-20 h-20 mx-auto opacity-75 mb-2 relative z-10" />
              <span className="text-sm font-mono uppercase tracking-widest opacity-80 relative z-10">
                {modConfig.label}
              </span>
            </div>
          )}

          {/* Markdown Body Section */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-10 shadow-sm">
            <MarkdownPreview content={artigo.content} />
          </div>

          {/* Tags and Social Share Actions */}
          <footer className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
            {/* Tags list */}
            {artigo.tags && artigo.tags.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Tags relacionadas:
                </span>
                <div className="flex flex-wrap gap-2">
                  {artigo.tags.map((tag, idx) => (
                    <Link key={idx} href={`/blog?tag=${encodeURIComponent(tag)}`}>
                      <Badge variant="outline" className="px-3 py-1 text-xs font-semibold rounded-full border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1">
                        <Tag className="w-3 h-3 text-emerald-600" />
                        #{tag}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Social Share Bar */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <Share2 className="w-4 h-4 text-emerald-600" />
                Compartilhar este artigo:
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  WhatsApp
                </a>

                <a
                  href={twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-xl bg-sky-500/10 text-sky-700 dark:text-sky-400 hover:bg-sky-500/20 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  X (Twitter)
                </a>

                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-xl bg-blue-500/10 text-blue-700 dark:text-blue-400 hover:bg-blue-500/20 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  Facebook
                </a>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyLink}
                  className="rounded-xl border-slate-300 dark:border-slate-700 text-xs font-bold flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  {copied ? "Copiado!" : "Copiar Link"}
                </Button>
              </div>
            </div>
          </footer>

          {/* Prev / Next article navigation — real internal <a> linking chain */}
          {(prevArticle || nextArticle) && (
            <nav
              aria-label="Navegação entre artigos"
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {prevArticle ? (
                <Link
                  href={`/blog/${prevArticle.slug}`}
                  className="group flex flex-col gap-1 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:border-emerald-500/60 hover:shadow-md transition-all"
                >
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <ArrowLeft className="w-3.5 h-3.5" /> Artigo Anterior
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {prevArticle.title}
                  </span>
                </Link>
              ) : (
                <span aria-hidden="true" />
              )}

              {nextArticle && (
                <Link
                  href={`/blog/${nextArticle.slug}`}
                  className="group flex flex-col justify-end gap-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 text-right hover:border-emerald-500/60 hover:shadow-md transition-all"
                >
                  <span className="flex items-center justify-end gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Próximo Artigo <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {nextArticle.title}
                  </span>
                </Link>
              )}
            </nav>
          )}

          {/* Related Articles Section */}
          {relatedPosts.length > 0 && (
            <section className="pt-8 space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-600" />
                  Leia Também
                </h3>
                <Link href="/blog" className="text-xs font-bold text-emerald-600 hover:underline">
                  Ver todos os artigos →
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((post) => {
                  const postModConfig = getModalityConfig(post.modalidade);

                  return (
                    <Card
                      key={post.id}
                      className="group rounded-2xl border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between bg-white dark:bg-slate-900"
                    >
                      <div className="space-y-3">
                        <Link href={`/blog/${post.slug}`} className="block relative h-40 overflow-hidden bg-slate-900">
                          {post.coverImageUrl ? (
                            <img
                              src={post.coverImageUrl}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className={`w-full h-full bg-gradient-to-br ${postModConfig.bgGradient} flex items-center justify-center p-4 text-white relative`}>
                              <span className="text-[10px] font-mono uppercase tracking-wider opacity-80">
                                {postModConfig.label}
                              </span>
                            </div>
                          )}
                          <div className="absolute top-2 left-2 z-10">
                            <Badge className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm ${postModConfig.badgeClass}`}>
                              {postModConfig.label}
                            </Badge>
                          </div>
                        </Link>

                        <CardContent className="p-4 pt-0 space-y-2">
                          <Link href={`/blog/${post.slug}`} className="block">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
                              {post.title}
                            </h4>
                          </Link>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                            {post.excerpt}
                          </p>
                        </CardContent>
                      </div>

                      <div className="px-4 pb-4 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                        <span>{formatArticleDate(post.publishedAt || post.createdAt)}</span>
                        <Link href={`/blog/${post.slug}`} className="font-bold text-emerald-600 hover:underline">
                          Ler →
                        </Link>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}
        </article>
      </div>
    </>
  );
}
