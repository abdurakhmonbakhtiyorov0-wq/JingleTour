import type { Metadata } from "next";
import Image from "next/image";
import { AviaForm } from "@/components/avia-form";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Авиабилеты из Ташкента",
  description: "Подберём авиабилеты из Ташкента и Самарканда: прямые рейсы и удобные пересадки. Оставьте заявку — пришлём варианты в мессенджер.",
};

const BENEFITS = [
  { title: "Сравним рейсы", text: "Прямые и с пересадкой — по цене, времени и багажу." },
  { title: "Объясним тариф", text: "Что входит: багаж, ручная кладь, возврат и обмен." },
  { title: "Поможем после покупки", text: "Если рейс перенесли или нужно поменять дату — подскажем, что делать." },
] as const;

export default function AviaPage() {
  return (
    <div className="wrap py-10 md:py-14">
      <section className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <h1 className="text-[clamp(2.3rem,1.4rem+3vw,3.6rem)] leading-[1.08] text-pine">Авиабилеты из Ташкента</h1>
          <p className="mt-5 max-w-[46ch] text-lg text-muted">
            Нужен только перелёт? Напишите направление и даты — подберём удобный рейс и пришлём варианты в Telegram или
            WhatsApp.
          </p>
          <div className="relative mt-10 hidden aspect-4/3 overflow-hidden rounded-3xl lg:block">
            <Image src="/images/beach.jpg" alt="Закат над морем" fill sizes="40vw" className="object-cover" />
          </div>
        </div>
        <div className="rounded-3xl bg-sand-2 p-6 sm:p-10">
          <AviaForm />
        </div>
      </section>

      <section className="mt-24 grid gap-10 md:grid-cols-3">
        {BENEFITS.map((b) => (
          <div key={b.title} className="border-t-2 border-champagne pt-5">
            <h2 className="text-2xl text-pine">{b.title}</h2>
            <p className="mt-2 text-muted">{b.text}</p>
          </div>
        ))}
      </section>

      <section className="mt-24 rounded-3xl bg-pine p-8 text-sand md:p-12">
        <h2 className="text-[clamp(1.8rem,1.2rem+2vw,2.6rem)] leading-tight">С какими авиакомпаниями летаем</h2>
        <p className="mt-4 max-w-2xl text-mist">
          Чаще всего наши туристы летают рейсами {site.airlines.join(", ")} — но подберём билеты любой авиакомпании, которая
          летает из Узбекистана.
        </p>
      </section>
    </div>
  );
}
