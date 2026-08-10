-- First, revoke EVERYTHING from everyone to start clean
REVOKE ALL ON FUNCTION public.has_role(_user_id uuid, _role app_role) FROM PUBLIC, authenticated, anon;
REVOKE ALL ON FUNCTION public.is_staff(_user_id uuid) FROM PUBLIC, authenticated, anon;
REVOKE ALL ON FUNCTION public.is_admin(_user_id uuid) FROM PUBLIC, authenticated, anon;
REVOKE ALL ON FUNCTION public.auto_update_egg_rates() FROM PUBLIC, authenticated, anon;

-- Explicitly re-grant to only the necessary roles
GRANT EXECUTE ON FUNCTION public.has_role(_user_id uuid, _role app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_staff(_user_id uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin(_user_id uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.auto_update_egg_rates() TO service_role;
