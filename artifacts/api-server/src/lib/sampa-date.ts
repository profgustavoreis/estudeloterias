/**
 * Utilidades de data em America/Sao_Paulo, sem depender do fuso do processo.
 *
 * Extraído de `services/special-editions.ts` para ser compartilhado pela régua
 * de indexação (`services/indexing-policy.ts`), que precisa do "hoje" de
 * Brasília e de aritmética de janela em meses.
 */

export interface SaoPauloToday {
  year: number;
  month: number;
  day: number;
}

/**
 * "Hoje" em America/Sao_Paulo. É a fonte única de verdade temporal dos
 * serviços: os dias de pico (virada de ano, noite do sorteio) acontecem
 * antes/depois da meia-noite UTC, então `new Date().getFullYear()` erra o dia.
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

/**
 * Converte a data textual da Caixa (`dd/mm/yyyy`) para ISO (`yyyy-mm-dd`),
 * formato que compara lexicograficamente. Validação apenas por regex, sem
 * `new Date`, portanto imune a fuso e a datas inexistentes (ex.: 31/02).
 * Devolve `null` quando o formato não bate.
 */
export function toIsoDate(ddmmyyyy: string | null | undefined): string | null {
  if (!ddmmyyyy) return null;
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(ddmmyyyy);
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return `${match[3]}-${match[2]}-${match[1]}`;
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** Serializa `{ year, month, day }` como `yyyy-mm-dd`. */
export function isoFromParts(date: SaoPauloToday): string {
  return `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
}

/**
 * Data de corte da janela de `months` meses atrás, com **clamp de dia**: em
 * 31/03 menos um mês o resultado é 28/02 (ou 29/02 em ano bissexto), nunca
 * 03/03. Meses inválidos (`<= 0`) equivalem a "sem janela" (corte = hoje).
 */
export function windowCutoffIso(
  months: number,
  today: SaoPauloToday = getTodaySaoPaulo(),
): string {
  const safeMonths = Number.isInteger(months) && months > 0 ? months : 0;
  const total = today.year * 12 + (today.month - 1) - safeMonths;
  const year = Math.floor(total / 12);
  const month = (total % 12) + 1;
  const day = Math.min(today.day, daysInMonth(year, month));
  return isoFromParts({ year, month, day });
}
