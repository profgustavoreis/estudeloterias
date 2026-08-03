import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useGenerateBlogPostAi, AiGenerateResultado, AiGenerateInputTom, AiGenerateInputTamanho } from "@workspace/api-client-react";
import { Sparkles, Loader2, Wand2, FileText, BrainCircuit, CheckCircle2 } from "lucide-react";

interface AiGeneratorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerated: (data: AiGenerateResultado) => void;
  onUnauthorized?: () => void;
  defaultModalidade?: string;
}

const MODALIDADES = [
  { value: "geral", label: "Geral / Notícias" },
  { value: "mega-sena", label: "Mega-Sena" },
  { value: "lotofacil", label: "Lotofácil" },
  { value: "quina", label: "Quina" },
  { value: "lotomania", label: "Lotomania" },
  { value: "timemania", label: "Timemania" },
  { value: "diadesorte", label: "Dia de Sorte" },
  { value: "duplasena", label: "Dupla Sena" },
  { value: "maismilionaria", label: "+Milionária" },
  { value: "super-sete", label: "Super Sete" },
];

const TONS = [
  { value: "informativo", label: "Informativo", desc: "Direto ao ponto, focado em dados e fatos" },
  { value: "educativo", label: "Educativo", desc: "Explicativo, ensinando como jogar ou analisar" },
  { value: "analitico", label: "Analítico", desc: "Aprofundado em frequências e padrões estatísticos" },
  { value: "descontraido", label: "Descontraído", desc: "Leve, engajante e conversacional" },
];

const TAMANHOS = [
  { value: "curto", label: "Curto", desc: "~500 palavras, leitura rápida de 2-3 min" },
  { value: "medio", label: "Médio", desc: "~1.000 palavras, leitura completa de 4-5 min" },
  { value: "longo", label: "Longo", desc: "~1.800+ palavras, guia detalhado de 7-10 min" },
];

