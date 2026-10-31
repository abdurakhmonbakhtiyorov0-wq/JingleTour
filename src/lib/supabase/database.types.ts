/**
 * Типы таблиц Supabase. Совпадают с supabase/migrations.
 * После подключения облачного проекта можно заменить на сгенерированные:
 * npx supabase gen types typescript --project-id <id> > src/lib/supabase/database.types.ts
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      tours: {
        Row: {
          id: number;
          media_group_id: string | null;
          title: string;
          body: string;
          country_slug: string | null;
          kind: "beach" | "excursion" | "health";
          price_from: number | null;
          currency: "USD" | "UZS" | null;
          nights: number | null;
          departure_dates: string[];
          photos: string[];
          post_url: string;
          posted_at: string;
          expires_at: string;
          is_visible: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: number;
          media_group_id?: string | null;
          title: string;
          body?: string;
          country_slug?: string | null;
          kind?: "beach" | "excursion" | "health";
          price_from?: number | null;
          currency?: "USD" | "UZS" | null;
          nights?: number | null;
          departure_dates?: string[];
          photos?: string[];
          post_url: string;
          posted_at: string;
          expires_at: string;
          is_visible?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["tours"]["Insert"]>;
        Relationships: [];
      };
      channel_media: {
        Row: {
          message_id: number;
          media_group_id: string;
          file_id: string;
          file_unique_id: string;
          storage_path: string | null;
          created_at: string;
        };
        Insert: {
          message_id: number;
          media_group_id: string;
          file_id: string;
          file_unique_id: string;
          storage_path?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["channel_media"]["Insert"]>;
        Relationships: [];
      };
      requests: {
        Row: {
          id: string;
          kind: "tour" | "avia";
          name: string | null;
          contact: string;
          details: Json;
          ip_hash: string;
          status: "new" | "in_progress" | "done" | "spam";
          notified: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          kind: "tour" | "avia";
          name?: string | null;
          contact: string;
          details?: Json;
          ip_hash: string;
          status?: "new" | "in_progress" | "done" | "spam";
          notified?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["requests"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}

export type TourRow = Database["public"]["Tables"]["tours"]["Row"];
export type TourInsert = Database["public"]["Tables"]["tours"]["Insert"];
export type ChannelMediaRow = Database["public"]["Tables"]["channel_media"]["Row"];
export type RequestInsert = Database["public"]["Tables"]["requests"]["Insert"];
