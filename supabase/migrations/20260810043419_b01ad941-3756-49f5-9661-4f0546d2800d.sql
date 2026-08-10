-- Enable pg_cron extension if not enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the job (every day at 1:00 AM UTC)
-- Using DO block to avoid failure if already scheduled
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'daily-egg-rate-update') THEN
        PERFORM cron.schedule(
            'daily-egg-rate-update',
            '0 1 * * *',
            'SELECT public.auto_update_egg_rates();'
        );
    END IF;
END $$;
