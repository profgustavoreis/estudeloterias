import { db } from "@workspace/db";
import { lotteryResultsTable, type LotteryResult } from "@workspace/db/schema";
import { and, asc, desc, eq, inArray, or, sql } from "drizzle-orm";
import type {
  SpecialEditionFacts,
  SpecialEditionFase,
  SpecialEditionNext,
  SpecialEditionResult,
} from "@workspace/seo-special-editions";

export type {
  SpecialEditionFacts,
  SpecialEditionFase,
  SpecialEditionNext,
  SpecialEditionResult,
};

/**
 * Detecção centralizada das edições especiais de loteria.
 *
 * Antes dessa camada a heurística estava espalhada (e com bugs) em
 * `routes/{lotofacil,mega-sena,quina}.ts`:
 *   - `getFullYear()` em UTC (o "ano" virava antes da virada de ano de Brasília);
 *   - hardcode do ano 2026 na Lotofácil da Independência;
 *   - ano da edição da Mega da Virada confundido com o ano do sorteio;
 *   - `select *` da tabela inteira para achar poucos concursos especiais.
 *
 * Aqui:
 *   - "hoje" é sempre resolvido em America/Sao_Paulo;
 *   - datas oficiais conhecidas ficam num mapa (`confirmadas`), sem hardcode disperso;
 *   - quando a origem (Caixa) traz `dataProximoConcurso`/`valorEstimadoProximo` para a
 *     janela do concurso especial, esses valores são preferidos;
 *   - as consultas são direcionadas (filtro por mês/data ou `ORDER BY ... LIMIT 1`),
 *     nunca um full-table scan;
 *   - há cache curto (5 min) por modalidade, compartilhando a promise em voo para
 *     evitar tempestade de consultas no caminho do middleware.
 *
 * Contrato compartilhado com a lane de SEO/HTML — NÃO renomeie os campos.
 *
 * Os tipos `SpecialEditionResult`, `SpecialEditionNext` e `SpecialEditionFacts`
 * são a fonte de verdade em `@workspace/seo-special-editions` e re-exportados
 * aqui para manter os consumidores existentes sem duplicação de contrato.
 */

export type SpecialEditionKey = "independencia" | "virada" | "sao-joao" | "pascoa";

interface ConfirmedEdition {
  data: string;
  valorEstimado?: number | null;
}

interface EditionDefinition {
  /** Nome da modalidade no espelho/DB (usado nas queries). */
  dbModalidade: string;
  /** Segmento de hub/URL usado pelo SEO (`mega-sena`, `lotofacil`, `quina`). */
  modalidade: string;
  /** Rota completa da página especial. */
  slug: string;
  nome: string;
  /**
   * Limiar mínimo (R$) do prêmio total da faixa principal para reconhecer a edição.
   * `null` quando todas as linhas do recorte já são edições (Mega da Virada).
   */
  limiarPremio: number | null;
  /** Meses (1-12) em que a edição pode cair — usado para validar `dataProximoConcurso`. */
  janelaMeses: number[];
  /** Datas oficiais já confirmadas, por ano da edição. */
  confirmadas: Record<number, ConfirmedEdition>;
}

const EDITIONS: Record<SpecialEditionKey, EditionDefinition> = {
  independencia: {
    dbModalidade: "lotofacil",
    modalidade: "lotofacil",
    slug: "/lotofacil/lotofacil-da-independencia",
    nome: "Lotofácil da Independência",
    limiarPremio: 15_000_000,
    janelaMeses: [9],
    confirmadas: {
      // A Caixa confirmou oficialmente o sorteio de 2026 para 15/09/2026.
      2026: { data: "15/09/2026", valorEstimado: 300_000_000 },
    },
  },
  virada: {
    dbModalidade: "megasena",
    modalidade: "mega-sena",
    slug: "/mega-sena/mega-da-virada",
    nome: "Mega da Virada",
    limiarPremio: null,
    janelaMeses: [12],
    // Regra fixa (31/12) + exceções pontuais (ver VIRADA_* abaixo).
    confirmadas: {},
  },
  "sao-joao": {
    dbModalidade: "quina",
    modalidade: "quina",
    slug: "/quina/quina-de-sao-joao",
    nome: "Quina de São João",
    limiarPremio: 50_000_000,
    janelaMeses: [6],
    confirmadas: {
      // Edição de 2026 confirmada pela Caixa em 28/06/2026 (domingo).
      2026: { data: "28/06/2026", valorEstimado: 239_400_000 },
    },
  },
  pascoa: {
    dbModalidade: "duplasena",
    modalidade: "duplasena",
    slug: "/duplasena/dupla-de-pascoa",
    nome: "Dupla de Páscoa",
    // Todas as linhas do recorte são identificadas por data: sem limiar.
    limiarPremio: null,
    janelaMeses: [3, 4],
    // Edição criada em 2017. Datas oficiais (sábado que antecede a Páscoa), com
    // as exceções COVID de 2020 (25/04) e 2021 (17/04).
    confirmadas: {
      2017: { data: "15/04/2017" },
      2018: { data: "31/03/2018" },
      2019: { data: "20/04/2019" },
      2020: { data: "25/04/2020" },
      2021: { data: "17/04/2021" },
      2022: { data: "16/04/2022" },
      2023: { data: "08/04/2023" },
      2024: { data: "30/03/2024" },
      2025: { data: "19/04/2025" },
      2026: { data: "04/04/2026" },
    },
  },
};

