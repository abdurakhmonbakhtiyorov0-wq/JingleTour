import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

export const PHOTO_BUCKET = "tour-photos";

export type Supabase = SupabaseClient<Database>;

/**
 * Проверяет, что заданы адрес и публичный ключ Supabase.
 * Без них сайт работает на данных из seed-tours.json.
 * @returns true, если можно читать из Supabase
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/**
 * Проверяет, что задан service-role ключ для записи.
 * @returns true, если сервер может писать в базу и Storage
 */
export function isSupabaseWritable(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/**
 * Достаёт обязательную переменную окружения.
 * @throws Error с понятным текстом, если переменная не задана
 */
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Не задана переменная окружения ${name}`);
  return value;
}

/**
 * Клиент с публичным ключом: читает только то, что разрешают политики RLS.
 * @returns клиент Supabase
 * @throws Error, если не заданы NEXT_PUBLIC_SUPABASE_URL или NEXT_PUBLIC_SUPABASE_ANON_KEY
 */
export function createPublicClient(): Supabase {
  return createClient<Database>(requireEnv("NEXT_PUBLIC_SUPABASE_URL"), requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Клиент с service-role ключом: обходит RLS. Только для сервера —
 * вебхука, Server Actions и скриптов.
 * @returns клиент Supabase с полными правами
 * @throws Error, если не заданы NEXT_PUBLIC_SUPABASE_URL или SUPABASE_SERVICE_ROLE_KEY
 */
export function createAdminClient(): Supabase {
  return createClient<Database>(requireEnv("NEXT_PUBLIC_SUPABASE_URL"), requireEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Публичная ссылка на фото тура.
 * @param pathOrUrl - путь в bucket, абсолютная ссылка или путь из /public
 * @returns ссылка, которую можно отдать в <Image>
 */
export function photoUrl(pathOrUrl: string): string {
  if (/^https?:\/\//.test(pathOrUrl) || pathOrUrl.startsWith("/")) return pathOrUrl;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return `${base}/storage/v1/object/public/${PHOTO_BUCKET}/${pathOrUrl}`;
}
