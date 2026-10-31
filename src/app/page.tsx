import Image from "next/image";
import Link from "next/link";
import { Faq, Operators, Reasons, Steps } from "@/components/blocks";
import { DestinationCard } from "@/components/destination-card";
import { RequestForm } from "@/components/request-form";
import { SectionHead } from "@/components/section-head";
import { TelegramPost } from "@/components/telegram-post";
import { TourCard } from "@/components/tour-card";
import { buttonClass } from "@/components/ui";
import { DESTINATIONS } from "@/lib/destinations";
import { site } from "@/lib/site";
import { getActiveTours } from "@/lib/tours/repository";
import { cheapestUsd, sortTours } from "@/lib/tours/select";

const TYPES = [
  { kind: "beach", title: "Пляжный", text: "Дубай, Таиланд, Вьетнам, Малайзия, Шри-Ланка", image: "/images/boats.jpg" },
  { kind: "excursion", title: "Экскурсионный", text: "Турция и Китай с русскоговорящим гидом", image: "/images/istanbul.jpg" },
  { kind: "health", title: "Лечебный", text: "Санатории Нафталана и отдых в Баку", image: "/images/baku.jpg" },
] as const;

export default async function HomePage() {
  const { tours, today } = await getActiveTours();
  const upcoming = sortTours(tours, "soon", today).slice(0, 4);

  return (
    <>
      {/* 1. Главный экран */}
      <section className="wrap grid items-center gap-12 pt-8 pb-20 md:grid-cols-[1.05fr_1fr] md:pt-12">
        <div>
          <h1 className="text-[clamp(2.4rem,1.4rem+3.6vw,4rem)] leading-[1.08] text-pine">
            Отдых, который подбирает живой человек
          </h1>
          <p className="mt-6 max-w-[42ch] text-lg text-muted">
            Пляжные, экскурсионные и лечебные туры с вылетом из Ташкента. Расскажите, о каком отдыхе мечтаете, — пришлём
            лучшие варианты в Telegram или WhatsApp.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
            <Link href="#request" className={buttonClass("dark")}>
              Подобрать тур
            </Link>
            <Link href="#hot" className="font-semibold text-pine underline underline-offset-4">
              Ближайшие вылеты
            </Link>
          </div>
        </div>
        <div className="relative pb-10 pl-10">
          <div className="relative aspect-4/5 overflow-hidden rounded-arch">
            <Image
              src="/images/maldives.jpg"
              alt="Виллы над бирюзовой водой на Мальдивах"
              fill
              priority
              sizes="(min-width: 768px) 45vw, 90vw"
              className="object-cover"
            />
          </div>
          <div className="absolute bottom-0 left-0 aspect-square w-[42%] overflow-hidden rounded-full border-8 border-sand">
            <Image src="/images/beach.jpg" alt="" fill sizes="20vw" className="object-cover" />
          </div>
          <p className="absolute top-[18%] -right-2 rounded-2xl bg-pine px-5 py-4 text-sm leading-tight text-sand md:-right-4">
            <b className="block font-display text-3xl font-normal text-champagne">{site.yearsInBusiness} лет</b>
            подбираем туры
          </p>
        </div>
      </section>

      {/* 2. Типы отдыха */}
      <section className="bg-pine py-20 text-sand">
        <div className="wrap">
          <SectionHead title="Какой отдых вам нужен?" tone="dark" />
          <div className="grid gap-5 md:grid-cols-3">
            {TYPES.map((type) => (
              <Link
                key={type.kind}
                href={`/tours?kind=${type.kind}`}
                className="group relative isolate flex min-h-80 flex-col justify-end overflow-hidden rounded-3xl p-7"
              >
                <Image src={type.image} alt="" fill sizes="(min-width: 768px) 33vw, 92vw" className="-z-20 object-cover" />
                <span aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-b from-transparent from-35% to-pine/95" />
                <h3 className="text-3xl underline-offset-4 group-hover:underline">{type.title}</h3>
                <p className="mt-1 text-mist">{type.text}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Направления */}
      <section id="destinations" className="wrap py-24">
        <SectionHead title="Популярные направления">
          Цена за человека при двухместном размещении: перелёт, отель, питание, трансфер и страховка.
        </SectionHead>
        <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {DESTINATIONS.map((destination) => (
            <DestinationCard
              key={destination.slug}
              destination={destination}
              priceUsd={cheapestUsd(tours, destination.slug) ?? destination.basePriceUsd}
            />
          ))}
        </div>
      </section>

      {/* 4. Ближайшие вылеты */}
      <section id="hot" className="bg-sand-2 py-24">
        <div className="wrap">
          <SectionHead
            title="Ближайшие вылеты"
            action={
              <Link href="/tours" className={buttonClass("outline")}>
                Все туры
              </Link>
            }
          >
            Места на эти даты заканчиваются быстро. Напишите — проверим, остались ли они.
          </SectionHead>
          {upcoming.length > 0 ? (
            <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
              {upcoming.map((tour) => (
                <TourCard key={tour.id} tour={tour} today={today} />
              ))}
            </div>
          ) : (
            <p className="max-w-xl text-lg text-muted">
              Подборка обновляется. Свежие горящие туры каждый день появляются в нашем Telegram-канале.
            </p>
          )}
          <a
            href={site.channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-14 flex flex-col items-start justify-between gap-5 rounded-3xl bg-pine p-8 text-sand sm:flex-row sm:items-center md:p-10"
          >
            <span>
              <span className="block font-display text-[clamp(1.5rem,1.1rem+1.4vw,2.1rem)] leading-tight">
                Новые горящие туры — каждый день в Telegram
              </span>
              <span className="mt-2 block text-mist">Подпишитесь, чтобы первыми узнавать о скидках</span>
            </span>
            <span className={buttonClass("champagne", "shrink-0")}>Подписаться</span>
          </a>
        </div>
      </section>

      {/* 5. Как мы работаем */}
      <section id="steps" className="wrap py-24">
        <SectionHead title="Как мы работаем" />
        <Steps />
      </section>

      {/* 6. Почему с нами спокойно */}
      <section className="wrap grid gap-12 pb-24 md:grid-cols-[1fr_1.2fr] md:items-center">
        <div className="relative aspect-4/5 overflow-hidden rounded-arch">
          <Image src="/images/hero.jpg" alt="Бирюзовая бухта среди зелёных скал" fill sizes="(min-width: 768px) 40vw, 92vw" className="object-cover" />
        </div>
        <div>
          <SectionHead title="Почему с нами спокойно" />
          <Reasons />
          <h3 className="mt-12 mb-4 font-sans text-lg font-semibold">Работаем с туроператорами</h3>
          <Operators />
        </div>
      </section>

      {/* 7. Отзывы */}
      <section id="reviews" className="bg-sand-2 py-24">
        <div className="wrap">
          <SectionHead title="Отзывы наших туристов">Видео, которые туристы присылают нам из поездок.</SectionHead>
          <div className="grid gap-6 md:grid-cols-3">
            {site.reviewPosts.map((id) => (
              <TelegramPost key={id} post={`${site.channelUsername}/${id}`} />
            ))}
          </div>
        </div>
      </section>

      {/* 8. Заявка */}
      <section id="request" className="bg-pine-2 py-24 text-sand">
        <div className="wrap grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <SectionHead title="Подберём тур под ваш бюджет" tone="dark">
              Заполните, что знаете, — остальное уточним в переписке. Это бесплатно и ни к чему не обязывает.
            </SectionHead>
            <div className="relative hidden aspect-4/3 overflow-hidden rounded-3xl lg:block">
              <Image src="/images/atoll.jpg" alt="" fill sizes="40vw" className="object-cover" />
            </div>
          </div>
          <div className="rounded-3xl bg-sand p-6 text-ink sm:p-10">
            <RequestForm />
          </div>
        </div>
      </section>

      {/* 9. Вопросы */}
      <section id="faq" className="wrap grid gap-10 py-24 lg:grid-cols-[1fr_2fr]">
        <h2 className="text-[clamp(1.9rem,1.2rem+2.4vw,2.9rem)] leading-tight text-pine">Частые вопросы</h2>
        <Faq />
      </section>
    </>
  );
}
