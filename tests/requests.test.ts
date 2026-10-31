import { describe, expect, it } from "vitest";
import { contactLink, formatAdminNotification } from "@/lib/requests/format";
import { isReachableContact, tourRequestSchema } from "@/lib/requests/schema";
import type { RequestStore } from "@/lib/requests/store";
import { HONEYPOT_FIELD, submitRequest, type SubmitDeps } from "@/lib/requests/submit";
import type { RequestInsert } from "@/lib/supabase/database.types";

class MemoryRequestStore implements RequestStore {
  rows: (RequestInsert & { id: string; notified: boolean })[] = [];
  recent = 0;
  async countSince() {
    return this.recent;
  }
  async insert(request: RequestInsert) {
    const id = `r${this.rows.length + 1}`;
    this.rows.push({ ...request, id, notified: false });
    return id;
  }
  async markNotified(id: string) {
    const row = this.rows.find((r) => r.id === id);
    if (row) row.notified = true;
  }
}

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [k, v] of Object.entries(fields)) data.set(k, v);
  return data;
}

function setup(overrides: Partial<SubmitDeps> = {}) {
  const store = new MemoryRequestStore();
  const sent: { text: string; replyUrl: string | null }[] = [];
  const tasks: Promise<void>[] = [];
  const deps: SubmitDeps = {
    store,
    notify: async (text, replyUrl) => {
      sent.push({ text, replyUrl });
      return 1;
    },
    schedule: (task) => {
      tasks.push(task());
    },
    ipHash: "hash",
    now: new Date("2026-11-01T10:00:00Z"),
    isProduction: true,
    ...overrides,
  };
  return { store, sent, tasks, deps };
}

describe("isReachableContact", () => {
  it.each(["+998 95 376 08 01", "998953760801", "@jingle_tour", "https://t.me/jingle_tour", "jingle_tour"])(
    "принимает %s",
    (value) => expect(isReachableContact(value)).toBe(true),
  );
  it.each(["123", "@ab", "привет", "+99 89"])("не принимает %s", (value) => expect(isReachableContact(value)).toBe(false));
});

describe("submitRequest", () => {
  it("сохраняет заявку, уведомляет маму и отмечает отправку", async () => {
    const { store, sent, tasks, deps } = setup();
    const state = await submitRequest(
      "tour",
      form({ where: "Дубай", when: "декабрь", adults: "2 взрослых", contact: "@client_name", name: "Анна" }),
      deps,
    );
    await Promise.all(tasks);
    expect(state.status).toBe("success");
    expect(store.rows[0]).toMatchObject({ kind: "tour", contact: "@client_name", name: "Анна", notified: true });
    expect(store.rows[0].details).toEqual({ Куда: "Дубай", Когда: "декабрь", "Кто едет": "2 взрослых" });
    expect(sent[0].text).toContain("Куда: Дубай");
    expect(sent[0].replyUrl).toBe("https://t.me/client_name");
    if (state.status === "success") expect(decodeURIComponent(state.whatsappUrl)).toContain("Куда: Дубай");
  });

  it("без контакта возвращает ошибку поля", async () => {
    const { store, deps } = setup();
    const state = await submitRequest("tour", form({ where: "Дубай", contact: "12" }), deps);
    expect(state.status).toBe("error");
    if (state.status === "error") expect(state.fieldErrors?.contact?.[0]).toMatch(/телефон/);
    expect(store.rows).toHaveLength(0);
  });

  it("авиабилеты требуют направление", async () => {
    const { deps } = setup();
    const state = await submitRequest("avia", form({ contact: "+998901234567" }), deps);
    expect(state.status === "error" && state.fieldErrors?.to).toBeTruthy();
  });

  it("бот, заполнивший ловушку, получает «успех», но заявка не сохраняется", async () => {
    const { store, sent, deps } = setup();
    const state = await submitRequest("tour", form({ contact: "+998901234567", [HONEYPOT_FIELD]: "spam.com" }), deps);
    expect(state.status).toBe("success");
    expect(store.rows).toHaveLength(0);
    expect(sent).toHaveLength(0);
  });

  it("ограничивает частые заявки с одного IP", async () => {
    const { store, deps } = setup();
    store.recent = 5;
    const state = await submitRequest("tour", form({ contact: "+998901234567" }), deps);
    expect(state.status).toBe("error");
    expect(store.rows).toHaveLength(0);
  });

  it("в продакшене без базы и бота честно сообщает об ошибке", async () => {
    const { deps } = setup({ store: null, notify: null });
    const state = await submitRequest("tour", form({ contact: "+998901234567" }), deps);
    expect(state.status).toBe("error");
  });

  it("если база упала, уведомление всё равно уходит", async () => {
    const { sent, tasks, deps } = setup({
      store: {
        countSince: async () => 0,
        insert: async () => {
          throw new Error("db down");
        },
        markNotified: async () => undefined,
      },
    });
    const state = await submitRequest("tour", form({ contact: "+998901234567" }), deps);
    await Promise.all(tasks);
    expect(state.status).toBe("success");
    expect(sent).toHaveLength(1);
  });
});

describe("formatAdminNotification", () => {
  it("экранирует HTML из формы", () => {
    const data = tourRequestSchema.parse({ where: "<b>Дубай</b>", contact: "+998901234567" });
    const text = formatAdminNotification({ kind: "tour", data });
    expect(text).toContain("&lt;b&gt;Дубай&lt;/b&gt;");
    expect(contactLink("+998901234567")).toBeNull();
  });
});
