-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_egg_rates_effective_date ON public.egg_rates (effective_date DESC);
CREATE INDEX IF NOT EXISTS idx_egg_rates_city_id ON public.egg_rates (city_id);
CREATE INDEX IF NOT EXISTS idx_egg_rates_state_id ON public.egg_rates (state_id);
CREATE INDEX IF NOT EXISTS idx_egg_rates_market_id ON public.egg_rates (market_id);
CREATE INDEX IF NOT EXISTS idx_egg_rates_published ON public.egg_rates (is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_cities_slug ON public.cities (slug);
CREATE INDEX IF NOT EXISTS idx_states_slug ON public.states (slug);
CREATE INDEX IF NOT EXISTS idx_markets_slug ON public.markets (slug);
CREATE INDEX IF NOT EXISTS idx_cities_status ON public.cities (status);
CREATE INDEX IF NOT EXISTS idx_states_status ON public.states (status);

-- Security: Audit RLS and ensure every table has grants
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- Ensure RLS is enabled on all tables (idempotent)
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    END LOOP;
END $$;