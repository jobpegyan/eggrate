
-- ============ content tables ============
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  content text,
  cover_image_url text,
  author_name text,
  tags text[] not null default '{}',
  read_minutes integer not null default 4,
  is_published boolean not null default true,
  published_at timestamptz not null default now(),
  meta_title text,
  meta_description text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.posts to anon;
grant select, insert, update, delete on public.posts to authenticated;
grant all on public.posts to service_role;
alter table public.posts enable row level security;
create policy posts_select_public on public.posts for select to anon, authenticated using (is_published = true);
create policy posts_select_staff on public.posts for select to authenticated using (public.is_staff(auth.uid()));
create policy posts_write_staff on public.posts for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create trigger posts_set_updated_at before update on public.posts for each row execute function public.set_updated_at();

create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  category text not null default 'general',
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.faqs to anon;
grant select, insert, update, delete on public.faqs to authenticated;
grant all on public.faqs to service_role;
alter table public.faqs enable row level security;
create policy faqs_select_public on public.faqs for select to anon, authenticated using (is_active = true);
create policy faqs_select_staff on public.faqs for select to authenticated using (public.is_staff(auth.uid()));
create policy faqs_write_staff on public.faqs for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create trigger faqs_set_updated_at before update on public.faqs for each row execute function public.set_updated_at();

create table public.ad_slots (
  id uuid primary key default gen_random_uuid(),
  position text not null unique,
  name text not null,
  description text,
  is_enabled boolean not null default false,
  code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.ad_slots to anon;
grant select, insert, update, delete on public.ad_slots to authenticated;
grant all on public.ad_slots to service_role;
alter table public.ad_slots enable row level security;
create policy ad_slots_select_public on public.ad_slots for select to anon, authenticated using (is_enabled = true);
create policy ad_slots_select_staff on public.ad_slots for select to authenticated using (public.is_staff(auth.uid()));
create policy ad_slots_write_staff on public.ad_slots for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));
create trigger ad_slots_set_updated_at before update on public.ad_slots for each row execute function public.set_updated_at();

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  city_slug text,
  source text not null default 'homepage',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
grant insert on public.newsletter_subscribers to anon;
grant select, insert, update, delete on public.newsletter_subscribers to authenticated;
grant all on public.newsletter_subscribers to service_role;
alter table public.newsletter_subscribers enable row level security;
create policy newsletter_insert_public on public.newsletter_subscribers for insert to anon, authenticated with check (true);
create policy newsletter_select_staff on public.newsletter_subscribers for select to authenticated using (public.is_staff(auth.uid()));
create policy newsletter_write_staff on public.newsletter_subscribers for all to authenticated using (public.is_staff(auth.uid())) with check (public.is_staff(auth.uid()));

-- ============ ad slot positions ============
insert into public.ad_slots (position, name, description, is_enabled) values
  ('header_banner','Header banner','Leaderboard directly under the sticky header.', false),
  ('below_hero','Below hero','High-viewability unit under the hero and live rate card.', false),
  ('between_sections','Between sections','Responsive unit placed between homepage sections.', false),
  ('sidebar_desktop','Desktop sidebar','Sticky 300x600 unit, desktop only.', false),
  ('sticky_mobile','Sticky mobile banner','Anchored 320x50 banner on mobile.', false),
  ('in_content','In content','Native in-article unit inside long form content.', false),
  ('footer_banner','Footer banner','Last unit above the footer.', false);

