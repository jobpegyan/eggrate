REVOKE EXECUTE ON FUNCTION public.auto_update_egg_rates() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.auto_update_egg_rates() TO service_role;

-- Ensure RLS functions are safe but executable if needed by RLS
-- (Note: If they are used in RLS, 'authenticated' needs EXECUTE. 
-- The linter warns because they are SECURITY DEFINER, which is a risk if not careful.)
