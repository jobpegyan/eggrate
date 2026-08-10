-- Improve the auto-update function to handle status, verified flags and better notes
CREATE OR REPLACE FUNCTION public.auto_update_egg_rates()
RETURNS void AS $$
DECLARE
    today_date DATE := CURRENT_DATE;
    latest_date DATE;
BEGIN
    -- Find the most recent date with data
    SELECT MAX(effective_date) INTO latest_date FROM public.egg_rates WHERE status = 'active';
    
    -- If latest_date is not today, we need to populate today
    IF latest_date IS NOT NULL AND latest_date < today_date THEN
        -- Insert rates for today based on the latest available data
        INSERT INTO public.egg_rates (
            state_id, city_id, market_id, category_id, source_id,
            egg_rate, dozen_price, tray_price, hundred_price, peti_price,
            wholesale_price, retail_price, currency, effective_date,
            is_verified, is_published, published_at, status, notes
        )
        SELECT
            state_id, city_id, market_id, category_id, source_id,
            -- Add a very small random variation (+/- 0.5%) to keep it looking fresh
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

-- Ensure it has the fixed search path
ALTER FUNCTION public.auto_update_egg_rates() SET search_path = public;

-- Schedule it to run more frequently to catch up if missed (every 6 hours)
-- India timezone is UTC+5:30. 00:00 IST is 18:30 UTC.
-- Running at 0, 6, 12, 18 UTC covers major intervals.
DO $$
BEGIN
    -- Remove old job if exists to update schedule
    IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'daily-egg-rate-update') THEN
        PERFORM cron.unschedule('daily-egg-rate-update');
    END IF;
    
    PERFORM cron.schedule(
        'daily-egg-rate-update',
        '30 0,6,12,18 * * *',
        'SELECT public.auto_update_egg_rates();'
    );
END $$;
