import type { Currency } from "@/lib/tours/types";

const TIME_ZONE = "Asia/Tashkent";

/**
 * Выбирает форму слова по числу: 1 ночь, 2 ночи, 5 ночей.
 * @param n - число
 * @param forms - [одна, две, пять]
 * @returns подходящая форма
 */
export function plural(n: number, forms: readonly [string, string, string]): string {
  const mod100 = Math.abs(n) % 100;
  const mod10 = mod100 % 10;
  if (mod100 > 10 && mod100 < 20) return forms[2];
  if (mod10 === 1) return forms[0];
  if (mod10 >= 2 && mod10 <= 4) return forms[1];
  return forms[2];
}

/**
 * «7 ночей».
 * @param n - число ночей
 * @returns строка с числом и словом
 */
export function nightsLabel(n: number): string {
  return `${n} ${plural(n, ["ночь", "ночи", "ночей"])}`;
}

/**
 * Цена с разделителями тысяч: «1 011 $», «9,9 млн сум».
 * @param amount - сумма
 * @param currency - валюта
 * @returns отформатированная цена
 */
export function formatPrice(amount: number, currency: Currency): string {
  if (currency === "UZS") {
    if (amount >= 1_000_000) {
      const millions = (amount / 1_000_000).toLocaleString("ru-RU", { maximumFractionDigits: 1 });
      return `${millions} млн сум`;
    }
    return `${amount.toLocaleString("ru-RU")} сум`;
  }
  return `${amount.toLocaleString("ru-RU")} $`;
}

/**
 * Дата «5 декабря» по ташкентскому времени.
 * @param isoDate - YYYY-MM-DD или полная ISO-строка
 * @returns дата словами без года
 */
export function formatDay(isoDate: string): string {
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", timeZone: TIME_ZONE }).format(
    new Date(isoDate.length === 10 ? `${isoDate}T12:00:00Z` : isoDate),
  );
}
