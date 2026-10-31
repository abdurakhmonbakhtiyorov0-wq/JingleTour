import type { ParsedTour } from "@/lib/tours/types";

/** Тур, как он хранится в базе (только поля, нужные вебхуку). */
export interface StoredTour {
  id: number;
  title: string;
  mediaGroupId: string | null;
  photos: string[];
  isVisible: boolean;
}

export interface ChannelMedia {
  messageId: number;
  mediaGroupId: string;
  fileId: string;
  fileUniqueId: string;
  storagePath: string | null;
}

export interface TourUpsert extends ParsedTour {
  mediaGroupId: string | null;
  isVisible: boolean;
  /** Если не передать, фото в базе останутся прежними. */
  photos?: string[];
}

/** Запись туров. Реализации: Supabase (сайт) и in-memory (тесты). */
export interface TourStore {
  upsertTour(tour: TourUpsert): Promise<void>;
  findTour(id: number): Promise<StoredTour | null>;
  findTourByMediaGroup(mediaGroupId: string): Promise<StoredTour | null>;
  setVisibility(id: number, isVisible: boolean): Promise<StoredTour | null>;
  setPhotos(id: number, photos: string[]): Promise<void>;
  addChannelMedia(media: Omit<ChannelMedia, "storagePath">): Promise<void>;
  listChannelMedia(mediaGroupId: string): Promise<ChannelMedia[]>;
  setMediaStoragePath(messageId: number, storagePath: string): Promise<void>;
}

/** Загрузка готовых WebP-файлов. */
export interface PhotoStorage {
  /**
   * @param path - путь внутри bucket, например tours/3013-AQAD.webp
   * @param data - WebP-изображение
   * @returns тот же путь — его сохраняем в tours.photos
   */
  upload(path: string, data: Buffer): Promise<string>;
}
