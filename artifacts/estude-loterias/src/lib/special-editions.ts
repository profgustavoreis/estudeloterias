import type {
  DuplasenaDuplaDePascoa,
  FaixaPremio,
  LotofacilDaIndependencia,
  MegaDaVirada,
  QuinaDeSaoJoao,
} from "@workspace/api-client-react";
import type { SpecialEditionFacts, SpecialEditionFase } from "@workspace/seo-special-editions";
import { formatLongDate, formatWeekday } from "./formatters";

/**
 * Adaptação do payload das edições especiais para a view do
 * `SpecialEditionHero` + fatos normalizados para o builder de SEO compartilhado.
 *
 * A **fase** (`"resultado" | "proxima" | "apuracao"`) é autoritativa: vem do
 * serviço server-side (`payload.fase`). Nada de heurística de janela/detecção
 * aqui — o cliente só apresenta. O mesmo vale para `ultimaEdicao`
 * (`anoEdicao`, `premioTotal`, `ganhadores` já resolvidos pelo serviço) e
 * `proximaEdicao`.
 *
 * As `dezenas` não fazem parte do contrato normalizado, então continuam sendo
 * lidas do `historico` casando pelo `concurso` (o serviço entrega o histórico
 * completo, mais recente primeiro).
 */

export type SpecialEditionId = "independencia" | "virada" | "sao-joao" | "pascoa";

/** Estados possíveis do slot dominante — espelha `SpecialEditionFase`. */
export type SpecialEditionEstado = SpecialEditionFase;

export type SpecialEditionInput =
  | { tipo: "independencia"; data: LotofacilDaIndependencia }
  | { tipo: "virada"; data: MegaDaVirada }
  | { tipo: "sao-joao"; data: QuinaDeSaoJoao }
  | { tipo: "pascoa"; data: DuplasenaDuplaDePascoa };

interface SorteioBase {
  concurso: number;
  data: string;
  dezenas: string[];
  /** Segundo sorteio (Dupla Sena). */
  dezenas2?: string[] | null;
  premios: FaixaPremio[];
}

export interface SpecialEditionFaixaResumo {
  faixa: number;
  rotulo: string;
  ganhadores: number;
  valorPremio: number;
  /** valorPremio × ganhadores — o total efetivamente pago na faixa. */
  total: number;
}

export interface SpecialEditionResultadoResumo {
  concurso: number;
  data: string;
  anoEdicao: number;
  dezenas: string[];
  /** Dezenas do 2º sorteio, quando a modalidade tem dois sorteios (Dupla Sena). */
  dezenas2?: string[];
  faixa: SpecialEditionFaixaResumo;
}

export interface SpecialEditionAccent {
  /** Texto de acento sobre o fundo claro/escuro do card. */
  text: string;
  /** Fundo sólido de CTA e destaques (com texto branco). */
  solid: string;
  /** Fundo tinte + texto para badges internos. */
  soft: string;
  /** Anel de foco acessível. */
  ring: string;
}

export interface SpecialEditionView {
  id: SpecialEditionId;
  estado: SpecialEditionEstado;

  nome: string;
  nomeCurto: string;
  rota: string;
  /** Cor de marca (bolas, borda, brilho de fundo). */
  cor: string;
  accent: SpecialEditionAccent;
  bolaTamanho: "md" | "lg";
  qtdDezenas: number;

  /** Ano da edição em destaque (resultado corrente ou próxima edição). */
  anoEdicao: number;

  /** Resultado em destaque (somente no estado "resultado"). */
  resultadoDestaque: SpecialEditionResultadoResumo | null;
  /** Resultado mais recente (para o rodapé secundário). */
  ultimoResultado: SpecialEditionResultadoResumo | null;

  proximaData: string | null;
  proximaDataLabel: string | null;
  /** Horário oficial (`HH:MM`) da próxima edição, para o alvo do countdown. */
  proximaHorario: string | null;
  proximaStatus: "confirmada" | "prevista" | null;
  valorEstimado: number | null;

  /** H1 da página, alinhado ao padrão "Todos os Resultados da {nome}". */
  h1: string;

  ctaPrincipal: { href: string; label: string };
  /** CTA promocional da próxima edição (rodapé secundário). */
  ctaProxima: { href: string; label: string };
  /** Link direto para o resultado mais recente (rodapé secundário). */
  ultimoResultadoLink: string | null;
}

