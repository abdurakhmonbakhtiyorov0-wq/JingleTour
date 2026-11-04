import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { toWebp } from "@/lib/images/to-webp";
import { site } from "@/lib/site";
import { createAdminClient, isSupabaseWritable } from "@/lib/supabase/clients";
import { createBotApi } from "@/lib/telegram/bot-api";
import { readTelegramEnv } from "@/lib/telegram/env";
import type { TgUpdate } from "@/lib/telegram/types";
import { handleUpdate } from "@/lib/telegram/webhook";
import { TOURS_CACHE_TAG } from "@/lib/tours/cache";
import { createSupabasePhotoStorage, createSupabaseTourStore } from "@/lib/tours/supabase-store";

export const maxDuration = 60;

/**
 * Сравнивает секрет из заголовка с ожидаемым за постоянное время.
 * @returns true, если секрет совпал
 */
function secretMatches(received: string | null, expected: string): boolean {
  if (!received) return false;
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Проверяет, что тело похоже на апдейт Telegram.
 */
function isUpdate(value: unknown): value is TgUpdate {
  return typeof value === "object" && value !== null && typeof (value as { update_id?: unknown }).update_id === "number";
}

/**
 * Вебхук Telegram-бота: посты канала, правки, кнопки «Скрыть / Показать».
 * Ответ 500 заставит Telegram повторить апдейт — так переживаем временные сбои Supabase.
 */
export async function POST(request: Request): Promise<Response> {
  const env = readTelegramEnv();
  if (!env || !isSupabaseWritable()) {
    return Response.json({ ok: false, error: "Бот или Supabase не настроены" }, { status: 503 });
  }
  if (!secretMatches(request.headers.get("x-telegram-bot-api-secret-token"), env.webhookSecret)) {
    return Response.json({ ok: false, error: "Неверный секрет" }, { status: 401 });
  }

  let update: unknown;
  try {
    update = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Тело запроса — не JSON" }, { status: 400 });
  }
  if (!isUpdate(update)) {
    return Response.json({ ok: false, error: "Это не апдейт Telegram" }, { status: 400 });
  }

  const db = createAdminClient();
  try {
    const result = await handleUpdate(update, {
      bot: createBotApi(env.botToken),
      store: createSupabaseTourStore(db),
      photos: createSupabasePhotoStorage(db),
      convertImage: toWebp,
      config: {
        channelId: env.channelId,
        channelUsername: site.channelUsername,
        adminChatIds: env.adminChatIds,
        siteUrl: site.url,
      },
    });
    // expire: 0 — следующий посетитель сразу получит новые туры, а не старую копию
    if (result.changed) revalidateTag(TOURS_CACHE_TAG, { expire: 0 });
    return Response.json({ ok: true, action: result.action });
  } catch (error) {
    console.error("[telegram webhook] апдейт", update.update_id, "не обработан:", error);
    return Response.json({ ok: false, error: "Внутренняя ошибка" }, { status: 500 });
  }
}
