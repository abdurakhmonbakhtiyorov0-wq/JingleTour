/**
 * Скриншоты страниц для проверки вёрстки: npx tsx scripts/screenshots.ts [baseUrl] [outDir]
 */
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { chromium, type Page } from "playwright";

const base = process.argv[2] ?? "http://localhost:3000";
const out = process.argv[3] ?? "screenshots";
const pages = ["/", "/tours", "/tours/3013", "/destinations/turkey", "/avia", "/about", "/tours/999"];
const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

async function main(): Promise<void> {
  mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  try {
    for (const vp of viewports) {
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
      for (const path of pages) {
        await page.goto(`${base}${path}`, { waitUntil: "networkidle" });
        await autoScroll(page);
        const name = `${vp.name}${path === "/" ? "-home" : path.replaceAll("/", "-")}.png`;
        await page.screenshot({ path: join(out, name), fullPage: true });
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        console.log(`${name}${overflow > 0 ? `  ⚠ горизонтальный скролл ${overflow}px` : ""}`);
      }
      await page.close();
    }
  } finally {
    await browser.close();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});

/**
 * Прокручивает страницу до конца, чтобы подгрузились ленивые картинки и виджеты.
 */
async function autoScroll(page: Page): Promise<void> {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1500);
}
