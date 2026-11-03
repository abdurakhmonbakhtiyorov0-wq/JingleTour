import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/**
 * Проверяем миграции на PGlite (настоящий Postgres без Docker).
 * Storage-миграцию не накатываем: схемы storage есть только в Supabase.
 */
const migrations = ["20261101000000_init.sql", "20261101000200_grants.sql"].map((file) =>
  readFileSync(join(__dirname, "../supabase/migrations", file), "utf8"),
);
const db = new PGlite();

const tour = (id: number, extra = "") => `
  insert into public.tours (id, title, post_url, posted_at, expires_at${extra ? ", is_visible" : ""})
  values (${id}, 'Тур ${id}', 'https://t.me/jingle_tour/${id}', now(), now() + interval '10 days'${extra})`;

beforeAll(async () => {
  await db.exec(`
    create role anon nologin;
    create role authenticated nologin;
    create role service_role nologin bypassrls;
    grant usage on schema public to anon, authenticated, service_role;
  `);
  // Права только из миграций: в новых проектах Supabase таблицы без GRANT недоступны
  for (const migration of migrations) await db.exec(migration);
});

afterAll(async () => {
  await db.close();
});

describe("миграция init", () => {
  it("создаёт таблицы", async () => {
    const { rows } = await db.query<{ table_name: string }>(
      "select table_name from information_schema.tables where table_schema = 'public' order by table_name",
    );
    expect(rows.map((r) => r.table_name)).toEqual(["channel_media", "requests", "tours"]);
  });

  it("не даёт сохранить цену без валюты", async () => {
    await expect(
      db.exec(`insert into public.tours (id, title, post_url, posted_at, expires_at, price_from)
               values (1, 'x', 'u', now(), now(), 100)`),
    ).rejects.toThrow(/tours_price_currency/);
  });

  it("обновляет updated_at при изменении", async () => {
    await db.exec(tour(10));
    await db.exec("update public.tours set updated_at = '2000-01-01' where id = 10");
    await db.exec("update public.tours set title = 'Новый' where id = 10");
    const { rows } = await db.query<{ updated_at: Date }>("select updated_at from public.tours where id = 10");
    expect(rows[0].updated_at.getFullYear()).toBeGreaterThan(2000);
  });

  it("посетитель видит только видимые и неистёкшие туры", async () => {
    await db.exec(tour(20));
    await db.exec(tour(21, ", false"));
    await db.exec(`insert into public.tours (id, title, post_url, posted_at, expires_at)
                   values (22, 'Старый', 'u', now() - interval '60 days', now() - interval '1 day')`);
    await db.exec("set role anon");
    const { rows } = await db.query<{ id: number }>("select id from public.tours where id in (20, 21, 22)");
    await db.exec("reset role");
    expect(rows.map((r) => Number(r.id))).toEqual([20]);
  });

  it("посетитель не может читать и писать заявки напрямую", async () => {
    await db.exec(`insert into public.requests (kind, contact, ip_hash) values ('tour', '+998901234567', 'h')`);
    await db.exec("set role anon");
    await expect(db.query("select * from public.requests")).rejects.toThrow(/permission denied/);
    await expect(
      db.exec(`insert into public.requests (kind, contact, ip_hash) values ('tour', '+998900000000', 'h')`),
    ).rejects.toThrow(/permission denied/);
    await db.exec("reset role");
  });

  it("посетитель не видит служебную таблицу фото", async () => {
    await db.exec(`insert into public.channel_media (message_id, media_group_id, file_id, file_unique_id)
                   values (1, 'g', 'f', 'u')`);
    await db.exec("set role anon");
    await expect(db.query("select * from public.channel_media")).rejects.toThrow(/permission denied/);
    await db.exec("reset role");
  });

  it("посетитель не может менять туры", async () => {
    await db.exec(tour(30));
    await db.exec("set role anon");
    await expect(db.exec("update public.tours set title = 'x' where id = 30")).rejects.toThrow(/permission denied/);
    await db.exec("reset role");
  });

  it("сервер читает и пишет во все таблицы", async () => {
    await db.exec("set role service_role");
    await db.exec(tour(40));
    await db.exec("update public.tours set is_visible = false where id = 40");
    const { rows } = await db.query<{ id: number }>("select id from public.tours where id = 40");
    await db.exec(`insert into public.requests (kind, contact, ip_hash) values ('avia', '+998901112233', 'h')`);
    await db.exec("update public.requests set notified = true where contact = '+998901112233'");
    await db.exec(`insert into public.channel_media (message_id, media_group_id, file_id, file_unique_id)
                   values (2, 'g', 'f', 'u')`);
    await db.exec("select * from public.channel_media");
    await db.exec("reset role");
    expect(rows).toHaveLength(1);
  });
});
