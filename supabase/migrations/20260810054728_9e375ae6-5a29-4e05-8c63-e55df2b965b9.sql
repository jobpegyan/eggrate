
-- Create table for storing raw incoming data
CREATE TABLE public.raw_data (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id uuid REFERENCES public.data_sources(id),
    fetch_time timestamp with time zone DEFAULT now(),
    raw_payload jsonb NOT NULL,
    hash text NOT NULL, -- To detect duplicates
    request_id text,
    status text DEFAULT 'pending', -- pending, processed, failed
    error_message text,
    created_at timestamp with time zone DEFAULT now()
);

-- Audit log for automation
CREATE TABLE public.automation_audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id text,
    action text NOT NULL,
    status text NOT NULL,
    details jsonb,
    created_at timestamp with time zone DEFAULT now()
);

-- Automation configuration/settings
CREATE TABLE public.automation_settings (
    key text PRIMARY KEY,
    value jsonb NOT NULL,
    updated_at timestamp with time zone DEFAULT now()
);

-- Data Quality Score table
CREATE TABLE public.data_quality_scores (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type text NOT NULL, -- state, city, total
    entity_id uuid, -- NULL for total
    score_value float NOT NULL,
    details jsonb,
    recorded_date date DEFAULT current_date,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(entity_type, entity_id, recorded_date)
);

-- Conflict Records for review
CREATE TABLE public.data_conflicts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    date date NOT NULL,
    city_id uuid REFERENCES public.cities(id),
    source_a uuid REFERENCES public.data_sources(id),
    source_b uuid REFERENCES public.data_sources(id),
    rate_a numeric NOT NULL,
    rate_b numeric NOT NULL,
    resolved boolean DEFAULT false,
    resolution_details jsonb,
    created_at timestamp with time zone DEFAULT now()
);

-- Grant permissions for authenticated/service_role
GRANT SELECT, INSERT, UPDATE, DELETE ON public.raw_data TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.automation_audit_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.automation_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.data_quality_scores TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.data_conflicts TO authenticated;

GRANT ALL ON public.raw_data TO service_role;
GRANT ALL ON public.automation_audit_logs TO service_role;
GRANT ALL ON public.automation_settings TO service_role;
GRANT ALL ON public.data_quality_scores TO service_role;
GRANT ALL ON public.data_conflicts TO service_role;

ALTER TABLE public.raw_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_quality_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_conflicts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage automation" ON public.raw_data FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage automation logs" ON public.automation_audit_logs FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage automation settings" ON public.automation_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage quality scores" ON public.data_quality_scores FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage conflicts" ON public.data_conflicts FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
