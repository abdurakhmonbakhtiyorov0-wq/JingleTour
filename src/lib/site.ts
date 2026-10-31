/** Контакты и постоянные данные агентства. Меняются здесь — и сразу на всём сайте. */
export const site = {
  name: "Jingle Tour",
  description:
    "Пляжные, экскурсионные и лечебные туры из Ташкента. Подберём тур под ваш бюджет и пришлём варианты в Telegram или WhatsApp.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  city: "Ташкент",
  yearsInBusiness: 5,
  hours: "Каждый день с 8:00 до 20:00",
  phone: "+998 95 376 08 01",
  phoneHref: "tel:+998953760801",
  whatsappNumber: "998953760801",
  telegramChat: "https://t.me/+998953760801",
  channelUsername: "jingle_tour",
  channelUrl: "https://t.me/jingle_tour",
  instagramUrl: "https://www.instagram.com/noza_asa",
  payment: "Наличными или картой",
  airlines: ["Uzbekistan Airways", "Centrum Air", "Qanot Sharq", "SunExpress"],
  operators: [
    "Kompas",
    "FUN&SUN",
    "Crystal Bay",
    "Centrum Holidays",
    "Asia Luxe Travel",
    "Kazunion",
    "Selfie Travel",
    "Prestige",
    "Fly Khiva",
    "Mir Jahon",
    "Unit Travel",
  ],
  /** Посты канала с видео-отзывами туристов. */
  reviewPosts: [2630, 2445, 2672],
} as const;

/**
 * Ссылка на WhatsApp с готовым текстом сообщения.
 * @param text - текст, который появится в поле ввода
 * @returns ссылка вида https://wa.me/998...?text=...
 */
export function whatsappLink(text: string): string {
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(text)}`;
}
