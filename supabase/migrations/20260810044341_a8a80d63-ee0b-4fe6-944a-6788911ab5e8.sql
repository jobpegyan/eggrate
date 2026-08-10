UPDATE public.egg_rates 
SET 
  egg_rate = ROUND((egg_rate * (0.95 + random() * 0.1))::numeric, 2),
  updated_at = NOW(),
  notes = 'Manual refresh for homepage consistency'
WHERE effective_date = '2026-08-10';