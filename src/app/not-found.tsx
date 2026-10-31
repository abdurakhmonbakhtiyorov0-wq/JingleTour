import Link from "next/link";
import { buttonClass } from "@/components/ui";
import { site } from "@/lib/site";

/** 404: тур мог истечь или быть скрыт — ведём к актуальным турам. */
export default function NotFound() {
  return (
    <div className="wrap flex flex-col items-start py-24 md:py-32">
      <p className="font-display text-7xl text-champagne-deep">404</p>
      <h1 className="mt-4 max-w-[20ch] text-[clamp(2rem,1.3rem+2.4vw,3rem)] leading-tight text-pine">
        Такой страницы нет — возможно, тур уже прошёл
      </h1>
      <p className="mt-4 max-w-xl text-lg text-muted">
        Места на горящие туры быстро заканчиваются, и такие туры мы убираем с сайта. Посмотрите актуальные предложения или
        напишите нам — подберём похожий вариант.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/tours" className={buttonClass("dark")}>
          Актуальные туры
        </Link>
        <a href={site.telegramChat} target="_blank" rel="noopener noreferrer" className={buttonClass("outline")}>
          Написать в Telegram
        </a>
      </div>
    </div>
  );
}
