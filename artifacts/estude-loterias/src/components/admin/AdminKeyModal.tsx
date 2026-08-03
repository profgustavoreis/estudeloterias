import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getAdminKey, setAdminKey, removeAdminKey } from "@/lib/admin-auth";
import { KeyRound, Eye, EyeOff, Check, Trash2, Lock, ShieldCheck } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface AdminKeyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

export const AdminKeyModal: React.FC<AdminKeyModalProps> = ({
  open,
  onOpenChange,
  title = "Chave de Acesso Admin",
  description = "Digite sua chave administrativa para gerenciar os artigos do blog e utilizar a IA.",
}) => {
  const [inputValue, setInputValue] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [currentKey, setCurrentKey] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open) {
      const stored = getAdminKey();
      setCurrentKey(stored);
      setInputValue(stored);
    }
  }, [open]);

  const handleSave = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      toast({
        title: "Atenção",
        description: "Por favor, digite uma chave admin válida.",
        variant: "destructive",
      });
      return;
    }

    setAdminKey(trimmed);
    queryClient.invalidateQueries();

    toast({
      title: "Chave Admin Salva!",
      description: "Sua chave foi atualizada com sucesso no navegador.",
    });

    onOpenChange(false);
  };

  const handleClear = () => {
    removeAdminKey();
    setInputValue("");
    setCurrentKey("");
    queryClient.invalidateQueries();

    toast({
      title: "Chave Removida",
      description: "A chave admin foi removida do navegador.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-2xl">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {title}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-3">
          {currentKey ? (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-sm font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Chave configurada e ativa</span>
              </div>
              <span className="text-xs font-mono bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-800 dark:text-emerald-300">
                ••••{currentKey.slice(-4)}
              </span>
            </div>
          ) : (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2 text-amber-700 dark:text-amber-400 text-sm font-medium">
              <Lock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Nenhuma chave configurada. Algumas ações exigem autenticação.</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="admin-key-input" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Sua Chave Admin (x-admin-key)
            </Label>
            <div className="relative">
              <Input
                id="admin-key-input"
                type={showKey ? "text" : "password"}
                placeholder="Cole sua chave admin aqui..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSave();
                  }
                }}
                className="pr-10 font-mono text-sm border-slate-300 dark:border-slate-700 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                title={showKey ? "Ocultar chave" : "Mostrar chave"}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Esta chave é mantida com segurança no armazenamento local do seu navegador e enviada via cabeçalho HTTP <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-700 dark:text-slate-300">x-admin-key</code>.
            </p>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between gap-2 border-t border-slate-100 dark:border-slate-800 pt-4">
          {currentKey ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 dark:border-red-900/40 dark:hover:bg-red-950/30"
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              Remover
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
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
              size="sm"
              onClick={handleSave}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              <Check className="w-4 h-4 mr-1.5" />
              Salvar Chave
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