-- ============ locations ============
insert into public.states (name, slug, code, seo_title, meta_description, status, display_order)
values
  ('Andhra Pradesh','andhra-pradesh','AP','Egg Rate in Andhra Pradesh Today','Daily NECC egg rate for Andhra Pradesh markets.','active',1),
  ('Telangana','telangana','TS','Egg Rate in Telangana Today','Daily NECC egg rate for Telangana markets.','active',2),
  ('Tamil Nadu','tamil-nadu','TN','Egg Rate in Tamil Nadu Today','Daily NECC egg rate for Tamil Nadu markets.','active',3),
  ('Karnataka','karnataka','KA','Egg Rate in Karnataka Today','Daily NECC egg rate for Karnataka markets.','active',4),
  ('Maharashtra','maharashtra','MH','Egg Rate in Maharashtra Today','Daily NECC egg rate for Maharashtra markets.','active',5),
  ('Delhi','delhi','DL','Egg Rate in Delhi Today','Daily NECC egg rate for Delhi NCR markets.','active',6),
  ('Uttar Pradesh','uttar-pradesh','UP','Egg Rate in Uttar Pradesh Today','Daily NECC egg rate for Uttar Pradesh markets.','active',7),
  ('West Bengal','west-bengal','WB','Egg Rate in West Bengal Today','Daily NECC egg rate for West Bengal markets.','active',8),
  ('Gujarat','gujarat','GJ','Egg Rate in Gujarat Today','Daily NECC egg rate for Gujarat markets.','active',9),
  ('Rajasthan','rajasthan','RJ','Egg Rate in Rajasthan Today','Daily NECC egg rate for Rajasthan markets.','active',10),
  ('Madhya Pradesh','madhya-pradesh','MP','Egg Rate in Madhya Pradesh Today','Daily NECC egg rate for Madhya Pradesh markets.','active',11),
  ('Punjab','punjab','PB','Egg Rate in Punjab Today','Daily NECC egg rate for Punjab markets.','active',12);

insert into public.cities (state_id, name, slug, latitude, longitude, population, is_featured, status, display_order, seo_title, meta_description)
select s.id, v.name, v.slug, v.lat, v.lon, v.pop, v.featured, 'active', v.ord,
       'Egg Rate in ' || v.name || ' Today', 'Today''s wholesale and retail egg rate in ' || v.name || '.'
from (values
  ('andhra-pradesh','Vijayawada','vijayawada',16.5062,80.6480,1750000,true,1),
  ('andhra-pradesh','Visakhapatnam','visakhapatnam',17.6868,83.2185,2035000,true,2),
  ('telangana','Hyderabad','hyderabad',17.3850,78.4867,10500000,true,3),
  ('telangana','Warangal','warangal',17.9689,79.5941,830000,false,4),
  ('tamil-nadu','Chennai','chennai',13.0827,80.2707,11000000,true,5),
  ('tamil-nadu','Namakkal','namakkal',11.2189,78.1677,600000,true,6),
  ('karnataka','Bengaluru','bengaluru',12.9716,77.5946,13000000,true,7),
  ('karnataka','Mysuru','mysuru',12.2958,76.6394,1010000,false,8),
  ('maharashtra','Mumbai','mumbai',19.0760,72.8777,20400000,true,9),
  ('maharashtra','Pune','pune',18.5204,73.8567,7400000,true,10),
  ('maharashtra','Nagpur','nagpur',21.1458,79.0882,3000000,false,11),
  ('delhi','Delhi','delhi',28.6139,77.2090,32900000,true,12),
  ('uttar-pradesh','Lucknow','lucknow',26.8467,80.9462,3800000,true,13),
  ('uttar-pradesh','Varanasi','varanasi',25.3176,82.9739,1600000,false,14),
  ('uttar-pradesh','Kanpur','kanpur',26.4499,80.3319,3100000,false,15),
  ('west-bengal','Kolkata','kolkata',22.5726,88.3639,15100000,true,16),
  ('west-bengal','Siliguri','siliguri',26.7271,88.3953,750000,false,17),
  ('gujarat','Ahmedabad','ahmedabad',23.0225,72.5714,8400000,true,18),
  ('gujarat','Surat','surat',21.1702,72.8311,7500000,false,19),
  ('rajasthan','Jaipur','jaipur',26.9124,75.7873,4100000,true,20),
  ('rajasthan','Ajmer','ajmer',26.4499,74.6399,600000,false,21),
  ('madhya-pradesh','Indore','indore',22.7196,75.8577,3300000,true,22),
  ('madhya-pradesh','Bhopal','bhopal',23.2599,77.4126,2400000,false,23),
  ('punjab','Ludhiana','ludhiana',30.9010,75.8573,1800000,true,24)
) as v(state_slug,name,slug,lat,lon,pop,featured,ord)
join public.states s on s.slug = v.state_slug;

