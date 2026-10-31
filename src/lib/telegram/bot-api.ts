import type { TgFile, TgInlineButton, TgMessage } from "@/lib/telegram/types";

const API_ROOT = "https://api.telegram.org";
const TIMEOUT_MS = 15_000;

export class TelegramApiError extends Error {
  constructor(
    readonly method: string,
    readonly description: string,
    readonly status?: number,
  ) {
    super(`Telegram ${method}: ${description}`);
    this.name = "TelegramApiError";
  }
}

export interface SendMessageParams {
  chat_id: number;
  text: string;
  parse_mode?: "HTML";
  reply_markup?: { inline_keyboard: TgInlineButton[][] };
  link_preview_options?: { is_disabled: boolean };
}

export interface EditMessageTextParams extends SendMessageParams {
  message_id: number;
}

export interface BotApi {
  sendMessage(params: SendMessageParams): Promise<TgMessage>;
  editMessageText(params: EditMessageTextParams): Promise<void>;
  answerCallbackQuery(params: { callback_query_id: string; text?: string }): Promise<void>;
  getFile(fileId: string): Promise<TgFile>;
  downloadFile(filePath: string): Promise<Buffer>;
}

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

/**
 * Клиент Telegram Bot API.
 * @param token - токен бота от @BotFather
 * @param fetchImpl - fetch; в тестах подменяется
 * @returns объект с методами Bot API, которые нужны сайту
 */
export function createBotApi(token: string, fetchImpl: FetchLike = fetch): BotApi {
  /**
   * Вызывает метод Bot API и возвращает поле result.
   * @throws TelegramApiError, если Telegram ответил ошибкой или запрос не прошёл
   */
  async function call<T>(method: string, params: object): Promise<T> {
    let response: Response;
    try {
      response = await fetchImpl(`${API_ROOT}/bot${token}/${method}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(params),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    } catch (error) {
      throw new TelegramApiError(method, error instanceof Error ? error.message : "сеть недоступна");
    }

    let payload: { ok: boolean; result?: T; description?: string };
    try {
      payload = (await response.json()) as { ok: boolean; result?: T; description?: string };
    } catch {
      throw new TelegramApiError(method, `ответ не JSON (HTTP ${response.status})`, response.status);
    }
    if (!payload.ok || payload.result === undefined) {
      throw new TelegramApiError(method, payload.description ?? "неизвестная ошибка", response.status);
    }
    return payload.result;
  }

  return {
    sendMessage: (params) => call<TgMessage>("sendMessage", params),
    async editMessageText(params) {
      await call<unknown>("editMessageText", params);
    },
    async answerCallbackQuery(params) {
      await call<boolean>("answerCallbackQuery", params);
    },
    getFile: (fileId) => call<TgFile>("getFile", { file_id: fileId }),
    async downloadFile(filePath) {
      let response: Response;
      try {
        response = await fetchImpl(`${API_ROOT}/file/bot${token}/${filePath}`, {
          signal: AbortSignal.timeout(TIMEOUT_MS),
        });
      } catch (error) {
        throw new TelegramApiError("downloadFile", error instanceof Error ? error.message : "сеть недоступна");
      }
      if (!response.ok) throw new TelegramApiError("downloadFile", `HTTP ${response.status}`, response.status);
      return Buffer.from(await response.arrayBuffer());
    },
  };
}

/**
 * Экранирует текст для parse_mode HTML.
 * @param text - любой текст
 * @returns текст, безопасный для вставки в сообщение Telegram
 */
export function escapeTelegramHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