export const AiGeneratorModal: React.FC<AiGeneratorModalProps> = ({
  open,
  onOpenChange,
  onGenerated,
  onUnauthorized,
  defaultModalidade = "geral",
}) => {
  const [pauta, setPauta] = useState("");
  const [modalidade, setModalidade] = useState(defaultModalidade);
  const [tom, setTom] = useState<AiGenerateInputTom>("informativo");
  const [tamanho, setTamanho] = useState<AiGenerateInputTamanho>("medio");
  const [loadingStep, setLoadingStep] = useState(0);

  const { toast } = useToast();
  const generateAiMutation = useGenerateBlogPostAi();

  const handleGenerate = async () => {
    if (!pauta.trim()) {
      toast({
        title: "Pauta obrigatória",
        description: "Por favor, digite uma pauta ou tema para o artigo.",
        variant: "destructive",
      });
      return;
    }

    setLoadingStep(1);
    const stepTimer1 = setTimeout(() => setLoadingStep(2), 8000);
    const stepTimer2 = setTimeout(() => setLoadingStep(3), 20000);

    try {
      const result = await generateAiMutation.mutateAsync({
        data: {
          pauta: pauta.trim(),
          modalidade: modalidade === "geral" ? null : modalidade,
          tom,
          tamanho,
        },
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      toast({
        title: "✨ Artigo Gerado com Sucesso!",
        description: "Os campos do formulário foram preenchidos para sua revisão.",
      });

      onGenerated(result);
      onOpenChange(false);
    } catch (err: any) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      if (err?.status === 401 || err?.status === 403) {
        toast({
          title: "Acesso Não Autorizado",
          description: "Sua chave de admin é necessária para utilizar o gerador IA.",
          variant: "destructive",
        });
        if (onUnauthorized) onUnauthorized();
      } else {
        toast({
          title: "Erro ao gerar com IA",
          description: err?.message || "Não foi possível gerar o rascunho no momento.",
          variant: "destructive",
        });
      }
    } finally {
      setLoadingStep(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={generateAiMutation.isPending ? () => {} : onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl p-0 overflow-hidden">
        {/* Header gradient banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 p-6 text-white relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-amber-300">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black tracking-tight text-white">
                Assistente de IA — Gerar Rascunho
              </DialogTitle>
              <DialogDescription className="text-emerald-100 text-xs mt-0.5">
                Descreva o assunto e deixe nossa IA estruturar o artigo completo com Markdown e meta tags SEO.
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {generateAiMutation.isPending ? (
            <div className="py-10 px-4 flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30">
                  <BrainCircuit className="w-10 h-10 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-lg">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="space-y-2 max-w-md">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                  Gerando rascunho com Inteligência Artificial...
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Este processo pode levar alguns segundos enquanto a IA pesquisa dados e formata o conteúdo.
                </p>
              </div>

              <div className="w-full max-w-sm space-y-2 text-left bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                  {loadingStep > 1 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : loadingStep === 1 ? (
                    <Loader2 className="w-4 h-4 text-emerald-600 animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 shrink-0" />
                  )}
                  <span className={loadingStep >= 1 ? "font-medium text-emerald-700 dark:text-emerald-400" : "text-slate-400"}>
                    Analisando a pauta e modalidades
                  </span>
                </div>

                <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                  {loadingStep > 2 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : loadingStep === 2 ? (
                    <Loader2 className="w-4 h-4 text-emerald-600 animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 shrink-0" />
                  )}
                  <span className={loadingStep >= 2 ? "font-medium text-emerald-700 dark:text-emerald-400" : "text-slate-400"}>
                    Redigindo artigo completo em Markdown
                  </span>
                </div>

                <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                  {loadingStep >= 3 ? (
                    <Loader2 className="w-4 h-4 text-emerald-600 animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 shrink-0" />
                  )}
                  <span className={loadingStep >= 3 ? "font-medium text-emerald-700 dark:text-emerald-400" : "text-slate-400"}>
                    Otimizando Slug, Resumo e Meta Tags SEO
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Form Content */}
              <div className="space-y-2">
                <Label htmlFor="ai-pauta" className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  Pauta ou Tema do Artigo <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="ai-pauta"
                  rows={3}
                  placeholder="Ex: Como funciona o bolão da Lotofácil, quais os números mais sorteados e estratégias simples de desdobramento..."
                  value={pauta}
                  onChange={(e) => setPauta(e.target.value)}
                  className="text-sm border-slate-300 dark:border-slate-700 focus:ring-emerald-500 rounded-xl"
                />
                <p className="text-[11px] text-slate-500">
                  Dica: Quanto mais detalhes e palavras-chave você incluir na pauta, mais rico e preciso será o rascunho gerado.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ai-modalidade" className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Modalidade / Categoria
                  </Label>
                  <Select value={modalidade} onValueChange={setModalidade}>
                    <SelectTrigger id="ai-modalidade" className="rounded-xl border-slate-300 dark:border-slate-700">
                      <SelectValue placeholder="Selecione a modalidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {MODALIDADES.map((mod) => (
                        <SelectItem key={mod.value} value={mod.value}>
                          {mod.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ai-tom" className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Tom de Voz
                  </Label>
                  <Select value={tom} onValueChange={(val) => setTom(val as AiGenerateInputTom)}>
                    <SelectTrigger id="ai-tom" className="rounded-xl border-slate-300 dark:border-slate-700">
                      <SelectValue placeholder="Selecione o tom" />
                    </SelectTrigger>
                    <SelectContent>
                      {TONS.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ai-tamanho" className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Tamanho Estimado do Conteúdo
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  {TAMANHOS.map((tam) => (
                    <button
                      key={tam.value}
                      type="button"
                      onClick={() => setTamanho(tam.value as AiGenerateInputTamanho)}
                      className={`p-3 text-left rounded-xl border transition-all ${
                        tamanho === tam.value
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/30"
                          : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-100 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <div className="font-bold text-xs">{tam.label}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-tight">
                        {tam.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {!generateAiMutation.isPending && (
          <DialogFooter className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="default"
              onClick={handleGenerate}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 shadow-lg shadow-emerald-600/20 rounded-xl"
            >
              <Wand2 className="w-4 h-4 mr-2" />
              ⚡ Gerar Artigo com IA
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
