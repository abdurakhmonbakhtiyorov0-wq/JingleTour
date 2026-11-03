import { beforeEach, describe, expect, it } from "vitest";
import type { TgMessage, TgUpdate } from "@/lib/telegram/types";
import { handleUpdate, type WebhookDeps } from "@/lib/telegram/webhook";
import { FakeBot, MemoryPhotoStorage, MemoryTourStore } from "./helpers/fakes";

const CHANNEL = { id: -1001234567890, type: "channel" as const, username: "jingle_tour" };
const MOM = 555;
const DATE = Math.floor(new Date("2026-11-01T09:00:00Z").getTime() / 1000);
const TOUR_TEXT = "🇹🇭 Пхукет — 7 ночей\nВылет 05.12.2026\nот 1 011 $\n#тур";

let store: MemoryTourStore;
let bot: FakeBot;
let photos: MemoryPhotoStorage;
let deps: WebhookDeps;
let updateId = 0;

function post(message_id: number, extra: Partial<TgMessage> = {}): TgMessage {
  return { message_id, date: DATE, chat: CHANNEL, ...extra };
}
function photo(id: string) {
  return [
    { file_id: `${id}-small`, file_unique_id: `${id}-s`, width: 90, height: 60 },
    { file_id: id, file_unique_id: `${id}-u`, width: 1280, height: 853 },
  ];
}
const run = (u: Omit<TgUpdate, "update_id">) => handleUpdate({ update_id: ++updateId, ...u }, deps);

beforeEach(() => {
  store = new MemoryTourStore();
  bot = new FakeBot();
  photos = new MemoryPhotoStorage();
  deps = {
    bot,
    store,
    photos,
    convertImage: async (input) => Buffer.concat([Buffer.from("webp:"), input]),
    config: { channelId: CHANNEL.id, channelUsername: "jingle_tour", adminChatIds: [MOM], siteUrl: "https://jingle.example" },
  };
});

describe("посты канала", () => {
  it("пост с #тур становится туром с фото", async () => {
    const result = await run({ channel_post: post(100, { caption: TOUR_TEXT, photo: photo("p1") }) });
    expect(result).toEqual({ changed: true, action: "tour:created" });
    const tour = store.tours.get(100);
    expect(tour).toMatchObject({ countrySlug: "thailand", priceFrom: 1011, nights: 7, isVisible: true });
    expect(tour?.photos).toEqual(["tours/100-p1-u.webp"]);
    expect(photos.uploads.get("tours/100-p1-u.webp")?.toString()).toBe("webp:photos/p1.jpg");
  });

  it("мелкое превью видео не сохраняется, тур создаётся без фото", async () => {
    const thumbnail = { file_id: "v1", file_unique_id: "v1-u", width: 175, height: 320 };
    const result = await run({ channel_post: post(103, { caption: TOUR_TEXT, video: { file_id: "v", file_unique_id: "v-u", thumbnail } }) });
    expect(result.action).toBe("tour:created");
    expect(store.tours.get(103)?.photos).toEqual([]);
    expect(photos.uploads.size).toBe(0);
  });

  it("фото меньше минимальной ширины не сохраняется", async () => {
    const small = [{ file_id: "s1", file_unique_id: "s1-u", width: 320, height: 240 }];
    await run({ channel_post: post(104, { caption: TOUR_TEXT, photo: small }) });
    expect(store.tours.get(104)?.photos).toEqual([]);
    expect(photos.uploads.size).toBe(0);
  });

  it("пост без #тур не трогает сайт", async () => {
    const result = await run({ channel_post: post(101, { text: "Поздравляем с праздником!" }) });
    expect(result.changed).toBe(false);
    expect(store.tours.size).toBe(0);
  });

  it("посты из чужого канала игнорируются", async () => {
    const result = await run({ channel_post: { ...post(102, { text: TOUR_TEXT }), chat: { id: -100999, type: "channel" } } });
    expect(result.action).toBe("ignored:foreign-chat");
  });

  it("если убрать #тур при редактировании, тур скрывается, а если вернуть — показывается", async () => {
    await run({ channel_post: post(103, { text: TOUR_TEXT }) });
    expect((await run({ edited_channel_post: post(103, { text: "Мест нет" }) })).action).toBe("tour:hidden-no-hashtag");
    expect(store.tours.get(103)?.isVisible).toBe(false);
    expect((await run({ edited_channel_post: post(103, { text: TOUR_TEXT.replace("1 011", "990") }) })).action).toBe(
      "tour:updated",
    );
    expect(store.tours.get(103)).toMatchObject({ isVisible: true, priceFrom: 990 });
  });

  it("при правке текста то же фото не загружается заново", async () => {
    await run({ channel_post: post(104, { caption: TOUR_TEXT, photo: photo("p1") }) });
    await run({ edited_channel_post: post(104, { caption: `${TOUR_TEXT}\nОсталось 2 места`, photo: photo("p1") }) });
    expect(bot.downloads).toEqual(["photos/p1.jpg"]);
  });

  it("альбом: фото до и после подписи собираются по порядку", async () => {
    const group = { media_group_id: "album-1" };
    await run({ channel_post: post(200, { ...group, photo: photo("a") }) });
    await run({ channel_post: post(201, { ...group, photo: photo("b"), caption: TOUR_TEXT }) });
    await run({ channel_post: post(202, { ...group, photo: photo("c") }) });
    expect(store.tours.get(201)?.photos).toEqual([
      "tours/201-a-u.webp",
      "tours/201-b-u.webp",
      "tours/201-c-u.webp",
    ]);
    expect(bot.downloads).toHaveLength(3);
  });

  it("альбом без #тур не скачивает фото", async () => {
    await run({ channel_post: post(300, { media_group_id: "album-2", photo: photo("x"), caption: "Просто фото" }) });
    expect(bot.downloads).toEqual([]);
  });
});

