import type { Supabase } from "@/lib/supabase/clients";
import type { Json, RequestInsert } from "@/lib/supabase/database.types";

export interface RequestStore {
  /** Сколько заявок пришло с этого IP после указанного момента. */
  countSince(ipHash: string, since: Date): Promise<number>;
  /** Сохраняет заявку и возвращает её id. */
  insert(request: RequestInsert): Promise<string>;
  markNotified(id: string): Promise<void>;
}

/**
 * Заявки в таблице requests. Только с service-role клиентом — у посетителей доступа нет.
 * @param db - клиент из createAdminClient()
 * @returns реализация RequestStore
 */
export function createSupabaseRequestStore(db: Supabase): RequestStore {
  return {
    async countSince(ipHash, since) {
      const { count, error } = await db
        .from("requests")
        .select("id", { count: "exact", head: true })
        .eq("ip_hash", ipHash)
        .gte("created_at", since.toISOString());
      if (error) throw new Error(`Supabase count requests: ${error.message}`);
      return count ?? 0;
    },
    async insert(request) {
      const { data, error } = await db.from("requests").insert(request).select("id").single();
      if (error) throw new Error(`Supabase insert request: ${error.message}`);
      return data.id;
    },
    async markNotified(id) {
      const { error } = await db.from("requests").update({ notified: true }).eq("id", id);
      if (error) throw new Error(`Supabase update request: ${error.message}`);
    },
  };
}

/**
 * Данные формы для колонки details (jsonb).
 */
export function toDetails(lines: [string, string][]): Json {
  return Object.fromEntries(lines);
}
