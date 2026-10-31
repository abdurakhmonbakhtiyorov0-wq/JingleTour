import { z } from "zod";

const PHONE_DIGITS_MIN = 7;
const TELEGRAM_USERNAME = /^@?[a-z][a-z0-9_]{4,31}$/i;

/**
 * Телефон (не меньше 7 цифр) или ник в Telegram (@username).
 * @param value - то, что ввёл клиент
 * @returns true, если с клиентом можно связаться
 */
export function isReachableContact(value: string): boolean {
  const compact = value.replace(/[\s()-]/g, "");
  if (/^\+?\d+$/.test(compact)) return compact.replace(/\D/g, "").length >= PHONE_DIGITS_MIN;
  return TELEGRAM_USERNAME.test(compact.replace(/^https?:\/\/t\.me\//i, ""));
}

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Не длиннее ${max} символов`)
    .optional()
    .transform((v) => v || undefined);

const contact = z
  .string({ error: "Укажите телефон или ник в Telegram" })
  .trim()
  .min(1, "Укажите телефон или ник в Telegram")
  .max(100, "Слишком длинный контакт")
  .refine(isReachableContact, "Похоже, тут ошибка: нужен телефон (+998 …) или ник в Telegram (@…)");

export const tourRequestSchema = z.object({
  type: optionalText(40),
  where: optionalText(120),
  when: optionalText(80),
  nights: optionalText(20),
  adults: optionalText(30),
  kids: optionalText(30),
  budget: optionalText(60),
  tour: optionalText(160),
  name: optionalText(80),
  contact,
});

export const aviaRequestSchema = z.object({
  from: optionalText(60).transform((v) => v ?? "Ташкент"),
  to: z.string({ error: "Куда летим?" }).trim().min(2, "Куда летим?").max(60, "Не длиннее 60 символов"),
  departDate: optionalText(20),
  returnDate: optionalText(20),
  passengers: optionalText(30),
  name: optionalText(80),
  contact,
});

export type TourRequest = z.infer<typeof tourRequestSchema>;
export type AviaRequest = z.infer<typeof aviaRequestSchema>;
