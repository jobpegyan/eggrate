-- View for daily state average egg rates
CREATE OR REPLACE VIEW public.daily_state_rates AS
SELECT 
    s.slug as state_slug,
    s.name as state_name,
    er.effective_date,
    AVG(er.egg_rate)::numeric(10,2) as avg_price,
    COUNT(*) as markets_count
FROM public.egg_rates er
JOIN public.states s ON er.state_id = s.id
WHERE er.is_published = true
GROUP BY s.slug, s.name, er.effective_date
ORDER BY er.effective_date DESC;

GRANT SELECT ON public.daily_state_rates TO anon, authenticated;

-- View for daily city average egg rates
CREATE OR REPLACE VIEW public.daily_city_rates AS
SELECT 
    c.slug as city_slug,
    c.name as city_name,
    er.effective_date,
    AVG(er.egg_rate)::numeric(10,2) as avg_price,
    COUNT(*) as markets_count
FROM public.egg_rates er
JOIN public.cities c ON er.city_id = c.id
WHERE er.is_published = true
GROUP BY c.slug, c.name, er.effective_date
ORDER BY er.effective_date DESC;

GRANT SELECT ON public.daily_city_rates TO anon, authenticated;

-- View for latest city rates (today's rates)
CREATE OR REPLACE VIEW public.latest_city_rates AS
WITH ranked_rates AS (
    SELECT 
        er.id,
        er.egg_rate,
        er.dozen_price,
        er.tray_price,
        er.hundred_price,
        er.peti_price,
        er.wholesale_price,
        er.retail_price,
        er.effective_date,
        er.updated_at,
        er.is_verified,
        er.market_id,
        c.name as city_name,
        c.slug as city_slug,
        c.is_featured,
        s.name as state_name,
        s.slug as state_slug,
        ROW_NUMBER() OVER(PARTITION BY er.city_id ORDER BY er.effective_date DESC) as rn
    FROM public.egg_rates er
    JOIN public.cities c ON er.city_id = c.id
    JOIN public.states s ON er.state_id = s.id
    WHERE er.is_published = true
)
SELECT * FROM ranked_rates WHERE rn = 1;

GRANT SELECT ON public.latest_city_rates TO anon, authenticated;