insert into public.markets (city_id, state_id, name, slug, market_type, supports_wholesale, supports_retail, status)
select c.id, c.state_id, c.name || ' Main Market', c.slug || '-main-market', 'both', true, true, 'active'
from public.cities c;

-- ============ 30 days of published rates ============
insert into public.egg_rates (
  state_id, city_id, market_id, egg_rate, dozen_price, tray_price, hundred_price, peti_price,
  wholesale_price, retail_price, currency, effective_date, is_verified, is_published, published_at, status
)
select
  c.state_id,
  c.id,
  m.id,
  r.rate,
  round(r.rate * 12, 2),
  round(r.rate * 30, 2),
  round(r.rate * 100, 2),
  round(r.rate * 210, 2),
  round(r.rate - 0.15, 2),
  round(r.rate + 0.60, 2),
  'INR',
  current_date - r.n,
  true,
  true,
  now(),
  'active'
from public.cities c
join public.markets m on m.city_id = c.id
cross join lateral (
  select g.n,
         round((5.60
                + ((abs(hashtext(c.slug)) % 90) / 100.0)
                - (g.n * 0.010)
                + (((abs(hashtext(c.slug || g.n::text)) % 25) - 12) / 100.0))::numeric, 2) as rate
  from generate_series(0, 29) as g(n)
) r;

-- ============ FAQs ============
insert into public.faqs (question, answer, category, display_order) values
  ('What is today''s egg rate in India?','The national average NECC egg rate shown on this page is calculated every morning from the wholesale declarations of every market we track. Open any city page for the exact local price per egg, per dozen, per tray and per 210-egg peti.','rates',1),
  ('How often are egg rates updated?','Rates are refreshed every morning after the day''s market declaration, and any correction published later in the day is applied immediately with a fresh timestamp.','rates',2),
  ('What is the difference between wholesale and retail egg price?','Wholesale is the price traders pay at the mandi, usually a few paise below the declared rate. Retail is the shop price you pay, which typically carries a margin of ₹0.50 to ₹1.00 per egg.','rates',3),
  ('How many eggs are in a tray and a peti?','A standard tray holds 30 eggs and a peti (box) holds 210 eggs, which is seven trays. We show both prices so traders and households can compare directly.','units',4),
  ('Why do egg rates differ between cities?','Feed cost, local production capacity, transport distance from producing belts such as Namakkal and Hyderabad, and seasonal demand all move the daily price city by city.','rates',5),
  ('Is the data on EggRate India verified?','Every published rate carries a verified badge only after an editor has matched it against the declaring source. Each change is stored in an immutable history log.','trust',6),
  ('Can I see historical egg price trends?','Yes. Every rate we publish is archived, so you can compare any two dates and follow 7-day, 30-day and long-run trends.','history',7),
  ('Do you charge for egg rate data?','No. EggRate India is free to use and supported by advertising.','general',8);

