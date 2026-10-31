import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Operators, Reasons, Steps } from "@/components/blocks";
import { SectionHead } from "@/components/section-head";
import { buttonClass } from "@/components/ui";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "О нас",
  description: `${site.name} — турагентство в Ташкенте. ${site.yearsInBusiness} лет подбираем пляжные, экскурсионные и лечебные туры.`,
};

export default function AboutPage() {
  return (
    <div className="wrap py-10 md:py-14">
      <section className="grid gap-12 md:grid-cols-[1.1fr_0.9fr] md:items-center">
        <div>
          <h1 className="text-[clamp(2.3rem,1.4rem+3vw,3.6rem)] leading-[1.08] text-pine">
            {site.yearsInBusiness} лет подбираем отдых для наших туристов
          </h1>
          <p className="mt-6 max-w-[52ch] text-lg text-muted">
            {site.name} — турагентство из Ташкента. Мы не продаём «что есть»: сначала спрашиваем, какой отдых нужен вам, а
            потом сравниваем предложения туроператоров и честно рассказываем о плюсах и минусах каждого варианта.
          </p>
          <p className="mt-4 max-w-[52ch] text-lg text-muted">
            Работаем онлайн — через Telegram, WhatsApp и по телефону. Офиса нет, зато мы на связи {site.hours.toLowerCase()}, в
            том числе пока вы отдыхаете.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/#request" className={buttonClass("dark")}>
              Подобрать тур
            </Link>
            <a href={site.channelUrl} target="_blank" rel="noopener noreferrer" className={buttonClass("outline")}>
              Наш Telegram-канал
            </a>
          </div>
        </div>
        <div className="relative aspect-4/5 overflow-hidden rounded-arch">
          <Image src="/images/palms.jpg" alt="Пальмы над бирюзовой лагуной" fill priority sizes="(min-width: 768px) 40vw, 92vw" className="object-cover" />
        </div>
      </section>

      <section className="mt-24">
        <SectionHead title="Как мы работаем" />
        <Steps />
      </section>

      <section className="mt-24">
        <SectionHead title="Почему с нами спокойно" />
        <Reasons />
      </section>

      <section className="mt-24">
        <SectionHead title="Туроператоры, с которыми мы работаем">
          Бронируем туры у проверенных туроператоров, которые работают на рынке Узбекистана.
        </SectionHead>
        <Operators />
      </section>

      <section className="mt-24 grid gap-8 rounded-3xl bg-pine p-8 text-sand md:grid-cols-3 md:p-12">
        <div>
          <h2 className="text-2xl text-champagne">Телефон</h2>
          <a href={site.phoneHref} className="mt-2 block text-lg hover:underline">
            {site.phone}
          </a>
        </div>
        <div>
          <h2 className="text-2xl text-champagne">Часы работы</h2>
          <p className="mt-2 text-lg">{site.hours}</p>
        </div>
        <div>
          <h2 className="text-2xl text-champagne">Оплата</h2>
          <p className="mt-2 text-lg">{site.payment}</p>
        </div>
      </section>
    </div>
  );
}
