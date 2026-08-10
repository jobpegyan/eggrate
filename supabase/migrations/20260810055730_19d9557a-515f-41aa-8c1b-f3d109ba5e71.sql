-- View for daily national average egg rates
CREATE OR REPLACE VIEW public.daily_national_rates AS
SELECT 
    effective_date,
    AVG(egg_rate)::numeric(10,2) as avg_price,
    COUNT(*) as markets_count
FROM public.egg_rates
WHERE is_published = true
GROUP BY effective_date
ORDER BY effective_date DESC;

GRANT SELECT ON public.daily_national_rates TO anon, authenticated;