/** Aceita tanto o nome do DB (`megasena`) quanto o hub/URL (`mega-sena`). */
const MODALIDADE_TO_KEY: Record<string, SpecialEditionKey> = {
  lotofacil: "independencia",
  megasena: "virada",
  "mega-sena": "virada",
  quina: "sao-joao",
  duplasena: "pascoa",
};

/** Concursos cujo sorteio não caiu em 31/12: Mega da Virada 2025 sorteada em 01/01/2026. */
const VIRADA_CONCURSO_EXCECOES = [2955];
const VIRADA_ANO_EDICAO_EXCECOES: Record<number, number> = { 2955: 2025 };

// ---------------------------------------------------------------------------
// Datas (sempre sem depender do fuso do processo)
// ---------------------------------------------------------------------------

export interface SaoPauloToday {
  year: number;
  month: number;
  day: number;
}

interface BRDate {
  dd: number;
  mm: number;
  yyyy: number;
}

/**
 * "Hoje" em America/Sao_Paulo. É a fonte única de verdade temporal do serviço:
 * os dias de pico (virada de ano, noite do sorteio) acontecem antes/depois da
 * meia-noite UTC, então `new Date().getFullYear()` errava o ano da edição.
 */
export function getTodaySaoPaulo(): SaoPauloToday {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const pick = (type: Intl.DateTimeFormatPartTypes): number => {
    const found = parts.find((p) => p.type === type);
    return found ? Number(found.value) : 0;
  };
  return { year: pick("year"), month: pick("month"), day: pick("day") };
}

function parseBR(value: string | null | undefined): BRDate | null {
  if (!value) return null;
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return null;
  return { dd: Number(match[1]), mm: Number(match[2]), yyyy: Number(match[3]) };
}

function serial(date: BRDate | SaoPauloToday): number {
  if ("yyyy" in date) return date.yyyy * 10000 + date.mm * 100 + date.dd;
  return date.year * 10000 + date.month * 100 + date.day;
}

/** Dia absoluto (epoch day) para diferenças em dias sem depender de fuso. */
function toEpochDay(date: BRDate | SaoPauloToday): number {
  const y = "yyyy" in date ? date.yyyy : date.year;
  const m = "yyyy" in date ? date.mm : date.month;
  const d = "yyyy" in date ? date.dd : date.day;
  return Math.round(Date.UTC(y, m - 1, d) / 86_400_000);
}

function formatBR(dd: number, mm: number, yyyy: number): string {
  return `${String(dd).padStart(2, "0")}/${String(mm).padStart(2, "0")}/${yyyy}`;
}

function weekdayUTC(yyyy: number, mm: number, dd: number): number {
  return new Date(Date.UTC(yyyy, mm - 1, dd)).getUTCDay();
}

/**
 * Lotofácil da Independência: sábado da semana (segunda a domingo) que contém
 * 7 de setembro — exceto quando o próprio dia 7 é sábado, caso em que vai para
 * a segunda seguinte (ex.: 07/09/2024 → 09/09/2024).
 */
function calcularDataIndependencia(ano: number): string {
  const dow = weekdayUTC(ano, 9, 7);
  if (dow === 6) return formatBR(9, 9, ano);
  const indiceSegunda = (dow + 6) % 7;
  const offset = 5 - indiceSegunda;
  return formatBR(7 + offset, 9, ano);
}

