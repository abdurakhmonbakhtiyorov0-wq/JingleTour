import { escapeTelegramHtml, type BotApi } from "@/lib/telegram/bot-api";
import { hasTourHashtag, parseTourPost } from "@/lib/telegram/parse-post";
import type { TgCallbackQuery, TgChat, TgInlineButton, TgMessage, TgPhotoSize, TgUpdate } from "@/lib/telegram/types";
import type { PhotoStorage, StoredTour, TourStore } from "@/lib/tours/store";

const MAX_ALBUM_PHOTOS = 10;

export interface WebhookConfig {
  /** id канала (-100…). Если не задан, канал узнаём по username. */
  channelId: number | null;
  channelUsername: string;
  adminChatIds: readonly number[];
  siteUrl: string;
}

export interface WebhookDeps {
  bot: BotApi;
  store: TourStore;
  photos: PhotoStorage;
  convertImage: (input: Buffer) => Promise<Buffer>;
  config: WebhookConfig;
}

export interface WebhookResult {
  /** true — данные туров изменились, кеш сайта нужно сбросить. */
  changed: boolean;
  action: string;
}

const ignored = (reason: string): WebhookResult => ({ changed: false, action: `ignored:${reason}` });

/**
 * Обрабатывает один апдейт Telegram.
 * @param update - тело запроса вебхука
 * @param deps - бот, хранилище, загрузка фото и настройки
 * @returns что сделано и нужно ли сбросить кеш туров
 * @throws ошибки Supabase или Telegram — тогда вебхук отвечает 500, и Telegram повторит апдейт
 */
export async function handleUpdate(update: TgUpdate, deps: WebhookDeps): Promise<WebhookResult> {
  if (update.channel_post) return handleChannelPost(update.channel_post, false, deps);
  if (update.edited_channel_post) return handleChannelPost(update.edited_channel_post, true, deps);
  if (update.callback_query) return handleCallback(update.callback_query, deps);
  if (update.message) return handlePrivateMessage(update.message, deps);
  return ignored("unsupported-update");
}

/**
 * Наш ли это канал.
 */
function isOurChannel(chat: TgChat, config: WebhookConfig): boolean {
  if (chat.type !== "channel") return false;
  if (config.channelId !== null) return chat.id === config.channelId;
  return chat.username?.toLowerCase() === config.channelUsername.toLowerCase();
}

/**
 * Лучшее фото поста: самое большое фото или превью видео/документа.
 * @returns фото или null, если в посте нет картинки
 */
export function pickPhoto(message: TgMessage): TgPhotoSize | null {
  if (message.photo && message.photo.length > 0) {
    return message.photo.reduce((best, p) => (p.width * p.height > best.width * best.height ? p : best));
  }
  return message.video?.thumbnail ?? message.animation?.thumbnail ?? message.document?.thumbnail ?? null;
}

/**
 * Путь фото в bucket. Зависит от file_unique_id, поэтому новое фото — новый путь.
 */
export function photoPath(tourId: number, fileUniqueId: string): string {
  return `tours/${tourId}-${fileUniqueId}.webp`;
}

/**
 * Скачивает фото из Telegram, сжимает и кладёт в Storage.
 * @returns путь в bucket
 * @throws TelegramApiError, если файл недоступен
 */
async function storePhoto(fileId: string, path: string, deps: WebhookDeps): Promise<string> {
  const file = await deps.bot.getFile(fileId);
  if (!file.file_path) throw new Error(`Telegram не отдал путь к файлу ${fileId}`);
  const original = await deps.bot.downloadFile(file.file_path);
  return deps.photos.upload(path, await deps.convertImage(original));
}

/**
 * Докачивает все фото альбома и записывает их в тур по порядку.
 */
async function syncAlbumPhotos(mediaGroupId: string, tourId: number, deps: WebhookDeps): Promise<void> {
  const media = (await deps.store.listChannelMedia(mediaGroupId)).slice(0, MAX_ALBUM_PHOTOS);
  const paths: string[] = [];
  for (const item of media) {
    if (item.storagePath) {
      paths.push(item.storagePath);
      continue;
    }
    const path = await storePhoto(item.fileId, photoPath(tourId, item.fileUniqueId), deps);
    await deps.store.setMediaStoragePath(item.messageId, path);
    paths.push(path);
  }
  await deps.store.setPhotos(tourId, paths);
}

/**
 * Новый или отредактированный пост канала.
 * Пост с #тур становится туром. Если хэштег убрали — тур скрывается.
 */