-- ============ articles ============
insert into public.posts (slug, title, excerpt, content, author_name, tags, read_minutes, published_at, meta_title, meta_description) values
  ('why-egg-prices-rise-in-winter','Why egg prices rise every winter in India','Cold-weather demand, higher feed intake and slower layer productivity combine to push the NECC rate up between November and February.','Egg demand in India is strongly seasonal. As temperatures fall, household consumption rises across the northern belt while layer birds eat more feed to hold body temperature, which raises the cost of every egg produced. At the same time, shorter daylight reduces laying efficiency. The result is the familiar winter climb in the NECC declared rate, typically peaking in late December.\n\nTraders who track the daily rate city by city can plan procurement a week ahead instead of reacting to the mandi on the morning of purchase.','EggRate India Desk','{market,seasonality}',5,now() - interval '2 days','Why egg prices rise every winter in India','Feed cost, cold-weather demand and layer productivity explain the winter egg rate climb in India.'),
  ('necc-egg-rate-explained','NECC egg rate explained: how the daily price is declared','A plain-English guide to who declares the daily egg rate, what the declared price covers and how it reaches your local shop.','The National Egg Coordination Committee publishes a suggested wholesale rate for each major market every morning. The declaration reflects supply reaching that market, cold-store stock and expected demand. It is a suggested price, not a controlled one, so local mandis can trade slightly above or below it.\n\nBy the time an egg reaches a retail counter it carries handling, breakage and margin, which is why the retail price on this site runs above the declared wholesale rate.','EggRate India Desk','{necc,guide}',6,now() - interval '6 days','NECC egg rate explained','How the NECC declares the daily egg rate and how it reaches retail counters.'),
  ('tray-peti-dozen-price-guide','Tray, peti and dozen: converting egg prices correctly','30 eggs to a tray, 210 to a peti. Here is how to convert the per-egg rate into the number you actually pay.','Most Indian markets quote eggs per piece. A dozen is 12 eggs, a tray is 30 and a peti is 210, or seven trays. Converting is simple multiplication, but rounding rules differ between traders, which is why two shops can quote different tray prices from the same declared rate.\n\nEvery city page on EggRate India shows all four figures calculated from the same verified per-egg rate, so there is nothing to compute by hand.','EggRate India Desk','{guide,units}',4,now() - interval '11 days','Tray, peti and dozen egg price conversion guide','Convert the per-egg rate into dozen, tray and peti prices with the standard Indian egg counts.'),
  ('feed-cost-and-egg-rate','How maize and soya prices drive the egg rate','Feed is roughly seventy percent of the cost of producing an egg, so grain markets lead the egg rate by weeks.','Maize and soya meal make up the bulk of layer feed. When grain prices firm up after a weak harvest, poultry farms face higher cost per bird within weeks and the declared egg rate follows. Watching grain arrivals is therefore one of the better leading indicators for where the egg rate is heading.','EggRate India Desk','{market,feed}',5,now() - interval '18 days','How feed cost drives the egg rate in India','Maize and soya prices lead the Indian egg rate because feed is most of the cost of production.');

-- ============ static pages ============
insert into public.pages (slug, title, content, meta_title, meta_description, is_published) values
  ('about','About EggRate India','EggRate India publishes the daily egg rate for every major market in the country. We collect the morning declaration from each market, verify it against the declaring source, and publish it with a timestamp and an immutable history record.\n\nOur goal is simple: the fastest, clearest place to check what an egg costs today, wherever you are in India. Traders, retailers, bakeries and households all use the same verified numbers.','About EggRate India','Who we are and how EggRate India collects, verifies and publishes the daily egg rate.',true),
  ('contact','Contact us','Corrections, market submissions, advertising enquiries and partnership requests are all welcome.\n\nEmail: hello@eggrateindia.example\nEditorial corrections: corrections@eggrateindia.example\n\nWe review every rate correction within one working day.','Contact EggRate India','Reach the EggRate India team for corrections, market submissions and advertising.',true),
  ('privacy-policy','Privacy policy','We collect the minimum data needed to run this site. If you subscribe to daily rate alerts we store your email address and the city you selected so we can send you that alert, and nothing else.\n\nWe use cookies for theme preference and for advertising partners including Google AdSense, which may use cookies to serve ads based on your prior visits to this and other websites. You can opt out of personalised advertising in your Google Ads settings.\n\nYou can request deletion of your email address at any time by contacting us.','Privacy policy','How EggRate India handles your data, cookies and advertising preferences.',true),
  ('terms','Terms of use','EggRate India provides egg price information for general reference. By using this site you agree that the rates published here are indicative, sourced from market declarations, and may differ from the price offered by any individual trader or shop.\n\nYou may not scrape, republish or resell bulk data from this site without written permission. Reasonable citation with a link back is welcome.','Terms of use','The terms governing your use of EggRate India.',true),
  ('disclaimer','Disclaimer','Egg rates published on EggRate India are collected from public market declarations and verified by our editors, but they are indicative figures and not a trading quote. Always confirm the price with your local market before making a commercial decision.\n\nEggRate India is not affiliated with the National Egg Coordination Committee or any other trade body.','Disclaimer','Egg rates on EggRate India are indicative figures collected from public market declarations.',true);
