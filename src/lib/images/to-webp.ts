import sharp from "sharp";

const MAX_WIDTH = 1200;
const QUALITY = 78;

/**
 * Сжимает фото для сайта: поворачивает по EXIF, уменьшает до 1200px и переводит в WebP.
 * Так фото тура весит 100–200 КБ и не съедает лимиты Storage.
 * @param input - исходное изображение (JPEG, PNG, WebP)
 * @returns WebP-изображение
 * @throws Error, если файл не является изображением
 */
export async function toWebp(input: Buffer): Promise<Buffer> {
  return sharp(input)
    .rotate()
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toBuffer();
}