describe("бот для мамы", () => {
  it("пересланный пост показывает кнопку «Скрыть с сайта»", async () => {
    await run({ channel_post: post(400, { text: TOUR_TEXT }) });
    await run({
      message: {
        message_id: 1,
        date: DATE,
        chat: { id: MOM, type: "private" },
        forward_origin: { type: "channel", date: DATE, chat: CHANNEL, message_id: 400 },
      },
    });
    const buttons = bot.sent[0].reply_markup?.inline_keyboard.flat() ?? [];
    expect(buttons[0]).toEqual({ text: "Скрыть с сайта", callback_data: "tour:hide:400" });
    expect(buttons[1].url).toBe("https://jingle.example/tours/400");
  });

  it("кнопка скрывает тур и обновляет сообщение", async () => {
    await run({ channel_post: post(401, { text: TOUR_TEXT }) });
    const result = await run({
      callback_query: {
        id: "cb1",
        from: { id: MOM, is_bot: false, first_name: "Мама" },
        data: "tour:hide:401",
        message: { message_id: 7, date: DATE, chat: { id: MOM, type: "private" } },
      },
    });
    expect(result).toEqual({ changed: true, action: "tour:hidden" });
    expect(store.tours.get(401)?.isVisible).toBe(false);
    expect(bot.answers[0].text).toBe("Тур скрыт с сайта");
    expect(bot.edited[0].reply_markup?.inline_keyboard[0][0].callback_data).toBe("tour:show:401");
  });

  it("чужой человек не может нажимать кнопки", async () => {
    await run({ channel_post: post(402, { text: TOUR_TEXT }) });
    const result = await run({
      callback_query: { id: "cb2", from: { id: 999, is_bot: false, first_name: "X" }, data: "tour:hide:402" },
    });
    expect(result.changed).toBe(false);
    expect(store.tours.get(402)?.isVisible).toBe(true);
    expect(bot.answers[0].text).toBe("Нет доступа");
  });

  it("/start от незнакомца показывает его chat_id", async () => {
    await run({ message: { message_id: 1, date: DATE, chat: { id: 777, type: "private" }, text: "/start" } });
    expect(bot.sent[0].text).toContain("Ваш chat_id: 777");
  });
});
