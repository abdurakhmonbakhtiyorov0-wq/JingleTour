import { site } from "@/lib/site";

/** Круглая кнопка «Написать» в углу экрана на телефоне. */
export function FloatChat() {
  return (
    <a
      href={site.telegramChat}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Написать нам в Telegram"
      className="fixed right-4 bottom-4 z-40 grid size-14 place-items-center rounded-full bg-champagne text-pine shadow-[0_10px_30px_rgba(14,59,54,0.35)] lg:hidden"
    >
      <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    </a>
  );
}
