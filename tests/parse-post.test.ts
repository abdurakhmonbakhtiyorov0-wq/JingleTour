import { describe, expect, it } from "vitest";
import posts from "./fixtures/channel-posts.json";
import {
  detectCountry,
  detectKind,
  extractDates,
  extractNights,
  extractPrices,
  extractTitle,
  hasTourHashtag,
  isB2BPost,
  looksLikeTour,
  parseTourPost,
  pickPriceFrom,
} from "@/lib/telegram/parse-post";

interface FixturePost {
  id: number;
  date: string;
  text: string;
  photos: string[];
}

const fixture = posts as FixturePost[];
const posted = new Date("2026-10-28T09:00:00Z");

function parseFixture(id: number) {
  const post = fixture.find((p) => p.id === id);
  if (!post) throw new Error(`В фикстуре нет поста ${id}`);
  return parseTourPost({
    messageId: post.id,
    text: post.text,
    postedAt: new Date(`${post.date}T09:00:00Z`),
    channelUsername: "jingle_tour",
  });
}

describe("hasTourHashtag", () => {
  it("находит #тур в любом регистре", () => {
    expect(hasTourHashtag("Дубай 392$ #тур")).toBe(true);
    expect(hasTourHashtag("#Тур\nДубай")).toBe(true);
  });
  it("не путает с другими хэштегами", () => {
    expect(hasTourHashtag("#туры #турция")).toBe(false);
    expect(hasTourHashtag("слово#тур")).toBe(false);
  });
});

describe("isB2BPost", () => {
  it("распознаёт посты для агентов", () => {
    expect(isB2BPost("Коллеги, открыто раннее бронирование")).toBe(true);
    expect(isB2BPost("Летим в Дубай по лучшим ценам")).toBe(false);
  });
});

describe("extractPrices / pickPriceFrom", () => {
  it("понимает разные записи долларов", () => {
    const amounts = extractPrices("от 392$\n1 156$\n1,011 USD\n$ 450\n4.758 USD").map((p) => p.amount);
    expect(amounts).toEqual(expect.arrayContaining([392, 1156, 1011, 450, 4758]));
  });
  it("понимает суммы в сумах", () => {
    expect(pickPriceFrom(extractPrices("JOYTRIP HOTEL 4* от 9,9 млн сум"))).toEqual({ amount: 9_900_000, currency: "UZS" });
    expect(pickPriceFrom(extractPrices("Concorde Deira: 5 036 000 сум"))).toEqual({ amount: 5_036_000, currency: "UZS" });
  });
  it("предпочитает доллары и берёт минимальную цену", () => {
    expect(pickPriceFrom(extractPrices("5 036 000 сум (421$)\n7 178 000 сум (600$)"))).toEqual({ amount: 421, currency: "USD" });
  });
  it("пропускает доплаты, скидки и детские цены", () => {
    const text = "Тур 899 USD\n🛏 Single размещение - 250 USD\n2 - 7 лет скидка 150 USD\nДоплата за вид на море 100$";
    expect(pickPriceFrom(extractPrices(text))).toEqual({ amount: 899, currency: "USD" });
  });
  it("не считает звёзды и годы ценой", () => {
    expect(extractPrices("Отель 5* 2026 года")).toEqual([]);
  });
});

describe("extractDates", () => {
  it("берёт начало диапазона как вылет", () => {
    const { departures, expiresAt } = extractDates("Даты: 05.12.2026–13.12.2026", posted);
    expect(departures).toEqual(["2026-12-05"]);
    expect(expiresAt.toISOString().slice(0, 10)).toBe("2026-12-14");
  });
  it("понимает даты словами и подбирает год", () => {
    expect(extractDates("Вылет 2 декабря", posted).departures).toEqual(["2026-12-02"]);
    expect(extractDates("Вылет 15 января", posted).departures).toEqual(["2027-01-15"]);
  });
  it("понимает даты без года", () => {
    expect(extractDates("21.10–28.10, 04.11–11.11", posted).departures).toEqual(["2026-11-04"]);
  });
  it("не принимает цены за даты", () => {
    expect(extractDates("от 12.5 млн сум", posted).departures).toEqual([]);
  });
  it("без дат тур живёт 30 дней", () => {
    const { departures, expiresAt } = extractDates("Летим в Дубай", posted);
    expect(departures).toEqual([]);
    expect(expiresAt.toISOString().slice(0, 10)).toBe("2026-11-27");
  });
});

