import type { SpecialEditionFacts, SpecialEditionResult } from "./types";

export interface SpecialEditionSeo {
  title: string;
  description: string;
}

/**
 * Textos atemporais de fallback, replicando o padrão atual de
 * `artifacts/api-server/src/middlewares/seo-head-injection.ts` (linhas ~457-491).
 * Usados quando `facts` é nulo/incompleto.
 */
const FALLBACK_BY_MODALIDADE: Record<string, SpecialEditionSeo> = {
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

const TITLE_MAX = 60;
const DESCRIPTION_MAX = 160;

/** Formata um valor em reais sem depender de ICU/Intl (determinístico). */
export function formatBRL(value: number): string {
  const negativo = value < 0;
  const centavosTotais = Math.round(Math.abs(value) * 100);
  const reais = Math.floor(centavosTotais / 100);
  const centavos = String(centavosTotais % 100).padStart(2, "0");
  const comPontos = String(reais).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${negativo ? "-" : ""}R$ ${comPontos},${centavos}`;
}

/** Trunca em fronteira de palavra, preservando a legibilidade. */
function clip(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const idx = cut.lastIndexOf(" ");
  return `${(idx > 0 ? cut.slice(0, idx) : cut).trimEnd()}…`;
}

function descricaoResultado(
  facts: SpecialEditionFacts,
  ano: number,
  resultado: SpecialEditionResult,
): string {
  let texto = `Resultado da ${facts.nome} ${ano}`;

  const temPremio = resultado.premioTotal != null;
  const temGanhadores = resultado.ganhadores != null;

  if (temPremio) {
    texto += ` com prêmio total de ${formatBRL(resultado.premioTotal as number)}`;
  }
  if (temGanhadores) {
    const g = resultado.ganhadores as number;
    const ganhadoresTxt =
      g === 0 ? "sem ganhadores" : `${g} ${g === 1 ? "ganhador" : "ganhadores"}`;
    texto += temPremio ? ` e ${ganhadoresTxt}` : ` com ${ganhadoresTxt}`;
  }
  texto += ".";

  return clip(
    `${texto} Veja as dezenas sorteadas e o histórico completo de todas as edições.`,
    DESCRIPTION_MAX,
  );
}

function descricaoProxima(facts: SpecialEditionFacts): string {
  const data = facts.proximaEdicao?.data ?? null;
  const valor = facts.proximaEdicao?.valorEstimado ?? null;
  const dataTxt = data ? ` em ${data}` : "";
  const valorTxt = valor != null ? ` Prêmio estimado de ${formatBRL(valor)}.` : "";
  return clip(
    `Próxima edição da ${facts.nome}${dataTxt}.${valorTxt} Histórico completo de resultados, dezenas e estatísticas.`,
    DESCRIPTION_MAX,
  );
}

/**
 * Constrói título e descrição SEO a partir dos fatos normalizados.
 *
 * A fase é **autoritativa**: vem de `facts.fase`, calculada pelo serviço. Não
 * inferimos a fase por `ultimaEdicao != null` — o serviço sempre popula
 * `ultimaEdicao` quando existe edição passada, inclusive pré-sorteio.
 *
 * Regra de ano por fase (nunca ano-calendário):
 *   - `"resultado"` → `ultimaEdicao.anoEdicao`
 *   - `"proxima"` / `"apuracao"` → `anoProximaEdicao`
 *
 * Função pura (sem `Date.now()`): quando `facts` é nulo/incompleto, delega ao
 * fallback atemporal de `buildSpecialEditionFallback`.
 */
export function buildSpecialEditionSeo(
  facts: SpecialEditionFacts | null | undefined,
): SpecialEditionSeo {
  if (!facts || !facts.nome || !Number.isFinite(facts.anoProximaEdicao)) {
    return buildSpecialEditionFallback(facts);
  }

  const fase = facts.fase;
  const ano =
    fase === "resultado"
      ? facts.ultimaEdicao?.anoEdicao ?? facts.anoProximaEdicao
      : facts.anoProximaEdicao;

  const title = `Todos os Resultados da ${facts.nome} ${ano}`;

  let description: string;
  if (fase === "resultado" && facts.ultimaEdicao) {
    description = descricaoResultado(facts, ano, facts.ultimaEdicao);
  } else if (fase === "apuracao") {
    description = clip(
      `A edição ${ano} da ${facts.nome} está em apuração. Confira o resultado assim que for divulgado e o histórico completo de todas as edições.`,
      DESCRIPTION_MAX,
    );
  } else {
    description = descricaoProxima(facts);
  }

  return { title: clip(title, TITLE_MAX), description };
}

/** Fallback atemporal para quando não há fatos suficientes. */
export function buildSpecialEditionFallback(
  facts?: SpecialEditionFacts | null,
): SpecialEditionSeo {
  const porModalidade = facts?.modalidade
    ? FALLBACK_BY_MODALIDADE[facts.modalidade]
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
