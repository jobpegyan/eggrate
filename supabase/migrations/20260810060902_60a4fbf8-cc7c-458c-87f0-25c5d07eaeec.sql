CREATE OR REPLACE VIEW public.regional_price_movers AS
WITH current_rates AS (
  SELECT 
    c.id as city_id,
    c.name as city_name,
    c.slug as city_slug,
    s.name as state_name,
    s.slug as state_slug,
    r.egg_rate as current_price,
    r.effective_date,
    LAG(r.egg_rate) OVER (PARTITION BY c.id ORDER BY r.effective_date) as previous_price
  FROM public.egg_rates r
  JOIN public.cities c ON r.city_id = c.id
  JOIN public.states s ON c.state_id = s.id
  WHERE r.is_published = true AND r.status = 'active'
)
SELECT 
  city_id,
  city_name,
  city_slug,
  state_name,
  state_slug,
  current_price,
  previous_price,
  (current_price - previous_price) as price_change,
  CASE 
    WHEN previous_price > 0 THEN ROUND(((current_price - previous_price) / previous_price) * 100, 2)
    ELSE 0
  END as percentage_change,
  effective_date
FROM current_rates
WHERE previous_price IS NOT NULL;

GRANT SELECT ON public.regional_price_movers TO authenticated, anon;

-- Function to get coverage stats
CREATE OR REPLACE FUNCTION public.get_data_coverage_stats(_date date)
RETURNS TABLE (
  total_cities bigint,
  updated_cities bigint,
  coverage_percent numeric
) 
LANGUAGE sql
STABLE
AS $$
  SELECT 
    (SELECT COUNT(*) FROM public.cities WHERE status = 'active') as total_cities,
    (SELECT COUNT(DISTINCT city_id) FROM public.egg_rates WHERE effective_date = _date AND is_published = true) as updated_cities,
    ROUND(
      (SELECT COUNT(DISTINCT city_id) FROM public.egg_rates WHERE effective_date = _date AND is_published = true)::numeric / 
      NULLIF((SELECT COUNT(*) FROM public.cities WHERE status = 'active'), 0)::numeric * 100,
      2
    ) as coverage_percent;
$$;

GRANT EXECUTE ON FUNCTION public.get_data_coverage_stats(date) TO authenticated, anon;
