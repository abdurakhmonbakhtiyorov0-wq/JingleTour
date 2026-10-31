"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { after } from "next/server";
import { createSupabaseRequestStore } from "@/lib/requests/store";
import { submitRequest, type RequestState, type SubmitDeps } from "@/lib/requests/submit";
import { createAdminClient, isSupabaseWritable } from "@/lib/supabase/clients";
import { createBotApi } from "@/lib/telegram/bot-api";
import { readTelegramEnv } from "@/lib/telegram/env";
import { notifyAdmins } from "@/lib/telegram/notify";

/**
 * IP клиента в виде хеша: сам адрес не храним.
 */
async function clientIpHash(): Promise<string> {
  const list = await headers();
  const ip = list.get("x-forwarded-for")?.split(",")[0]?.trim() || list.get("x-real-ip") || "unknown";
  const salt = process.env.REQUEST_IP_SALT ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "jingle-dev";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

/**
 * Собирает зависимости из переменных окружения.
 */
async function buildDeps(): Promise<SubmitDeps> {
  const telegram = readTelegramEnv();
  const bot = telegram && telegram.adminChatIds.length > 0 ? createBotApi(telegram.botToken) : null;
  return {
    store: isSupabaseWritable() ? createSupabaseRequestStore(createAdminClient()) : null,
    notify: bot && telegram ? (text, replyUrl) => notifyAdmins(bot, telegram.adminChatIds, text, replyUrl) : null,
    schedule: (task) => after(task),
    ipHash: await clientIpHash(),
    now: new Date(),
    isProduction: process.env.NODE_ENV === "production",
  };
}

/**
 * Заявка на подбор тура.
 * @param _prev - прошлое состояние формы (useActionState)
 * @param formData - поля формы
 * @returns новое состояние формы
 */
export async function submitTourRequest(_prev: RequestState, formData: FormData): Promise<RequestState> {
  return submitRequest("tour", formData, await buildDeps());
}

/**
 * Заявка на авиабилеты.
 * @param _prev - прошлое состояние формы (useActionState)
 * @param formData - поля формы
 * @returns новое состояние формы
 */
export async function submitAviaRequest(_prev: RequestState, formData: FormData): Promise<RequestState> {
  return submitRequest("avia", formData, await buildDeps());
}
