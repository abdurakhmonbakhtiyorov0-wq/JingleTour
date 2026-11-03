# Jingle Tour — сайт турагентства

Next.js 16 (App Router, Cache Components) + TypeScript + Tailwind 4 + Supabase.
Туры приходят из Telegram-канала [@jingle_tour](https://t.me/jingle_tour) через бота: пост с хэштегом `#тур` сам становится карточкой на сайте.

## Быстрый старт

```bash
npm install
npm run dev          # http://localhost:3000
```

Без переменных окружения сайт работает на `src/lib/tours/seed-tours.json` — 7 туров, импортированных из канала. Заявки в этом режиме пишутся в консоль сервера.

## Команды

| Команда | Что делает |
|---|---|
| `npm run dev` | дев-сервер |
| `npm run build` / `npm start` | продакшн-сборка и запуск |
| `npm run check` | `tsc` + ESLint + тесты |
| `npm test` | Vitest: парсер постов, вебхук, заявки, миграции (на PGlite, без Docker) |
| `npm run import:channel -- --dry-run` | показать туры из канала, ничего не записывая |
| `npm run import:channel` | импортировать актуальные туры из `t.me/s/jingle_tour` в Supabase |
| `npx tsx scripts/screenshots.ts http://localhost:3000 screenshots` | скриншоты страниц для проверки вёрстки (нужен `npx playwright install chromium`) |

## Страницы

| Путь | Что там |
|---|---|
| `/` | главная: 9 секций + шапка и подвал |
| `/tours` | все туры, фильтры `?country=&kind=&max=&sort=` |
| `/tours/[id]` | тур; `id` = id поста в канале |
| `/destinations/[slug]` | 8 направлений (контент в `src/lib/destinations.ts`) |
| `/avia` | заявка на авиабилеты |
| `/about`, `/privacy` | о нас, политика конфиденциальности |
| `/api/telegram` | вебхук бота |

## Как устроено

```
пост в канале с #тур ──► бот (админ канала) ──► POST /api/telegram
                                                  ├─ разбор: страна, цена, даты, ночи (src/lib/telegram/parse-post.ts)
                                                  ├─ фото → WebP 1200px → Supabase Storage (bucket tour-photos)
                                                  ├─ upsert в tours
                                                  └─ revalidateTag("tours")

форма заявки ──► Server Action ──► zod ──► лимит 5 заявок / 10 мин с IP ──► requests ──► after(): сообщение маме в Telegram
```

- **Альбомы:** фото приходят отдельными апдейтами; их `file_id` копятся в `channel_media` и скачиваются, только когда альбом оказался туром.
- **Редактирование:** убрали `#тур` — тур скрывается; вернули — снова на сайте.
- **Удаление поста** Telegram ботам не сообщает. Поэтому туры скрываются сами после последней даты в посте (без дат — через 30 дней), а мама может переслать пост боту и нажать «Скрыть с сайта».
- **Кеш:** `getActiveTours()` — `"use cache"` + `cacheLife("hours")` + тег `tours`.

## Подключение (по шагам)

1. **Supabase.** Создать проект, затем:
   ```bash
   npx supabase login
   npx supabase link --project-ref <ref>
   npx supabase db push --remote
   ```
   Docker для этого не нужен. Проверить, что появился bucket `tour-photos`.
2. **Бот.** @BotFather → `/newbot` → токен в `TELEGRAM_BOT_TOKEN`. Добавить бота администратором канала — только админы-боты получают посты канала. Особых прав давать не нужно.
3. **Переменные.** Скопировать `.env.example` в `.env.local` и в Vercel.
4. **Деплой на Vercel**, затем вебхук:
   ```bash
   curl "https://api.telegram.org/bot<TOKEN>/setWebhook" \
     -d url=https://<домен>/api/telegram \
     -d secret_token=<TELEGRAM_WEBHOOK_SECRET> \
     -d max_connections=1 \
     -d 'allowed_updates=["channel_post","edited_channel_post","message","callback_query"]'
   ```
   `max_connections=1` — чтобы фото одного альбома обрабатывались по очереди.
5. **Админ.** Мама пишет боту `/start`, бот отвечает её `chat_id` → добавить в `ADMIN_CHAT_IDS`, передеплоить.
6. **Старые туры:** `npm run import:channel`.
7. **Проверка:** опубликовать в канале тестовый пост с `#тур`, ценой и страной — он должен появиться на `/tours`. Затем отправить заявку с сайта — маме придёт сообщение.

## Что проверить перед запуском

- Тексты направлений (`src/lib/destinations.ts`): время перелёта и сезоны — примерные.
- Политику конфиденциальности (`src/app/privacy/page.tsx`) — сверить с законом Узбекистана о персональных данных, в том числе с требованием хранить данные граждан на серверах в Узбекистане.
- Список туроператоров в `src/lib/site.ts`.

## Фото

Unsplash (лицензия Unsplash), Баку — Wikimedia Commons (CC0), Чжанцзяцзе — Kuruman, Wikimedia Commons ([CC BY 2.0](https://creativecommons.org/licenses/by/2.0/)), атрибуция в подвале сайта.
