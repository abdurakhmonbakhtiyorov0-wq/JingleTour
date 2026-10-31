import { site } from "@/lib/site";

const STEPS = [
  { title: "Вы пишете", text: "Куда, когда и с кем хотите поехать, какой бюджет" },
  { title: "Мы подбираем", text: "Присылаем лучшие варианты с фото и ценами" },
  { title: "Оформляем", text: "Бронь, билеты, страховка, а если нужно — виза" },
  { title: "Вы отдыхаете", text: "А мы на связи всю поездку" },
] as const;

/** «Как мы работаем»: четыре шага по порядку. */
export function Steps() {
  return (
    <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {STEPS.map((step, index) => (
        <li key={step.title} className="border-t-2 border-champagne pt-5">
          <span aria-hidden="true" className="block font-display text-4xl leading-none text-champagne-deep">
            {index + 1}
          </span>
          <h3 className="mt-3 font-sans text-lg font-semibold">{step.title}</h3>
          <p className="mt-1 text-muted">{step.text}</p>
        </li>
      ))}
    </ol>
  );
}

const FAQ = [
  {
    q: "Что входит в стоимость тура?",
    a: "Обычно перелёт, проживание, питание по выбранной концепции, трансфер и медицинская страховка. Что именно входит в ваш тур, напишем вместе с подборкой.",
  },
  {
    q: "Цена указана за одного человека?",
    a: "Да, цены на сайте — за одного человека при двухместном размещении. Для семей с детьми посчитаем отдельно.",
  },
  {
    q: "Нужна ли виза?",
    a: "Зависит от страны. Подскажем правила въезда для граждан Узбекистана и поможем с оформлением, если виза нужна.",
  },
  { q: "Как можно оплатить?", a: `${site.payment}.` },
  { q: "Можно купить только авиабилеты?", a: "Да. Напишите направление и даты — подберём удобный рейс." },
  {
    q: "Почему цены на сайте могут отличаться?",
    a: "Цены туроператоров меняются каждый день. На сайте — цены на момент публикации тура, точную стоимость на ваши даты пришлём в мессенджер.",
  },
] as const;

/** Частые вопросы — раскрываются по клику без JavaScript. */
export function Faq() {
  return (
    <div className="divide-y divide-line border-y border-line">
      {FAQ.map((item) => (
        <details key={item.q} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-lg font-semibold [&::-webkit-details-marker]:hidden">
            {item.q}
            <span aria-hidden="true" className="text-2xl leading-none text-pine-2 transition-transform group-open:rotate-45">
              +
            </span>
          </summary>
          <p className="max-w-2xl pb-6 text-muted">{item.a}</p>
        </details>
      ))}
    </div>
  );
}

/** Список туроператоров, с которыми работает агентство. */
export function Operators() {
  return (
    <ul className="flex flex-wrap gap-2">
      {site.operators.map((name) => (
        <li key={name} className="rounded-full border border-line px-4 py-2 text-[15px]">
          {name}
        </li>
      ))}
    </ul>
  );
}

const REASONS = [
  {
    title: `${site.yearsInBusiness} лет опыта`,
    text: "Знаем отели, в которых бывали наши туристы, и честно говорим о плюсах и минусах.",
  },
  { title: "Вылеты из Ташкента", text: `Прямые рейсы ${site.airlines.slice(0, 3).join(", ")} и других авиакомпаний.` },
  { title: "Помощь с визами", text: "Подскажем, нужна ли виза, и поможем её оформить." },
  { title: "Удобная оплата", text: `${site.payment} — как вам удобнее.` },
] as const;

/** «Почему с нами спокойно»: четыре причины. */
export function Reasons() {
  return (
    <ul className="grid gap-x-10 gap-y-7 sm:grid-cols-2">
      {REASONS.map((reason) => (
        <li key={reason.title}>
          <h3 className="text-xl text-pine">{reason.title}</h3>
          <p className="mt-1 text-muted">{reason.text}</p>
        </li>
      ))}
    </ul>
  );
}
