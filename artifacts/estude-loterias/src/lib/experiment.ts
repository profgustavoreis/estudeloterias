/**
 * Parceiro padrão dos módulos de ferramenta.
 *
 * Escopo: os cards nativos de ferramenta (`placement: "ferramenta_inline"`) das
 * páginas de estatísticas e simulador de todas as modalidades.
 *
 * Histórico: este módulo já abrigou um A/B entre parceiros, com split 50/50
 * persistido em `localStorage`. O experimento foi encerrado e o parceiro de
 * ferramenta passou a ser fixo: **Portal Net Sorte**. A API pública
 * (`getToolExperiment()`) foi mantida para não exigir mudanças nas páginas.
 */

import type { Afiliado, AffiliateVariant } from "./affiliate";

export interface ToolPartner {
  /** Parceiro exibido no card de ferramenta. */
  afiliado: Afiliado;
  /** Variante de link usada (tráfego frio → `landing`). */
  variant: AffiliateVariant;
  /** Copy do card. */
  title: string;
  body: string;
  /** Rótulo opcional em negrito antes do corpo (ex.: "Nota do Gustavo:"). */
  noteLabel?: string;
  ctaLabel: string;
}

/**
 * Parceiro único dos cards de ferramenta (Portal Net Sorte, variante landing).
 * Copy vencedora do A/B encerrado.
 */
const TOOL_PARTNER: ToolPartner = {
  afiliado: "net_sorte",
  variant: "landing",
  title: "Coloque a Matemática a serviço de sua sorte!",
  body: "A plataforma Net Sorte oferece análises matemáticas detalhadas de todas as modalidades das Loterias Caixa e, principalmente, fechamentos lotéricos inteligentes para você apostar sozinho ou organizar seus próprios bolões. Uma assinatura oferece acesso ilimitado às ferramentas do Portal Net Sorte por 12 meses.",
  noteLabel: "Nota do Gustavo:",
  ctaLabel: "Ver ferramentas",
};

/**
 * Atribuição do card de ferramenta. Hoje devolve sempre o parceiro padrão
 * (Portal Net Sorte); mantida como função para preservar a API das páginas.
 */
export function getToolExperiment(): ToolPartner {
  return TOOL_PARTNER;
}
