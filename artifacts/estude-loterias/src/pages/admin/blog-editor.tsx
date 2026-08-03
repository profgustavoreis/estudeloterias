import React, { useState, useEffect, useRef } from "react";
import { Link, useParams, useLocation } from "wouter";
import { PageSEO } from "@/components/seo/PageSEO";
import {
  useGetAdminBlogPostById,
  getGetAdminBlogPostByIdQueryKey,
  useCreateAdminBlogPost,
  useUpdateAdminBlogPost,
  ArtigoInput,
  AiGenerateResultado,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { MarkdownPreview } from "@/components/admin/MarkdownPreview";
import { AiGeneratorModal } from "@/components/admin/AiGeneratorModal";
import { AdminKeyModal } from "@/components/admin/AdminKeyModal";
import {
  ArrowLeft,
  Save,
  Send,
  Sparkles,
  Wand2,
  Eye,
  FileText,
  Search,
  Tag,
  User,
  Image as ImageIcon,
  Clock,
  CheckCircle2,
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  Quote,
  Code,
  Table as TableIcon,
  Link as LinkIcon,
  RefreshCw,
  Globe,
  HelpCircle,
  AlertTriangle,
  Upload,
  Trash2,
  Columns2,
} from "lucide-react";

function slugify(text: string): string {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, "") // Remove invalid chars
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/-+/g, "-"); // Replace multiple - with single -
}

