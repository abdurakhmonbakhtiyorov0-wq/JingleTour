import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { RequestForm } from "@/components/request-form";
import { TourCard } from "@/components/tour-card";
import { buttonClass } from "@/components/ui";
import { getCountry } from "@/lib/countries";
import { DESTINATIONS, getDestination } from "@/lib/destinations";
import { formatPrice } from "@/lib/format";
import { site } from "@/lib/site";
import { getActiveTours } from "@/lib/tours/repository";
import { cheapestUsd, sortTours } from "@/lib/tours/select";

export function generateStaticParams(): { slug: string }[] {
  return DESTINATIONS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: PageProps<"/destinations/[slug]">): Promise<Metadata> {
  const destination = getDestination((await params).slug);
  if (!destination) return { title: "Направление не найдено" };
  const country = getCountry(destination.slug);
  return {
    title: `Туры в ${country?.inName ?? destination.name} из Ташкента`,
    description: destination.intro,
    openGraph: { images: [{ url: destination.image, alt: destination.imageAlt }] },
  };
}

async function DestinationDetails({ params }: Pick<PageProps<"/destinations/[slug]">, "params">) {
  const destination = getDestination((await params).slug);
  if (!destination) notFound();
  const country = getCountry(destination.slug);
  const { tours, today } = await getActiveTours();
  const countryTours = sortTours(
    tours.filter((t) => t.countrySlug === destination.slug),
    "soon",
    today,
  );
  const price = cheapestUsd(tours, destination.slug) ?? destination.basePriceUsd;

  return (
    <>
      <section className="grid gap-12 md:grid-cols-[1fr_1.1fr] md:items-center">
        <div className="relative aspect-4/5 overflow-hidden rounded-arch">
          <Image src={destination.image} alt={destination.imageAlt} fill priority sizes="(min-width: 768px) 45vw, 92vw" className="object-cover" />
        </div>
        <div>
          <p className="text-muted">
            <Link href="/#destinations" className="underline underline-offset-4">
              Направления
            </Link>
          </p>
          <h1 className="mt-3 text-[clamp(2.3rem,1.4rem+3vw,3.6rem)] leading-[1.08] text-pine">
            {destination.name}
          </h1>
          <p className="mt-5 max-w-[48ch] text-lg text-muted">{destination.intro}</p>
          <dl className="mt-8 grid gap-5 border-y border-line py-6 sm:grid-cols-3">
            <div>
              <dt className="text-sm text-muted">Цена за человека</dt>
              <dd className="mt-1 text-xl font-bold text-pine-2">от {formatPrice(price, "USD")}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">Сезон</dt>
              <dd className="mt-1">{destination.season}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">Перелёт</dt>
              <dd className="mt-1">{destination.flight}</dd>
            </div>
          </dl>
          <Link href="#request" className={buttonClass("dark", "mt-8")}>
            Подобрать тур в {country?.inName ?? destination.name}
          </Link>
        </div>
      </section>

      <section className="mt-24 grid gap-12 md:grid-cols-2">
        <div>
          <h2 className="text-3xl text-pine">Что посмотреть</h2>
          <ul className="mt-6 space-y-3">
            {destination.highlights.map((item) => (
              <li key={item} className="border-b border-line pb-3 text-lg">
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-3xl text-pine">Что важно знать</h2>
          <ul className="mt-6 space-y-3">
            {destination.goodToKnow.map((item) => (
              <li key={item} className="border-b border-line pb-3 text-lg">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-24">
        <h2 className="mb-10 text-[clamp(1.8rem,1.2rem+2vw,2.6rem)] text-pine">Актуальные туры</h2>
        {countryTours.length > 0 ? (
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {countryTours.map((tour) => (
              <TourCard key={tour.id} tour={tour} today={today} />
            ))}
          </div>
        ) : (
          <p className="max-w-xl text-lg text-muted">
            Сейчас в подборке нет туров в {country?.inName ?? destination.name}, но мы подберём их под ваши даты. Свежие
            предложения появляются в нашем{" "}
            <a href={site.channelUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
              Telegram-канале
            </a>
            .
          </p>
        )}
      </section>

      <section id="request" className="mt-24 grid gap-10 rounded-3xl bg-pine-2 p-6 text-sand sm:p-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <h2 className="text-[clamp(1.8rem,1.2rem+2vw,2.6rem)] leading-tight">
            Подберём тур в {country?.inName ?? destination.name}
          </h2>
          <p className="mt-4 max-w-sm text-mist">Сравним предложения туроператоров и пришлём лучшие варианты.</p>
        </div>
        <div className="rounded-2xl bg-sand p-6 text-ink sm:p-8">
          <RequestForm defaultWhere={destination.name} />
        </div>
      </section>
    </>
  );
}

export default function DestinationPage(props: PageProps<"/destinations/[slug]">) {
  return (
    <div className="wrap py-10 md:py-14">
      <Suspense fallback={<p className="text-muted">Загружаем направление…</p>}>
        <DestinationDetails params={props.params} />
      </Suspense>
    </div>
  );
}
