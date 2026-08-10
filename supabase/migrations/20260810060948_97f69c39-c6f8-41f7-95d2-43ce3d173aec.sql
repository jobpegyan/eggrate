-- Update function to set search_path
CREATE OR REPLACE FUNCTION public.get_data_coverage_stats(_date date)
RETURNS TABLE (
  total_cities bigint,
  updated_cities bigint,
  coverage_percent numeric
) 
LANGUAGE sql
STABLE
SET search_path = public
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
