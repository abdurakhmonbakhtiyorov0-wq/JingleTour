import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SectionHead } from "@/components/section-head";
import { TourCard } from "@/components/tour-card";
import { buttonClass } from "@/components/ui";
import { getCountry, isCountrySlug } from "@/lib/countries";
import { site } from "@/lib/site";
import { getActiveTours } from "@/lib/tours/repository";
import { filterTours, type TourFilters, type TourSort } from "@/lib/tours/select";
import { TOUR_KINDS, type TourKind } from "@/lib/tours/types";

export const metadata: Metadata = {
  title: "Все туры",
  description: "Актуальные туры из Ташкента: пляжные, экскурсионные и лечебные. Цены за человека, обновляются из нашего Telegram-канала.",
};

const SORTS: readonly { value: TourSort; label: string }[] = [
  { value: "soon", label: "Скоро вылет" },
  { value: "cheap", label: "Сначала дешевле" },
  { value: "new", label: "Новые" },
];

const PRICES = [500, 800, 1000, 1500, 2000] as const;

/**
 * Первое значение параметра адреса.
 */
function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Разбирает ?country=&kind=&max=&sort= в фильтры, отбрасывая мусор.
 */
function readFilters(params: Record<string, string | string[] | undefined>): TourFilters {
  const country = first(params.country);
  const kind = first(params.kind);
  const max = Number(first(params.max));
  const sort = first(params.sort);
  return {
    country: country && isCountrySlug(country) ? country : undefined,
    kind: TOUR_KINDS.some((k) => k.value === kind) ? (kind as TourKind) : undefined,
    maxPrice: Number.isFinite(max) && max > 0 ? max : undefined,
    sort: SORTS.some((s) => s.value === sort) ? (sort as TourSort) : "soon",
  };
}

const SELECT =
  "min-h-11 w-full cursor-pointer rounded-full border border-line bg-sand pr-5 pl-4 text-[15px] focus:border-pine-2 focus:outline-none";

async function ToursResults({ searchParams }: Pick<PageProps<"/tours">, "searchParams">) {
  const filters = readFilters(await searchParams);
  const { tours, today } = await getActiveTours();
  const countries = [...new Set(tours.map((t) => t.countrySlug).filter((c): c is NonNullable<typeof c> => c !== null))]
    .map((slug) => getCountry(slug))
    .filter((c) => c !== undefined)
    .sort((a, b) => a.name.localeCompare(b.name, "ru"));
  const result = filterTours(tours, filters, today);

  return (
    <>
      <form method="get" className="mb-12 grid gap-4 rounded-3xl bg-sand-2 p-5 sm:grid-cols-2 lg:grid-cols-[repeat(4,1fr)_auto]">
        <label className="flex flex-col gap-1 text-sm text-muted">
          Страна
          <select name="country" defaultValue={filters.country ?? ""} className={SELECT}>
            <option value="">Все страны</option>
            {countries.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-muted">
          Тип отдыха
          <select name="kind" defaultValue={filters.kind ?? ""} className={SELECT}>
            <option value="">Любой</option>
            {TOUR_KINDS.map((k) => (
              <option key={k.value} value={k.value}>
                {k.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-muted">
          Цена за человека
          <select name="max" defaultValue={filters.maxPrice ? String(filters.maxPrice) : ""} className={SELECT}>
            <option value="">Любая</option>
            {PRICES.map((p) => (
              <option key={p} value={p}>
                до {p.toLocaleString("ru-RU")} $
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-muted">
          Порядок
          <select name="sort" defaultValue={filters.sort} className={SELECT}>
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className={buttonClass("dark", "self-end")}>
          Показать
        </button>
      </form>

      {result.length > 0 ? (
        <>
          <p className="mb-8 text-muted">
            Найдено туров: {result.length}
            {filters.country || filters.kind || filters.maxPrice ? (
              <>
                {" · "}
                <Link href="/tours" className="underline underline-offset-4">
                  сбросить фильтры
                </Link>
              </>
            ) : null}
          </p>
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {result.map((tour, index) => (
              <TourCard key={tour.id} tour={tour} today={today} priority={index < 3} />
            ))}
          </div>
        </>
      ) : (
        <div className="max-w-xl">
          <p className="text-lg">По этим фильтрам сейчас нет туров.</p>
          <p className="mt-2 text-muted">
            Напишите нам, что ищете, — подберём сами. Или посмотрите свежие предложения в нашем Telegram-канале.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/#request" className={buttonClass("dark")}>
              Подобрать тур
            </Link>
            <a href={site.channelUrl} target="_blank" rel="noopener noreferrer" className={buttonClass("outline")}>
              Открыть канал
            </a>
          </div>
        </div>
      )}
    </>
  );
}

export default function ToursPage(props: PageProps<"/tours">) {
  return (
    <div className="wrap py-14 md:py-20">
      <SectionHead title="Все туры" as="h1">
        Туры из нашего Telegram-канала. Цены за человека при двухместном размещении на момент публикации — точную стоимость
        на ваши даты пришлём в мессенджер.
      </SectionHead>
      <Suspense fallback={<p className="text-muted">Загружаем туры…</p>}>
        <ToursResults searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}
