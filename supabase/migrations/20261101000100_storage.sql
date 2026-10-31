-- Публичный bucket для фото туров. Загружает только сервер (service_role),
-- читать может кто угодно по публичной ссылке.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('tour-photos', 'tour-photos', true, 2097152, array['image/webp'])
on conflict (id) do nothing;
