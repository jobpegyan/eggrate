CREATE OR REPLACE FUNCTION public.get_region_history(
  p_type text,
  p_slug text DEFAULT NULL,
  p_days int DEFAULT 30
)
RETURNS TABLE (
  effective_date date,
  avg_price numeric
)
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
BEGIN
  IF p_type = 'city' AND p_slug IS NOT NULL THEN
    RETURN QUERY
    SELECT r.effective_date, r.avg_price
    FROM public.daily_city_rates r
    WHERE r.city_slug = p_slug
    ORDER BY r.effective_date DESC
    LIMIT p_days;
  ELSIF p_type = 'state' AND p_slug IS NOT NULL THEN
    RETURN QUERY
    SELECT r.effective_date, r.avg_price
    FROM public.daily_state_rates r
    WHERE r.state_slug = p_slug
    ORDER BY r.effective_date DESC
    LIMIT p_days;
  ELSE
    RETURN QUERY
    SELECT r.effective_date, r.avg_price
    FROM public.daily_national_rates r
    ORDER BY r.effective_date DESC
    LIMIT p_days;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_region_history(text, text, int) TO authenticated, anon;
