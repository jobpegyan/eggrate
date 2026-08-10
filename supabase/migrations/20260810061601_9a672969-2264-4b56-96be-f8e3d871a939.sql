
CREATE TYPE public.insight_type AS ENUM ('daily_summary', 'price_movement', 'city_analysis', 'state_analysis', 'national_analysis', 'weekly_summary', 'monthly_summary', 'trend_detection', 'anomaly_explanation', 'data_quality');
CREATE TYPE public.insight_status AS ENUM ('draft', 'review', 'published', 'archived');
CREATE TYPE public.insight_confidence AS ENUM ('low', 'medium', 'high');

CREATE TABLE public.ai_prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    content TEXT NOT NULL,
    type public.insight_type NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT false,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.ai_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_name TEXT NOT NULL UNIQUE,
    model_name TEXT NOT NULL,
    api_key_secret_name TEXT,
    temperature FLOAT NOT NULL DEFAULT 0.7,
    max_tokens INTEGER NOT NULL DEFAULT 1000,
    priority INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT false,
    config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.ai_market_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type public.insight_type NOT NULL,
    scope TEXT NOT NULL, -- 'national', 'state', 'city'
    state_id UUID REFERENCES public.states(id),
    city_id UUID REFERENCES public.cities(id),
    analysis_date DATE NOT NULL DEFAULT CURRENT_DATE,
    title TEXT NOT NULL,
    summary TEXT,
    content TEXT NOT NULL,
    confidence public.insight_confidence NOT NULL DEFAULT 'medium',
    confidence_reason TEXT,
    source_data_ids UUID[],
    provider_id UUID REFERENCES public.ai_providers(id),
    prompt_id UUID REFERENCES public.ai_prompts(id),
    status public.insight_status NOT NULL DEFAULT 'draft',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.ai_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES public.ai_providers(id),
    model TEXT NOT NULL,
    prompt_tokens INTEGER NOT NULL DEFAULT 0,
    completion_tokens INTEGER NOT NULL DEFAULT 0,
    estimated_cost FLOAT NOT NULL DEFAULT 0,
    status TEXT NOT NULL,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

GRANT SELECT ON public.ai_market_insights TO authenticated;
GRANT SELECT ON public.ai_market_insights TO anon;
GRANT ALL ON public.ai_market_insights TO service_role;

GRANT SELECT ON public.ai_providers TO authenticated;
GRANT ALL ON public.ai_providers TO service_role;

GRANT SELECT ON public.ai_prompts TO authenticated;
GRANT ALL ON public.ai_prompts TO service_role;

GRANT ALL ON public.ai_usage_logs TO service_role;

ALTER TABLE public.ai_market_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published insights" ON public.ai_market_insights
    FOR SELECT USING (status = 'published');

CREATE POLICY "Admins can manage all insights" ON public.ai_market_insights
    FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage providers" ON public.ai_providers
    FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage prompts" ON public.ai_prompts
    FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_ai_insights_updated_at BEFORE UPDATE ON public.ai_market_insights FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER tr_ai_prompts_updated_at BEFORE UPDATE ON public.ai_prompts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER tr_ai_providers_updated_at BEFORE UPDATE ON public.ai_providers FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
