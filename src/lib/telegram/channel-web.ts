/**
 * Разбор публичной веб-версии канала t.me/s/<username>.
 * Нужен один раз — чтобы импортировать туры, опубликованные до подключения бота.
 */

export interface ChannelWebPost {
  id: number;
  /** ISO-дата публикации. */
  date: string;
  text: string;
  photos: string[];
}

const ENTITIES: Readonly<Record<string, string>> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

/**
 * Декодирует HTML-сущности: &amp;, &#39;, &#x1F525; и т. п.
 * @param text - текст с сущностями
 * @returns обычный текст
 */
export function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, code: string) => {
    if (code[0] === "#") {
      const n = code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(n) && n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : whole;
    }
    return ENTITIES[code.toLowerCase()] ?? whole;
  });
}

/**
 * Достаёт посты со страницы t.me/s/<username>.
 * @param html - HTML страницы
 * @param channelUsername - username канала без @
 * @returns посты в порядке появления на странице
 */
export function parseChannelPage(html: string, channelUsername: string): ChannelWebPost[] {
  const posts: ChannelWebPost[] = [];
  const idPattern = new RegExp(`data-post="${channelUsername}/(\\d+)"`, "i");

  for (const block of html.split('class="tgme_widget_message_wrap').slice(1)) {
    const id = idPattern.exec(block)?.[1];
    const date = /<time[^>]*datetime="([^"]+)"/.exec(block)?.[1];
    if (!id || !date) continue;

    const rawText = /<div class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/.exec(block)?.[1] ?? "";
    const text = decodeEntities(rawText.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "")).trim();
    const photos = [...block.matchAll(/background-image:url\('([^']+)'\)/g)]
      .map((m) => m[1])
      .filter((url) => url.startsWith("https://"));

    posts.push({ id: Number(id), date: new Date(date).toISOString(), text, photos: [...new Set(photos)] });
  }
  return posts;
}

/**
 * Самый маленький id на странице — от него грузится следующая (более старая) страница.
 * @param posts - посты страницы
 * @returns id или null для пустой страницы
 */
export function oldestPostId(posts: readonly ChannelWebPost[]): number | null {
  return posts.length > 0 ? Math.min(...posts.map((p) => p.id)) : null;
}