/**
 * Quina de São João: sábado da semana (domingo a sábado) que contém 24 de junho.
 * A regra é só uma estimativa; exceções confirmadas ficam no mapa `confirmadas`.
 */
function calcularDataSaoJoao(ano: number): string {
  const dow = weekdayUTC(ano, 6, 24);
  const offset = 6 - dow;
  return formatBR(24 + offset, 6, ano);
}

function calcularDataVirada(ano: number): string {
  return formatBR(31, 12, ano);
}

/**
 * Dupla de Páscoa: sábado que antecede a Páscoa (Páscoa − 1 dia). A Páscoa é
 * calculada pelo computus gregoriano (algoritmo de Meeus/Jones/Butcher). As
 * exceções COVID (2020/2021) e demais datas oficiais estão em `confirmadas`.
 */
function calcularDataPascoa(ano: number): string {
  const a = ano % 19;
  const b = Math.floor(ano / 100);
  const c = ano % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;

  const pascoaEpoch = Math.round(Date.UTC(ano, mes - 1, dia) / 86_400_000);
  const sabado = new Date((pascoaEpoch - 1) * 86_400_000);
  return formatBR(sabado.getUTCDate(), sabado.getUTCMonth() + 1, sabado.getUTCFullYear());
}

function dataPrevista(key: SpecialEditionKey, ano: number): string {
  const confirmada = EDITIONS[key].confirmadas[ano];
  if (confirmada) return confirmada.data;
  switch (key) {
    case "independencia":
      return calcularDataIndependencia(ano);
    case "sao-joao":
      return calcularDataSaoJoao(ano);
    case "virada":
      return calcularDataVirada(ano);
    case "pascoa":
      return calcularDataPascoa(ano);
  }
}

/**
 * Janela (em dias) que define a face dominante da página: edição recém-sorteada
 * (pós) ou iminente (pré). É a mesma janela usada pela UI.
 */
export const JANELA_DIAS = 60;

/**
 * Seleção do ciclo **puramente por recência de data**, nunca por ano-calendário
 * (que quebrava o dia do sorteio: em 15/09/2026 com o resultado já no banco, o
 * heurístico `anoEdicaoEsperado` ainda apontava para 2025 e a fase ficava
 * `"proxima"`).
 *
 *   - `ultimaEdicao`: edição detectada mais recente cuja `data` seja `<= hoje`
 *     (comparação por dia absoluto);
 *   - `anoProximaEdicao`: `ultimaEdicao.anoEdicao + 1`; sem nenhuma edição
 *     passada, o ano corrente — ou o seguinte quando a data prevista do ano
 *     corrente já passou.
 *
 * Pura e com `hoje` injetado para permitir teste determinístico.
 */
export function selectCycle(
  resultados: SpecialEditionResult[],
  hoje: SaoPauloToday,
  key: SpecialEditionKey,
): { ultimaEdicao: SpecialEditionResult | null; anoProximaEdicao: number } {
  const hojeDia = toEpochDay(hoje);
  let ultimaEdicao: SpecialEditionResult | null = null;
  let ultimaDia = -Infinity;

  for (const r of resultados) {
    const parsed = parseBR(r.data);
    if (!parsed) continue;
    const dia = toEpochDay(parsed);
    if (dia > hojeDia) continue; // edição futura não conta como passada
    const maisRecente =
      dia > ultimaDia ||
      (dia === ultimaDia && ultimaEdicao !== null && r.concurso > ultimaEdicao.concurso);
    if (maisRecente) {
      ultimaEdicao = r;
      ultimaDia = dia;
    }
  }

  if (ultimaEdicao) {
    return { ultimaEdicao, anoProximaEdicao: ultimaEdicao.anoEdicao + 1 };
  }

  // Sem nenhuma edição passada: usa o ano corrente; se a data prevista desse ano
  // já passou, a próxima edição é a do ano seguinte.
  const prevista = parseBR(dataPrevista(key, hoje.year));
  const anoProximaEdicao =
    prevista && toEpochDay(prevista) <= toEpochDay(hoje) ? hoje.year + 1 : hoje.year;
  return { ultimaEdicao: null, anoProximaEdicao };
}

