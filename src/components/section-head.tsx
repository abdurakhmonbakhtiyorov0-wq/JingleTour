import type { ReactNode } from "react";

interface SectionHeadProps {
  title: string;
  /** Пояснение под заголовком. */
  children?: ReactNode;
  /** Ссылка или кнопка справа. */
  action?: ReactNode;
  tone?: "light" | "dark";
  /** h1 для заголовка страницы, h2 для секции. */
  as?: "h1" | "h2";
}

/** Заголовок секции: слева заголовок с пояснением, справа кнопка. */
export function SectionHead({ title, children, action, tone = "light", as: Tag = "h2" }: SectionHeadProps) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-x-12 gap-y-5">
      <div>
        <Tag className={`max-w-[18ch] text-[clamp(1.9rem,1.2rem+2.4vw,2.9rem)] leading-[1.12] ${tone === "dark" ? "text-sand" : "text-pine"}`}>
          {title}
        </Tag>
        {children && <div className={`mt-4 max-w-xl ${tone === "dark" ? "text-mist" : "text-muted"}`}>{children}</div>}
      </div>
      {action}
    </div>
  );
}
