import Link from "next/link";
import { site } from "@/lib/site";

/** Подвал: контакты, соцсети, часы работы и ссылки. */
export function SiteFooter() {
  return (
    <footer id="contacts" className="bg-pine text-sand">
      <div className="wrap grid gap-10 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-3xl text-champagne">{site.name}</p>
          <p className="mt-3 max-w-xs text-mist">
            Туры из Ташкента: пляжи, экскурсии, лечение, круизы и авиабилеты.
          </p>
        </div>
        <div>
          <h2 className="text-lg text-champagne">Связаться</h2>
          <ul className="mt-4 space-y-2">
            <li>
              <a href={site.phoneHref} className="hover:underline">
                {site.phone}
              </a>
            </li>
            <li>
              <a href={site.telegramChat} target="_blank" rel="noopener noreferrer" className="hover:underline">
                Написать в Telegram
              </a>
            </li>
            <li>
              <a
                href={`https://wa.me/${site.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                Написать в WhatsApp
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="text-lg text-champagne">Подписаться</h2>
          <ul className="mt-4 space-y-2">
            <li>
              <a href={site.channelUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                Telegram-канал с горящими турами
              </a>
            </li>
            <li>
              <a href={site.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                Instagram
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="text-lg text-champagne">Часы работы</h2>
          <p className="mt-4">{site.hours}</p>
          <p className="mt-1 text-mist">Работаем онлайн, без офиса</p>
          <p className="mt-1 text-mist">Оплата: {site.payment.toLowerCase()}</p>
        </div>
      </div>
      <div className="wrap flex flex-col gap-3 border-t border-sand/15 py-6 text-sm text-mist md:flex-row md:justify-between">
        <p>
          © {site.name}, {site.city}
        </p>
        <nav aria-label="Документы" className="flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/privacy" className="hover:underline">
            Политика конфиденциальности
          </Link>
          <Link href="/about" className="hover:underline">
            О нас
          </Link>
        </nav>
        <p>
          Фото: Unsplash, Wikimedia Commons (Kuruman,{" "}
          <a href="https://creativecommons.org/licenses/by/2.0/" className="underline" rel="license noopener noreferrer" target="_blank">
            CC BY 2.0
          </a>
          )
        </p>
      </div>
    </footer>
  );
}
