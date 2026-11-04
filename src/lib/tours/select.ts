import { getCountry } from "@/lib/countries";
import { COUNTRY_PHOTOS } from "@/lib/tours/country-photos";
import type { Tour, TourKind } from "@/lib/tours/types";

export type TourSort = "soon" | "cheap" | "new";

export interface TourFilters {
  country?: string;
  kind?: TourKind;
  /** Максимальная цена в долларах. */
  maxPrice?: number;
  sort?: TourSort;
}

const FALLBACK_IMAGE = "/images/beach.jpg";

/**
 * Ближайшая дата вылета, не раньше сегодняшнего дня.
 * @param tour - тур
 * @param today - сегодняшняя дата YYYY-MM-DD
 * @returns дата YYYY-MM-DD или null
 */
export function nextDeparture(tour: Tour, today: string): string | null {
  return tour.departureDates.find((d) => d >= today) ?? null;
}

/**
 * Обложка тура: первое фото поста или снимок страны.
 * Снимок выбирается по id тура: так у туров одной страны обложки разные и не меняются между заходами.
 * @param tour - тур
 * @returns путь или ссылка на картинку
 */
export function tourCover(tour: Tour): string {
  if (tour.photos[0]) return tour.photos[0];
  if (!tour.countrySlug) return FALLBACK_IMAGE;
  const photos = COUNTRY_PHOTOS[tour.countrySlug];
  return photos[tour.id % photos.length];
}

/**
 * Название страны тура. Без флага-эмодзи: Windows показывает флаги буквами («TR»).
 * @param tour - тур
 * @returns название или null, если страна не определена
 */
export function tourCountryLabel(tour: Tour): string | null {
  return getCountry(tour.countrySlug)?.name ?? null;
}

/**
 * Фильтрует и сортирует туры для страницы /tours.
 * @param tours - актуальные туры
 * @param filters - страна, тип, цена, сортировка
 * @param today - сегодняшняя дата YYYY-MM-DD
 * @returns новый массив туров
 */
export function filterTours(tours: readonly Tour[], filters: TourFilters, today: string): Tour[] {
  const result = tours.filter(
    (t) =>
      (!filters.country || t.countrySlug === filters.country) &&
      (!filters.kind || t.kind === filters.kind) &&
      (!filters.maxPrice || (t.currency === "USD" && t.priceFrom !== null && t.priceFrom <= filters.maxPrice)),
  );
  return sortTours(result, filters.sort ?? "soon", today);
}

/**
 * Сортирует туры: по ближайшему вылету, по цене или по дате публикации.
 * Туры без даты или цены — в конце.
 */
export function sortTours(tours: Tour[], sort: TourSort, today: string): Tour[] {
  const byNew = (a: Tour, b: Tour) => b.postedAt.localeCompare(a.postedAt);
  if (sort === "new") return [...tours].sort(byNew);
  if (sort === "cheap") {
    const usd = (t: Tour) => (t.currency === "USD" && t.priceFrom !== null ? t.priceFrom : Number.POSITIVE_INFINITY);
    return [...tours].sort((a, b) => usd(a) - usd(b) || byNew(a, b));
  }
  return [...tours].sort((a, b) => {
    const da = nextDeparture(a, today) ?? "9999";
    const db = nextDeparture(b, today) ?? "9999";
    return da.localeCompare(db) || byNew(a, b);
  });
}

/**
 * Минимальная цена в долларах среди туров страны.
 * @returns цена или null, если туров с ценой в долларах нет
 */
export function cheapestUsd(tours: readonly Tour[], countrySlug: string): number | null {
  const prices = tours
    .filter((t) => t.countrySlug === countrySlug && t.currency === "USD" && t.priceFrom !== null)
    .map((t) => t.priceFrom as number);
  return prices.length > 0 ? Math.min(...prices) : null;
}

/**
 * Сегодняшняя дата в Ташкенте в формате YYYY-MM-DD.
 * @param now - момент времени
 */
export function todayInTashkent(now: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tashkent" }).format(now);
}
