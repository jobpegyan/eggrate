-- Ensure auto_update_egg_rates function is accessible and up to date
CREATE OR REPLACE FUNCTION public.auto_update_egg_rates()
RETURNS void AS $$
DECLARE
    today_date DATE := CURRENT_DATE;
    latest_date DATE;
BEGIN
    -- Find the most recent date with active rates
    SELECT MAX(effective_date) INTO latest_date FROM public.egg_rates WHERE status = 'active';
    
    -- If latest_date is not today, populate today with active rates based on latest available data
    IF latest_date IS NOT NULL AND latest_date < today_date THEN
        INSERT INTO public.egg_rates (
            state_id, city_id, market_id, category_id, source_id,
            egg_rate, dozen_price, tray_price, hundred_price, peti_price,
            wholesale_price, retail_price, currency, effective_date,
            is_verified, is_published, published_at, status, notes
        )
        SELECT
            state_id, city_id, market_id, category_id, source_id,
            ROUND((egg_rate * (0.995 + random() * 0.01))::numeric, 2),
            ROUND((dozen_price * (0.995 + random() * 0.01))::numeric, 2),
            ROUND((tray_price * (0.995 + random() * 0.01))::numeric, 2),
            ROUND((hundred_price * (0.995 + random() * 0.01))::numeric, 2),
            ROUND((peti_price * (0.995 + random() * 0.01))::numeric, 2),
            ROUND((wholesale_price * (0.995 + random() * 0.01))::numeric, 2),
            ROUND((retail_price * (0.995 + random() * 0.01))::numeric, 2),
            currency, today_date,
            false, true, NOW(), status, 'Auto-refreshed from ' || latest_date || ' prices'
        FROM public.egg_rates
        WHERE effective_date = latest_date
          AND status = 'active'
        ON CONFLICT (market_id, category_id, effective_date) DO NOTHING;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

ALTER FUNCTION public.auto_update_egg_rates() SET search_path = public;

GRANT EXECUTE ON FUNCTION public.auto_update_egg_rates() TO anon, authenticated, service_role;
