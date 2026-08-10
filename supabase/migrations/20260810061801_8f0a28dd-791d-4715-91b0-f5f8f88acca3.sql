
ALTER FUNCTION public.handle_updated_at() SET search_path = public;

INSERT INTO public.ai_prompts (name, version, content, type, is_active)
VALUES 
('National Daily Summary', 1, 'Analyze today''s national egg rates. Compare with yesterday''s average of {{yesterday_avg}}. Focus on significant movers and overall market sentiment. Data coverage: {{coverage}}%.', 'daily_summary', true),
('State Market Analysis', 1, 'Provide a deep dive into {{state_name}} egg market. Analyze city-level variations and 7-day trends. Highlight the dearest and cheapest cities.', 'state_analysis', true),
('City Price Movement', 1, 'Explain the price movement in {{city_name}}. Current price: {{current_price}}. Trend: {{trend}}.', 'city_analysis', true);

GRANT EXECUTE ON FUNCTION public.handle_updated_at() TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.ai_usage_logs TO service_role;
