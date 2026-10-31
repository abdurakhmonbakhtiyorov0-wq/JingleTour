import type { MetadataRoute } from "next";
import { DESTINATIONS } from "@/lib/destinations";
import { site } from "@/lib/site";
import { getActiveTours } from "@/lib/tours/repository";

/** Карта сайта для Google: страницы, направления и актуальные туры. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { tours } = await getActiveTours();
  const pages = ["", "/tours", "/avia", "/about", "/privacy"].map((path) => ({ url: `${site.url}${path}` }));
  const destinations = DESTINATIONS.map((d) => ({ url: `${site.url}/destinations/${d.slug}` }));
  const tourPages = tours.map((t) => ({ url: `${site.url}/tours/${t.id}`, lastModified: t.postedAt }));
  return [...pages, ...destinations, ...tourPages];
}