describe("extractNights", () => {
  it("берёт ночи", () => {
    expect(extractNights("7 ночей / 8 дней")).toBe(7);
  });
  it("переводит дни в ночи", () => {
    expect(extractNights("8-дневный тур по Турции")).toBe(7);
  });
  it("игнорирует сроки бронирования", () => {
    expect(extractNights("Бронирование за 42 / 62 / 92+ дня до заезда")).toBeNull();
  });
});

describe("detectCountry", () => {
  it("находит страну по городу", () => {
    expect(detectCountry("Нафталан + Баку")).toBe("azerbaijan");
    expect(detectCountry("Пхукет — тот самый отпуск")).toBe("thailand");
  });
  it("ищет только с начала слова", () => {
    expect(detectCountry("Привезите табаку")).toBeNull();
  });
  it("не выбирает страну для подборки из трёх стран", () => {
    expect(detectCountry("🇲🇻 Мальдивы\n🇹🇷 Турция\n🇹🇭 Таиланд")).toBeNull();
  });
});

describe("detectKind", () => {
  it("«развлечения» — не лечение", () => {
    expect(detectKind("Развлечения для всей семьи")).toBe("beach");
  });
  it("распознаёт лечебные и экскурсионные туры", () => {
    expect(detectKind("Лечебный тур в Нафталан")).toBe("health");
    expect(detectKind("8-дневный тур с гидом")).toBe("excursion");
  });
});

describe("extractTitle", () => {
  it("убирает эмодзи и переводит капс в обычный регистр", () => {
    expect(extractTitle("🌿КАРЛОВЫ ВАРЫ | РАННЕЕ БРОНИРОВАНИЕ 2026 🇨🇿", "czechia")).toBe(
      "Карловы вары | раннее бронирование 2026",
    );
  });
  it("возвращает заглавные буквы городам и странам", () => {
    expect(extractTitle("ФУКУОК ИЗ ТАШКЕНТА!", "vietnam")).toBe("Фукуок из Ташкента!");
    expect(extractTitle("МЕГА ТУР ПО ТУРЦИИ 2026", "turkey")).toBe("Мега тур по Турции 2026");
  });
  it("даёт запасной заголовок", () => {
    expect(extractTitle("💎💎💎", "turkey")).toBe("Тур в Турцию");
  });
});

describe("настоящие посты канала", () => {
  it("Китай, 3013", () => {
    const t = parseFixture(3013);
    expect(t).toMatchObject({ countrySlug: "china", kind: "excursion", priceFrom: 1156, currency: "USD", nights: 7 });
    expect(t.departureDates).toEqual(["2026-12-02"]);
    expect(t.title).toBe("Чэнду → Чжанцзяцзе → Чунцин");
  });
  it("Пхукет, 3011", () => {
    expect(parseFixture(3011)).toMatchObject({ countrySlug: "thailand", priceFrom: 1011, currency: "USD" });
  });
  it("Лангкави, 2972", () => {
    const t = parseFixture(2972);
    expect(t).toMatchObject({ countrySlug: "malaysia", priceFrom: 953, nights: 7 });
    expect(t.departureDates).toEqual(["2026-11-14"]);
  });
  it("Нафталан + Баку, 3003", () => {
    expect(parseFixture(3003)).toMatchObject({ countrySlug: "azerbaijan", kind: "health", priceFrom: 1163, nights: 11 });
  });
  it("Дубай, 3002 — пляжный, а не лечебный", () => {
    expect(parseFixture(3002)).toMatchObject({ countrySlug: "uae", kind: "beach", priceFrom: 392 });
  });
  it("Шри-Ланка, 2994", () => {
    expect(parseFixture(2994)).toMatchObject({ countrySlug: "sri-lanka", priceFrom: 4758 });
  });
  it("посты для агентов не становятся турами", () => {
    const b2b = fixture.filter((p) => p.text && isB2BPost(p.text));
    expect(b2b.length).toBeGreaterThan(0);
    for (const post of b2b) expect(looksLikeTour(post.text)).toBe(false);
  });
  it("разбирает большую часть постов с ценой и страной", () => {
    const tours = fixture.filter((p) => p.text && looksLikeTour(p.text));
    expect(tours.length).toBeGreaterThan(300);
    for (const post of tours) {
      const t = parseTourPost({
        messageId: post.id,
        text: post.text,
        postedAt: new Date(`${post.date}T09:00:00Z`),
        channelUsername: "jingle_tour",
      });
      expect(t.title.length).toBeGreaterThan(2);
      expect(t.priceFrom).not.toBeNull();
      expect(new Date(t.expiresAt).getTime()).toBeGreaterThan(new Date(t.postedAt).getTime());
    }
  });
});
