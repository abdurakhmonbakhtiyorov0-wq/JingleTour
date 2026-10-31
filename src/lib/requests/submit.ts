import { z } from "zod";
import { HONEYPOT_FIELD } from "@/lib/requests/constants";
import { contactLink, formatAdminNotification, formatClientMessage, requestLines, type RequestPayload } from "@/lib/requests/format";
import { aviaRequestSchema, tourRequestSchema } from "@/lib/requests/schema";
import { toDetails, type RequestStore } from "@/lib/requests/store";
import { whatsappLink } from "@/lib/site";

export { HONEYPOT_FIELD };
export const RATE_LIMIT = { max: 5, windowMs: 10 * 60 * 1000 } as const;

export type RequestState =
  | { status: "idle" }
  | { status: "success"; whatsappUrl: string }
  | {
      status: "error";
      message: string;
      fieldErrors?: Partial<Record<string, string[]>>;
      /** Что ввёл клиент — чтобы форма не очищалась после ошибки. */
      values?: Record<string, string>;
    };

export interface SubmitDeps {
  /** null — Supabase не настроен; заявка только уйдёт в Telegram. */
  store: RequestStore | null;
  /** Отправляет уведомление и возвращает, сколько админов его получили. null — бот не настроен. */
  notify: ((text: string, replyUrl: string | null) => Promise<number>) | null;
  /** Запускает работу после ответа клиенту (next/server after). */
  schedule: (task: () => Promise<void>) => void;
  ipHash: string;
  now: Date;
  isProduction: boolean;
}

const FALLBACK_ERROR =
  "Не получилось отправить заявку. Напишите нам в Telegram или WhatsApp — ссылки внизу страницы.";

/**
 * Проверяет форму, сохраняет заявку и отправляет уведомление маме.
 * @param kind - заявка на тур или на авиабилеты
 * @param formData - данные формы
 * @param deps - хранилище, уведомления, IP и время
 * @returns состояние для формы: успех со ссылкой на WhatsApp или ошибки полей
 */
export async function submitRequest(kind: RequestPayload["kind"], formData: FormData, deps: SubmitDeps): Promise<RequestState> {
  const raw = Object.fromEntries([...formData.entries()].filter(([key]) => !key.startsWith("$ACTION")));
  const values = Object.fromEntries(
    Object.entries(raw).filter((e): e is [string, string] => typeof e[1] === "string" && e[0] !== HONEYPOT_FIELD),
  );
  const invalid = (error: z.ZodError): RequestState => ({
    status: "error",
    message: "Проверьте поля формы",
    fieldErrors: z.flattenError(error).fieldErrors,
    values,
  });

  let payload: RequestPayload;
  if (kind === "tour") {
    const parsed = tourRequestSchema.safeParse(raw);
    if (!parsed.success) return invalid(parsed.error);
    payload = { kind, data: parsed.data };
  } else {
    const parsed = aviaRequestSchema.safeParse(raw);
    if (!parsed.success) return invalid(parsed.error);
    payload = { kind, data: parsed.data };
  }
  const whatsappUrl = whatsappLink(formatClientMessage(payload));

  // Бот заполнил поле-ловушку: делаем вид, что всё хорошо, и ничего не сохраняем.
  if (typeof raw[HONEYPOT_FIELD] === "string" && raw[HONEYPOT_FIELD] !== "") return { status: "success", whatsappUrl };

  if (!deps.store && !deps.notify) {
    if (deps.isProduction) {
      console.error("[requests] ни Supabase, ни бот не настроены — заявка потеряна бы");
      return { status: "error", message: FALLBACK_ERROR, values };
    }
    console.info("[requests] (dev) заявка:", formatClientMessage(payload));
    return { status: "success", whatsappUrl };
  }

  let requestId: string | null = null;
  if (deps.store) {
    try {
      const recent = await deps.store.countSince(deps.ipHash, new Date(deps.now.getTime() - RATE_LIMIT.windowMs));
      if (recent >= RATE_LIMIT.max) {
        return {
          status: "error",
          message: "Слишком много заявок подряд. Попробуйте через 10 минут или напишите нам напрямую.",
          values,
        };
      }
      requestId = await deps.store.insert({
        kind,
        name: payload.data.name ?? null,
        contact: payload.data.contact,
        details: toDetails(requestLines(payload)),
        ip_hash: deps.ipHash,
      });
    } catch (error) {
      console.error("[requests] не удалось сохранить заявку:", error);
      if (!deps.notify) return { status: "error", message: FALLBACK_ERROR, values };
    }
  }

  if (deps.notify) {
    const notify = deps.notify;
    const store = deps.store;
    deps.schedule(async () => {
      try {
        const delivered = await notify(formatAdminNotification(payload), contactLink(payload.data.contact));
        if (delivered > 0 && requestId && store) await store.markNotified(requestId);
      } catch (error) {
        console.error("[requests] уведомление не отправлено, заявка", requestId, error);
      }
    });
  }

  return { status: "success", whatsappUrl };
}
