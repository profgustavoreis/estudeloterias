/**
 * A/B de módulos de ferramenta (parceiros) — Net Sorte × Lotosport.
 *
 * Escopo: os cards nativos de ferramenta (`placement: "ferramenta_inline"`) das
 * páginas de estatísticas e simulador de todas as modalidades.
 *
 * Desenho:
 * - Split 50/50 **persistido** em `localStorage` com chave versionada. A
 *   atribuição é resolvida uma única vez por usuário/navegador e fica em cache
 *   de módulo, portanto é estável entre renders e navegações.
 * - `getToolExperiment()` é idempotente e seguro de chamar no corpo do
 *   componente (React): na primeira chamada sorteia e persiste; nas seguintes
 *   devolve o mesmo objeto.
 * - O braço escolhido define parceiro + variante de link e a copy do card.
 * - O `experiment_id`/`variation` são expostos para o tracking via
 *   `getExperimentTrackFields()` (consumido por `src/lib/affiliate.ts`).
 *
 * Como ENCERRAR o A/B (fixar o braço vencedor):
 * 1. Defina `FORCED_TOOL_VARIATION` abaixo para `"A"` (Net Sorte) ou `"B"`
 *    (Lotosport). Com isso nenhum usuário é sorteado e todos passam a ver o
 *    braço fixado — é o jeito recomendado de encerrar o experimento.
 * 2. Alternativa operacional (QA/suporte, sem deploy): gravar `"A"` ou `"B"`
 *    na chave abaixo no `localStorage`. Use `setToolExperimentVariation()`
 *    para isso.
 *
 * Ressalva: com tráfego baixo o A/B é **indicativo**, não estatisticamente
 * significativo. O split fica sempre ligado até que um braço seja fixado.
 */

import type { Afiliado, AffiliateVariant } from "./affiliate";

/** Identificador fixo do experimento (vai no evento como `experiment_id`). */
export const TOOL_EXPERIMENT_ID = "ab_ferramentas_net_vs_loto";

/**
 * Placement dos cards de ferramenta. O tracking só anexa os campos do
 * experimento para este placement, evitando contaminar os demais cards.
 */
export const FERRAMENTA_PLACEMENT = "ferramenta_inline";

/** Chave versionada de persistência da atribuição. */
const STORAGE_KEY = "el_exp_ab_ferramentas_net_vs_loto_v1";

export type ToolVariation = "A" | "B";

export interface ToolExperimentAssignment {
  experimentId: string;
  variation: ToolVariation;
  afiliado: Afiliado;
  variant: AffiliateVariant;
  /** Copy do card, coerente com o parceiro do braço. */
  title: string;
  body: string;
  ctaLabel: string;
}

/**
 * Ao encerrar o A/B, troque `null` por `"A"` ou `"B"` para fixar o braço
 * vencedor. Enquanto for `null`, o split 50/50 persistido continua ativo.
 */
const FORCED_TOOL_VARIATION: ToolVariation | null = null;

/** Braços do experimento: A = Net Sorte (landing), B = Lotosport (anual). */
const ARMS: Record<ToolVariation, Omit<ToolExperimentAssignment, "experimentId" | "variation">> = {
  A: {
    afiliado: "net_sorte",
    variant: "landing",
    title: "Monte jogos com mais dezenas",
    body: "No Portal Net Sorte você usa fechamentos e análises para montar jogos com mais dezenas gastando menos. Garantia de 7 dias.",
    ctaLabel: "Ver ferramentas",
  },
  B: {
    afiliado: "lotosport",
    variant: "anual",
    title: "Entre em bolões prontos",
    body: "No Lotosport você participa de bolões organizados, sem precisar montar o jogo sozinho. Conheça os planos disponíveis.",
    ctaLabel: "Ver bolões",
  },
};

function isVariation(value: string | null): value is ToolVariation {
  return value === "A" || value === "B";
}

function readStoredVariation(): ToolVariation | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return isVariation(value) ? value : null;
  } catch {
    // localStorage indisponível (modo privado/SSR): segue sem persistir.
    return null;
  }
}

function persistVariation(variation: ToolVariation): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, variation);
  } catch {
    // ignora
  }
}

/** Sorteia 50/50 entre os braços. */
function drawVariation(): ToolVariation {
  return Math.random() < 0.5 ? "A" : "B";
}

let cachedAssignment: ToolExperimentAssignment | null = null;

function buildAssignment(variation: ToolVariation): ToolExperimentAssignment {
  return {
    experimentId: TOOL_EXPERIMENT_ID,
    variation,
    ...ARMS[variation],
  };
}

/**
 * Atribuição estável do usuário para o A/B de ferramentas.
 *
 * Idempotente: a primeira chamada resolve (forçado → persistido → sorteio),
 * persiste e guarda em cache; chamadas seguintes devolvem o mesmo objeto.
 */
export function getToolExperiment(): ToolExperimentAssignment {
  if (cachedAssignment) return cachedAssignment;

  const variation =
    FORCED_TOOL_VARIATION ?? readStoredVariation() ?? drawVariation();

  persistVariation(variation);
  cachedAssignment = buildAssignment(variation);
  return cachedAssignment;
}

/**
 * Campos de tracking a anexar ao evento, quando houver atribuição de
 * experimento ativa e o placement for de ferramenta. Fora disso, retorna `{}`.
 */
export function getExperimentTrackFields(
  placement: string,
): { experiment_id?: string; variation?: ToolVariation } {
  if (placement !== FERRAMENTA_PLACEMENT) return {};
  const assignment = cachedAssignment ?? getToolExperiment();
  return {
    experiment_id: assignment.experimentId,
    variation: assignment.variation,
  };
}

/** Persiste e aplica uma variação específica (QA/suporte). */
export function setToolExperimentVariation(variation: ToolVariation): void {
  persistVariation(variation);
  cachedAssignment = buildAssignment(variation);
}

/** Limpa a atribuição persistida (útil em testes). */
export function clearToolExperiment(): void {
  cachedAssignment = null;
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignora
  }
}
