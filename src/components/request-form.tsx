"use client";

import { useActionState } from "react";
import { submitTourRequest } from "@/app/actions/requests";
import { Chips, ConsentNote, Field, Honeypot, Select, SubmitButton, SuccessPanel, TextInput } from "@/components/form-parts";
import type { RequestState } from "@/lib/requests/submit";
import { site } from "@/lib/site";

const TYPES = ["Пляжный отдых", "Экскурсионный тур", "Лечебный тур", "Круиз", "Только авиабилеты"] as const;
const NIGHTS = [
  { value: "", label: "Пока не знаю" },
  { value: "3–5", label: "3–5" },
  { value: "6–8", label: "6–8" },
  { value: "9–11", label: "9–11" },
  { value: "12–14", label: "12–14" },
];
const ADULTS = [
  { value: "1 взрослый", label: "1" },
  { value: "2 взрослых", label: "2" },
  { value: "3 взрослых", label: "3" },
  { value: "4 взрослых", label: "4" },
  { value: "5 и больше взрослых", label: "5 и больше" },
];
const KIDS = [
  { value: "", label: "Без детей" },
  { value: "1 ребёнок", label: "1" },
  { value: "2 детей", label: "2" },
  { value: "3 и больше детей", label: "3 и больше" },
];

const INITIAL: RequestState = { status: "idle" };

interface RequestFormProps {
  /** Направление по умолчанию, например «Таиланд». */
  defaultWhere?: string;
  /** Заголовок тура, если форма на странице тура. */
  tour?: string;
}

/** Форма подбора тура. Заявка уходит в базу и маме в Telegram. */
export function RequestForm({ defaultWhere, tour }: RequestFormProps) {
  const [state, formAction] = useActionState(submitTourRequest, INITIAL);

  if (state.status === "success") {
    return <SuccessPanel whatsappUrl={state.whatsappUrl} text={`Мы получили заявку и скоро напишем вам. Отвечаем ${site.hours.toLowerCase()}.`} />;
  }

  const values = state.status === "error" ? (state.values ?? {}) : {};
  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};

  return (
    <form action={formAction} noValidate className="relative flex flex-col gap-7">
      <Honeypot />
      {tour && <input type="hidden" name="tour" value={tour} />}
      <Chips name="type" legend="Какой отдых нужен" options={TYPES} defaultValue={values.type} />
      <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
        <Field name="where" label="Куда" wide>
          <TextInput name="where" placeholder="Например, Дубай" defaultValue={values.where ?? defaultWhere} />
        </Field>
        <Field name="when" label="Когда">
          <TextInput name="when" placeholder="Например, середина декабря" defaultValue={values.when} />
        </Field>
        <Field name="nights" label="Сколько ночей">
          <Select name="nights" options={NIGHTS} defaultValue={values.nights ?? "6–8"} />
        </Field>
        <Field name="adults" label="Взрослые">
          <Select name="adults" options={ADULTS} defaultValue={values.adults ?? "2 взрослых"} />
        </Field>
        <Field name="kids" label="Дети">
          <Select name="kids" options={KIDS} defaultValue={values.kids ?? ""} />
        </Field>
        <Field name="budget" label="Бюджет на всех" wide>
          <TextInput name="budget" placeholder="Например, до 1500 $" defaultValue={values.budget} />
        </Field>
        <Field name="name" label="Как к вам обращаться">
          <TextInput name="name" autoComplete="name" defaultValue={values.name} />
        </Field>
        <Field name="contact" label="Телефон или ник в Telegram" error={errors.contact?.[0]}>
          <TextInput
            name="contact"
            type="tel"
            autoComplete="tel"
            placeholder="+998 __ ___ __ __"
            defaultValue={values.contact}
            invalid={Boolean(errors.contact)}
            required
          />
        </Field>
      </div>
      {state.status === "error" && !errors.contact && (
        <p role="alert" className="text-red-800">
          {state.message}
        </p>
      )}
      <div className="flex flex-col gap-3">
        <SubmitButton>Подобрать тур</SubmitButton>
        <ConsentNote />
      </div>
    </form>
  );
}
