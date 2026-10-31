import { PHOTO_BUCKET, type Supabase } from "@/lib/supabase/clients";
import type { TourRow } from "@/lib/supabase/database.types";
import type { ChannelMedia, PhotoStorage, StoredTour, TourStore, TourUpsert } from "@/lib/tours/store";

const STORED_COLUMNS = "id, title, media_group_id, photos, is_visible";

/**
 * Превращает строку таблицы в StoredTour.
 */
function toStored(row: Pick<TourRow, "id" | "title" | "media_group_id" | "photos" | "is_visible">): StoredTour {
  return {
    id: Number(row.id),
    title: row.title,
    mediaGroupId: row.media_group_id,
    photos: row.photos,
    isVisible: row.is_visible,
  };
}

/**
 * Бросает понятную ошибку, если Supabase вернул error.
 * @throws Error с названием операции
 */
function check(operation: string, error: { message: string } | null): void {
  if (error) throw new Error(`Supabase ${operation}: ${error.message}`);
}

/**
 * Хранилище туров в Supabase. Использует service-role клиент.
 * @param db - клиент из createAdminClient()
 * @returns реализация TourStore
 */
export function createSupabaseTourStore(db: Supabase): TourStore {
  return {
    async upsertTour(tour: TourUpsert) {
      const { error } = await db.from("tours").upsert({
        id: tour.id,
        media_group_id: tour.mediaGroupId,
        title: tour.title,
        body: tour.body,
        country_slug: tour.countrySlug,
        kind: tour.kind,
        price_from: tour.priceFrom,
        currency: tour.currency,
        nights: tour.nights,
        departure_dates: tour.departureDates,
        post_url: tour.postUrl,
        posted_at: tour.postedAt,
        expires_at: tour.expiresAt,
        is_visible: tour.isVisible,
        ...(tour.photos ? { photos: tour.photos } : {}),
      });
      check("upsert tours", error);
    },

    async findTour(id) {
      const { data, error } = await db.from("tours").select(STORED_COLUMNS).eq("id", id).maybeSingle();
      check("select tour", error);
      return data ? toStored(data) : null;
    },

    async findTourByMediaGroup(mediaGroupId) {
      const { data, error } = await db
        .from("tours")
        .select(STORED_COLUMNS)
        .eq("media_group_id", mediaGroupId)
        .maybeSingle();
      check("select tour by media group", error);
      return data ? toStored(data) : null;
    },

    async setVisibility(id, isVisible) {
      const { data, error } = await db
        .from("tours")
        .update({ is_visible: isVisible })
        .eq("id", id)
        .select(STORED_COLUMNS)
        .maybeSingle();
      check("update visibility", error);
      return data ? toStored(data) : null;
    },

    async setPhotos(id, photos) {
      const { error } = await db.from("tours").update({ photos }).eq("id", id);
      check("update photos", error);
    },

    async addChannelMedia(media) {
      const { error } = await db.from("channel_media").upsert(
        {
          message_id: media.messageId,
          media_group_id: media.mediaGroupId,
          file_id: media.fileId,
          file_unique_id: media.fileUniqueId,
        },
        { onConflict: "message_id", ignoreDuplicates: true },
      );
      check("insert channel_media", error);
    },

    async listChannelMedia(mediaGroupId): Promise<ChannelMedia[]> {
      const { data, error } = await db
        .from("channel_media")
        .select("message_id, media_group_id, file_id, file_unique_id, storage_path")
        .eq("media_group_id", mediaGroupId)
        .order("message_id");
      check("select channel_media", error);
      return (data ?? []).map((row) => ({
        messageId: Number(row.message_id),
        mediaGroupId: row.media_group_id,
        fileId: row.file_id,
        fileUniqueId: row.file_unique_id,
        storagePath: row.storage_path,
      }));
    },

    async setMediaStoragePath(messageId, storagePath) {
      const { error } = await db.from("channel_media").update({ storage_path: storagePath }).eq("message_id", messageId);
      check("update channel_media", error);
    },
  };
}

/**
 * Загрузка фото в публичный bucket tour-photos.
 * @param db - клиент из createAdminClient()
 * @returns реализация PhotoStorage
 */
export function createSupabasePhotoStorage(db: Supabase): PhotoStorage {
  return {
    async upload(path, data) {
      const { error } = await db.storage.from(PHOTO_BUCKET).upload(path, data, {
        contentType: "image/webp",
        upsert: true,
        cacheControl: "31536000",
      });
      check("storage upload", error);
      return path;
    },
  };
}
