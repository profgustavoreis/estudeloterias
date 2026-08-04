import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { PageSEO } from "@/components/seo/PageSEO";
import {
  useGetAdminBlogPosts,
  getGetAdminBlogPostsQueryKey,
  useUpdateAdminBlogPost,
  useDeleteAdminBlogPost,
  Artigo,
  ArtigoStatus,
} from "@workspace/api-client-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { AdminKeyModal } from "@/components/admin/AdminKeyModal";
import { AdminAuthGate } from "@/components/admin/AdminAuthGate";
import { useAdminKey } from "@/lib/admin-auth";
import {
  FileText,
  Plus,
  Search,
  KeyRound,
  MoreVertical,
  Pencil,
  Trash2,
  Eye,
  Clock,
  Calendar,
  CheckCircle2,
  FileEdit,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";

const MODALIDADE_STYLES: Record<string, { label: string; class: string }> = {
  "mega-sena": { label: "Mega-Sena", class: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20" },
  lotofacil: { label: "Lotofácil", class: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20" },
  quina: { label: "Quina", class: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20" },
  lotomania: { label: "Lotomania", class: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20" },
  timemania: { label: "Timemania", class: "bg-lime-500/10 text-lime-700 dark:text-lime-400 border-lime-500/20" },
  diadesorte: { label: "Dia de Sorte", class: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20" },
  duplasena: { label: "Dupla Sena", class: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20" },
  maismilionaria: { label: "+Milionária", class: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20" },
  "super-sete": { label: "Super Sete", class: "bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/20" },
  geral: { label: "Geral", class: "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20" },
};

export default function BlogListAdminPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { hasKey } = useAdminKey();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [modalidadeFilter, setModalidadeFilter] = useState<string>("todos");
  const [keyModalOpen, setKeyModalOpen] = useState(false);

  const [deleteArticleId, setDeleteArticleId] = useState<number | null>(null);

  // Fetch admin posts — only when a key is present (avoids useless 401s)
  const queryParams = {
    q: searchQuery.trim() || undefined,
    status: statusFilter === "todos" ? undefined : statusFilter,
  };

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useGetAdminBlogPosts(queryParams, {
    query: {
      queryKey: getGetAdminBlogPostsQueryKey(queryParams),
      retry: false,
      enabled: hasKey,
    },
  });

  // Derive auth error from the protected query
  const authError = hasKey && isError && ((error as any)?.status === 401 || (error as any)?.status === 403);

  const updateArticleMutation = useUpdateAdminBlogPost();
  const deleteArticleMutation = useDeleteAdminBlogPost();

  const posts = data?.resultados || [];
  const totalPosts = data?.total || 0;

  // Filter modalidade on client if selected
  const filteredPosts = posts.filter((post) => {
    if (modalidadeFilter === "todos") return true;
    return (post.modalidade || "geral") === modalidadeFilter;
  });

  const publishedCount = posts.filter((p) => p.status === "published").length;
  const draftCount = posts.filter((p) => p.status === "draft").length;

  const handleToggleStatus = async (article: Artigo) => {
    const newStatus: ArtigoStatus = article.status === "published" ? "draft" : "published";
    const statusLabel = newStatus === "published" ? "Publicado" : "Rascunho";

    try {
      await updateArticleMutation.mutateAsync({
        id: article.id,
        data: {
          title: article.title,
          excerpt: article.excerpt,
          content: article.content,
          slug: article.slug,
          coverImageUrl: article.coverImageUrl,
          modalidade: article.modalidade,
          tags: article.tags,
          author: article.author,
          seoTitle: article.seoTitle,
          seoDescription: article.seoDescription,
          status: newStatus,
        },
      });

      toast({
        title: "Status Atualizado",
        description: `O artigo "${article.title}" agora é ${statusLabel}.`,
      });

      refetch();
    } catch (err: any) {
      toast({
        title: "Erro ao alterar status",
        description: err?.message || "Não foi possível alterar o status do artigo.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteArticleId) return;

    try {
      await deleteArticleMutation.mutateAsync({ id: deleteArticleId });

      toast({
        title: "Artigo Excluído",
        description: "O artigo foi removido permanentemente com sucesso.",
      });

      setDeleteArticleId(null);
      refetch();
    } catch (err: any) {
      toast({
        title: "Erro ao excluir",
        description: err?.message || "Não foi possível excluir o artigo.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <>
      <PageSEO
        title="Gerenciador do Blog | Estude Loterias Admin"
        description="Painel administrativo de gerenciamento de artigos do blog das Loterias Caixa."
      />

      <AdminAuthGate isLoading={hasKey && isLoading} authError={authError}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                Painel Admin
              </span>

            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight flex items-center gap-3">
              <FileText className="w-8 h-8 text-emerald-600" />
              Gerenciador de Artigos
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Crie, edite, organize publicações e gere novos rascunhos otimizados para SEO usando IA.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant="outline"
              size="default"
              onClick={() => setKeyModalOpen(true)}
              className="rounded-xl border-slate-300 dark:border-slate-700 font-medium"
            >
              <KeyRound className="w-4 h-4 mr-2 text-amber-600" />
              Chave Admin
            </Button>

            <Button
              size="default"
              onClick={() => setLocation("/admin/blog/novo")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20"
            >
              <Plus className="w-5 h-5 mr-1.5" />
              ⚡ Criar Novo Artigo
            </Button>
          </div>
        </div>

        {/* Statistics Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Total de Artigos
                </p>
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 mt-1">
                  {totalPosts}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Publicados
                </p>
                <h3 className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-1">
                  {publishedCount}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  Rascunhos
                </p>
                <h3 className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
                  {draftCount}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <FileEdit className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center gap-4 justify-between">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar por título, resumo ou palavra-chave..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-xl border-slate-300 dark:border-slate-700 text-sm focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">Status:</span>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] rounded-xl border-slate-300 dark:border-slate-700 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="published">Publicado</SelectItem>
                  <SelectItem value="draft">Rascunho</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500">Modalidade:</span>
              <Select value={modalidadeFilter} onValueChange={setModalidadeFilter}>
                <SelectTrigger className="w-[150px] rounded-xl border-slate-300 dark:border-slate-700 text-xs">
                  <SelectValue placeholder="Modalidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  <SelectItem value="geral">Geral</SelectItem>
                  <SelectItem value="mega-sena">Mega-Sena</SelectItem>
                  <SelectItem value="lotofacil">Lotofácil</SelectItem>
                  <SelectItem value="quina">Quina</SelectItem>
                  <SelectItem value="lotomania">Lotomania</SelectItem>
                  <SelectItem value="timemania">Timemania</SelectItem>
                  <SelectItem value="diadesorte">Dia de Sorte</SelectItem>
                  <SelectItem value="duplasena">Dupla Sena</SelectItem>
                  <SelectItem value="maismilionaria">+Milionária</SelectItem>
                  <SelectItem value="super-sete">Super Sete</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              disabled={isRefetching}
              className="rounded-xl text-slate-500 hover:text-slate-800"
              title="Atualizar lista"
            >
              <RefreshCw className={`w-4 h-4 ${isRefetching ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="py-16 text-center text-slate-400 space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
              <p className="text-sm font-medium">Carregando artigos do blog...</p>
            </div>
          ) : isError ? (
            <div className="py-16 text-center text-red-500 space-y-3">
              <AlertTriangle className="w-10 h-10 mx-auto" />
              <p className="text-base font-bold">Falha ao carregar artigos</p>
              <p className="text-xs text-slate-500">{(error as any)?.message || "Ocorreu um erro no servidor."}</p>
              <Button size="sm" onClick={() => refetch()} className="bg-slate-800 text-white rounded-xl">
                Tentar Novamente
              </Button>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="py-16 px-4 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <FileText className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  Nenhum artigo encontrado
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Não foram encontrados artigos com os filtros aplicados ou sua base ainda não possui posts cadastrados.
                </p>
              </div>
              <Button
                onClick={() => setLocation("/admin/blog/novo")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Criar o Primeiro Artigo
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                <TableRow className="border-slate-200 dark:border-slate-800">
                  <TableHead className="w-[45%] text-slate-700 dark:text-slate-300 font-bold">Artigo</TableHead>
                  <TableHead className="text-slate-700 dark:text-slate-300 font-bold">Modalidade</TableHead>
                  <TableHead className="text-slate-700 dark:text-slate-300 font-bold">Status</TableHead>
                  <TableHead className="text-slate-700 dark:text-slate-300 font-bold">Atualizado em</TableHead>
                  <TableHead className="text-slate-700 dark:text-slate-300 font-bold">Leitura</TableHead>
                  <TableHead className="text-right text-slate-700 dark:text-slate-300 font-bold">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPosts.map((article) => {
                  const modKey = article.modalidade || "geral";
                  const modStyle = MODALIDADE_STYLES[modKey] || MODALIDADE_STYLES.geral;

                  return (
                    <TableRow
                      key={article.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 border-slate-100 dark:border-slate-800/60 transition-colors"
                    >
                      <TableCell>
                        <div className="space-y-1">
                          <Link
                            href={`/admin/blog/editar/${article.id}`}
                            className="font-bold text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 text-sm line-clamp-1 transition-colors"
                          >
                            {article.title}
                          </Link>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                            {article.excerpt || "Sem resumo disponível"}
                          </p>
                          <div className="flex items-center gap-2 pt-0.5">
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                              /{article.slug}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${modStyle.class}`}>
                          {modStyle.label}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        {article.status === "published" ? (
                          <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 font-semibold text-xs px-2.5 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Publicado
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 font-semibold text-xs px-2.5 py-0.5 rounded-full">
                            <FileEdit className="w-3 h-3 mr-1" /> Rascunho
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {formatDate(article.updatedAt || article.createdAt)}
                        </div>
                      </TableCell>

                      <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {article.readingTimeMinutes || 3} min
                        </div>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setLocation(`/admin/blog/editar/${article.id}`)}
                            className="h-8 w-8 p-0 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                            title="Editar artigo"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-slate-500 hover:text-slate-800"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg">
                              <DropdownMenuItem
                                onClick={() => setLocation(`/admin/blog/editar/${article.id}`)}
                                className="text-xs font-medium cursor-pointer"
                              >
                                <Pencil className="w-3.5 h-3.5 mr-2 text-slate-500" />
                                Editar Artigo
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() => handleToggleStatus(article)}
                                className="text-xs font-medium cursor-pointer"
                              >
                                <RefreshCw className="w-3.5 h-3.5 mr-2 text-slate-500" />
                                {article.status === "published" ? "Mudar para Rascunho" : "Publicar Artigo"}
                              </DropdownMenuItem>

                              <DropdownMenuSeparator className="border-slate-100 dark:border-slate-800" />

                              <DropdownMenuItem
                                onClick={() => setDeleteArticleId(article.id)}
                                className="text-xs font-medium text-red-600 dark:text-red-400 cursor-pointer focus:bg-red-50 dark:focus:bg-red-950/30"
                              >
                                <Trash2 className="w-3.5 h-3.5 mr-2" />
                                Excluir Artigo
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
      </AdminAuthGate>

      {/* Admin Key Modal */}
      <AdminKeyModal
        open={keyModalOpen}
        onOpenChange={setKeyModalOpen}
      />

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={deleteArticleId !== null} onOpenChange={(open) => !open && setDeleteArticleId(null)}>
        <AlertDialogContent className="rounded-2xl border-slate-200 dark:border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Confirmar Exclusão de Artigo
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-slate-500 dark:text-slate-400">
              Tem certeza que deseja remover este artigo permanentemente? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 pt-2">
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl"
            >
              Excluir Artigo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
