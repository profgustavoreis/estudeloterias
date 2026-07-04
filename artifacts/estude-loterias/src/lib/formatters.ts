export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      timeZone: "UTC",
    }).format(date);
  } catch (e) {
    return dateString;
  }
}

export function formatLongDate(dateString: string | null | undefined): string {
  if (!dateString) return "";
  try {
    const [dd, mm, yyyy] = dateString.split("/").map(Number);
    if (!dd || !mm || !yyyy) return dateString;
    const date = new Date(Date.UTC(yyyy, mm - 1, dd));
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "long",
      timeZone: "UTC",
    }).format(date);
  } catch (e) {
    return dateString;
  }
}

export function formatWeekday(dateString: string | null | undefined): string {
  if (!dateString) return "";
  try {
    const [dd, mm, yyyy] = dateString.split("/").map(Number);
    if (!dd || !mm || !yyyy) return "";
    const date = new Date(Date.UTC(yyyy, mm - 1, dd));
    return new Intl.DateTimeFormat("pt-BR", {
      weekday: "long",
      timeZone: "UTC",
    }).format(date);
  } catch (e) {
    return "";
  }
}

export function padNumber(num: number | string): string {
  return num.toString().padStart(2, "0");
}

// O prêmio bruto mudou de 43,35% para 43,79% em nov/2024 (início da Lotex — Lei 13.756/2018)
const PREMIO_BRUTO_POS_LOTEX = 0.4379;
const PREMIO_BRUTO_PRE_LOTEX = 0.4335;

function taxaPremioBruto(data: string | null | undefined): number {
  if (!data) return PREMIO_BRUTO_POS_LOTEX;
  const partes = data.split("/");
  if (partes.length !== 3) return PREMIO_BRUTO_POS_LOTEX;
  const ano = Number(partes[2]);
  if (ano > 2024) return PREMIO_BRUTO_POS_LOTEX;
  if (ano < 2024) return PREMIO_BRUTO_PRE_LOTEX;
  // ano === 2024: Lotex entrou em novembro
  return Number(partes[1]) >= 11 ? PREMIO_BRUTO_POS_LOTEX : PREMIO_BRUTO_PRE_LOTEX;
}

// Percentuais da Sena, Quina e Quadra do 2º sorteio sobre o prêmio bruto por era:
// 4 premios (2001–2010): Sena2=30%, Quina2=20%, Quadra2=20%
// 6 premios (2010–2016): Sena2=20%, Quina2=15%, Quadra2=10%
// 8 premios (2016+):     Sena2=11%, Quina2= 9%, Quadra2= 8%
function percSena2(premiosLen: number): number {
  if (premiosLen >= 8) return 0.11;
  if (premiosLen >= 6) return 0.20;
  return 0.30;
}
function percQuina2(premiosLen: number): number {
  if (premiosLen >= 8) return 0.09;
  if (premiosLen >= 6) return 0.15;
  return 0.20;
}
function percQuadra2(premiosLen: number): number {
  if (premiosLen >= 8) return 0.08;
  if (premiosLen >= 6) return 0.10;
  return 0.20;
}

/**
 * Estima o valor acumulado da Sena do 2º sorteio da Dupla Sena.
 * Tenta primeiro a partir do total pago à Quina2 ou Quadra2 (mais preciso),
 * e cai para a estimativa por arrecadação quando não há vencedores nessas faixas.
 *
 * @param premiosLen Número de faixas de premiação (define a era)
 * @param totalQuina2 Valor total pago à Quina2 (ganhadores × valorPremio), ou null
 * @param totalQuadra2 Valor total pago à Quadra2, ou null
 * @param arrecadacaoTotal Arrecadação total do concurso (fallback)
 * @param data Data do concurso (dd/mm/yyyy) para definir prêmio bruto pré/pós-Lotex
 */
export function estimarSena2(
  premiosLen: number,
  totalQuina2: number | null,
  totalQuadra2: number | null,
  arrecadacaoTotal: number | null | undefined,
  data?: string | null,
): number | null {
  // Tenta a partir da Quina2 (maior faixa = estimativa mais confiável)
  if (totalQuina2 != null && totalQuina2 > 0) {
    const ratio = percSena2(premiosLen) / percQuina2(premiosLen);
    return Math.round(totalQuina2 * ratio * 100) / 100;
  }
  // Tenta a partir da Quadra2
  if (totalQuadra2 != null && totalQuadra2 > 0) {
    const ratio = percSena2(premiosLen) / percQuadra2(premiosLen);
    return Math.round(totalQuadra2 * ratio * 100) / 100;
  }
  // Fallback: estimativa por arrecadação (menos precisa)
  if (arrecadacaoTotal == null || arrecadacaoTotal <= 0) return null;
  const premioBruto = taxaPremioBruto(data);
  return Math.round(arrecadacaoTotal * premioBruto * percSena2(premiosLen) * 100) / 100;
}

export function formatDateShort(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const parts = dateStr.split("/");
  if (parts.length !== 3) return dateStr;
  const [dd, mm, yyyy] = parts;
  return `${Number(dd)}/${Number(mm)}/${yyyy}`;
}

export function formatDateWithWeekday(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const parts = dateStr.split("/");
  if (parts.length !== 3) return dateStr;
  const [dd, mm, yyyy] = parts;
  const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  const weekday = date.toLocaleDateString("pt-BR", { weekday: "long" });
  return `${Number(dd)}/${Number(mm)}/${yyyy} (${weekday})`;
}
