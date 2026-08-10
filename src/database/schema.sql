-- EggRateToday — reference schema.
-- Applied once the Cloud backend is enabled; kept here as the source of truth
-- for the shape the data layer in src/database/queries.ts expects.

create table if not exists public.states (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  code text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.cities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  state_id uuid not null references public.states(id) on delete cascade,
  is_major_market boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.egg_rates (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references public.cities(id) on delete cascade,
  rate_date date not null,
  market text not null default 'necc',
  price_per_piece numeric(6,2) not null,
  created_at timestamptz not null default now(),
  unique (city_id, rate_date, market)
);

create index if not exists egg_rates_date_idx on public.egg_rates (rate_date desc);
create index if not exists egg_rates_city_date_idx on public.egg_rates (city_id, rate_date desc);
create index if not exists cities_state_idx on public.cities (state_id);