export default function BlogEditorAdminPage() {
  const params = useParams<{ id?: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const articleId = params.id ? parseInt(params.id, 10) : undefined;
  const isEditing = Boolean(articleId && !isNaN(articleId));

  // Form states
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [modalidade, setModalidade] = useState("geral");
  const [tagsInput, setTagsInput] = useState("");
  const [author, setAuthor] = useState("Equipe Estude Loterias");
  const [authorDescription, setAuthorDescription] = useState("Especialista em Loterias e Estatística");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");

  const [activeTab, setActiveTab] = useState<"write" | "preview" | "split">("write");
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [keyModalOpen, setKeyModalOpen] = useState(false);
  const [isAutoSlug, setIsAutoSlug] = useState(true);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch article if editing
  const {
    data: existingArticle,
    isLoading: isLoadingArticle,
    isError: isErrorArticle,
    error: articleError,
  } = useGetAdminBlogPostById(articleId || 0, {
    query: {
      queryKey: getGetAdminBlogPostByIdQueryKey(articleId || 0),
      enabled: isEditing,
      retry: false,
    },
  });

  const createMutation = useCreateAdminBlogPost();
  const updateMutation = useUpdateAdminBlogPost();

  // Populate form on article load
  useEffect(() => {
    if (existingArticle) {
      setTitle(existingArticle.title || "");
      setSlug(existingArticle.slug || "");
      setExcerpt(existingArticle.excerpt || "");
      setContent(existingArticle.content || "");
      setCoverImageUrl(existingArticle.coverImageUrl || "");
      setModalidade(existingArticle.modalidade || "geral");
      setTagsInput(Array.isArray(existingArticle.tags) ? existingArticle.tags.join(", ") : "");
      setAuthor(existingArticle.author || "Equipe Estude Loterias");
      setAuthorDescription(existingArticle.authorDescription || "Especialista em Loterias e Estatística");
      setSeoTitle(existingArticle.seoTitle || "");
      setSeoDescription(existingArticle.seoDescription || "");
      setStatus(existingArticle.status === "published" ? "published" : "draft");
      setIsAutoSlug(false);
    }
  }, [existingArticle]);

  // Handle title changes & auto-slug
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (isAutoSlug) {
      setSlug(slugify(val));
    }
  };

  const handleGenerateSlug = () => {
    setSlug(slugify(title));
    setIsAutoSlug(true);
    toast({ title: "Slug Gerado", description: "O slug foi gerado a partir do título." });
  };

  // Helper for inserting Markdown tags into textarea
  const insertMarkdown = (prefix: string, suffix: string = "") => {
    if (!textareaRef.current) return;
    const el = textareaRef.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = content.substring(start, end);
    const replacement = `${prefix}${selected || "texto"}${suffix}`;
    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, end + prefix.length + (selected ? 0 : 5));
    }, 50);
  };

  // Word count & Reading time calculation
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  // AI Generation handler
  const handleAiGenerated = (result: AiGenerateResultado) => {
    if (result.title) setTitle(result.title);
    if (result.slug) {
      setSlug(result.slug);
      setIsAutoSlug(false);
    }
    if (result.excerpt) setExcerpt(result.excerpt);
    if (result.content) setContent(result.content);
    if (result.modalidade) setModalidade(result.modalidade);
    if (Array.isArray(result.tags)) setTagsInput(result.tags.join(", "));
    if (result.seoTitle) setSeoTitle(result.seoTitle);
    if (result.seoDescription) setSeoDescription(result.seoDescription);

    setActiveTab("write");
  };

  // Image compression helper
  const compressImage = (file: File, maxWidth = 1200, maxHeight = 630, quality = 0.85): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Não foi possível processar a imagem."));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        let dataUrl = canvas.toDataURL("image/webp", quality);
        if (!dataUrl.startsWith("data:image/webp")) {
          dataUrl = canvas.toDataURL("image/jpeg", quality);
        }
        resolve(dataUrl);
      };
      img.onerror = (err) => {
        URL.revokeObjectURL(url);
        reject(err);
      };
      img.src = url;
    });
  };

  // Cover image upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "Por favor, escolha uma imagem menor que 10MB.",
        variant: "destructive",
      });
      return;
    }

    try {
      const compressedDataUrl = await compressImage(file);
      setCoverImageUrl(compressedDataUrl);
      toast({
        title: "Imagem Carregada!",
        description: "A imagem de capa foi otimizada e atualizada com sucesso.",
      });
    } catch {
      // Fallback to FileReader if Canvas compression fails
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setCoverImageUrl(reader.result);
          toast({
            title: "Imagem Carregada!",
            description: "A imagem de capa foi atualizada com sucesso.",
          });
        }
      };
      reader.readAsDataURL(file);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Save handler
  const handleSave = async (overrideStatus?: "draft" | "published") => {
    const targetStatus = overrideStatus || status;

    if (!title.trim()) {
      toast({
        title: "Título obrigatório",
        description: "Por favor, digite o título do artigo.",
        variant: "destructive",
      });
      return;
    }

    if (!content.trim()) {
      toast({
        title: "Conteúdo obrigatório",
        description: "Por favor, escreva o conteúdo em Markdown do artigo.",
        variant: "destructive",
      });
      return;
    }

    const finalSlug = slug.trim() || slugify(title);
    const parsedTags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const payload: ArtigoInput = {
      title: title.trim(),
      slug: finalSlug,
      excerpt: excerpt.trim(),
      content: content.trim(),
      coverImageUrl: coverImageUrl.trim() || null,
      modalidade: modalidade === "geral" ? null : modalidade,
      tags: parsedTags,
      author: author.trim() || "Equipe Estude Loterias",
      authorDescription: authorDescription.trim() || "Especialista em Loterias e Estatística",
      seoTitle: seoTitle.trim() || null,
      seoDescription: seoDescription.trim() || null,
      status: targetStatus,
    };

    try {
      if (isEditing && articleId) {
        await updateMutation.mutateAsync({
          id: articleId,
          data: payload,
        });
        toast({
          title: "Artigo Atualizado!",
          description: `Artigo salvo como ${targetStatus === "published" ? "Publicado" : "Rascunho"}.`,
        });
      } else {
        const created = await createMutation.mutateAsync({
          data: payload,
        });
        toast({
          title: "Artigo Criado!",
          description: `Novo artigo criado como ${targetStatus === "published" ? "Publicado" : "Rascunho"}.`,
        });
        if (created?.id) {
          setLocation(`/admin/blog/editar/${created.id}`);
        }
      }
    } catch (err: any) {
      if (err?.status === 401 || err?.status === 403) {
        toast({
          title: "Não Autorizado",
          description: "Sua chave de admin é necessária para salvar ou publicar artigos.",
          variant: "destructive",
        });
        setKeyModalOpen(true);
      } else {
        toast({
          title: "Erro ao salvar artigo",
          description: err?.message || "Ocorreu um erro ao comunicar com o servidor.",
          variant: "destructive",
        });
      }
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  // Escape key closes split mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && activeTab === "split") {
        setActiveTab("write");
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [activeTab]);

  // Reusable Markdown Formatting Toolbar
  const formattingToolbar = (
    <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1 flex-wrap text-xs">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => insertMarkdown("## ")}
        className="h-7 px-2 text-slate-700 font-bold"
        title="Título H2"
      >
        <Heading2 className="w-3.5 h-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => insertMarkdown("### ")}
        className="h-7 px-2 text-slate-700 font-bold"
        title="Subtítulo H3"
      >
        <Heading3 className="w-3.5 h-3.5" />
      </Button>
      <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 my-auto mx-1" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => insertMarkdown("**", "**")}
        className="h-7 px-2 text-slate-700 font-bold"
        title="Negrito"
      >
        <Bold className="w-3.5 h-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => insertMarkdown("*", "*")}
        className="h-7 px-2 text-slate-700 font-italic"
        title="Itálico"
      >
        <Italic className="w-3.5 h-3.5" />
      </Button>
      <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 my-auto mx-1" />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => insertMarkdown("- ")}
        className="h-7 px-2 text-slate-700"
        title="Lista com marcadores"
      >
        <List className="w-3.5 h-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => insertMarkdown("> ")}
        className="h-7 px-2 text-slate-700"
        title="Citação"
      >
        <Quote className="w-3.5 h-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => insertMarkdown("[", "](https://)")}
        className="h-7 px-2 text-slate-700"
        title="Link"
      >
        <LinkIcon className="w-3.5 h-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => insertMarkdown("![Imagem](", ")")}
        className="h-7 px-2 text-slate-700"
        title="Imagem"
      >
        <ImageIcon className="w-3.5 h-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => insertMarkdown("`", "`")}
        className="h-7 px-2 text-slate-700 font-mono"
        title="Código em linha"
      >
        <Code className="w-3.5 h-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() =>
          insertMarkdown(
            "\n| Coluna 1 | Coluna 2 |\n| --- | --- |\n| Dado 1 | Dado 2 |\n"
          )
        }
        className="h-7 px-2 text-slate-700"
        title="Inserir Tabela"
      >
        <TableIcon className="w-3.5 h-3.5" />
      </Button>
    </div>
  );

  if (isEditing && isLoadingArticle) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-3">
        <RefreshCw className="w-10 h-10 animate-spin mx-auto text-emerald-600" />
        <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
          Carregando artigo #{articleId}...
        </p>
      </div>
    );
  }

  return (
    <>
      <PageSEO
        title={isEditing ? `Editar Artigo #${articleId} | Admin` : "Novo Artigo | Admin"}
        description="Editor de artigos do blog Estude Loterias com suporte a Markdown, IA e SEO."
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Top Header & Navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <Link
              href="/admin/blog"
              className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-emerald-600 transition-colors mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Voltar para lista de artigos
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
                {isEditing ? `Editar Artigo` : "Criar Novo Artigo"}
              </h1>
              {isEditing && (
                <Badge className={status === "published" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"}>
                  {status === "published" ? "Publicado" : "Rascunho"}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              type="button"
              variant="outline"
              size="default"
              onClick={() => setAiModalOpen(true)}
              className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 hover:from-amber-500/20 border-emerald-500/30 text-emerald-800 dark:text-emerald-300 font-bold rounded-xl"
            >
              <Sparkles className="w-4 h-4 mr-2 text-amber-500 animate-pulse" />
              ⚡ Gerar Rascunho com IA
            </Button>

            <Button
              type="button"
              disabled={isSaving}
              onClick={() => handleSave(status)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>

        {/* Form Layout: Main Content (Left) + Sidebar (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Form Fields */}
          <div className="lg:col-span-8 space-y-6">
            {/* Card 1: Article Details */}
            <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
              <CardHeader className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 py-4">
                <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  Dados do Artigo
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="artigo-title" className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Título Principal <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="artigo-title"
                    type="text"
                    placeholder="Ex: Como Funciona o Bolão Oficial da Mega-Sena da Virada"
                    value={title}
                    onChange={handleTitleChange}
                    className="text-base font-bold border-slate-300 dark:border-slate-700 focus:ring-emerald-500 rounded-xl"
                  />
                </div>

                {/* Slug */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="artigo-slug" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      URL Slug (identificador amigável)
                    </Label>
                    <button
                      type="button"
                      onClick={handleGenerateSlug}
                      className="text-xs font-medium text-emerald-600 hover:underline flex items-center gap-1"
                    >
                      <Wand2 className="w-3 h-3" /> Gerar a partir do título
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
                      /artigos/
                    </span>
                    <Input
                      id="artigo-slug"
                      type="text"
                      placeholder="como-funciona-bolao-mega-sena"
                      value={slug}
                      onChange={(e) => {
                        setSlug(e.target.value);
                        setIsAutoSlug(false);
                      }}
                      className="font-mono text-xs border-slate-300 dark:border-slate-700 focus:ring-emerald-500 rounded-xl"
                    />
                  </div>
                </div>

                {/* Excerpt */}
                <div className="space-y-2">
                  <Label htmlFor="artigo-excerpt" className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Resumo / Excerpt (visível nas listas do blog) <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="artigo-excerpt"
                    rows={3}
                    placeholder="Aprenda as regras completas, estatísticas de ganhadores e como organizar um bolão seguro e sem riscos..."
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    className="text-sm border-slate-300 dark:border-slate-700 focus:ring-emerald-500 rounded-xl"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Markdown Editor & Live Preview */}
            <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
              <CardHeader className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 py-3 px-6 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  Conteúdo do Artigo (Markdown)
                </CardTitle>

                {/* Tab Switcher */}
                <div className="bg-slate-200/70 dark:bg-slate-800 p-1 rounded-xl flex items-center gap-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveTab("write")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                      activeTab === "write"
                        ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                    }`}
                  >
                    ✍️ Escrever
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("preview")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                      activeTab === "preview"
                        ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5 text-emerald-600" /> Prévia da Leitura
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("split")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                      activeTab === "split"
                        ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                    }`}
                  >
                    <Columns2 className="w-3.5 h-3.5 text-emerald-600" /> Lado a Lado
                  </button>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {activeTab === "write" ? (
                  <div className="space-y-0">
                    {formattingToolbar}

                    <Textarea
                      ref={textareaRef}
                      rows={18}
                      placeholder="Escreva seu artigo utilizando a sintaxe Markdown..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="border-0 focus-visible:ring-0 rounded-none p-6 font-mono text-sm leading-relaxed focus:outline-none resize-y"
                    />

                    {/* Editor Metrics Bar */}
                    <div className="bg-slate-50 dark:bg-slate-800/40 p-3 px-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-4">
                        <span>
                          <strong>{wordCount}</strong> palavras
                        </span>
                        <span>
                          <strong>{content.length}</strong> caracteres
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Tempo de leitura est. ~{readingTimeMinutes} min</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 bg-white dark:bg-slate-900 min-h-[400px]">
                    <MarkdownPreview content={content} />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Split Mode Overlay */}
            {activeTab === "split" && (
              <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-slate-950">
                {/* Overlay Header */}
                <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shrink-0">
                  <div className="flex items-center gap-2">
                    <Columns2 className="w-4 h-4 text-emerald-600" />
                    <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Conteúdo do Artigo — Modo Lado a Lado
                    </h2>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab("write")}
                    className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 gap-1.5"
                  >
                    <span className="hidden sm:inline">Sair do modo lado a lado</span>
                    <span className="sm:hidden">Fechar</span>
                    <span className="text-slate-400 dark:text-slate-600 text-[10px] ml-1 hidden sm:inline">ESC</span>
                  </Button>
                </div>

                {/* Two-Column Layout */}
                <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
                  {/* Left Pane: Editor */}
                  <div className="flex flex-col overflow-hidden min-h-0">
                    {formattingToolbar}
                    <Textarea
                      ref={textareaRef}
                      placeholder="Escreva seu artigo utilizando a sintaxe Markdown..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="flex-1 border-0 focus-visible:ring-0 rounded-none p-6 font-mono text-sm leading-relaxed focus:outline-none resize-none min-h-0"
                    />
                    {/* Editor Metrics Bar */}
                    <div className="bg-slate-50 dark:bg-slate-800/40 p-3 px-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 shrink-0">
                      <div className="flex items-center gap-4">
                        <span>
                          <strong>{wordCount}</strong> palavras
                        </span>
                        <span>
                          <strong>{content.length}</strong> caracteres
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Tempo de leitura est. ~{readingTimeMinutes} min</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Pane: Live Preview */}
                  <div className="overflow-y-auto p-8 bg-white dark:bg-slate-950 min-h-0">
                    <MarkdownPreview content={content} />
                  </div>
                </div>
              </div>
            )}

            {/* Card 3: SEO Meta Title & Description */}
            <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
              <CardHeader className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 py-4">
                <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Search className="w-4 h-4 text-emerald-600" />
                  Otimização para Mecanismos de Busca (SEO)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                {/* Meta Title */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="artigo-seo-title" className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Meta Title (Título SEO)
                    </Label>
                    <span
                      className={`text-xs font-mono font-bold ${
                        seoTitle.length > 60
                          ? "text-amber-600"
                          : seoTitle.length >= 30
                          ? "text-emerald-600"
                          : "text-slate-400"
                      }`}
                    >
                      {seoTitle.length} / 60 caracteres
                    </span>
                  </div>
                  <Input
                    id="artigo-seo-title"
                    type="text"
                    placeholder={title || "Título para aparecer na busca do Google..."}
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    className="text-sm border-slate-300 dark:border-slate-700 focus:ring-emerald-500 rounded-xl"
                  />
                  {/* Progress visual bar */}
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        seoTitle.length > 60
                          ? "bg-amber-500"
                          : seoTitle.length >= 30
                          ? "bg-emerald-500"
                          : "bg-slate-300"
                      }`}
                      style={{ width: `${Math.min(100, (seoTitle.length / 60) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Meta Description */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="artigo-seo-desc" className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Meta Description (Descrição SEO)
                    </Label>
                    <span
                      className={`text-xs font-mono font-bold ${
                        seoDescription.length > 160
                          ? "text-amber-600"
                          : seoDescription.length >= 80
                          ? "text-emerald-600"
                          : "text-slate-400"
                      }`}
                    >
                      {seoDescription.length} / 160 caracteres
                    </span>
                  </div>
                  <Textarea
                    id="artigo-seo-desc"
                    rows={3}
                    placeholder={excerpt || "Descrição resumida que aparecerá nos resultados do Google..."}
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    className="text-sm border-slate-300 dark:border-slate-700 focus:ring-emerald-500 rounded-xl"
                  />
                  {/* Progress visual bar */}
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        seoDescription.length > 160
                          ? "bg-amber-500"
                          : seoDescription.length >= 80
                          ? "bg-emerald-500"
                          : "bg-slate-300"
                      }`}
                      style={{ width: `${Math.min(100, (seoDescription.length / 160) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Google Snippet Live Preview Box */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-sans mb-1">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    <span>Prévia do Resultado de Busca no Google:</span>
                  </div>
                  <div className="text-xs font-mono text-emerald-800 dark:text-emerald-400 truncate">
                    https://estudeloterias.com.br/artigos/{slug || "slug-do-artigo"}
                  </div>
                  <div className="text-base font-semibold text-blue-700 dark:text-blue-400 hover:underline cursor-pointer line-clamp-1">
                    {seoTitle || title || "Título do Artigo no Google"}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {seoDescription || excerpt || "Descrição resumida do artigo como aparecerá no resultado da busca."}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* AI Assistant Callout Box */}
            <div className="p-5 bg-gradient-to-br from-emerald-600 via-teal-700 to-indigo-700 rounded-2xl text-white shadow-lg space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-amber-300 border border-white/20 shrink-0">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Gerar com IA</h3>
                  <p className="text-xs text-emerald-100">Criar pauta automática em segundos</p>
                </div>
              </div>

              <p className="text-xs text-emerald-100/90 leading-relaxed">
                Digite um tema e deixe a IA preencher o título, resumo, marcas SEO e artigo completo em Markdown.
              </p>

              <Button
                type="button"
                onClick={() => setAiModalOpen(true)}
                className="w-full bg-white text-emerald-900 hover:bg-emerald-50 font-bold rounded-xl shadow-md border-0"
              >
                <Wand2 className="w-4 h-4 mr-2 text-emerald-700" />
                Abrir Assistente IA
              </Button>
            </div>

            {/* Publishing & Metadata Card */}
            <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
              <CardHeader className="bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 py-4">
                <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-emerald-600" />
                  Publicação & Categoria
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                {/* Modalidade Dropdown */}
                <div className="space-y-1.5">
                  <Label htmlFor="artigo-modalidade" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Modalidade da Loteria
                  </Label>
                  <Select value={modalidade} onValueChange={setModalidade}>
                    <SelectTrigger id="artigo-modalidade" className="rounded-xl border-slate-300 dark:border-slate-700 text-xs">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="geral">Geral / Notícias</SelectItem>
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

                {/* Status */}
                <div className="space-y-1.5">
                  <Label htmlFor="artigo-status" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Status do Artigo
                  </Label>
                  <Select value={status} onValueChange={(val) => setStatus(val as "draft" | "published")}>
                    <SelectTrigger id="artigo-status" className="rounded-xl border-slate-300 dark:border-slate-700 text-xs">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Rascunho</SelectItem>
                      <SelectItem value="published">Publicado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Cover Image URL & Upload */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="artigo-cover" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Imagem de Capa
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-7 px-2.5 text-xs rounded-lg border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 gap-1 font-semibold"
                    >
                      <Upload className="w-3.5 h-3.5" /> Fazer Upload
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                  {coverImageUrl.startsWith("data:") ? (
                    <div className="flex items-center justify-between p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300">
                      <div className="flex items-center gap-2 truncate pr-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-semibold truncate">Imagem carregada via upload (Base64)</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setCoverImageUrl("")}
                        className="h-6 px-2 text-[11px] text-slate-500 hover:text-red-600 dark:text-slate-400 hover:bg-transparent shrink-0 font-medium"
                      >
                        Usar URL em vez disso
                      </Button>
                    </div>
                  ) : (
                    <Input
                      id="artigo-cover"
                      type="text"
                      placeholder="https://exemplo.com/imagem.jpg ou faça upload..."
                      value={coverImageUrl}
                      onChange={(e) => setCoverImageUrl(e.target.value)}
                      className="text-xs border-slate-300 dark:border-slate-700 focus:ring-emerald-500 rounded-xl"
                    />
                  )}
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight pt-0.5">
                    💡 <strong>Resolução recomendada:</strong> 1200 x 630 pixels (proporção 1.91:1) — WebP, PNG ou JPG.
                  </p>
                  {coverImageUrl && (
                    <div className="relative mt-2 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 max-h-36 group">
                      <img
                        src={coverImageUrl}
                        alt="Prévia da capa"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setCoverImageUrl("")}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-red-600 text-white transition-colors"
                        title="Remover imagem"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Author */}
                <div className="space-y-1.5">
                  <Label htmlFor="artigo-author" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Autor
                  </Label>
                  <Input
                    id="artigo-author"
                    type="text"
                    placeholder="Equipe Estude Loterias"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="text-xs border-slate-300 dark:border-slate-700 focus:ring-emerald-500 rounded-xl"
                  />
                </div>

                {/* Author Description */}
                <div className="space-y-1.5">
                  <Label htmlFor="artigo-author-desc" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Descrição do Autor
                  </Label>
                  <Input
                    id="artigo-author-desc"
                    type="text"
                    placeholder="Especialista em Loterias e Estatística"
                    value={authorDescription}
                    onChange={(e) => setAuthorDescription(e.target.value)}
                    className="text-xs border-slate-300 dark:border-slate-700 focus:ring-emerald-500 rounded-xl"
                  />
                </div>

                {/* Tags */}
                <div className="space-y-1.5">
                  <Label htmlFor="artigo-tags" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Tags (separadas por vírgula)
                  </Label>
                  <Input
                    id="artigo-tags"
                    type="text"
                    placeholder="megasena, estatisticas, dicas"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="text-xs border-slate-300 dark:border-slate-700 focus:ring-emerald-500 rounded-xl"
                  />
                  {tagsInput.trim() && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {tagsInput
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean)
                        .map((tag, idx) => (
                          <Badge key={idx} variant="secondary" className="text-[10px] font-mono">
                            #{tag}
                          </Badge>
                        ))}
                    </div>
                  )}
                </div>

                {/* Second Save Button below Tags */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    type="button"
                    disabled={isSaving}
                    onClick={() => handleSave(status)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? "Salvando..." : "Salvar"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* AI Generator Modal */}
      <AiGeneratorModal
        open={aiModalOpen}
        onOpenChange={setAiModalOpen}
        onGenerated={handleAiGenerated}
        onUnauthorized={() => setKeyModalOpen(true)}
        defaultModalidade={modalidade}
      />

      {/* Admin Key Modal */}
      <AdminKeyModal
        open={keyModalOpen}
        onOpenChange={setKeyModalOpen}
      />
    </>
  );
}