/**
 * Fase autoritativa por recência/imminência — nunca por ano-calendário (que
 * quebrava a Mega da Virada na virada do ano).
 *
 *   1. edição recém-sorteada dentro de `JANELA_DIAS` -> "resultado";
 *   2. data esperada para `anoProximaEdicao` já passou e a edição desse ano
 *      ainda não está no banco -> "apuracao";
 *   3. próxima edição dentro de `JANELA_DIAS` -> "proxima";
 *   4. fora da janela -> "resultado" (última edição como conteúdo principal);
 *      sem nenhuma edição sorteada, cai em "proxima".
 */
export function computeSpecialEditionFase(params: {
  key: SpecialEditionKey;
  hoje: SaoPauloToday;
  ultimaEdicao: SpecialEditionResult | null;
  proximaEdicao: SpecialEditionNext | null;
  anoProximaEdicao: number;
  /** Edições detectadas, para saber se a edição de `anoProximaEdicao` já existe. */
  edicoes: SpecialEditionResult[];
}): SpecialEditionFase {
  const hojeDia = toEpochDay(params.hoje);
  const ultima = parseBR(params.ultimaEdicao?.data ?? null);
  const proxima = parseBR(params.proximaEdicao?.data ?? null);

  const diasDesdeUltima = ultima ? hojeDia - toEpochDay(ultima) : null;
  const diasAteProxima = proxima ? toEpochDay(proxima) - hojeDia : null;

  // 1. Edição recém-sorteada domina o destaque pós-sorteio.
  if (
    params.ultimaEdicao &&
    diasDesdeUltima !== null &&
    diasDesdeUltima >= 0 &&
    diasDesdeUltima <= JANELA_DIAS
  ) {
    return "resultado";
  }

  // 2. Data esperada do próximo ciclo passou mas o resultado ainda não está no
  //    banco (sync atrasado). Não confundir com ano-calendário.
  const dataEsperada = parseBR(dataPrevista(params.key, params.anoProximaEdicao));
  const dataEsperadaJaPassou = dataEsperada ? toEpochDay(dataEsperada) <= hojeDia : false;
  const edicaoDoAnoJaExiste = params.edicoes.some(
    (e) => e.anoEdicao === params.anoProximaEdicao,
  );
  if (dataEsperadaJaPassou && !edicaoDoAnoJaExiste) {
    return "apuracao";
  }

  // 3. Edição iminente domina o destaque pré-sorteio.
  if (diasAteProxima !== null && diasAteProxima >= 0 && diasAteProxima <= JANELA_DIAS) {
    return "proxima";
  }

  // 4. Fora da janela: mostra a última edição; sem histórico, aponta a próxima.
  return params.ultimaEdicao ? "resultado" : "proxima";
}

// ---------------------------------------------------------------------------
// Detecção das edições já sorteadas
// ---------------------------------------------------------------------------

interface Premio {
  faixa: number;
  valorPremio: number;
  ganhadores: number;
}

function getFaixa(premios: LotteryResult["premios"] | null | undefined, faixa: number): Premio | undefined {
  return premios?.find((p) => p.faixa === faixa);
}

function anoDoTexto(data: string): number {
  const parts = data.split("/");
  return parts[2] ? Number(parts[2]) : 0;
}

function anoEdicaoVirada(row: LotteryResult): number {
  const fixo = VIRADA_ANO_EDICAO_EXCECOES[row.concurso];
  if (fixo !== undefined) return fixo;
  const parsed = parseBR(row.data);
  // Virada sorteada em 1º de janeiro pertence à edição do ano anterior.
  if (parsed && parsed.dd === 1 && parsed.mm === 1) return parsed.yyyy - 1;
  return parsed ? parsed.yyyy : 0;
}

/**
 * Prêmio efetivo da faixa principal com **cascade faixa 1 → faixa 2**. Vale para
 * São João (quina → quadra), Independência (15 → 14 acertos) e Dupla de Páscoa
 * (sena → quina do 1º sorteio): sem o cascade, uma edição sem ganhadores da
 * faixa 1 era descartada e a fase ficava travada em "apuracao" mesmo com o
 * resultado já no banco.
 */
function premioEfetivo(premios: LotteryResult["premios"] | null | undefined): {
  total: number;
  ganhadores: number;
} {
  const faixa1 = getFaixa(premios, 1);
  if (faixa1 && faixa1.ganhadores > 0) {
    return { total: faixa1.valorPremio * faixa1.ganhadores, ganhadores: faixa1.ganhadores };
  }
  const faixa2 = getFaixa(premios, 2);
  if (faixa2 && faixa2.ganhadores > 0) {
    return { total: faixa2.valorPremio * faixa2.ganhadores, ganhadores: faixa2.ganhadores };
  }
  if (faixa1) return { total: faixa1.valorPremio * faixa1.ganhadores, ganhadores: faixa1.ganhadores };
  if (faixa2) return { total: faixa2.valorPremio * faixa2.ganhadores, ganhadores: faixa2.ganhadores };
  return { total: 0, ganhadores: 0 };
}

