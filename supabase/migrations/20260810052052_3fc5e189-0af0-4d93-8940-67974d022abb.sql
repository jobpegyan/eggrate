-- Revoke execute from public/anon/authenticated for all security definer functions
-- These will be granted back to specific roles where strictly necessary

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.has_permission(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_permission(uuid, text) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

REVOKE EXECUTE ON FUNCTION public.record_egg_rate_history() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_egg_rate_history() TO service_role;

-- auto_update_egg_rates was already secured in previous turn but confirming here
REVOKE EXECUTE ON FUNCTION public.auto_update_egg_rates() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.auto_update_egg_rates() TO service_role;