export interface SpecialEditionMeta {
  id: SpecialEditionId;
  /** Modalidade no formato de hub/URL (`"mega-sena"`, `"lotofacil"`, `"quina"`). */
  modalidade: string;
  nome: string;
  nomeCurto: string;
  rota: string;
  canonical: string;
  cor: string;
  accent: SpecialEditionAccent;
  bolaTamanho: "md" | "lg";
  qtdDezenas: number;
  ctaProxima: { href: string; label: string };
  /** Rótulo estático da faixa principal (São João resolve dinamicamente). */
  rotuloPrincipal: string;
  /**
   * Horário oficial do sorteio no formato `HH:MM` (America/Sao_Paulo, UTC-3).
   * Usado como alvo do countdown. Default histórico: 20:00.
   */
  horarioSorteio: string;
  /** Sobrescreve o `horarioSorteio` em anos específicos (ex.: Independência 2026). */
  horariosPorEdicao?: Record<number, string>;
}

/**
 * Metadados estáticos por modalidade. Compartilhados entre o resolver, o
 * builder de SEO e as telas de loading/erro.
 */
export const SPECIAL_EDITIONS_META: Record<SpecialEditionId, SpecialEditionMeta> = {
  independencia: {
    id: "independencia",
    modalidade: "lotofacil",
    nome: "Lotofácil da Independência",
    nomeCurto: "Independência",
    rota: "/lotofacil/lotofacil-da-independencia",
    canonical: "/lotofacil/lotofacil-da-independencia",
    cor: "#930089",
    accent: {
      text: "text-[#930089] dark:text-purple-300",
      solid: "bg-[#930089] text-white dark:bg-purple-700",
      soft: "bg-[#930089]/10 text-[#930089] dark:bg-purple-400/15 dark:text-purple-200",
      ring: "focus-visible:ring-[#930089]",
    },
    bolaTamanho: "md",
    qtdDezenas: 15,
    ctaProxima: { href: "/lotofacil/como-jogar", label: "Como jogar na Lotofácil" },
    rotuloPrincipal: "15 acertos",
    // A edição de 2026 (concurso 3780, 15/09/2026) foi confirmada para 11:00.
    horarioSorteio: "20:00",
    horariosPorEdicao: { 2026: "11:00" },
  },
  virada: {
    id: "virada",
    modalidade: "mega-sena",
    nome: "Mega da Virada",
    nomeCurto: "Mega da Virada",
    rota: "/mega-sena/mega-da-virada",
    canonical: "/mega-sena/mega-da-virada",
    // Verde oficial #009640. Para TEXTO usamos #007A33 (5,5:1 sobre branco);
    // o verde de marca continua nas bolas/borda.
    cor: "#009640",
    accent: {
      text: "text-[#007A33] dark:text-emerald-300",
      solid: "bg-[#007A33] text-white dark:bg-emerald-700",
      soft: "bg-[#007A33]/10 text-[#007A33] dark:bg-emerald-400/15 dark:text-emerald-200",
      ring: "focus-visible:ring-[#007A33]",
    },
    bolaTamanho: "lg",
    qtdDezenas: 6,
    ctaProxima: { href: "/mega-sena/como-jogar", label: "Como jogar na Mega-Sena" },
    rotuloPrincipal: "6 acertos",
    horarioSorteio: "20:00",
  },
  "sao-joao": {
    id: "sao-joao",
    modalidade: "quina",
    nome: "Quina de São João",
    nomeCurto: "São João",
    rota: "/quina/quina-de-sao-joao",
    canonical: "/quina/quina-de-sao-joao",
    cor: "#260085",
    accent: {
      text: "text-[#260085] dark:text-indigo-300",
      solid: "bg-[#260085] text-white dark:bg-indigo-700",
      soft: "bg-[#260085]/10 text-[#260085] dark:bg-indigo-400/15 dark:text-indigo-200",
      ring: "focus-visible:ring-[#260085]",
    },
    bolaTamanho: "lg",
    qtdDezenas: 5,
    ctaProxima: { href: "/quina/como-jogar", label: "Como jogar na Quina" },
    // Resolvido dinamicamente (quina ou quadra) a partir dos dados da edição.
    rotuloPrincipal: "5 acertos",
    horarioSorteio: "20:00",
  },
  pascoa: {
    id: "pascoa",
    modalidade: "duplasena",
    nome: "Dupla de Páscoa",
    nomeCurto: "Dupla de Páscoa",
    rota: "/duplasena/dupla-de-pascoa",
    canonical: "/duplasena/dupla-de-pascoa",
    cor: "#a61324",
    accent: {
      text: "text-[#a61324] dark:text-rose-300",
      solid: "bg-[#a61324] text-white dark:bg-rose-700",
      soft: "bg-[#a61324]/10 text-[#a61324] dark:bg-rose-400/15 dark:text-rose-200",
      ring: "focus-visible:ring-[#a61324]",
    },
    bolaTamanho: "lg",
    qtdDezenas: 6,
    ctaProxima: { href: "/duplasena/como-jogar", label: "Como jogar na Dupla Sena" },
    rotuloPrincipal: "6 acertos",
    horarioSorteio: "20:00",
  },
};

