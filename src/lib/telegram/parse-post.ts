import { COUNTRIES, getCountry, type CountrySlug } from "@/lib/countries";
import type { Currency, ParsedTour, TourKind } from "@/lib/tours/types";

const DAY_MS = 86_400_000;
const TOUR_TTL_DAYS = 30;
const MAX_TTL_DAYS = 365;
const TITLE_MAX = 90;

const MONTHS: Readonly<Record<string, number>> = {
  января: 1,
  февраля: 2,
  марта: 3,
  апреля: 4,
  мая: 5,
  июня: 6,
  июля: 7,
  августа: 8,
  сентября: 9,
  октября: 10,
  ноября: 11,
  декабря: 12,
};

const PRICE_LIMITS: Readonly<Record<Currency, { min: number; max: number }>> = {
  USD: { min: 50, max: 50_000 },
  UZS: { min: 500_000, max: 1_000_000_000 },
};

/** Число с разделителями тысяч: «1 156», «1,011», «4.758» или просто «899». */
const NUM = String.raw`\d{1,3}(?:[ ,.]\d{3})+|\d+`;
const USD_AFTER = new RegExp(String.raw`(?<![\d.,])(${NUM})(?:[.,]\d{1,2})?\s*(?:\$|usd\b|у\.?\s?е\.?|долл)`, "giu");
const USD_BEFORE = new RegExp(String.raw`(?:\$|usd)\s*(${NUM})(?![\d])`, "giu");
const UZS_MLN = /(?<![\d.,])(\d{1,4}(?:[.,]\d{1,2})?)\s*млн/giu;
const UZS_PLAIN = new RegExp(String.raw`(?<![\d.,])(${NUM})\s*(?:сум|сўм|so['’]?m\b)`, "giu");

const DATE_FULL = /(?<![\d.])(\d{1,2})\.(\d{1,2})\.(\d{4}|\d{2})(?![\d])/g;
const DATE_SHORT = /(?<![\d.,])(\d{1,2})\.(\d{2})(?![.,\d])(?!\s*(?:млн|mln|тыс|%|\$|usd))/giu;
const DATE_WORDS =
  /(?<!\d)(\d{1,2})(?:\s*[-–—]\s*\d{1,2})?\s+(января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)(?:\s+(\d{4}))?/giu;
const RANGE_GLUE = /^\s*[-–—]\s*/;
/** Строки со сроками акций и бронирования: их даты — не вылеты. */
const PROMO_DATE_LINE = /(скидк|период\s+бронирования|бронир\p{L}*\s+до(?![\p{L}])|акци\p{L}*\s+(?:действует\s+)?до(?![\p{L}])|действует\s+до(?![\p{L}]))/iu;
/** Срок бронирования снимает тур с сайта, если в посте нет дат вылета. */
const BOOKING_DEADLINE_LINE = /(период\s+бронирования|бронир\p{L}*\s+до(?![\p{L}]))/iu;

const NIGHTS = /(?<!\d)(\d{1,2})\s*[-–]?\s*(?:ноч|night|kecha)/iu;
const DAYS = /(?<!\d)(\d{1,2})\s*[-–]?\s*(?:дн|дней|дня|дневн|kun)/iu;

const TOUR_HASHTAG = /(^|[^\p{L}\p{N}_])#тур(?![\p{L}\p{N}_])/iu;
const ANY_HASHTAG = /(^|\s)#[\p{L}\p{N}_]+/gu;
// \b в JS не работает с кириллицей, поэтому границы слов — через (?![\p{L}])
const B2B = /(коллег|турагент|агентств[уаом]?(?![\p{L}])|агентск|комисси)/iu;
const HEALTH = /(?<![\p{L}])(лечени|лечебн|санатори|оздоров|нафталан|карловы\s+вар|бальнео)/iu;
const EXCURSION =
  /(?<![\p{L}])(экскурсионн|маршрут|гид(?![\p{L}])|русскоговорящ|достопримечательност|сити-?тур|обзорн)|\d\s*-?\s*дневн/iu;
/** Строки с доплатами, скидками и детскими ценами — это не цена тура. */
const EXTRA_PRICE_LINE =
  /(скидк|доплат|single|сингл|одноместн|ребен|ребён|детск|младен|infant|child|чаев|депозит|предоплат|сбор|\d\s*[-–]?\s*\d*\s*лет(?![\p{L}]))/iu;

