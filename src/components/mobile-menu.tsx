"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { buttonClass } from "@/components/ui";

interface MobileMenuProps {
  links: readonly { href: string; label: string }[];
}

/** Меню для телефона: кнопка «Меню» и выпадающий список разделов. */
export function MobileMenu({ links }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="ml-auto lg:hidden sm:ml-0">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
        className="min-h-11 rounded-full border border-pine/30 px-5 text-[15px] font-semibold text-pine"
      >
        {open ? "Закрыть" : "Меню"}
      </button>
      {open && (
        <nav
          id={menuId}
          aria-label="Разделы сайта"
          className="absolute inset-x-0 top-full border-b border-line bg-sand pb-6 shadow-lg"
        >
          <div className="wrap">
            <ul>
              {links.map((link) => (
                <li key={link.href} className="border-b border-line/70">
                  <Link href={link.href} onClick={() => setOpen(false)} className="block py-4 text-lg">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/#request" onClick={() => setOpen(false)} className={buttonClass("dark", "mt-5 w-full")}>
              Подобрать тур
            </Link>
          </div>
        </nav>
      )}
    </div>
  );
}
