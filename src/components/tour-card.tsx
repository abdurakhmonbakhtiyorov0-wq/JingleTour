import Image from "next/image";
import Link from "next/link";
import { formatDay, formatPrice, nightsLabel } from "@/lib/format";
import { nextDeparture, tourCountryLabel, tourCover } from "@/lib/tours/select";
import type { Tour } from "@/lib/tours/types";

interface TourCardProps {
  tour: Tour;
  today: string;
  /** Первые карточки на экране грузятся сразу. */
  priority?: boolean;
}

/** Карточка тура: фото-арка, страна, заголовок, вылет и цена. */
export function TourCard({ tour, today, priority = false }: TourCardProps) {
  const departure = nextDeparture(tour, today);
  const country = tourCountryLabel(tour);
  return (
    <article className="group relative flex flex-col">
      <div className="relative aspect-4/5 overflow-hidden rounded-arch bg-sand-2">
        <Image
          src={tourCover(tour)}
          alt=""
          fill
          sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 92vw"
          className="object-cover"
          priority={priority}
        />
        {country && (
          <span className="absolute top-[18%] left-4 rounded-full bg-sand/95 px-3 py-1 text-sm font-semibold text-pine">
            {country}
          </span>
        )}
      </div>
      <h3 className="mt-4 line-clamp-2 min-h-[2.75em] text-xl leading-snug">
        <Link href={`/tours/${tour.id}`} className="underline-offset-4 group-hover:underline after:absolute after:inset-0">
          {tour.title}
        </Link>
      </h3>
      <p className="mt-1 text-sm text-muted">
        {[departure && `вылет ${formatDay(departure)}`, tour.nights && nightsLabel(tour.nights)].filter(Boolean).join(", ") ||
          "даты уточняйте"}
      </p>
      <p className="mt-3 flex items-baseline justify-between border-t border-line pt-3">
        <span className="font-bold text-pine-2">
          {tour.priceFrom !== null && tour.currency ? `от ${formatPrice(tour.priceFrom, tour.currency)}` : "Цена по запросу"}
        </span>
        <span className="text-sm text-muted">за человека</span>
      </p>
    </article>
  );
}
