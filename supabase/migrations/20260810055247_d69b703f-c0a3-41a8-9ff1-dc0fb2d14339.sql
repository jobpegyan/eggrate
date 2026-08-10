
-- Enable RLS for normalization_mappings
ALTER TABLE public.normalization_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage normalization_mappings"
ON public.normalization_mappings
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public can read normalization_mappings"
ON public.normalization_mappings
FOR SELECT
TO authenticated
USING (true);

-- Enable RLS for anomaly_rules
ALTER TABLE public.anomaly_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage anomaly_rules"
ON public.anomaly_rules
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public can read anomaly_rules"
ON public.anomaly_rules
FOR SELECT
TO authenticated
USING (true);

-- Grant permissions to automation_audit_logs if not already done
GRANT SELECT, INSERT, UPDATE, DELETE ON public.automation_audit_logs TO authenticated;
GRANT ALL ON public.automation_audit_logs TO service_role;
ALTER TABLE public.automation_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read all logs"
ON public.automation_audit_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert logs"
ON public.automation_audit_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Revoke public execute on security definer functions to satisfy linter
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

-- (Repeat for other SD functions if they exist)
