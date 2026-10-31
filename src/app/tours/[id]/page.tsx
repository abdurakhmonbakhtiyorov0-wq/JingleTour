import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { RequestForm } from "@/components/request-form";
import { TourCard } from "@/components/tour-card";
import { getCountry } from "@/lib/countries";
import { formatDay, formatPrice, nightsLabel } from "@/lib/format";
import { getActiveTours, getTour } from "@/lib/tours/repository";
import { sortTours, tourCountryLabel, tourCover } from "@/lib/tours/select";
import { TOUR_KINDS } from "@/lib/tours/types";

/**
 * Заранее собираем страницы ближайших туров. Остальные соберутся при первом заходе.
 * С Cache Components нужен хотя бы один параметр — если туров нет, отдаём «0» (это 404).
 */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  const { tours, today } = await getActiveTours();
  const ids = sortTours(tours, "soon", today)
    .slice(0, 20)
    .map((t) => ({ id: String(t.id) }));
  return ids.length > 0 ? ids : [{ id: "0" }];
}

/**
 * id из адреса → число. Нечисловые id сразу дают 404.
 */
function parseId(raw: string): number | null {
  return /^\d{1,12}$/.test(raw) ? Number(raw) : null;
}

export async function generateMetadata({ params }: PageProps<"/tours/[id]">): Promise<Metadata> {
  const id = parseId((await params).id);
  const tour = id === null ? null : await getTour(id);
  if (!tour) return { title: "Тур не найден" };
  const price = tour.priceFrom !== null && tour.currency ? `от ${formatPrice(tour.priceFrom, tour.currency)}` : "";
  return {
    title: tour.title,
    description: [tourCountryLabel(tour)?.replace(/^\S+\s/, ""), tour.nights && nightsLabel(tour.nights), price]
      .filter(Boolean)
      .join(", "),
    openGraph: { images: [{ url: tourCover(tour) }] },
  };
}

async function TourDetails({ params }: Pick<PageProps<"/tours/[id]">, "params">) {
  const id = parseId((await params).id);
  if (id === null) notFound();
  const [tour, { tours, today }] = await Promise.all([getTour(id), getActiveTours()]);
  if (!tour) notFound();

  const country = getCountry(tour.countrySlug);
  const photos = tour.photos.length > 0 ? tour.photos : [tourCover(tour)];
  const kind = TOUR_KINDS.find((k) => k.value === tour.kind)?.label;
  const departures = tour.departureDates.filter((d) => d >= today);
  const similar = sortTours(
    tours.filter((t) => t.id !== tour.id && t.countrySlug !== null && t.countrySlug === tour.countrySlug),
    "soon",
    today,
  ).slice(0, 3);

  return (
    <>
      <nav aria-label="Навигация" className="mb-8 text-sm text-muted">
        <Link href="/tours" className="underline underline-offset-4">
          Все туры
        </Link>
        {country && <span> / {country.name}</span>}
      </nav>

      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="flex flex-col gap-4">
          <div className="relative aspect-4/5 overflow-hidden rounded-arch bg-sand-2">
            <Image src={photos[0]} alt={tour.title} fill priority sizes="(min-width: 1024px) 45vw, 92vw" className="object-cover" />
          </div>
          {photos.length > 1 && (
            <div className="grid grid-cols-3 gap-3">
              {photos.slice(1, 4).map((src) => (
                <div key={src} className="relative aspect-square overflow-hidden rounded-2xl">
                  <Image src={src} alt="" fill sizes="15vw" className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          {country && (
            <p className="mb-4 inline-block rounded-full border border-champagne px-4 py-1 text-sm font-semibold text-pine">
              {country.name}
            </p>
          )}
          <h1 className="text-[clamp(2rem,1.3rem+2.4vw,3.1rem)] leading-[1.1] text-pine">{tour.title}</h1>

          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-y border-line py-6">
            <div>
              <dt className="text-sm text-muted">Цена за человека</dt>
              <dd className="mt-1 text-2xl font-bold text-pine-2">
                {tour.priceFrom !== null && tour.currency ? `от ${formatPrice(tour.priceFrom, tour.currency)}` : "по запросу"}
              </dd>
            </div>
            {tour.nights && (
              <div>
                <dt className="text-sm text-muted">Длительность</dt>
                <dd className="mt-1 text-xl font-semibold">{nightsLabel(tour.nights)}</dd>
              </div>
            )}
            {departures.length > 0 && (
              <div className="col-span-2">
                <dt className="text-sm text-muted">{departures.length > 1 ? "Даты вылета" : "Дата вылета"}</dt>
                <dd className="mt-1 text-lg">{departures.map(formatDay).join(", ")}</dd>
              </div>
            )}
            {kind && (
              <div>
                <dt className="text-sm text-muted">Тип отдыха</dt>
                <dd className="mt-1">{kind}</dd>
              </div>
            )}
          </dl>

          <div className="mt-8 max-w-[65ch] text-[17px] leading-relaxed whitespace-pre-line">{tour.body}</div>
          <p className="mt-6 text-sm text-muted">
            Цены — на момент публикации,{" "}
            <a href={tour.postUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
              оригинальный пост в Telegram
            </a>
            .
          </p>
        </div>
      </div>

      <section id="request" className="mt-20 grid gap-10 rounded-3xl bg-pine-2 p-6 text-sand sm:p-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <h2 className="text-[clamp(1.8rem,1.2rem+2vw,2.6rem)] leading-tight">Узнать про места на этот тур</h2>
          <p className="mt-4 max-w-sm text-mist">Проверим наличие на ваши даты и пришлём точную цену в мессенджер.</p>
        </div>
        <div className="rounded-2xl bg-sand p-6 text-ink sm:p-8">
          <RequestForm defaultWhere={country?.name} tour={`${tour.title} (№${tour.id})`} />
        </div>
      </section>

      {similar.length > 0 && (
        <section className="mt-24">
          <h2 className="mb-10 text-[clamp(1.8rem,1.2rem+2vw,2.6rem)] text-pine">Ещё туры в {country?.inName}</h2>
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((t) => (
              <TourCard key={t.id} tour={t} today={today} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

export default function TourPage(props: PageProps<"/tours/[id]">) {
  return (
    <div className="wrap py-10 md:py-14">
      <Suspense fallback={<p className="text-muted">Загружаем тур…</p>}>
        <TourDetails params={props.params} />
      </Suspense>
    </div>
  );
}
