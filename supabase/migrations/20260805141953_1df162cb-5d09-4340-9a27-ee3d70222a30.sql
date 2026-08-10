
-- ===== Enums =====
create type public.record_status as enum ('active','inactive','draft','archived');
create type public.rate_market_type as enum ('wholesale','retail','both');
create type public.import_status as enum ('pending','validating','previewed','importing','completed','failed','rolled_back');
create type public.export_format as enum ('csv','xlsx','json');
create type public.rate_action as enum ('created','updated','deleted','published','unpublished','verified','unverified','restored','imported','rolled_back');
create type public.source_kind as enum ('manual','csv','excel','api','cron','webhook','scrape');

-- ===== Units =====
create table public.units (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  eggs_per_unit integer not null default 1,
  display_order integer not null default 0,
  status public.record_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.units to anon;
grant select, insert, update, delete on public.units to authenticated;
grant all on public.units to service_role;
alter table public.units enable row level security;
create policy units_select_public on public.units for select to anon, authenticated using (status = 'active');
create policy units_select_staff on public.units for select to authenticated using (public.is_staff(auth.uid()));
create policy units_write_staff on public.units for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

-- ===== Rate categories =====
create table public.rate_categories (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  description text,
  display_order integer not null default 0,
  status public.record_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.rate_categories to anon;
grant select, insert, update, delete on public.rate_categories to authenticated;
grant all on public.rate_categories to service_role;
alter table public.rate_categories enable row level security;
create policy rate_categories_select_public on public.rate_categories for select to anon, authenticated using (status = 'active');
create policy rate_categories_select_staff on public.rate_categories for select to authenticated using (public.is_staff(auth.uid()));
create policy rate_categories_write_staff on public.rate_categories for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

-- ===== Data sources =====
create table public.data_sources (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  kind public.source_kind not null default 'manual',
  url text,
  description text,
  is_trusted boolean not null default false,
  status public.record_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.data_sources to anon;
grant select, insert, update, delete on public.data_sources to authenticated;
grant all on public.data_sources to service_role;
alter table public.data_sources enable row level security;
create policy data_sources_select_public on public.data_sources for select to anon, authenticated using (status = 'active');
create policy data_sources_select_staff on public.data_sources for select to authenticated using (public.is_staff(auth.uid()));
create policy data_sources_write_staff on public.data_sources for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

-- ===== States =====
create table public.states (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  code text,
  seo_title text,
  meta_description text,
  status public.record_status not null default 'active',
  display_order integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index states_status_order_idx on public.states (status, display_order, name);
grant select on public.states to anon;
grant select, insert, update, delete on public.states to authenticated;
grant all on public.states to service_role;
alter table public.states enable row level security;
create policy states_select_public on public.states for select to anon, authenticated using (status = 'active');
create policy states_select_staff on public.states for select to authenticated using (public.is_staff(auth.uid()));
create policy states_write_staff on public.states for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

-- ===== Cities =====
create table public.cities (
  id uuid primary key default gen_random_uuid(),
  state_id uuid not null references public.states(id) on delete cascade,
  name text not null,
  slug text not null unique,
  latitude numeric(9,6),
  longitude numeric(9,6),
  population integer,
  is_featured boolean not null default false,
  status public.record_status not null default 'active',
  seo_title text,
  meta_description text,
  display_order integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index cities_state_idx on public.cities (state_id);
create index cities_status_idx on public.cities (status, name);
grant select on public.cities to anon;
grant select, insert, update, delete on public.cities to authenticated;
grant all on public.cities to service_role;
alter table public.cities enable row level security;
create policy cities_select_public on public.cities for select to anon, authenticated using (status = 'active');
create policy cities_select_staff on public.cities for select to authenticated using (public.is_staff(auth.uid()));
create policy cities_write_staff on public.cities for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

-- ===== Markets =====
create table public.markets (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references public.cities(id) on delete cascade,
  state_id uuid not null references public.states(id) on delete cascade,
  name text not null,
  slug text not null unique,
  market_type public.rate_market_type not null default 'both',
  supports_wholesale boolean not null default true,
  supports_retail boolean not null default true,
  seo_title text,
  meta_description text,
  status public.record_status not null default 'active',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index markets_city_idx on public.markets (city_id);
create index markets_state_idx on public.markets (state_id);
grant select on public.markets to anon;
grant select, insert, update, delete on public.markets to authenticated;
grant all on public.markets to service_role;
alter table public.markets enable row level security;
create policy markets_select_public on public.markets for select to anon, authenticated using (status = 'active');
create policy markets_select_staff on public.markets for select to authenticated using (public.is_staff(auth.uid()));
create policy markets_write_staff on public.markets for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

-- ===== Imports (declared before egg_rates for FK) =====
create table public.imports (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  file_format public.export_format not null default 'csv',
  source_id uuid references public.data_sources(id) on delete set null,
  status public.import_status not null default 'pending',
  total_rows integer not null default 0,
  valid_rows integer not null default 0,
  invalid_rows integer not null default 0,
  duplicate_rows integer not null default 0,
  imported_rows integer not null default 0,
  errors jsonb not null default '[]'::jsonb,
  preview jsonb not null default '[]'::jsonb,
  notes text,
  rolled_back_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index imports_created_idx on public.imports (created_at desc);
grant select, insert, update, delete on public.imports to authenticated;
grant all on public.imports to service_role;
alter table public.imports enable row level security;
create policy imports_staff on public.imports for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

-- ===== Exports =====
create table public.exports (
  id uuid primary key default gen_random_uuid(),
  file_format public.export_format not null default 'csv',
  filters jsonb not null default '{}'::jsonb,
  row_count integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index exports_created_idx on public.exports (created_at desc);
grant select, insert, delete on public.exports to authenticated;
grant all on public.exports to service_role;
alter table public.exports enable row level security;
create policy exports_staff on public.exports for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

-- ===== Egg rates =====
create table public.egg_rates (
  id uuid primary key default gen_random_uuid(),
  state_id uuid not null references public.states(id) on delete cascade,
  city_id uuid not null references public.cities(id) on delete cascade,
  market_id uuid references public.markets(id) on delete set null,
  category_id uuid references public.rate_categories(id) on delete set null,
  egg_rate numeric(10,2) not null,
  dozen_price numeric(10,2),
  tray_price numeric(10,2),
  hundred_price numeric(10,2),
  peti_price numeric(10,2),
  wholesale_price numeric(10,2),
  retail_price numeric(10,2),
  currency text not null default 'INR',
  effective_date date not null,
  source_id uuid references public.data_sources(id) on delete set null,
  import_id uuid references public.imports(id) on delete set null,
  is_verified boolean not null default false,
  verified_by uuid references auth.users(id) on delete set null,
  verified_at timestamptz,
  is_published boolean not null default false,
  published_at timestamptz,
  status public.record_status not null default 'active',
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (city_id, market_id, effective_date)
);
create index egg_rates_date_idx on public.egg_rates (effective_date desc);
create index egg_rates_city_date_idx on public.egg_rates (city_id, effective_date desc);
create index egg_rates_state_date_idx on public.egg_rates (state_id, effective_date desc);
create index egg_rates_published_idx on public.egg_rates (is_published, effective_date desc);
grant select on public.egg_rates to anon;
grant select, insert, update, delete on public.egg_rates to authenticated;
grant all on public.egg_rates to service_role;
alter table public.egg_rates enable row level security;
create policy egg_rates_select_public on public.egg_rates for select to anon, authenticated using (is_published = true and status = 'active');
create policy egg_rates_select_staff on public.egg_rates for select to authenticated using (public.is_staff(auth.uid()));
create policy egg_rates_write_staff on public.egg_rates for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

-- ===== Egg rate history (immutable snapshots) =====
create table public.egg_rate_history (
  id uuid primary key default gen_random_uuid(),
  rate_id uuid references public.egg_rates(id) on delete set null,
  state_id uuid,
  city_id uuid,
  market_id uuid,
  egg_rate numeric(10,2),
  dozen_price numeric(10,2),
  tray_price numeric(10,2),
  hundred_price numeric(10,2),
  peti_price numeric(10,2),
  wholesale_price numeric(10,2),
  retail_price numeric(10,2),
  currency text not null default 'INR',
  effective_date date,
  is_verified boolean,
  is_published boolean,
  snapshot jsonb not null default '{}'::jsonb,
  action public.rate_action not null default 'updated',
  changed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index egg_rate_history_rate_idx on public.egg_rate_history (rate_id, created_at desc);
create index egg_rate_history_date_idx on public.egg_rate_history (effective_date desc);
grant select on public.egg_rate_history to authenticated;
grant all on public.egg_rate_history to service_role;
alter table public.egg_rate_history enable row level security;
create policy egg_rate_history_select_staff on public.egg_rate_history for select to authenticated using (public.is_staff(auth.uid()));

-- ===== Rate logs =====
create table public.rate_logs (
  id uuid primary key default gen_random_uuid(),
  rate_id uuid,
  action public.rate_action not null,
  entity_type text not null default 'egg_rate',
  entity_id uuid,
  description text,
  changes jsonb not null default '{}'::jsonb,
  actor_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index rate_logs_created_idx on public.rate_logs (created_at desc);
grant select on public.rate_logs to authenticated;
grant all on public.rate_logs to service_role;
alter table public.rate_logs enable row level security;
create policy rate_logs_select_staff on public.rate_logs for select to authenticated using (public.is_staff(auth.uid()));

-- ===== updated_at triggers =====
create trigger units_updated_at before update on public.units for each row execute function public.set_updated_at();
create trigger rate_categories_updated_at before update on public.rate_categories for each row execute function public.set_updated_at();
create trigger data_sources_updated_at before update on public.data_sources for each row execute function public.set_updated_at();
create trigger states_updated_at before update on public.states for each row execute function public.set_updated_at();
create trigger cities_updated_at before update on public.cities for each row execute function public.set_updated_at();
create trigger markets_updated_at before update on public.markets for each row execute function public.set_updated_at();
create trigger imports_updated_at before update on public.imports for each row execute function public.set_updated_at();
create trigger egg_rates_updated_at before update on public.egg_rates for each row execute function public.set_updated_at();

-- ===== History trigger: never overwrite, always snapshot =====
create or replace function public.record_egg_rate_history()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  act public.rate_action;
  rec public.egg_rates;
begin
  if (tg_op = 'DELETE') then
    rec := old; act := 'deleted';
  elsif (tg_op = 'INSERT') then
    rec := new; act := 'created';
  else
    rec := new;
    if (old.is_published is distinct from new.is_published) then
      act := case when new.is_published then 'published' else 'unpublished' end;
    elsif (old.is_verified is distinct from new.is_verified) then
      act := case when new.is_verified then 'verified' else 'unverified' end;
    else
      act := 'updated';
    end if;
  end if;

  insert into public.egg_rate_history (
    rate_id, state_id, city_id, market_id, egg_rate, dozen_price, tray_price,
    hundred_price, peti_price, wholesale_price, retail_price, currency,
    effective_date, is_verified, is_published, snapshot, action, changed_by
  ) values (
    rec.id, rec.state_id, rec.city_id, rec.market_id, rec.egg_rate, rec.dozen_price, rec.tray_price,
    rec.hundred_price, rec.peti_price, rec.wholesale_price, rec.retail_price, rec.currency,
    rec.effective_date, rec.is_verified, rec.is_published, to_jsonb(rec), act,
    coalesce(rec.updated_by, rec.created_by)
  );

  insert into public.rate_logs (rate_id, action, entity_type, entity_id, description, changes, actor_id)
  values (rec.id, act, 'egg_rate', rec.id,
    'Rate ' || act::text || ' for ' || coalesce(rec.effective_date::text, ''),
    to_jsonb(rec), coalesce(rec.updated_by, rec.created_by));

  if (tg_op = 'DELETE') then return old; end if;
  return new;
end;
$$;
revoke execute on function public.record_egg_rate_history() from public, anon;

create trigger egg_rates_history
after insert or update or delete on public.egg_rates
for each row execute function public.record_egg_rate_history();

-- ===== Seed reference data =====
insert into public.units (key, name, eggs_per_unit, display_order) values
  ('piece','Single egg',1,1),
  ('dozen','Dozen',12,2),
  ('tray','Tray (30)',30,3),
  ('hundred','100 eggs',100,4),
  ('peti','Peti (210)',210,5);

insert into public.rate_categories (key, name, description, display_order) values
  ('necc','NECC','National Egg Coordination Committee declared rate',1),
  ('wholesale','Wholesale','Bulk market rate',2),
  ('retail','Retail','Consumer shop rate',3),
  ('farm','Farm gate','Rate at the farm',4);

insert into public.data_sources (key, name, kind, is_trusted, description) values
  ('necc','NECC Official','api',true,'Official NECC declared rates'),
  ('manual','Manual entry','manual',true,'Entered by an editor from the dashboard'),
  ('csv','CSV import','csv',true,'Bulk uploaded spreadsheet'),
  ('api','Partner API','api',false,'Third-party partner feed'),
  ('cron','Scheduled job','cron',false,'Automated scheduled fetch'),
  ('webhook','Webhook','webhook',false,'Pushed by an external system');