/**
 * Consulta direcionada das linhas candidatas. Nada de `SELECT *` na tabela toda:
 *   - Independência: apenas setembro (>= 2012, primeira edição);
 *   - São João: apenas junho (>= 2011);
 *   - Dupla de Páscoa: março/abril (>= 2017, primeira edição);
 *   - Virada: 31/12 (>= 2009) + concursos de exceção.
 */
async function queryCandidatas(key: SpecialEditionKey): Promise<LotteryResult[]> {
  const def = EDITIONS[key];
  switch (key) {
    case "independencia":
      return db
        .select()
        .from(lotteryResultsTable)
        .where(
          and(
            eq(lotteryResultsTable.modalidade, def.dbModalidade),
            sql`SPLIT_PART(${lotteryResultsTable.data}, '/', 2) = '09'`,
            sql`SPLIT_PART(${lotteryResultsTable.data}, '/', 3)::integer >= 2012`,
          ),
        )
        .orderBy(asc(lotteryResultsTable.concurso));

    case "sao-joao":
      return db
        .select()
        .from(lotteryResultsTable)
        .where(
          and(
            eq(lotteryResultsTable.modalidade, def.dbModalidade),
            sql`SPLIT_PART(${lotteryResultsTable.data}, '/', 2) = '06'`,
            sql`SPLIT_PART(${lotteryResultsTable.data}, '/', 3)::integer >= 2011`,
          ),
        )
        .orderBy(asc(lotteryResultsTable.concurso));

    case "pascoa":
      return db
        .select()
        .from(lotteryResultsTable)
        .where(
          and(
            eq(lotteryResultsTable.modalidade, def.dbModalidade),
            sql`SPLIT_PART(${lotteryResultsTable.data}, '/', 2) IN ('03', '04')`,
            sql`SPLIT_PART(${lotteryResultsTable.data}, '/', 3)::integer >= 2017`,
          ),
        )
        .orderBy(asc(lotteryResultsTable.concurso));

    case "virada": {
      const padrao = and(
        sql`SPLIT_PART(${lotteryResultsTable.data}, '/', 1) = '31'`,
        sql`SPLIT_PART(${lotteryResultsTable.data}, '/', 2) = '12'`,
        sql`SPLIT_PART(${lotteryResultsTable.data}, '/', 3)::integer >= 2009`,
      );
      return db
        .select()
        .from(lotteryResultsTable)
        .where(
          and(
            eq(lotteryResultsTable.modalidade, def.dbModalidade),
            or(padrao, inArray(lotteryResultsTable.concurso, VIRADA_CONCURSO_EXCECOES)),
          ),
        )
        .orderBy(asc(lotteryResultsTable.concurso));
    }
  }
}

/** Reduz as linhas candidatas às edições especiais reais, ordenadas por concurso crescente. */
export function filtrarEdicoes(key: SpecialEditionKey, rows: LotteryResult[]): LotteryResult[] {
  if (key === "virada") return rows;

  if (key === "pascoa") {
    // Dupla de Páscoa é identificada por data (sábado que antecede a Páscoa ou
    // exceção em `confirmadas`), não por limiar de prêmio: assim os sorteios
    // regulares de março/abril ficam de fora.
    return rows
      .filter((row) => {
        const ano = anoDoTexto(row.data);
        return ano > 0 && row.data === dataPrevista(key, ano);
      })
      .sort((a, b) => a.concurso - b.concurso);
  }

  const def = EDITIONS[key];
  const limiar = def.limiarPremio ?? 0;
  const melhorPorAno = new Map<number, { row: LotteryResult; total: number }>();

  for (const row of rows) {
    const ano = anoDoTexto(row.data);
    if (!ano) continue;
    const total = premioEfetivo(row.premios).total;
    const atual = melhorPorAno.get(ano);
    if (!atual || total > atual.total) melhorPorAno.set(ano, { row, total });
  }

  // Anos com data confirmada em config são identificados pela própria data (mais
  // robusto que o limiar de prêmio): inclui a edição confirmada mesmo com 0
  // ganhadores da faixa 1. Se o sorteio confirmado ainda NÃO aconteceu (a linha
  // da data confirmada não está no banco), remove qualquer candidato regular do
  // mesmo ano — o ano ainda não tem edição especial (ex.: Independência de 2026
  // antes de 15/09/2026, quando o maior sorteio de setembro é um concurso comum).
  for (const [anoStr, confirmada] of Object.entries(def.confirmadas)) {
    const ano = Number(anoStr);
    const row = rows.find((r) => r.data === confirmada.data);
    if (row) melhorPorAno.set(ano, { row, total: premioEfetivo(row.premios).total });
    else melhorPorAno.delete(ano);
  }

  return Array.from(melhorPorAno.entries())
    .filter(([ano, v]) => {
      const confirmada = def.confirmadas[ano];
      // Ano confirmado: só a linha da data confirmada vale (nunca um sorteio regular).
      return confirmada ? v.row.data === confirmada.data : v.total >= limiar;
    })
    .map(([, v]) => v.row)
    .sort((a, b) => a.concurso - b.concurso);
}

