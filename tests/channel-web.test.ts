import { describe, expect, it } from "vitest";
import { decodeEntities, oldestPostId, parseChannelPage } from "@/lib/telegram/channel-web";

const html = `
<div class="tgme_widget_message_wrap js-widget_message_wrap">
  <div class="tgme_widget_message" data-post="jingle_tour/3013">
    <a class="tgme_widget_message_photo_wrap" style="width:800px;background-image:url('https://cdn4.telesco.pe/file/abc.jpg')"></a>
    <div class="tgme_widget_message_text js-message_text" dir="auto">Чэнду &amp; Чунцин<br/>от <b>1156$</b> &#128293;</div>
    <time datetime="2026-10-28T04:24:00+00:00" class="time">04:24</time>
  </div>
</div>
<div class="tgme_widget_message_wrap js-widget_message_wrap">
  <div class="tgme_widget_message" data-post="jingle_tour/3011">
    <time datetime="2026-10-27T15:27:00+00:00" class="time">15:27</time>
  </div>
</div>`;

describe("parseChannelPage", () => {
  it("достаёт id, дату, текст и фото", () => {
    const posts = parseChannelPage(html, "jingle_tour");
    expect(posts).toHaveLength(2);
    expect(posts[0]).toEqual({
      id: 3013,
      date: "2026-10-28T04:24:00.000Z",
      text: "Чэнду & Чунцин\nот 1156$ 🔥",
      photos: ["https://cdn4.telesco.pe/file/abc.jpg"],
    });
    expect(posts[1].text).toBe("");
    expect(oldestPostId(posts)).toBe(3011);
  });

  it("пустая страница — нет старых постов", () => {
    expect(oldestPostId(parseChannelPage("<html></html>", "jingle_tour"))).toBeNull();
  });
});

describe("decodeEntities", () => {
  it("декодирует именованные и числовые сущности", () => {
    expect(decodeEntities("&lt;b&gt; &#39;x&#39; &#x1F525; &unknown;")).toBe("<b> 'x' 🔥 &unknown;");
  });
});
