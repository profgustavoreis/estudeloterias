import React, { useState } from "react";
import { useAdminKey } from "@/lib/admin-auth";
import { AdminKeyModal } from "@/components/admin/AdminKeyModal";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ShieldCheck, KeyRound, RefreshCw, Lock } from "lucide-react";

interface AdminAuthGateProps {
  children: React.ReactNode;
  /** True while the protected query is loading/resolving. */
  isLoading: boolean;
  /** True when the protected query resolved with a 401/403 auth error. */
  authError: boolean;
}

/**
 * Wraps admin-only content and blocks rendering until a valid admin key is
 * confirmed via a real API call (the page's protected query).
 *
 * States:
 *  1. No key in localStorage  → blocked screen ("Acesso Restrito")
 *  2. Key present + loading   → loading spinner
 *  3. Key present + 401/403   → blocked screen ("Chave Inválida")
 *  4. Key present + success   → renders children
 */
export function AdminAuthGate({ children, isLoading, authError }: AdminAuthGateProps) {
  const { hasKey } = useAdminKey();
  const [keyModalOpen, setKeyModalOpen] = useState(false);

  // ── State 1: No key at all ──────────────────────────────────────────────
  if (!hasKey) {
    return (
      <>
        <BlockedScreen
          variant="no-key"
          onOpenKeyModal={() => setKeyModalOpen(true)}
        />
        <AdminKeyModal open={keyModalOpen} onOpenChange={setKeyModalOpen} />
      </>
    );
  }

  // ── State 2: Key present, still validating ──────────────────────────────
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
              <RefreshCw className="w-7 h-7 text-emerald-600 animate-spin" />
            </div>
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Validando acesso...
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Verificando sua chave de administrador
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── State 3: Key present but invalid (401/403) ──────────────────────────
  if (authError) {
    return (
      <>
        <BlockedScreen
          variant="invalid-key"
          onOpenKeyModal={() => setKeyModalOpen(true)}
        />
        <AdminKeyModal open={keyModalOpen} onOpenChange={setKeyModalOpen} />
      </>
    );
  }

  // ── State 4: Authenticated — render the protected content ───────────────
  return <>{children}</>;
}

/* ────────────────────────────────────────────────────────────────────────────
 * BlockedScreen — centred, compact, professional "access denied" view
 * ────────────────────────────────────────────────────────────────────────── */

type BlockedVariant = "no-key" | "invalid-key";

interface BlockedScreenProps {
  variant: BlockedVariant;
  onOpenKeyModal: () => void;
}

const VARIANT_CONFIG: Record<
  BlockedVariant,
  {
    iconBg: string;
    iconColor: string;
    Icon: typeof ShieldAlert;
    badge: string;
    badgeClass: string;
    title: string;
    description: string;
  }
> = {
  "no-key": {
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-600",
    Icon: Lock,
    badge: "Sem Chave",
    badgeClass:
      "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20",
    title: "Acesso Restrito",
    description:
      "Esta área é exclusiva para administradores do blog. Para continuar, insira sua chave de acesso admin.",
  },
  "invalid-key": {
    iconBg: "bg-red-500/10",
    iconColor: "text-red-600",
    Icon: ShieldAlert,
    badge: "Chave Inválida",
    badgeClass:
      "bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20",
    title: "Chave Inválida",
    description:
      "A chave administrativa informada não é válida ou não foi reconhecida pelo servidor. Insira uma chave válida para continuar.",
  },
};

function BlockedScreen({ variant, onOpenKeyModal }: BlockedScreenProps) {
  const cfg = VARIANT_CONFIG[variant];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      <div className="flex flex-col items-center text-center max-w-md mx-auto space-y-6">
        {/* Icon */}
        <div
          className={`w-16 h-16 rounded-2xl ${cfg.iconBg} ${cfg.iconColor} flex items-center justify-center shadow-sm`}
        >
          <cfg.Icon className="w-8 h-8" />
        </div>

        {/* Badge */}
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${cfg.badgeClass}`}
        >
          {cfg.badge}
        </span>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
          {cfg.title}
        </h1>

        {/* Description */}
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          {cfg.description}
        </p>

        {/* CTA */}
        <Button
          onClick={onOpenKeyModal}
          className="bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-lg shadow-amber-600/20 px-6 py-2.5"
        >
          <KeyRound className="w-4 h-4 mr-2" />
          Inserir Chave Admin
        </Button>

        {/* Subtle hint */}
        <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-xs">
          A chave é armazenada apenas no navegador e enviada via cabeçalho HTTP seguro.
        </p>
      </div>
    </div>
  );
}
