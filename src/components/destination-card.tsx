import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import type { Destination } from "@/lib/destinations";

interface DestinationCardProps {
  destination: Destination;
  /** Минимальная цена из актуальных туров, если есть. */
  priceUsd: number;
}

/** Карточка направления со ссылкой на его страницу. */
export function DestinationCard({ destination, priceUsd }: DestinationCardProps) {
  return (
    <article className="group relative">
      <div className="relative aspect-4/5 overflow-hidden rounded-arch bg-sand-2">
        <Image
          src={destination.image}
          alt={destination.imageAlt}
          fill
          sizes="(min-width: 1024px) 270px, (min-width: 640px) 45vw, 92vw"
          className="object-cover"
        />
      </div>
      <h3 className="mt-4 text-2xl">
        <Link
          href={`/destinations/${destination.slug}`}
          className="underline-offset-4 group-hover:underline after:absolute after:inset-0"
        >
          {destination.name}
        </Link>
      </h3>
      <p className="mt-1 text-sm text-muted">{destination.tagline}</p>
      <p className="mt-3 flex items-center justify-between">
        <span className="font-bold text-pine-2">от {formatPrice(priceUsd, "USD")}</span>
        <span className="rounded-full border border-champagne px-3 py-0.5 text-sm">за человека</span>
      </p>
    </article>
  );
}
