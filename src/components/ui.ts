const BUTTON_BASE =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-[15px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60";

const BUTTON_VARIANTS = {
  dark: "bg-pine text-sand hover:bg-pine-2",
  champagne: "bg-champagne text-pine hover:bg-champagne-deep",
  outline: "border border-pine/35 text-pine hover:bg-pine hover:text-sand",
  outlineLight: "border border-sand/50 text-sand hover:bg-sand hover:text-pine",
} as const;

export type ButtonVariant = keyof typeof BUTTON_VARIANTS;

/**
 * Классы кнопки или ссылки-кнопки.
 * @param variant - dark, champagne, outline, outlineLight
 * @param extra - дополнительные классы
 * @returns строка классов Tailwind
 */
export function buttonClass(variant: ButtonVariant, extra = ""): string {
  return `${BUTTON_BASE} ${BUTTON_VARIANTS[variant]} ${extra}`.trim();
}
