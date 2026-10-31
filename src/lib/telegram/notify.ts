import type { BotApi } from "@/lib/telegram/bot-api";

/**
 * Отправляет сообщение всем администраторам. Ошибка для одного не мешает остальным.
 * @param bot - клиент Bot API
 * @param adminChatIds - кому отправить
 * @param text - текст в формате HTML
 * @param replyUrl - ссылка для кнопки «Написать клиенту» или null
 * @returns сколько администраторов получили сообщение
 */
export async function notifyAdmins(
  bot: BotApi,
  adminChatIds: readonly number[],
  text: string,
  replyUrl: string | null,
): Promise<number> {
  let delivered = 0;
  for (const chatId of adminChatIds) {
    try {
      await bot.sendMessage({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        link_preview_options: { is_disabled: true },
        ...(replyUrl ? { reply_markup: { inline_keyboard: [[{ text: "Написать клиенту", url: replyUrl }]] } } : {}),
      });
      delivered++;
    } catch (error) {
      console.error(`[notify] не удалось отправить сообщение в чат ${chatId}:`, error);
    }
  }
  return delivered;
}
