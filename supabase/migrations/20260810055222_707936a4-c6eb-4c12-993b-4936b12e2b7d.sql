
-- Add peti_size to markets if it doesn't exist
ALTER TABLE public.markets ADD COLUMN IF NOT EXISTS peti_size INTEGER DEFAULT 210;

-- Table for location normalization (Spelling variations)
CREATE TABLE IF NOT EXISTS public.normalization_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_name TEXT NOT NULL,
    target_name TEXT NOT NULL,
    mapping_type TEXT NOT NULL CHECK (mapping_type IN ('city', 'state', 'market')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(source_name, mapping_type)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.normalization_mappings TO authenticated;
GRANT ALL ON public.normalization_mappings TO service_role;

-- Insert some common mappings
INSERT INTO public.normalization_mappings (source_name, target_name, mapping_type)
VALUES 
('Bangalore', 'Bengaluru', 'city'),
('Bombay', 'Mumbai', 'city'),
('Calcutta', 'Kolkata', 'city'),
('Madras', 'Chennai', 'city'),
('Poona', 'Pune', 'city'),
('Benaras', 'Varanasi', 'city')
ON CONFLICT (source_name, mapping_type) DO NOTHING;

-- Anomaly detection rules
CREATE TABLE IF NOT EXISTS public.anomaly_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    metric TEXT NOT NULL, -- e.g. 'price_change_percent', 'absolute_price'
    operator TEXT NOT NULL, -- '>', '<', 'BETWEEN'
    threshold_value NUMERIC NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.anomaly_rules TO authenticated;
GRANT ALL ON public.anomaly_rules TO service_role;

INSERT INTO public.anomaly_rules (name, metric, operator, threshold_value)
VALUES 
('Sudden Spike', 'price_change_percent', '>', 15),
('Sudden Drop', 'price_change_percent', '<', -15),
('Impossible High', 'absolute_price', '>', 20), -- Price per egg > 20 INR
('Impossible Low', 'absolute_price', '<', 2) -- Price per egg < 2 INR
ON CONFLICT DO NOTHING;

-- Ensure automation_settings has defaults
INSERT INTO public.automation_settings (key, value)
VALUES 
('anomaly_threshold_percent', '15'),
('max_daily_price_change', '2'),
('max_stale_duration_days', '3'),
('auto_publish_verified', 'true'),
('peti_size_default', '210')
ON CONFLICT (key) DO NOTHING;

-- Conflicts table enhancement (if needed)
ALTER TABLE public.data_conflicts ADD COLUMN IF NOT EXISTS resolution_method TEXT;
ALTER TABLE public.data_conflicts ADD COLUMN IF NOT EXISTS resolved_by UUID REFERENCES auth.users(id);

GRANT ALL ON public.data_conflicts TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.data_conflicts TO authenticated;
