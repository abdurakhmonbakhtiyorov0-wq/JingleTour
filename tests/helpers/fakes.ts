import type { BotApi, EditMessageTextParams, SendMessageParams } from "@/lib/telegram/bot-api";
import type { TgMessage } from "@/lib/telegram/types";
import type { ChannelMedia, PhotoStorage, StoredTour, TourStore, TourUpsert } from "@/lib/tours/store";

/** Хранилище туров в памяти — ведёт себя как Supabase-реализация. */
export class MemoryTourStore implements TourStore {
  tours = new Map<number, TourUpsert & { photos: string[] }>();
  media = new Map<number, ChannelMedia>();

  private toStored(id: number): StoredTour | null {
    const t = this.tours.get(id);
    return t ? { id, title: t.title, mediaGroupId: t.mediaGroupId, photos: t.photos, isVisible: t.isVisible } : null;
  }

  async upsertTour(tour: TourUpsert) {
    const prev = this.tours.get(tour.id);
    this.tours.set(tour.id, { ...tour, photos: tour.photos ?? prev?.photos ?? [] });
  }
  async findTour(id: number) {
    return this.toStored(id);
  }
  async findTourByMediaGroup(groupId: string) {
    const found = [...this.tours.values()].find((t) => t.mediaGroupId === groupId);
    return found ? this.toStored(found.id) : null;
  }
  async setVisibility(id: number, isVisible: boolean) {
    const t = this.tours.get(id);
    if (!t) return null;
    t.isVisible = isVisible;
    return this.toStored(id);
  }
  async setPhotos(id: number, photos: string[]) {
    const t = this.tours.get(id);
    if (t) t.photos = photos;
  }
  async addChannelMedia(m: Omit<ChannelMedia, "storagePath">) {
    if (!this.media.has(m.messageId)) this.media.set(m.messageId, { ...m, storagePath: null });
  }
  async listChannelMedia(groupId: string) {
    return [...this.media.values()].filter((m) => m.mediaGroupId === groupId).sort((a, b) => a.messageId - b.messageId);
  }
  async setMediaStoragePath(messageId: number, path: string) {
    const m = this.media.get(messageId);
    if (m) m.storagePath = path;
  }
}

/** Бот, который запоминает вызовы и отдаёт «файл» с именем file_id. */
export class FakeBot implements BotApi {
  sent: SendMessageParams[] = [];
  edited: EditMessageTextParams[] = [];
  answers: { callback_query_id: string; text?: string }[] = [];
  downloads: string[] = [];

  async sendMessage(params: SendMessageParams): Promise<TgMessage> {
    this.sent.push(params);
    return { message_id: this.sent.length, date: 0, chat: { id: params.chat_id, type: "private" } };
  }
  async editMessageText(params: EditMessageTextParams) {
    this.edited.push(params);
  }
  async answerCallbackQuery(params: { callback_query_id: string; text?: string }) {
    this.answers.push(params);
  }
  async getFile(fileId: string) {
    return { file_id: fileId, file_unique_id: `u-${fileId}`, file_path: `photos/${fileId}.jpg` };
  }
  async downloadFile(filePath: string) {
    this.downloads.push(filePath);
    return Buffer.from(filePath);
  }
}

export class MemoryPhotoStorage implements PhotoStorage {
  uploads = new Map<string, Buffer>();
  async upload(path: string, data: Buffer) {
    this.uploads.set(path, data);
    return path;
  }
}