function anoDoTexto(data: string | null | undefined): number {
  if (!data) return 0;
  return Number(data.split("/")[2]) || 0;
}

/**
 * Ano da edição a partir da data do sorteio.
 *
 * Espelha a regra do serviço (`anoEdicaoVirada` em
 * `api-server/src/services/special-editions.ts`): a Mega da Virada pode ser
 * sorteada em 1º de janeiro (ex.: edição 2025 em 01/01/2026), então o ano da
 * edição é `yyyy - 1`. Duplicação consciente e pequena — o payload normalizado
 * (`ultimaEdicao.anoEdicao`) cobre a edição corrente, mas linhas históricas da
 * tabela e fallbacks de exibição precisam da mesma regra no cliente.
 */
export function anoEdicaoDaData(
  id: SpecialEditionId,
  data: string | null | undefined,
): number {
  if (!data) return 0;
  const [dd, mm, yyyy] = data.split("/").map(Number);
  if (!yyyy) return 0;
  if (id === "virada" && dd === 1 && mm === 1) return yyyy - 1;
  return yyyy;
}

/**
 * Horário oficial do sorteio (`HH:MM`, America/Sao_Paulo) para uma edição.
 * Default 20:00, com override por ano em `horariosPorEdicao`.
 */
export function horarioDaEdicao(
  id: SpecialEditionId,
  ano: number | null | undefined,
): string {
  const meta = SPECIAL_EDITIONS_META[id];
  if (ano != null && meta.horariosPorEdicao?.[ano]) return meta.horariosPorEdicao[ano];
  return meta.horarioSorteio;
}

/**
 * Alvo do countdown em UTC. O horário é de Brasília (UTC-3, sem horário de verão
 * desde 2019), configurável por edição. Default 20:00 → 23:00 UTC.
 */
export function brDateToDrawTimeUTC(
  value: string | null | undefined,
  horario = "20:00",
): Date | null {
  if (!value) return null;
  const [dd, mm, yyyy] = value.split("/").map(Number);
  if (!dd || !mm || !yyyy) return null;
  const [hh = 20, min = 0] = horario.split(":").map(Number);
  return new Date(Date.UTC(yyyy, mm - 1, dd, hh + 3, Number.isFinite(min) ? min : 0, 0));
}

function faixaPrincipal(premios: FaixaPremio[], id: SpecialEditionId) {
  const faixa1 = premios.find((p) => p.faixa === 1);
  // São João não acumula: sem acertador da quina, o prêmio garantido desce para
  // a quadra. O serviço já entrega isso resolvido em `ultimaEdicao`; aqui é só
  // para o rótulo e para o fallback de exibição de edições antigas do histórico.
  if (id === "sao-joao") {
    if (faixa1 && (faixa1.ganhadores ?? 0) > 0) return faixa1;
    return premios.find((p) => p.faixa === 2) ?? faixa1 ?? null;
  }
  return faixa1 ?? null;
}

function rotuloPrincipal(id: SpecialEditionId, premios?: FaixaPremio[]): string {
  if (id === "sao-joao") {
    const faixa1 = premios?.find((p) => p.faixa === 1);
    return faixa1 && (faixa1.ganhadores ?? 0) > 0 ? "5 acertos" : "4 acertos";
  }
  return SPECIAL_EDITIONS_META[id].rotuloPrincipal;
}