const EMOJI = /[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}\u{1F3FB}-\u{1F3FF}️‍⃣]/gu;

/** Слова, которые после перевода из капса снова пишутся с заглавной: страны и города. */
const PLACE_STEMS = [
  ...COUNTRIES.flatMap((c) => c.aliases.filter((a) => a.length >= 4 && /^[а-яё]/.test(a) && !a.includes(" "))),
  "ташкент",
  "самарканд",
  "бухар",
];
const PLACE_WORD = new RegExp(
  `(?<![\\p{L}])(?:${PLACE_STEMS.map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})[\\p{L}-]*`,
  "gu",
);

/** Алиас ищется только в начале слова: «баку» найдётся в «Баку», но не в «табаку». */
const COUNTRY_PATTERNS = COUNTRIES.map((country) => ({
  slug: country.slug,
  flag: country.flag,
  patterns: country.aliases.map(
    (alias) => new RegExp(`(?<![\\p{L}])${alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "gu"),
  ),
}));

export interface PriceMatch {
  amount: number;
  currency: Currency;
}

export interface ParseInput {
  messageId: number;
  text: string;
  postedAt: Date;
  channelUsername: string;
}

interface DateHit {
  date: Date;
  index: number;
  end: number;
}

/**
 * Приводит текст к единому виду: обычные пробелы и переводы строк.
 * @param text - исходный текст поста
 * @returns нормализованный текст
 */
function normalize(text: string): string {
  return text.replace(/[   ]/g, " ").replace(/\r\n?/g, "\n");
}

/**
 * Превращает «1 156», «1,011», «4.758» в число.
 * @param raw - число с разделителями тысяч
 * @returns число без разделителей
 */
function parseGroupedNumber(raw: string): number {
  return Number(raw.replace(/[ ,.]/g, ""));
}

/**
 * Проверяет, что пост помечен хэштегом #тур.
 * @param text - текст или подпись поста
 * @returns true, если в тексте есть отдельный хэштег #тур
 */
export function hasTourHashtag(text: string): boolean {
  return TOUR_HASHTAG.test(text);
}

/**
 * Проверяет, что пост адресован турагентам, а не туристам.
 * @param text - текст поста
 * @returns true для постов «Коллеги, …» и похожих
 */
export function isB2BPost(text: string): boolean {
  return B2B.test(text);
}

/**
 * Находит все цены в долларах и сумах.
 * @param text - текст поста
 * @returns список найденных цен в пределах разумных значений
 */
export function extractPrices(text: string): PriceMatch[] {
  const source = normalize(text)
    .split("\n")
    .filter((line) => !EXTRA_PRICE_LINE.test(line))
    .join("\n");
  const found: PriceMatch[] = [];
  const push = (amount: number, currency: Currency) => {
    const { min, max } = PRICE_LIMITS[currency];
    if (Number.isFinite(amount) && amount >= min && amount <= max) found.push({ amount, currency });
  };

  for (const m of source.matchAll(USD_AFTER)) push(parseGroupedNumber(m[1]), "USD");
  for (const m of source.matchAll(USD_BEFORE)) push(parseGroupedNumber(m[1]), "USD");
  for (const m of source.matchAll(UZS_MLN)) push(Math.round(Number(m[1].replace(",", ".")) * 1_000_000), "UZS");
  for (const m of source.matchAll(UZS_PLAIN)) push(parseGroupedNumber(m[1]), "UZS");
  return found;
}

/**
 * Выбирает цену «от»: минимальную в долларах, а если долларов нет — в сумах.
 * @param prices - найденные цены
 * @returns минимальная цена или null
 */
export function pickPriceFrom(prices: readonly PriceMatch[]): PriceMatch | null {
  for (const currency of ["USD", "UZS"] as const) {
    const amounts = prices.filter((p) => p.currency === currency).map((p) => p.amount);
    if (amounts.length > 0) return { amount: Math.min(...amounts), currency };
  }
  return null;
}

/**
 * Собирает дату и проверяет, что такой день существует.
 * @returns дата в UTC или null для «31.02»
 */
function makeDate(year: number, month: number, day: number): Date | null {
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCMonth() === month - 1 ? date : null;
}

/**
 * Год для даты без года: ближайший, при котором дата не сильно раньше публикации.
 */
function inferYear(month: number, day: number, postedAt: Date): number | null {
  const year = postedAt.getUTCFullYear();
  const sameYear = makeDate(year, month, day);
  if (!sameYear) return null;
  return sameYear.getTime() < postedAt.getTime() - 60 * DAY_MS ? year + 1 : year;
}

/**
 * Находит даты в тексте: «05.12.2026», «21.10», «2 декабря», «с 14 ноября 2026».
 * @returns даты с позициями в тексте, отсортированные по позиции
 */
function findDates(text: string, postedAt: Date): DateHit[] {
  const hits: DateHit[] = [];
  const add = (date: Date | null, index: number, length: number) => {
    if (date) hits.push({ date, index, end: index + length });
  };

  for (const m of text.matchAll(DATE_FULL)) {
    const yearRaw = Number(m[3]);
    const year = m[3].length === 2 ? 2000 + yearRaw : yearRaw;
    add(makeDate(year, Number(m[2]), Number(m[1])), m.index, m[0].length);
  }
  for (const m of text.matchAll(DATE_SHORT)) {
    const year = inferYear(Number(m[2]), Number(m[1]), postedAt);
    if (year !== null) add(makeDate(year, Number(m[2]), Number(m[1])), m.index, m[0].length);
  }
  for (const m of text.matchAll(DATE_WORDS)) {
    const month = MONTHS[m[2].toLowerCase()];
    const year = m[3] ? Number(m[3]) : inferYear(month, Number(m[1]), postedAt);
    if (year !== null) add(makeDate(year, month, Number(m[1])), m.index, m[0].length);
  }
  return hits.sort((a, b) => a.index - b.index);
}

/**
 * Разбирает даты: вылеты (первые даты диапазонов) и дату, до которой тур актуален.
 * @param text - текст поста
 * @param postedAt - время публикации
 * @returns даты вылета YYYY-MM-DD и дата истечения
 */
export function extractDates(text: string, postedAt: Date): { departures: string[]; expiresAt: Date } {
  const source = normalize(text);
  const lineOf = (index: number) => {
    const end = source.indexOf("\n", index);
    return source.slice(source.lastIndexOf("\n", index) + 1, end === -1 ? undefined : end);
  };
  const allDates = findDates(source, postedAt);
  const hits = allDates.filter((h) => !PROMO_DATE_LINE.test(lineOf(h.index)));
  const deadlines = allDates.filter((h) => BOOKING_DEADLINE_LINE.test(lineOf(h.index)));
  const rangeEnds = new Set<DateHit>();
  for (let i = 0; i < hits.length - 1; i++) {
    const glue = source.slice(hits[i].end, hits[i + 1].index);
    if (RANGE_GLUE.test(glue) && glue.replace(RANGE_GLUE, "").length === 0) rangeEnds.add(hits[i + 1]);
  }

  const notBefore = postedAt.getTime() - DAY_MS;
  const departures = [
    ...new Set(
      hits
        .filter((h) => !rangeEnds.has(h) && h.date.getTime() >= notBefore)
        .map((h) => h.date.toISOString().slice(0, 10)),
    ),
  ]
    .sort()
    .slice(0, 12);

  const latest = Math.max(...(hits.length > 0 ? hits : deadlines).map((h) => h.date.getTime()), Number.NEGATIVE_INFINITY);
  const fallback = postedAt.getTime() + TOUR_TTL_DAYS * DAY_MS;
  const cap = postedAt.getTime() + MAX_TTL_DAYS * DAY_MS;
  const expires = latest >= postedAt.getTime() ? Math.min(latest + DAY_MS, cap) : fallback;
  return { departures, expiresAt: new Date(expires) };
}

/**
 * Количество ночей: «7 ночей», а если указаны только дни — «8 дней» → 7 ночей.
 * @param text - текст поста
 * @returns число ночей или null
 */
export function extractNights(text: string): number | null {
  const nights = NIGHTS.exec(text);
  if (nights) {
    const n = Number(nights[1]);
    if (n >= 1 && n <= 60) return n;
  }
  const days = DAYS.exec(text);
  if (days) {
    const n = Number(days[1]);
    if (n >= 2 && n <= 21) return n - 1;
  }
  return null;
}

/**
 * Определяет страну по названиям городов, стран и флагам.
 * Если в посте три и больше стран — это подборка, и страна не выбирается.
 * @param text - текст поста
 * @returns slug страны или null
 */
export function detectCountry(text: string): CountrySlug | null {
  const lower = normalize(text).toLowerCase();
  const firstLine = lower.split("\n").find((line) => /\p{L}/u.test(line)) ?? "";
  const scores = new Map<CountrySlug, number>();

  for (const { slug, flag, patterns } of COUNTRY_PATTERNS) {
    let score = lower.includes(flag) ? 2 : 0;
    for (const pattern of patterns) {
      score += (lower.match(pattern)?.length ?? 0) + (firstLine.match(pattern)?.length ?? 0) * 2;
    }
    if (score > 0) scores.set(slug, score);
  }

  if (scores.size === 0 || scores.size >= 3) return null;
  return [...scores.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

/**
 * Тип отдыха по ключевым словам.
 * @param text - текст поста
 * @returns beach, excursion или health
 */
export function detectKind(text: string): TourKind {
  if (HEALTH.test(text)) return "health";
  if (EXCURSION.test(text)) return "excursion";
  return "beach";
}

/**
 * Удаляет эмодзи и флаги.
 * @param text - строка
 * @returns строка без эмодзи с одинарными пробелами
 */
export function stripEmoji(text: string): string {
  return text.replace(EMOJI, "").replace(/\s{2,}/g, " ").trim();
}

/**
 * Заголовок тура из первой содержательной строки поста.
 * Строки, написанные КАПСОМ, переводятся в обычный регистр.
 * @param text - текст поста
 * @param countrySlug - страна для запасного заголовка
 * @returns заголовок до 90 символов
 */
export function extractTitle(text: string, countrySlug: CountrySlug | null): string {
  const line = normalize(text)
    .replace(ANY_HASHTAG, "$1")
    .split("\n")
    .map((l) => stripEmoji(l).replace(/^[^\p{L}\p{N}«"(]+/u, "").replace(/[^\p{L}\p{N})»"?!]+$/u, ""))
    .find((l) => /\p{L}{3}/u.test(l));

  const country = getCountry(countrySlug);
  if (!line) return country ? `Тур в ${country.inName}` : "Тур";

  const letters = line.replace(/[^\p{L}]/gu, "");
  const upper = letters.replace(/[^\p{Lu}]/gu, "");
  let title = line;
  if (letters.length > 10 && upper.length / letters.length > 0.8) {
    const lower = line.toLowerCase().replace(PLACE_WORD, (word) => word.charAt(0).toUpperCase() + word.slice(1));
    title = lower.charAt(0).toUpperCase() + lower.slice(1);
  }
  if (title.length <= TITLE_MAX) return title;
  const cut = title.slice(0, TITLE_MAX);
  return `${cut.slice(0, cut.lastIndexOf(" ") > 40 ? cut.lastIndexOf(" ") : TITLE_MAX)}…`;
}

/**
 * Текст поста для страницы тура: без хэштегов и лишних пустых строк.
 * @param text - текст поста
 * @returns очищенный текст
 */
export function cleanBody(text: string): string {
  return normalize(text)
    .replace(ANY_HASHTAG, "$1")
    .split("\n")
    .map((l) => l.trimEnd())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Похож ли пост на тур, если хэштега нет (для импорта старых постов).
 * Тур — это пост для туристов с понятной страной и ценой.
 * @param text - текст поста
 * @returns true, если пост можно показать как тур
 */
export function looksLikeTour(text: string): boolean {
  if (isB2BPost(text)) return false;
  if (!pickPriceFrom(extractPrices(text))) return false;
  return detectCountry(text) !== null;
}

/**
 * Разбирает пост канала в тур.
 * @param input - id сообщения, текст, время публикации и username канала
 * @returns тур со всеми найденными полями; не найденные поля — null
 */
export function parseTourPost(input: ParseInput): ParsedTour {
  const countrySlug = detectCountry(input.text);
  const price = pickPriceFrom(extractPrices(input.text));
  const { departures, expiresAt } = extractDates(input.text, input.postedAt);

  return {
    id: input.messageId,
    title: extractTitle(input.text, countrySlug),
    body: cleanBody(input.text),
    countrySlug,
    kind: detectKind(input.text),
    priceFrom: price?.amount ?? null,
    currency: price?.currency ?? null,
    nights: extractNights(input.text),
    departureDates: departures,
    postUrl: `https://t.me/${input.channelUsername}/${input.messageId}`,
    postedAt: input.postedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };
}
