import type { CountrySlug } from "@/lib/countries";

/**
 * Снимки стран для туров без своего фото: большинство постов канала — видео,
 * а их превью слишком мелкие. Авторы и лицензии — в src/lib/photo-credits.ts.
 */
export const COUNTRY_PHOTOS: Readonly<Record<CountrySlug, readonly string[]>> = {
  uae: ["/images/uae.jpg", "/images/countries/uae-1.webp", "/images/countries/uae-2.webp"],
  turkey: ["/images/turkey.jpg", "/images/istanbul.jpg", "/images/countries/turkey-1.webp"],
  vietnam: ["/images/vietnam.jpg", "/images/countries/vietnam-1.webp", "/images/countries/vietnam-2.webp"],
  thailand: ["/images/thailand.jpg", "/images/countries/thailand-1.webp", "/images/countries/thailand-2.webp"],
  malaysia: ["/images/boats.jpg", "/images/countries/malaysia-1.webp", "/images/countries/malaysia-2.webp"],
  "sri-lanka": ["/images/palms.jpg", "/images/countries/sri-lanka-1.webp", "/images/countries/sri-lanka-2.webp"],
  azerbaijan: ["/images/baku.jpg", "/images/countries/azerbaijan-1.webp", "/images/countries/azerbaijan-2.webp"],
  china: ["/images/china.jpg", "/images/countries/china-1.webp", "/images/countries/china-2.webp"],
  egypt: ["/images/countries/egypt-1.webp"],
  maldives: ["/images/maldives.jpg", "/images/countries/maldives-1.webp", "/images/countries/maldives-2.webp"],
  georgia: ["/images/countries/georgia-1.webp", "/images/countries/georgia-2.webp", "/images/countries/georgia-3.webp"],
  kyrgyzstan: ["/images/countries/kyrgyzstan-1.webp", "/images/countries/kyrgyzstan-2.webp", "/images/countries/kyrgyzstan-3.webp"],
  qatar: ["/images/countries/qatar-1.webp", "/images/countries/qatar-2.webp", "/images/countries/qatar-3.webp"],
  oman: ["/images/countries/oman-1.webp", "/images/countries/oman-2.webp", "/images/countries/oman-3.webp"],
  indonesia: ["/images/countries/indonesia-1.webp", "/images/countries/indonesia-2.webp"],
  czechia: ["/images/countries/czechia-1.webp", "/images/countries/czechia-2.webp"],
  russia: ["/images/countries/russia-1.webp", "/images/countries/russia-2.webp", "/images/countries/russia-3.webp"],
  "saudi-arabia": ["/images/countries/saudi-arabia-1.webp", "/images/countries/saudi-arabia-2.webp", "/images/countries/saudi-arabia-3.webp"],
};
