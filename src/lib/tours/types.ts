import type { CountrySlug } from "@/lib/countries";

export type TourKind = "beach" | "excursion" | "health";
export type Currency = "USD" | "UZS";

export const TOUR_KINDS: readonly { value: TourKind; label: string }[] = [
  { value: "beach", label: "Пляжный" },
  { value: "excursion", label: "Экскурсионный" },
  { value: "health", label: "Лечебный" },
];

/** Тур, разобранный из поста Telegram-канала. */
export interface ParsedTour {
  /** id сообщения в канале — он же id тура на сайте. */
  id: number;
  title: string;
  body: string;
  countrySlug: CountrySlug | null;
  kind: TourKind;
  priceFrom: number | null;
  currency: Currency | null;
  nights: number | null;
  /** Даты вылета в формате YYYY-MM-DD. */
  departureDates: string[];
  postUrl: string;
  postedAt: string;
  expiresAt: string;
}

/** Тур, который показывается на сайте. */
export interface Tour extends ParsedTour {
  /** Абсолютные ссылки на фото или пути из /public. */
  photos: string[];
}
