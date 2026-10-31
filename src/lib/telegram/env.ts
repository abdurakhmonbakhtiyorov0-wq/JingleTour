export interface TelegramEnv {
  botToken: string;
  webhookSecret: string;
  channelId: number | null;
  adminChatIds: number[];
}

/**
 * Разбирает список chat_id через запятую: «123, 456».
 * @param raw - значение ADMIN_CHAT_IDS
 * @returns массив чисел; нечисловые значения отбрасываются
 */
export function parseChatIds(raw: string | undefined): number[] {
  return (raw ?? "")
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isSafeInteger(n) && n !== 0);
}

/**
 * Настройки бота из переменных окружения.
 * @returns настройки или null, если бот ещё не подключён (нет токена или секрета)
 */
export function readTelegramEnv(): TelegramEnv | null {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!botToken || !webhookSecret) return null;
  const channelId = Number(process.env.TELEGRAM_CHANNEL_ID);
  return {
    botToken,
    webhookSecret,
    channelId: Number.isSafeInteger(channelId) && channelId !== 0 ? channelId : null,
    adminChatIds: parseChatIds(process.env.ADMIN_CHAT_IDS),
  };
}
