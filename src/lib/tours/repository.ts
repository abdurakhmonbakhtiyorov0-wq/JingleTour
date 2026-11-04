import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { isCountrySlug } from "@/lib/countries";
import { createPublicClient, isSupabaseConfigured, photoUrl } from "@/lib/supabase/clients";
import type { TourRow } from "@/lib/supabase/database.types";
import { TOURS_CACHE_TAG } from "@/lib/tours/cache";
import seedTours from "@/lib/tours/seed-tours.json";
import { todayInTashkent } from "@/lib/tours/select";
import type { Tour } from "@/lib/tours/types";

export interface ActiveTours {
  tours: Tour[];
  /** Сегодня по Ташкенту на момент загрузки — для «ближайшего вылета». */
  today: string;
}

/**
 * Строка таблицы tours → тур для сайта.
 */
function fromRow(row: TourRow): Tour {
  return {
    id: Number(row.id),
    title: row.title,
    body: row.body,
    countrySlug: row.country_slug && isCountrySlug(row.country_slug) ? row.country_slug : null,
    kind: row.kind,
    priceFrom: row.price_from === null ? null : Number(row.price_from),
    currency: row.currency,
    nights: row.nights,
    departureDates: row.departure_dates,
    photos: row.photos.map(photoUrl),
    postUrl: row.post_url,
    postedAt: row.posted_at,
    expiresAt: row.expires_at,
  };
}

/**
 * Туры из Supabase (политика RLS отдаёт только видимые и неистёкшие).
 * @throws Error, если Supabase вернул ошибку
 */
async function loadFromSupabase(nowIso: string): Promise<Tour[]> {
  const { data, error } = await createPublicClient()
    .from("tours")
    .select("*")
    .eq("is_visible", true)
    .gt("expires_at", nowIso)
    .order("posted_at", { ascending: false })
    .limit(300);
  if (error) throw new Error(`Supabase select tours: ${error.message}`);
  return data.map(fromRow);
}

/**
 * Все актуальные туры. Кешируется на час и сбрасывается вебхуком по тегу «tours».
 * Без Supabase берёт туры из seed-tours.json — так сайт можно смотреть локально.
 * При сбое базы отдаёт пустой список на несколько минут, чтобы страница не падала.
 * @returns туры и сегодняшняя дата
 */
export async function getActiveTours(): Promise<ActiveTours> {
  "use cache";
  cacheTag(TOURS_CACHE_TAG);

  const now = new Date();
  const today = todayInTashkent(now);
  if (!isSupabaseConfigured()) {
    cacheLife("hours");
    const tours = (seedTours as Tour[]).filter((t) => new Date(t.expiresAt) > now);
    return { tours, today };
  }

  try {
    const tours = await loadFromSupabase(now.toISOString());
    // Истёкший тур пропадает со страниц максимум за час, даже если на них давно не заходили
    cacheLife({ stale: 300, revalidate: 1800, expire: 3600 });
    return { tours, today };
  } catch (error) {
    console.error("[tours] не удалось загрузить туры:", error);
    cacheLife("minutes");
    return { tours: [], today };
  }
}

/**
 * Тур по id сообщения канала.
 * @param id - id тура
 * @returns тур или null, если он скрыт, истёк или не существует
 */
export async function getTour(id: number): Promise<Tour | null> {
  const { tours } = await getActiveTours();
  return tours.find((t) => t.id === id) ?? null;
}
