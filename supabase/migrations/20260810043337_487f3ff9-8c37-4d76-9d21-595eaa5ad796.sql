CREATE OR REPLACE FUNCTION public.auto_update_egg_rates()
RETURNS void AS $$
DECLARE
    today_date DATE := CURRENT_DATE;
    yesterday_date DATE := CURRENT_DATE - INTERVAL '1 day';
BEGIN
    -- Only copy if today has no rates yet
    IF NOT EXISTS (SELECT 1 FROM public.egg_rates WHERE effective_date = today_date) THEN
        INSERT INTO public.egg_rates (
            state_id, city_id, market_id, category_id, source_id,
            egg_rate, dozen_price, tray_price, hundred_price, peti_price,
            wholesale_price, retail_price, currency, effective_date,
            is_verified, is_published, published_at, status, notes
        )
        SELECT
            state_id, city_id, market_id, category_id, source_id,
            egg_rate, dozen_price, tray_price, hundred_price, peti_price,
            wholesale_price, retail_price, currency, today_date,
            false, true, NOW(), status, 'Auto-generated from previous day prices'
        FROM public.egg_rates
        WHERE effective_date = yesterday_date
          AND status = 'active';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.auto_update_egg_rates() TO service_role;
GRANT EXECUTE ON FUNCTION public.auto_update_egg_rates() TO authenticated;
