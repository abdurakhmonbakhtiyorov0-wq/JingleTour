"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";
import { buttonClass } from "@/components/ui";
import { HONEYPOT_FIELD } from "@/lib/requests/constants";
import { site } from "@/lib/site";

const INPUT =
  "min-h-11 w-full rounded-none border-0 border-b-2 border-line bg-transparent px-0 py-2 text-[17px] font-medium text-ink placeholder:font-normal placeholder:text-muted/70 focus:border-pine-2 focus:outline-none aria-invalid:border-red-700";

interface FieldProps {
  name: string;
  label: string;
  error?: string;
  wide?: boolean;
  children?: ReactNode;
}

/** Поле формы: подпись, ввод и текст ошибки. */
export function Field({ name, label, error, wide = false, children }: FieldProps) {
  return (
    <div className={`flex flex-col gap-1 ${wide ? "sm:col-span-2" : ""}`}>
      <label htmlFor={name} className="text-sm text-muted">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${name}-error`} className="text-sm text-red-800">
          {error}
        </p>
      )}
    </div>
  );
}

interface TextInputProps {
  name: string;
  defaultValue?: string;
  placeholder?: string;
  type?: "text" | "tel" | "date";
  autoComplete?: string;
  invalid?: boolean;
  required?: boolean;
}

/** Текстовое поле в стиле макета: только нижняя линия. */
export function TextInput({ name, defaultValue, placeholder, type = "text", autoComplete = "off", invalid, required }: TextInputProps) {
  return (
    <input
      id={name}
      name={name}
      type={type}
      defaultValue={defaultValue}
      placeholder={placeholder}
      autoComplete={autoComplete}
      required={required}
      aria-invalid={invalid || undefined}
      aria-describedby={invalid ? `${name}-error` : undefined}
      className={INPUT}
    />
  );
}

interface SelectProps {
  name: string;
  options: readonly { value: string; label: string }[];
  defaultValue?: string;
}

/** Выпадающий список с той же линией снизу. */
export function Select({ name, options, defaultValue }: SelectProps) {
  return (
    <select id={name} name={name} defaultValue={defaultValue} className={`${INPUT} cursor-pointer pr-3`}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

interface ChipsProps {
  name: string;
  legend: string;
  options: readonly string[];
  defaultValue?: string;
}

/** Выбор одного варианта кнопками-«таблетками». */
export function Chips({ name, legend, options, defaultValue }: ChipsProps) {
  return (
    <fieldset>
      <legend className="mb-3 font-semibold">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label key={option} className="cursor-pointer">
            <input type="radio" name={name} value={option} defaultChecked={option === defaultValue} className="peer sr-only" />
            <span className="inline-block rounded-full border border-line px-4 py-2 text-[15px] transition-colors peer-checked:border-pine peer-checked:bg-pine peer-checked:text-sand peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-champagne-deep">
              {option}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Невидимое поле-ловушка для ботов. */
export function Honeypot() {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        Сайт
        <input type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}

/** Кнопка отправки: пока заявка уходит, показывает «Отправляем…». */
export function SubmitButton({ children }: { children: ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={buttonClass("dark", "w-full sm:w-auto")}>
      {pending ? "Отправляем…" : children}
    </button>
  );
}

/** Подпись под кнопкой про согласие на обработку данных. */
export function ConsentNote() {
  return (
    <p className="text-sm text-muted">
      Нажимая кнопку, вы соглашаетесь с{" "}
      <Link href="/privacy" className="underline underline-offset-2">
        политикой конфиденциальности
      </Link>
      .
    </p>
  );
}

/** Экран после отправки заявки. */
export function SuccessPanel({ whatsappUrl, text }: { whatsappUrl: string; text: string }) {
  return (
    <div role="status" className="flex flex-col items-start gap-4">
      <p className="font-display text-3xl text-pine">Заявка отправлена</p>
      <p className="max-w-md text-muted">{text}</p>
      <p className="max-w-md text-muted">Хотите быстрее? Напишите нам сами — заявка уже заполнена:</p>
      <div className="flex flex-wrap gap-3">
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={buttonClass("dark")}>
          Написать в WhatsApp
        </a>
        <a href={site.telegramChat} target="_blank" rel="noopener noreferrer" className={buttonClass("outline")}>
          Написать в Telegram
        </a>
      </div>
    </div>
  );
}
