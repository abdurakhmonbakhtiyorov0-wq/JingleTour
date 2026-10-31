import Link from "next/link";
import { MobileMenu } from "@/components/mobile-menu";
import { buttonClass } from "@/components/ui";
import { site } from "@/lib/site";

export const NAV_LINKS = [
  { href: "/tours", label: "Туры" },
  { href: "/#destinations", label: "Направления" },
  { href: "/avia", label: "Авиабилеты" },
  { href: "/about", label: "О нас" },
  { href: "#contacts", label: "Контакты" },
] as const;

/** Шапка сайта: логотип, меню и кнопка заявки. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/60 bg-sand/90 backdrop-blur">
      <div className="wrap flex h-16 items-center gap-6 md:h-20">
        <Link href="/" className="font-display text-2xl whitespace-nowrap text-pine">
          {site.name}
        </Link>
        <nav aria-label="Разделы сайта" className="ml-auto hidden gap-7 text-[15px] lg:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-pine-2 hover:underline hover:underline-offset-4">
              {link.label}
            </Link>
          ))}
        </nav>
        {/* Обёртка нужна, потому что inline-flex из buttonClass перебивает hidden */}
        <div className="ml-auto hidden sm:block lg:ml-0">
          <Link href="/#request" className={buttonClass("dark")}>
            Подобрать тур
          </Link>
        </div>
        <MobileMenu links={NAV_LINKS} />
      </div>
    </header>
  );
}
