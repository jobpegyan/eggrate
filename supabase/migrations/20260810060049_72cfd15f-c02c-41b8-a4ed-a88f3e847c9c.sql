CREATE OR REPLACE VIEW public.city_rate_changes AS
WITH ranked_rates AS (
    SELECT 
        er.city_id,
        er.egg_rate,
        er.effective_date,
        er.dozen_price,
        er.tray_price,
        er.hundred_price,
        er.peti_price,
        er.wholesale_price,
        er.retail_price,
        er.updated_at,
        er.is_verified,
        er.market_id,
        ROW_NUMBER() OVER(PARTITION BY er.city_id ORDER BY er.effective_date DESC) as rn
    FROM public.egg_rates er
    WHERE er.is_published = true
),
today_rates AS (
    SELECT * FROM ranked_rates WHERE rn = 1
),
yesterday_rates AS (
    SELECT * FROM ranked_rates WHERE rn = 2
)
SELECT 
    t.city_id,
    c.name as city_name,
    c.slug as city_slug,
    c.is_featured,
    s.name as state_name,
    s.slug as state_slug,
    t.egg_rate,
    t.dozen_price,
    t.tray_price,
    t.hundred_price,
    t.peti_price,
    t.wholesale_price,
    t.retail_price,
    t.effective_date,
    t.updated_at,
    t.is_verified,
    t.market_id,
    y.egg_rate as previous_price,
    (t.egg_rate - COALESCE(y.egg_rate, t.egg_rate)) as price_change,
    CASE 
        WHEN y.egg_rate IS NULL OR y.egg_rate = 0 THEN 0
        ELSE ROUND(((t.egg_rate - y.egg_rate) / y.egg_rate * 100)::numeric, 2)
    END as price_change_percent
FROM today_rates t
JOIN public.cities c ON t.city_id = c.id
JOIN public.states s ON c.state_id = s.id
LEFT JOIN yesterday_rates y ON t.city_id = y.city_id;

GRANT SELECT ON public.city_rate_changes TO anon, authenticated;
ALTER VIEW public.city_rate_changes SET (security_invoker = on);
