"use client";

import { useActionState } from "react";
import { submitAviaRequest } from "@/app/actions/requests";
import { ConsentNote, Field, Honeypot, Select, SubmitButton, SuccessPanel, TextInput } from "@/components/form-parts";
import type { RequestState } from "@/lib/requests/submit";
import { site } from "@/lib/site";

const PASSENGERS = [
  { value: "1 пассажир", label: "1" },
  { value: "2 пассажира", label: "2" },
  { value: "3 пассажира", label: "3" },
  { value: "4 пассажира", label: "4" },
  { value: "5 и больше пассажиров", label: "5 и больше" },
];

const INITIAL: RequestState = { status: "idle" };

/** Заявка на авиабилеты: откуда, куда, даты, пассажиры. */
export function AviaForm() {
  const [state, formAction] = useActionState(submitAviaRequest, INITIAL);

  if (state.status === "success") {
    return <SuccessPanel whatsappUrl={state.whatsappUrl} text={`Подберём рейсы и пришлём варианты. Отвечаем ${site.hours.toLowerCase()}.`} />;
  }

  const values = state.status === "error" ? (state.values ?? {}) : {};
  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};

  return (
    <form action={formAction} noValidate className="relative flex flex-col gap-7">
      <Honeypot />
      <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
        <Field name="from" label="Откуда">
          <TextInput name="from" defaultValue={values.from ?? "Ташкент"} />
        </Field>
        <Field name="to" label="Куда" error={errors.to?.[0]}>
          <TextInput name="to" placeholder="Например, Стамбул" defaultValue={values.to} invalid={Boolean(errors.to)} required />
        </Field>
        <Field name="departDate" label="Туда">
          <TextInput name="departDate" type="date" defaultValue={values.departDate} />
        </Field>
        <Field name="returnDate" label="Обратно (если нужно)">
          <TextInput name="returnDate" type="date" defaultValue={values.returnDate} />
        </Field>
        <Field name="passengers" label="Пассажиры">
          <Select name="passengers" options={PASSENGERS} defaultValue={values.passengers ?? "1 пассажир"} />
        </Field>
        <Field name="name" label="Как к вам обращаться">
          <TextInput name="name" autoComplete="name" defaultValue={values.name} />
        </Field>
        <Field name="contact" label="Телефон или ник в Telegram" error={errors.contact?.[0]} wide>
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
      {state.status === "error" && !errors.contact && !errors.to && (
        <p role="alert" className="text-red-800">
          {state.message}
        </p>
      )}
      <div className="flex flex-col gap-3">
        <SubmitButton>Найти билеты</SubmitButton>
        <ConsentNote />
      </div>
    </form>
  );
}
