-- Права на таблицы выдаём явно, а не надеемся на настройки проекта по умолчанию.
-- Какие строки видны посетителям, дальше решают политики RLS.
grant select on public.tours to anon, authenticated;

-- requests и channel_media посетителям недоступны совсем.
grant select, insert, update, delete on public.tours, public.channel_media, public.requests to service_role;
