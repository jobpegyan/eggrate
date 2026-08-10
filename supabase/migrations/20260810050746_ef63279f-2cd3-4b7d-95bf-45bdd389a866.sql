-- The linter is still flagging things. Let's be absolutely explicit about revoking anon.
REVOKE EXECUTE ON FUNCTION public.auto_update_egg_rates() FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(_user_id uuid, _role app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_staff(_user_id uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_admin(_user_id uuid) FROM anon;
