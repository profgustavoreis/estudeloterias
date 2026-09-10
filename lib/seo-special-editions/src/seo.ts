import type { SpecialEditionFacts } from "./types";

export interface SpecialEditionSeo {
  title: string;
  description: string;
}

/**
 * Título e descrição **atemporais** (sem ano e sem fase) para as páginas de
 * concursos especiais (Mega da Virada, Lotofácil da Independência, Quina de São
 * João e Dupla de Páscoa).
 *
 * Decisão editorial: estas páginas são arquivos permanentes ("todos os
 * resultados"), então o head não carrega o ano nem a fase. Isso evita títulos que
 * envelhecem e elimina a manutenção/erros ligados ao ano (p.ex. a virada de ano
 * da Mega da Virada). O destaque de "última/próxima edição" continua sendo feito
 * no **corpo** da página (componente `SpecialEditionHero` + `facts`), não no head.
 *
 * `buildSpecialEditionSeo` e `buildSpecialEditionFallback` devolvem o mesmo texto
 * atemporal; a primeira existe como ponto de entrada dos chamadores (servidor e
 * cliente) e a segunda é mantida por compatibilidade.
 */
const TEXTOS_ATEMPORAIS: Record<string, SpecialEditionSeo> = {
  "mega-sena": {
    title: "Mega da Virada — Histórico, Resultados e Estatísticas",
    description:
      "Todos os resultados da Mega da Virada desde sua primeira edição: histórico completo de dezenas sorteadas, prêmios, ganhadores e estatísticas do concurso especial.",
  },
  lotofacil: {
    title: "Lotofácil da Independência — Histórico, Resultados e Estatísticas",
    description:
      "Todos os resultados da Lotofácil da Independência desde sua primeira edição: histórico completo de dezenas sorteadas, prêmios, ganhadores e estatísticas do concurso especial.",
  },
  quina: {
    title: "Quina de São João — Histórico, Resultados e Estatísticas",
    description:
      "Todos os resultados da Quina de São João desde sua primeira edição: histórico completo de dezenas sorteadas, prêmios, ganhadores e estatísticas do concurso especial.",
  },
  duplasena: {
    title: "Dupla de Páscoa — Histórico, Resultados e Estatísticas",
    description:
      "Todos os resultados da Dupla de Páscoa desde sua primeira edição: histórico completo de dezenas sorteadas, prêmios, ganhadores e estatísticas do concurso especial.",
  },
};

/**
 * Título/descrição atemporais da página. `facts` é usado apenas para resolver a
 * modalidade (o serviço/`facts` continuam alimentando o widget e o JSON-LD).
 */
export function buildSpecialEditionSeo(
  facts: SpecialEditionFacts | null | undefined,
): SpecialEditionSeo {
  return buildSpecialEditionFallback(facts);
}

/** Texto atemporal por modalidade (genérico quando a modalidade é desconhecida). */
export function buildSpecialEditionFallback(
  facts?: SpecialEditionFacts | null,
): SpecialEditionSeo {
  const porModalidade = facts?.modalidade
    ? TEXTOS_ATEMPORAIS[facts.modalidade]
    : undefined;
  if (porModalidade) return { ...porModalidade };

  if (facts?.nome) {
    return {
      title: `${facts.nome} — Histórico, Resultados e Estatísticas`,
      description: `Todos os resultados da ${facts.nome}: histórico completo de dezenas sorteadas, prêmios, ganhadores e estatísticas do concurso especial.`,
    };
  }

  return {
    title: "Concursos Especiais — Histórico, Resultados e Estatísticas",
    description:
      "Todos os resultados dos concursos especiais das loterias da Caixa: histórico completo de dezenas sorteadas, prêmios, ganhadores e estatísticas.",
  };
}
