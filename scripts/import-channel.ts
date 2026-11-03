/**
 * Импорт туров, опубликованных в канале до подключения бота.
 *
 *   npm run import:channel -- --dry-run                     # только показать, что найдено
 *   npm run import:channel -- --dry-run --out seed.json     # сохранить в JSON (так собран seed-tours.json)
 *   npm run import:channel -- --fixture tests/fixtures/channel-posts.json --dry-run
 *   npm run import:channel                                  # записать в Supabase (нужен .env.local)
 *
 * Берутся посты, похожие на туры (есть страна и цена, не для агентов), которые ещё не истекли.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { parseArgs } from "node:util";
import sharp from "sharp";
import { toWebp } from "@/lib/images/to-webp";
import { site } from "@/lib/site";
import { createAdminClient } from "@/lib/supabase/clients";
import { oldestPostId, parseChannelPage, type ChannelWebPost } from "@/lib/telegram/channel-web";
import { looksLikeTour, parseTourPost } from "@/lib/telegram/parse-post";
import { MIN_PHOTO_WIDTH } from "@/lib/telegram/webhook";
import { createSupabasePhotoStorage, createSupabaseTourStore } from "@/lib/tours/supabase-store";
import type { Tour } from "@/lib/tours/types";

const MAX_PHOTOS = 4;
const PAGE_DELAY_MS = 800;

const { values: args } = parseArgs({
  options: {
    "dry-run": { type: "boolean", default: false },
    out: { type: "string" },
    fixture: { type: "string" },
    pages: { type: "string", default: "40" },
    "include-expired": { type: "boolean", default: false },
  },
});

/**
 * Пауза между запросами, чтобы не нагружать t.me.
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Загружает посты: из файла-фикстуры или со страниц t.me/s/<канал>.
 * @returns посты от новых к старым
 */
async function loadPosts(): Promise<ChannelWebPost[]> {
  if (args.fixture) {
    const raw = JSON.parse(readFileSync(args.fixture, "utf8")) as { id: number; date: string; text: string; photos: string[] }[];
    return raw.map((p) => ({ ...p, date: new Date(`${p.date}T09:00:00Z`).toISOString() }));
  }

  const all = new Map<number, ChannelWebPost>();
  let before: number | null = null;
  for (let page = 0; page < Number(args.pages); page++) {
    const url = `https://t.me/s/${site.channelUsername}${before ? `?before=${before}` : ""}`;
    const response = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 (JingleTour importer)" } });
    if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
    const posts = parseChannelPage(await response.text(), site.channelUsername);
    const oldest = oldestPostId(posts);
    if (oldest === null || oldest === before) break;
    for (const post of posts) all.set(post.id, post);
    console.log(`страница ${page + 1}: посты ${oldest}…${Math.max(...posts.map((p) => p.id))}`);
    before = oldest;
    await sleep(PAGE_DELAY_MS);
  }
  return [...all.values()].sort((a, b) => b.id - a.id);
}

/**
 * Скачивает фото поста с CDN Telegram, сжимает и загружает в Storage.
 * Ошибка одного фото не останавливает импорт.
 * @returns пути в bucket
 */
async function importPhotos(post: ChannelWebPost, upload: (path: string, data: Buffer) => Promise<string>): Promise<string[]> {
  const paths: string[] = [];
  for (const [index, url] of post.photos.slice(0, MAX_PHOTOS).entries()) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const original = Buffer.from(await response.arrayBuffer());
      const { width = 0 } = await sharp(original).metadata();
      if (width < MIN_PHOTO_WIDTH) {
        console.log(`  фото ${index + 1} поста ${post.id} пропущено: ширина ${width}px`);
        continue;
      }
      paths.push(await upload(`tours/${post.id}-import-${index}.webp`, await toWebp(original)));
    } catch (error) {
      console.warn(`  фото ${index + 1} поста ${post.id} пропущено:`, error instanceof Error ? error.message : error);
    }
  }
  return paths;
}

async function main(): Promise<void> {
  const now = Date.now();
  const posts = await loadPosts();
  const tours: Tour[] = posts
    .filter((p) => p.text && looksLikeTour(p.text))
    .map((p) => ({
      ...parseTourPost({ messageId: p.id, text: p.text, postedAt: new Date(p.date), channelUsername: site.channelUsername }),
      photos: [],
    }))
    .filter((t) => args["include-expired"] || new Date(t.expiresAt).getTime() > now);

  console.log(`Постов: ${posts.length}, туров к импорту: ${tours.length}`);
  for (const t of tours) console.log(`  ${t.id} · ${t.countrySlug ?? "—"} · ${t.priceFrom ?? "?"} ${t.currency ?? ""} · ${t.title}`);

  if (args["dry-run"]) {
    if (args.out) {
      writeFileSync(args.out, `${JSON.stringify(tours, null, 2)}\n`);
      console.log(`Сохранено в ${args.out}`);
    }
    return;
  }

  const db = createAdminClient();
  const store = createSupabaseTourStore(db);
  const storage = createSupabasePhotoStorage(db);
  const byId = new Map(posts.map((p) => [p.id, p]));
  for (const tour of tours) {
    const post = byId.get(tour.id);
    const photos = post ? await importPhotos(post, (path, data) => storage.upload(path, data)) : [];
    await store.upsertTour({ ...tour, photos, mediaGroupId: null, isVisible: true });
    console.log(`  ✓ ${tour.id} (${photos.length} фото)`);
  }
  console.log("Готово. Кеш сайта обновится сам в течение часа или после следующего поста с #тур.");
}

main().catch((error: unknown) => {
  console.error("Импорт не удался:", error);
  process.exitCode = 1;
});
