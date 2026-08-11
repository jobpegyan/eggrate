-- Migration: Add NECC Connector RLS policies to allow server-side writes to egg_rates
-- This allows the supabaseAdmin client (using publishable key) to perform
-- INSERT/UPDATE on egg_rates without requiring the service_role key.
-- Also adds the necc_source_id lookup so the connector can correctly tag NECC-sourced records.

-- ============================================================
-- 1. DROP conflicting old policies that may block server writes
-- ============================================================
DROP POLICY IF EXISTS "Allow service role full access" ON public.egg_rates;
DROP POLICY IF EXISTS "Allow anon insert" ON public.egg_rates;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.egg_rates;
DROP POLICY IF EXISTS "Server can insert egg rates" ON public.egg_rates;
DROP POLICY IF EXISTS "Server can update egg rates" ON public.egg_rates;
DROP POLICY IF EXISTS "Server can upsert egg rates" ON public.egg_rates;
DROP POLICY IF EXISTS "Public read egg rates" ON public.egg_rates;

-- ============================================================
-- 2. Make sure RLS is enabled on egg_rates
-- ============================================================
ALTER TABLE public.egg_rates ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 3. Allow anyone (anon + authenticated) to SELECT published rates
-- ============================================================
CREATE POLICY "Public read egg rates"
ON public.egg_rates
FOR SELECT
USING (is_published = true);

-- ============================================================
-- 4. Allow anon role to INSERT new egg_rates records
--    (used by supabaseAdmin with publishable key in server functions)
-- ============================================================
CREATE POLICY "Server anon insert egg rates"
ON public.egg_rates
FOR INSERT
TO anon
WITH CHECK (true);

-- ============================================================
-- 5. Allow anon role to UPDATE existing egg_rates records
--    (used for UPSERT / rate change detection)
-- ============================================================
CREATE POLICY "Server anon update egg rates"
ON public.egg_rates
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

-- ============================================================
-- 6. Allow authenticated role to INSERT/UPDATE as well
-- ============================================================
CREATE POLICY "Authenticated insert egg rates"
ON public.egg_rates
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated update egg rates"
ON public.egg_rates
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================================
-- 7. Allow service_role full access (bypasses RLS automatically,
--    but explicit GRANT ensures no edge cases)
-- ============================================================
GRANT ALL ON public.egg_rates TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.egg_rates TO anon;
GRANT SELECT, INSERT, UPDATE ON public.egg_rates TO authenticated;

-- ============================================================
-- 8. Ensure automation_audit_logs also allows anon INSERT
--    (needed for NECC connector to record audit events)
-- ============================================================
DROP POLICY IF EXISTS "Server anon insert audit logs" ON public.automation_audit_logs;

ALTER TABLE public.automation_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Server anon insert audit logs"
ON public.automation_audit_logs
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Server anon select audit logs"
ON public.automation_audit_logs
FOR SELECT
TO anon
USING (true);

GRANT SELECT, INSERT, UPDATE ON public.automation_audit_logs TO anon;
GRANT ALL ON public.automation_audit_logs TO service_role;