async function handleChannelPost(message: TgMessage, isEdit: boolean, deps: WebhookDeps): Promise<WebhookResult> {
  const { store, config } = deps;
  if (!isOurChannel(message.chat, config)) return ignored("foreign-chat");

  const text = message.text ?? message.caption ?? "";
  const photo = pickPhoto(message);
  const groupId = message.media_group_id ?? null;

  if (groupId && photo) {
    await store.addChannelMedia({
      messageId: message.message_id,
      mediaGroupId: groupId,
      fileId: photo.file_id,
      fileUniqueId: photo.file_unique_id,
    });
  }

  if (hasTourHashtag(text)) {
    const existing = await store.findTour(message.message_id);
    const parsed = parseTourPost({
      messageId: message.message_id,
      text,
      postedAt: new Date(message.date * 1000),
      channelUsername: config.channelUsername,
    });
    await store.upsertTour({ ...parsed, mediaGroupId: groupId, isVisible: true });

    if (groupId) {
      await syncAlbumPhotos(groupId, message.message_id, deps);
    } else if (photo) {
      const path = photoPath(message.message_id, photo.file_unique_id);
      if (existing?.photos[0] !== path) {
        await store.setPhotos(message.message_id, [await storePhoto(photo.file_id, path, deps)]);
      }
    }
    return { changed: true, action: existing ? "tour:updated" : "tour:created" };
  }

  // Из поста-тура убрали #тур — скрываем тур с сайта.
  if (isEdit) {
    const tour = await store.findTour(message.message_id);
    if (tour) {
      if (!tour.isVisible) return ignored("already-hidden");
      await store.setVisibility(tour.id, false);
      return { changed: true, action: "tour:hidden-no-hashtag" };
    }
  }

  // Фото из альбома без подписи: если подпись с #тур уже пришла, добавляем фото к туру.
  if (groupId) {
    const tour = await store.findTourByMediaGroup(groupId);
    if (tour) {
      await syncAlbumPhotos(groupId, tour.id, deps);
      return { changed: true, action: "tour:photo-added" };
    }
  }
  return ignored("no-hashtag");
}

/**
 * Текст и кнопки для управления туром из бота.
 */
function tourControls(tour: StoredTour, config: WebhookConfig): { text: string; buttons: TgInlineButton[][] } {
  const status = tour.isVisible ? "✅ Показывается на сайте" : "🙈 Скрыт с сайта";
  const text = `<b>${escapeTelegramHtml(tour.title)}</b>\n${status}`;
  const toggle: TgInlineButton = tour.isVisible
    ? { text: "Скрыть с сайта", callback_data: `tour:hide:${tour.id}` }
    : { text: "Показать на сайте", callback_data: `tour:show:${tour.id}` };
  return { text, buttons: [[toggle], [{ text: "Открыть на сайте", url: `${config.siteUrl}/tours/${tour.id}` }]] };
}

/**
 * Личные сообщения боту.
 * /start — показывает chat_id (его нужно добавить в ADMIN_CHAT_IDS).
 * Пересланный пост канала от администратора — показывает кнопки «Скрыть / Показать».
 */
async function handlePrivateMessage(message: TgMessage, deps: WebhookDeps): Promise<WebhookResult> {
  const { bot, store, config } = deps;
  if (message.chat.type !== "private") return ignored("not-private");
  const chatId = message.chat.id;
  const isAdmin = config.adminChatIds.includes(chatId);
  const origin = message.forward_origin;

  if (isAdmin && origin?.type === "channel" && isOurChannel(origin.chat, config)) {
    const tour = await store.findTour(origin.message_id);
    if (!tour) {
      await bot.sendMessage({
        chat_id: chatId,
        text: "Этого поста нет на сайте. Чтобы он стал туром, добавьте в него хэштег #тур.",
      });
      return { changed: false, action: "admin:tour-not-found" };
    }
    const { text, buttons } = tourControls(tour, config);
    await bot.sendMessage({ chat_id: chatId, text, parse_mode: "HTML", reply_markup: { inline_keyboard: buttons } });
    return { changed: false, action: "admin:tour-controls" };
  }

  const help = isAdmin
    ? [
        "Здравствуйте! Я бот сайта Jingle Tour.",
        "",
        "• Посты с хэштегом #тур сами появляются на сайте.",
        "• Чтобы скрыть или вернуть тур, перешлите мне этот пост из канала.",
        "• Новые заявки с сайта я присылаю сюда.",
      ].join("\n")
    : [
        "Здравствуйте! Это служебный бот сайта Jingle Tour.",
        `Чтобы подобрать тур, напишите нам: ${config.siteUrl}`,
        "",
        `Ваш chat_id: ${chatId}`,
      ].join("\n");
  await bot.sendMessage({ chat_id: chatId, text: help, link_preview_options: { is_disabled: true } });
  return { changed: false, action: isAdmin ? "admin:help" : "user:help" };
}

/**
 * Нажатие кнопок «Скрыть с сайта» / «Показать на сайте».
 */
async function handleCallback(query: TgCallbackQuery, deps: WebhookDeps): Promise<WebhookResult> {
  const { bot, store, config } = deps;
  if (!config.adminChatIds.includes(query.from.id)) {
    await bot.answerCallbackQuery({ callback_query_id: query.id, text: "Нет доступа" });
    return ignored("not-admin");
  }

  const match = /^tour:(hide|show):(\d+)$/.exec(query.data ?? "");
  if (!match) {
    await bot.answerCallbackQuery({ callback_query_id: query.id });
    return ignored("unknown-callback");
  }

  const visible = match[1] === "show";
  const tour = await store.setVisibility(Number(match[2]), visible);
  if (!tour) {
    await bot.answerCallbackQuery({ callback_query_id: query.id, text: "Тур не найден" });
    return { changed: false, action: "admin:tour-missing" };
  }

  await bot.answerCallbackQuery({
    callback_query_id: query.id,
    text: visible ? "Тур снова на сайте" : "Тур скрыт с сайта",
  });
  if (query.message) {
    const { text, buttons } = tourControls(tour, config);
    await bot.editMessageText({
      chat_id: query.message.chat.id,
      message_id: query.message.message_id,
      text,
      parse_mode: "HTML",
      reply_markup: { inline_keyboard: buttons },
    });
  }
  return { changed: true, action: visible ? "tour:shown" : "tour:hidden" };
}
