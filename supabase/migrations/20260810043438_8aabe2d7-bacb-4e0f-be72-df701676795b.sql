-- Fix all active public security definer functions to have a fixed search path
ALTER FUNCTION public.has_role(_user_id uuid, _role app_role) SET search_path = public;
ALTER FUNCTION public.is_staff(_user_id uuid) SET search_path = public;
ALTER FUNCTION public.is_admin(_user_id uuid) SET search_path = public;
ALTER FUNCTION public.auto_update_egg_rates() SET search_path = public;

-- Revoke public execution access (it's often granted by default on create)
REVOKE EXECUTE ON FUNCTION public.has_role(_user_id uuid, _role app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_staff(_user_id uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_admin(_user_id uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.auto_update_egg_rates() FROM PUBLIC;

-- Re-grant to specific roles
GRANT EXECUTE ON FUNCTION public.has_role(_user_id uuid, _role app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_staff(_user_id uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin(_user_id uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.auto_update_egg_rates() TO service_role;