/** Monta o resumo exibido a partir dos campos normalizados de `ultimaEdicao`. */
function resumoNormalizado(
  ultima:
    | {
        concurso?: number;
        data?: string;
        premioTotal?: number | null;
        ganhadores?: number | null;
        anoEdicao?: number;
      }
    | null
    | undefined,
  historico: SorteioBase[],
  id: SpecialEditionId,
): SpecialEditionResultadoResumo | null {
  if (!ultima || ultima.concurso == null) return null;
  const sorteio = historico.find((s) => s.concurso === ultima.concurso) ?? null;
  const ganhadores = ultima.ganhadores ?? 0;
  const total = ultima.premioTotal ?? 0;
  const valorPremio = ganhadores > 0 ? total / ganhadores : 0;

  return {
    concurso: ultima.concurso,
    data: ultima.data ?? sorteio?.data ?? "",
    anoEdicao: ultima.anoEdicao ?? anoEdicaoDaData(id, sorteio?.data),
    dezenas: sorteio?.dezenas ?? [],
    dezenas2: sorteio?.dezenas2?.length ? sorteio.dezenas2 : undefined,
    faixa: {
      faixa: 1,
      rotulo: rotuloPrincipal(id, sorteio?.premios),
      ganhadores,
      valorPremio,
      total,
    },
  };
}

/**
 * Fallback de exibição para o rodapé quando `ultimaEdicao` é nulo (ex.: em
 * apuração) — usa a edição mais recente do histórico apenas para texto.
 */
function resumoDoHistorico(sorteio: SorteioBase, id: SpecialEditionId): SpecialEditionResultadoResumo {
  const faixa = faixaPrincipal(sorteio.premios, id);
  const ganhadores = faixa?.ganhadores ?? 0;
  const valorPremio = faixa?.valorPremio ?? 0;
  return {
    concurso: sorteio.concurso,
    data: sorteio.data,
    anoEdicao: anoEdicaoDaData(id, sorteio.data),
    dezenas: sorteio.dezenas,
    dezenas2: sorteio.dezenas2?.length ? sorteio.dezenas2 : undefined,
    faixa: {
      faixa: faixa?.faixa ?? 1,
      rotulo: rotuloPrincipal(id, sorteio.premios),
      ganhadores,
      valorPremio,
      total: valorPremio * ganhadores,
    },
  };
}

function normalizarProximaData(
  input: SpecialEditionInput,
  proximaEdicao: { data?: string | null } | null | undefined,
): string | null {
  if (proximaEdicao?.data) return proximaEdicao.data;
  switch (input.tipo) {
    case "independencia":
      return input.data.dataProximaEdicao ?? null;
    case "virada":
      return input.data.dataProximaVirada ?? null;
    case "sao-joao":
      return input.data.dataProximaEdicao ?? null;
    case "pascoa":
      return input.data.dataProximaEdicao ?? null;
  }
}

