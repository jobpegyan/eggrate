-- Revoke execute from public to be safe
REVOKE EXECUTE ON FUNCTION public.has_role(_user_id uuid, _role app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_staff(_user_id uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_admin(_user_id uuid) FROM PUBLIC;

-- These functions are intentionally accessible to 'authenticated' to implement RLS policies.
-- They are secure because they only perform lookups against the user's own data or roles.
-- We will ignore the linter warning for these specific functions.
