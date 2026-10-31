import type { Metadata, Viewport } from "next";
import { Manrope, Prata } from "next/font/google";
import { FloatChat } from "@/components/float-chat";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { site } from "@/lib/site";
import "./globals.css";

const prata = Prata({ variable: "--font-prata", weight: "400", subsets: ["cyrillic", "latin"], display: "swap" });
const manrope = Manrope({ variable: "--font-manrope", subsets: ["cyrillic", "latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — туры из Ташкента`, template: `%s — ${site.name}` },
  description: site.description,
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: site.name,
    images: [{ url: "/images/maldives.jpg", alt: "Виллы над водой на Мальдивах" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0e3b36",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className={`${prata.variable} ${manrope.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <FloatChat />
      </body>
    </html>
  );
}
