-- Revoke public execution access from all security definer functions
REVOKE EXECUTE ON FUNCTION public.has_role(_user_id uuid, _role app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_staff(_user_id uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_admin(_user_id uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.auto_update_egg_rates() FROM PUBLIC;

-- Revoke from authenticated for functions that should only be called by service_role or admins
REVOKE EXECUTE ON FUNCTION public.auto_update_egg_rates() FROM authenticated;

-- Ensure grants are only for necessary roles
GRANT EXECUTE ON FUNCTION public.has_role(_user_id uuid, _role app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_staff(_user_id uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin(_user_id uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.auto_update_egg_rates() TO service_role;