function toSpecialEditionResult(key: SpecialEditionKey, row: LotteryResult): SpecialEditionResult {
  // São João (quina → quadra), Independência (15 → 14 acertos) e Dupla de Páscoa
  // (sena → quina do 1º sorteio) usam o cascade da faixa principal para não
  // sumirem quando não há ganhador da faixa 1.
  if (key === "sao-joao" || key === "independencia" || key === "pascoa") {
    const efetivo = premioEfetivo(row.premios);
    return {
      concurso: row.concurso,
      data: row.data,
      premioTotal: efetivo.total,
      ganhadores: efetivo.ganhadores,
      anoEdicao: anoDoTexto(row.data),
    };
  }

  const faixa1 = getFaixa(row.premios, 1);
  return {
    concurso: row.concurso,
    data: row.data,
    premioTotal: faixa1 ? faixa1.valorPremio * faixa1.ganhadores : null,
    ganhadores: faixa1 ? faixa1.ganhadores : null,
    anoEdicao: anoEdicaoVirada(row),
  };
}

// ---------------------------------------------------------------------------
// Próxima edição
// ---------------------------------------------------------------------------

export interface LatestDraw {
  concurso: number;
  data: string;
  dataProximoConcurso: string | null;
  valorEstimadoProximo: string | null;
}

/** Última linha da modalidade usando o índice (modalidade, concurso) — sem full scan. */
async function queryUltimoSorteio(modalidade: string): Promise<LatestDraw | null> {
  const [row] = await db
    .select({
      concurso: lotteryResultsTable.concurso,
      data: lotteryResultsTable.data,
      dataProximoConcurso: lotteryResultsTable.dataProximoConcurso,
      valorEstimadoProximo: lotteryResultsTable.valorEstimadoProximo,
    })
    .from(lotteryResultsTable)
    .where(eq(lotteryResultsTable.modalidade, modalidade))
    .orderBy(desc(lotteryResultsTable.concurso))
    .limit(1);
  return row ?? null;
}

