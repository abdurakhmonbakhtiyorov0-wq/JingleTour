-- Jingle Tour: туры из Telegram-канала и заявки клиентов.
-- Писать в эти таблицы может только сервер (service_role обходит RLS).

create table public.tours (
  id bigint primary key,                    -- id сообщения в канале
  media_group_id text unique,               -- альбом Telegram, если у поста несколько фото
  title text not null check (char_length(title) between 1 and 200),
  body text not null default '',
  country_slug text,
  kind text not null default 'beach' check (kind in ('beach', 'excursion', 'health')),
  price_from bigint check (price_from > 0),
  currency text check (currency in ('USD', 'UZS')),
  nights smallint check (nights between 1 and 60),
  departure_dates date[] not null default '{}',
  photos text[] not null default '{}',      -- пути в bucket tour-photos или абсолютные ссылки
  post_url text not null,
  posted_at timestamptz not null,
  expires_at timestamptz not null,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tours_price_currency check ((price_from is null) = (currency is null))
);

create index tours_visible_expires_idx on public.tours (expires_at) where is_visible;
create index tours_country_idx on public.tours (country_slug);

-- Фото альбомов приходят отдельными апдейтами; храним их file_id,
-- а качаем только когда альбом оказался туром.
create table public.channel_media (
  message_id bigint primary key,
  media_group_id text not null,
  file_id text not null,
  file_unique_id text not null,
  storage_path text,
  created_at timestamptz not null default now()
);

create index channel_media_group_idx on public.channel_media (media_group_id, message_id);

create table public.requests (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('tour', 'avia')),
  name text check (char_length(name) <= 80),
  contact text not null check (char_length(contact) between 3 and 100),
  details jsonb not null default '{}'::jsonb,
  ip_hash text not null,
  status text not null default 'new' check (status in ('new', 'in_progress', 'done', 'spam')),
  notified boolean not null default false,
  created_at timestamptz not null default now()
);

create index requests_ip_created_idx on public.requests (ip_hash, created_at desc);

create function public.set_updated_at() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tours_set_updated_at
before update on public.tours
for each row execute function public.set_updated_at();

alter table public.tours enable row level security;
alter table public.channel_media enable row level security;
alter table public.requests enable row level security;

-- Посетители сайта видят только актуальные туры.
-- У channel_media и requests политик нет: читать и писать их может только сервер.
create policy "Посетители видят актуальные туры"
on public.tours for select
to anon, authenticated
using (is_visible and expires_at > now());
