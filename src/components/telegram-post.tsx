"use client";

import { useEffect, useRef } from "react";

interface TelegramPostProps {
  /** «канал/id», например jingle_tour/2630 */
  post: string;
}

/**
 * Пост Telegram через официальный виджет.
 * React не выполняет <script> из JSX, поэтому скрипт добавляется после монтирования.
 */
export function TelegramPost({ post }: TelegramPostProps) {
  const holder = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = holder.current;
    if (!element) return;
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.dataset.telegramPost = post;
    script.dataset.width = "100%";
    script.dataset.color = "16524B";
    element.appendChild(script);
    return () => {
      element.replaceChildren();
    };
  }, [post]);

  return (
    <div className="flex flex-col gap-3">
      <div ref={holder} className="min-h-80 overflow-hidden rounded-2xl" />
      <a href={`https://t.me/${post}`} target="_blank" rel="noopener noreferrer" className="text-sm text-pine-2 underline underline-offset-4">
        Открыть в Telegram
      </a>
    </div>
  );
}
