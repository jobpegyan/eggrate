select tablename, rowsecurity from pg_tables where schemaname = 'public' and tablename = 'ai_market_insights';
select * from pg_policies where tablename = 'ai_market_insights';

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_market_insights TO authenticated;
GRANT ALL ON public.ai_market_insights TO service_role;
GRANT SELECT ON public.ai_market_insights TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_usage_logs TO authenticated;
GRANT ALL ON public.ai_usage_logs TO service_role;
GRANT SELECT ON public.ai_usage_logs TO anon;