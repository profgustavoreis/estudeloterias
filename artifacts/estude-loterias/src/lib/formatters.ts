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
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "long",
      timeZone: "UTC",
    }).format(date);
  } catch (e) {
    return dateString;
  }
}

export function padNumber(num: number | string): string {
  return num.toString().padStart(2, "0");
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
