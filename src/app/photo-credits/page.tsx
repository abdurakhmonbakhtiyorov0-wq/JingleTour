import type { Metadata } from "next";
import { PHOTO_CREDITS, LICENSE_URLS } from "@/lib/photo-credits";

export const metadata: Metadata = {
  title: "Авторы фотографий",
  description: "Авторы и лицензии фотографий на сайте.",
  robots: { index: false },
};

export default function PhotoCreditsPage() {
  return (
    <div className="wrap max-w-3xl py-10 md:py-14">
      <h1 className="text-[clamp(2rem,1.3rem+2.4vw,3rem)] leading-tight text-pine">Авторы фотографий</h1>
      <p className="mt-5 text-lg text-muted">
        Снимки ниже взяты с Wikimedia Commons. Для сайта мы их обрезали и сжали. Обрезанные версии снимков под лицензиями CC BY-SA
        распространяются на тех же условиях. Остальные фотографии на сайте — с Unsplash и из нашего Telegram-канала.
      </p>
      <ul className="mt-8 divide-y divide-line">
        {PHOTO_CREDITS.map((photo) => {
          const licenseUrl = LICENSE_URLS[photo.license];
          return (
            <li key={photo.source} className="py-3 text-[15px]">
              <a href={photo.source} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                {photo.title}
              </a>
              <span className="text-muted">
                {" "}
                — {photo.author},{" "}
                {licenseUrl ? (
                  <a href={licenseUrl} target="_blank" rel="license noopener noreferrer" className="underline underline-offset-4">
                    {photo.license}
                  </a>
                ) : (
                  photo.license
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