function toNumberOrNull(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/**
 * Resolve a próxima edição do `ano`.
 *
 * Ordem de autoridade:
 *   1. data confirmada no mapa `confirmadas` (autoritativa quando existe: um
 *      `dataProximoConcurso` da Caixa pode ser de um sorteio regular do mesmo
 *      mês, então a config vence o conflito de data);
 *   2. `dataProximoConcurso`/`valorEstimadoProximo` da Caixa, quando a data cai
 *      na janela da modalidade E não é anterior à data prevista;
 *   3. data calculada pela regra da modalidade.
 */
function resolveProximaEdicao(
  key: SpecialEditionKey,
  ano: number,
  origem: LatestDraw | null,
): SpecialEditionNext {
  const def = EDITIONS[key];
  const confirmada = def.confirmadas[ano];
  const prevista = dataPrevista(key, ano);
  const previstaSerial = parseBR(prevista);

  const origemDataTexto = origem?.dataProximoConcurso ?? null;
  const origemValor = toNumberOrNull(origem?.valorEstimadoProximo);

  // 1. Config confirmada é autoritativa. Só aproveita o valor estimado da Caixa
  //    quando ele se refere exatamente à mesma data da edição confirmada.
  if (confirmada) {
    const origemConfere = origemDataTexto === confirmada.data && origemValor != null;
    return {
      data: confirmada.data,
      valorEstimado: origemConfere ? origemValor : (confirmada.valorEstimado ?? null),
      confirmado: true,
    };
  }

  // 2. Fonte oficial da Caixa (somente na janela e sem capturar sorteio regular
  //    anterior à edição especial).
  const origemData = parseBR(origemDataTexto);
  const origemNaJanela =
    !!origemData &&
    origemData.yyyy === ano &&
    def.janelaMeses.includes(origemData.mm) &&
    (previstaSerial ? serial(origemData) >= serial(previstaSerial) : true);

  if (origemNaJanela && origemDataTexto) {
    return {
      data: origemDataTexto,
      valorEstimado: origemValor,
      confirmado: true,
    };
  }

  // 3. Regra calculada (estimativa).
  return { data: prevista, valorEstimado: null, confirmado: false };
}

// ---------------------------------------------------------------------------
// Montagem + cache
// ---------------------------------------------------------------------------

export interface SpecialEditionData {
  facts: SpecialEditionFacts;
  /** Linhas completas das edições detectadas, ordenadas por concurso crescente. */
  edicoes: LotteryResult[];
}

/**
 * Monta os `SpecialEditionFacts` de forma **pura** (sem I/O): recebe as edições
 * já filtradas, `hoje` e a origem da Caixa. `buildEditionData` apenas orquestra
 * as consultas e delega para cá, de modo que a seleção de ciclo e a fase sejam
 * testáveis de forma determinística.
 */
export function computeSpecialEditionFacts(
  key: SpecialEditionKey,
  edicoes: LotteryResult[],
  hoje: SaoPauloToday,
  origem: LatestDraw | null,
): SpecialEditionFacts {
  const def = EDITIONS[key];
  const resultados = edicoes.map((row) => toSpecialEditionResult(key, row));

  const { ultimaEdicao, anoProximaEdicao } = selectCycle(resultados, hoje, key);
  const proximaEdicao = resolveProximaEdicao(key, anoProximaEdicao, origem);
  const fase: SpecialEditionFase = computeSpecialEditionFase({
    key,
    hoje,
    ultimaEdicao,
    proximaEdicao,
    anoProximaEdicao,
    edicoes: resultados,
  });

  return {
    modalidade: def.modalidade,
    slug: def.slug,
    nome: def.nome,
    anoProximaEdicao,
    ultimaEdicao,
    proximaEdicao,
    fase,
  };
}

async function buildEditionData(key: SpecialEditionKey): Promise<SpecialEditionData> {
  const def = EDITIONS[key];
  const hoje = getTodaySaoPaulo();

  const [candidatas, origem] = await Promise.all([
    queryCandidatas(key),
    queryUltimoSorteio(def.dbModalidade),
  ]);

  const edicoes = filtrarEdicoes(key, candidatas);
  const facts = computeSpecialEditionFacts(key, edicoes, hoje, origem);

  return { facts, edicoes };
}

const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map<SpecialEditionKey, { expiresAt: number; promise: Promise<SpecialEditionData> }>();

function loadEditionData(key: SpecialEditionKey): Promise<SpecialEditionData> {
  const now = Date.now();
  const hit = cache.get(key);
  if (hit && hit.expiresAt > now) return hit.promise;

  const promise = buildEditionData(key).catch((err) => {
    cache.delete(key);
    throw err;
  });
  cache.set(key, { expiresAt: now + CACHE_TTL_MS, promise });
  return promise;
}

/** Fatos da edição especial para uma modalidade (null se não houver edição especial). */
export async function resolveSpecialEdition(
  modalidade: string,
): Promise<SpecialEditionFacts | null> {
  const key = MODALIDADE_TO_KEY[modalidade];
  if (!key) return null;
  const { facts } = await loadEditionData(key);
  return facts;
}

/**
 * Linhas completas das edições já sorteadas (mais recente primeiro), para as rotas
 * montarem o campo `historico` sem duplicar a heurística de detecção.
 */
export async function getSpecialEditionHistorico(modalidade: string): Promise<LotteryResult[]> {
  const key = MODALIDADE_TO_KEY[modalidade];
  if (!key) return [];
  const { edicoes } = await loadEditionData(key);
  return [...edicoes].reverse();
}

/** Invalida o cache (admin/testes); a próxima chamada recomputa. */
export function clearSpecialEditionCache(): void {
  cache.clear();
}
