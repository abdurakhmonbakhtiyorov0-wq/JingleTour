import { escapeTelegramHtml } from "@/lib/telegram/bot-api";
import type { AviaRequest, TourRequest } from "@/lib/requests/schema";

export type RequestPayload = { kind: "tour"; data: TourRequest } | { kind: "avia"; data: AviaRequest };

/**
 * Поля заявки в читаемом виде, только заполненные.
 * @param payload - тип заявки и проверенные данные формы
 * @returns пары «подпись — значение»
 */
export function requestLines(payload: RequestPayload): [string, string][] {
  const lines: [string, string | undefined][] =
    payload.kind === "tour"
      ? [
          ["Тур", payload.data.tour],
          ["Отдых", payload.data.type],
          ["Куда", payload.data.where],
          ["Когда", payload.data.when],
          ["Ночей", payload.data.nights],
          ["Кто едет", [payload.data.adults, payload.data.kids].filter(Boolean).join(", ") || undefined],
          ["Бюджет", payload.data.budget],
        ]
      : [
          ["Откуда", payload.data.from],
          ["Куда", payload.data.to],
          ["Туда", payload.data.departDate],
          ["Обратно", payload.data.returnDate],
          ["Пассажиры", payload.data.passengers],
        ];
  return lines.filter((line): line is [string, string] => Boolean(line[1]));
}

/**
 * Уведомление маме в Telegram (parse_mode HTML).
 * @returns текст сообщения
 */
export function formatAdminNotification(payload: RequestPayload): string {
  const title = payload.kind === "tour" ? "🔔 Новая заявка на тур" : "✈️ Новая заявка на авиабилеты";
  const body = requestLines(payload)
    .map(([label, value]) => `${label}: ${escapeTelegramHtml(value)}`)
    .join("\n");
  const client = [payload.data.name, payload.data.contact]
    .filter((v): v is string => Boolean(v))
    .map(escapeTelegramHtml)
    .join(" · ");
  return `<b>${title}</b>\n\n${body ? `${body}\n\n` : ""}<b>Клиент:</b> ${client}`;
}

/**
 * Текст, который клиент может отправить в WhatsApp после заявки.
 * @returns простой текст без разметки
 */
export function formatClientMessage(payload: RequestPayload): string {
  const intro = payload.kind === "tour" ? "Здравствуйте! Хочу подобрать тур." : "Здравствуйте! Нужны авиабилеты.";
  return [intro, ...requestLines(payload).map(([label, value]) => `${label}: ${value}`)].join("\n");
}

/**
 * Ссылка на чат с клиентом, если он оставил ник в Telegram.
 * Для телефона ссылки нет: кнопки Telegram не открывают tel:.
 * @param contact - телефон или @username
 * @returns https://t.me/username или null
 */
export function contactLink(contact: string): string | null {
  const compact = contact.replace(/[\s()-]/g, "");
  if (/^\+?\d+$/.test(compact)) return null;
  const username = compact.replace(/^https?:\/\/t\.me\//i, "").replace(/^@/, "");
  return /^[a-z][a-z0-9_]{4,31}$/i.test(username) ? `https://t.me/${username}` : null;
}
