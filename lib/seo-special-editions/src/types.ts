/**
 * Contrato normalizado compartilhado entre server e frontend para as páginas de
 * sorteios especiais (Mega da Virada, Lotofácil da Independência, Quina de São
 * João).
 *
 * Este pacote é intencionalmente puro: sem I/O, sem dependências e sem uso
 * implícito de `Date.now()`. Datas trafegam como texto no formato `dd/mm/yyyy`,
 * que é o formato usado em todo o espelho de dados da Caixa.
 */

/** Resultado de uma edição já sorteada. */
export interface SpecialEditionResult {
  concurso: number;
  /** Data da edição no formato `dd/mm/yyyy`. */
  data: string;
  premioTotal: number | null;
  ganhadores: number | null;
  anoEdicao: number;
}

/** Informações sobre a próxima edição (ou a edição corrente). */
export interface SpecialEditionNext {
  /** Data no formato `dd/mm/yyyy`. `null` quando ainda não divulgada. */
  data: string | null;
  valorEstimado: number | null;
  confirmado: boolean;
}

/** Fases autoritativas de uma edição especial, calculadas pelo serviço. */
export type SpecialEditionFase = "proxima" | "resultado" | "apuracao";

/** Fatos normalizados que alimentam a geração de SEO de uma edição especial. */
export interface SpecialEditionFacts {
  /** Ex.: `"lotofacil"`. */
  modalidade: string;
  /** Ex.: `"/lotofacil/lotofacil-da-independencia"`. */
  slug: string;
  /** Ex.: `"Lotofácil da Independência"`. */
  nome: string;
  anoProximaEdicao: number;
  ultimaEdicao: SpecialEditionResult | null;
  proximaEdicao: SpecialEditionNext | null;
  /**
   * Fase explícita da edição, calculada pelo serviço (não inferir por
   * `ultimaEdicao != null`, pois o serviço sempre a popula quando há edição
   * passada — inclusive pré-sorteio).
   */
  fase: SpecialEditionFase;
}