export function resolveSpecialEditionView(
  input: SpecialEditionInput,
  agora: Date = new Date(),
): SpecialEditionView {
  const meta = SPECIAL_EDITIONS_META[input.tipo];
  const historico = (input.data.historico ?? []) as unknown as SorteioBase[];

  const anoProxima = input.data.anoProximaEdicao ?? input.data.anoAtual;
  const ultimaEdicao = input.data.ultimaEdicao ?? null;
  const proximaEdicao = input.data.proximaEdicao ?? null;

  const proximaData = normalizarProximaData(input, proximaEdicao);
  const proximaAno = anoDoTexto(proximaData) || anoProxima;
  const proximaHorario = proximaData ? horarioDaEdicao(input.tipo, proximaAno) : null;
  const alvoProxima = brDateToDrawTimeUTC(proximaData, proximaHorario ?? undefined);

  // Fase autoritativa do servidor…
  let estado: SpecialEditionEstado = input.data.fase ?? "proxima";
  // …com um guard de consistência: se ainda estamos em "proxima" mas a hora
  // oficial do sorteio já passou (e o resultado ainda não chegou), o correto é
  // "apuracao" — nunca exibir um countdown zerado/negativo.
  if (estado === "proxima" && alvoProxima && alvoProxima.getTime() <= agora.getTime()) {
    estado = "apuracao";
  }

  const proximaStatus: "confirmada" | "prevista" =
    (proximaEdicao?.confirmado ?? input.data.confirmado ?? false) ? "confirmada" : "prevista";
  const valorEstimado = proximaEdicao?.valorEstimado ?? input.data.valorEstimado ?? null;

  // Resultado normalizado (autoritativo) com fallback de exibição do histórico.
  const ultimoResultado =
    resumoNormalizado(ultimaEdicao, historico, input.tipo) ??
    (historico[0] ? resumoDoHistorico(historico[0], input.tipo) : null);

  const resultadoDestaque = estado === "resultado" ? ultimoResultado : null;
  const anoEdicao =
    estado === "resultado" && resultadoDestaque ? resultadoDestaque.anoEdicao : anoProxima;

  const h1 = `Todos os Resultados da ${meta.nome}`;

  const baseResultado = meta.rota.replace(/\/[^/]+$/, "");
  const hrefResultado = (concurso: number) => `${baseResultado}/resultado/${concurso}`;

  let ctaPrincipal: { href: string; label: string };
  if (estado === "resultado" && resultadoDestaque) {
    ctaPrincipal = {
      href: hrefResultado(resultadoDestaque.concurso),
      label: "Ver resultado completo",
    };
  } else if (estado === "apuracao" && ultimoResultado) {
    ctaPrincipal = {
      href: hrefResultado(ultimoResultado.concurso),
      label: `Ver resultado de ${ultimoResultado.anoEdicao}`,
    };
  } else if (estado === "apuracao") {
    ctaPrincipal = { href: "#historico", label: "Ver edições anteriores" };
  } else {
    ctaPrincipal = meta.ctaProxima;
  }

  return {
    id: input.tipo,
    estado,
    nome: meta.nome,
    nomeCurto: meta.nomeCurto,
    rota: meta.rota,
    cor: meta.cor,
    accent: meta.accent,
    bolaTamanho: meta.bolaTamanho,
    qtdDezenas: meta.qtdDezenas,
    anoEdicao,
    resultadoDestaque,
    ultimoResultado,
    proximaData,
    proximaDataLabel: proximaData
      ? `${formatLongDate(proximaData)} (${formatWeekday(proximaData)})`
      : null,
    proximaHorario,
    proximaStatus,
    valorEstimado,
    h1,
    ctaPrincipal,
    ctaProxima: meta.ctaProxima,
    ultimoResultadoLink: ultimoResultado ? hrefResultado(ultimoResultado.concurso) : null,
  };
}

/** Fatos base (sem payload) para o fallback atemporal de SEO. */
export function specialEditionBaseFacts(tipo: SpecialEditionId): SpecialEditionFacts {
  const meta = SPECIAL_EDITIONS_META[tipo];
  return {
    modalidade: meta.modalidade,
    slug: meta.canonical,
    nome: meta.nome,
    anoProximaEdicao: new Date().getFullYear(),
    ultimaEdicao: null,
    proximaEdicao: null,
    fase: "proxima",
  };
}

/**
 * Converte o payload do endpoint em `SpecialEditionFacts` (contrato compartilhado
 * com `@workspace/seo-special-editions`). A `fase` e `ultimaEdicao` vêm prontos
 * do serviço; só preenchemos `modalidade`/`slug`/`nome` das constantes locais.
 */
export function specialEditionFacts(input: SpecialEditionInput): SpecialEditionFacts {
  const meta = SPECIAL_EDITIONS_META[input.tipo];
  const ultima = input.data.ultimaEdicao ?? null;
  const proxima = input.data.proximaEdicao ?? null;

  return {
    modalidade: meta.modalidade,
    slug: meta.canonical,
    nome: meta.nome,
    anoProximaEdicao: input.data.anoProximaEdicao ?? input.data.anoAtual,
    ultimaEdicao:
      ultima && ultima.concurso != null
        ? {
            concurso: ultima.concurso,
            data: ultima.data ?? "",
            premioTotal: ultima.premioTotal ?? null,
            ganhadores: ultima.ganhadores ?? null,
            anoEdicao: ultima.anoEdicao ?? anoEdicaoDaData(meta.id, ultima.data),
          }
        : null,
    proximaEdicao: proxima
      ? {
          data: proxima.data ?? null,
          valorEstimado: proxima.valorEstimado ?? null,
          confirmado: proxima.confirmado ?? false,
        }
      : null,
    fase: input.data.fase ?? "proxima",
  };
}
