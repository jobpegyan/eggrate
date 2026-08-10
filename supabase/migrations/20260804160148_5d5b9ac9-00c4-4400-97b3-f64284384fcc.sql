-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('guest','user','editor','admin','super_admin');
CREATE TYPE public.user_status AS ENUM ('active','suspended','pending');
CREATE TYPE public.notification_type AS ENUM ('success','warning','error','info');
CREATE TYPE public.log_level AS ENUM ('debug','info','warning','error','critical');

-- ============ SHARED TRIGGER FN ============
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text,
  avatar_url text,
  phone text,
  language text NOT NULL DEFAULT 'en',
  timezone text NOT NULL DEFAULT 'Asia/Kolkata',
  status public.user_status NOT NULL DEFAULT 'active',
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============ ROLES ============
CREATE TABLE public.roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key public.app_role NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  level int NOT NULL DEFAULT 0,
  is_system boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.roles TO authenticated;
GRANT SELECT ON public.roles TO anon;
GRANT ALL ON public.roles TO service_role;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- ============ PERMISSIONS ============
CREATE TABLE public.permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'general',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.permissions TO authenticated;
GRANT ALL ON public.permissions TO service_role;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role public.app_role NOT NULL,
  permission_key text NOT NULL REFERENCES public.permissions(key) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (role, permission_key)
);
GRANT SELECT ON public.role_permissions TO authenticated;
GRANT ALL ON public.role_permissions TO service_role;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- ============ USER ROLES ============
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ============ SECURITY DEFINER HELPERS ============
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','super_admin'));
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('editor','admin','super_admin'));
$$;

CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.role_permissions rp ON rp.role = ur.role
    WHERE ur.user_id = _user_id AND rp.permission_key = _permission
  );
$$;

-- ============ SETTINGS ============
CREATE TABLE public.settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  label text NOT NULL,
  group_name text NOT NULL DEFAULT 'general',
  input_type text NOT NULL DEFAULT 'text',
  is_public boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.settings TO authenticated;
GRANT SELECT ON public.settings TO anon;
GRANT ALL ON public.settings TO service_role;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- ============ SEO SETTINGS ============
CREATE TABLE public.seo_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text,
  label text NOT NULL,
  group_name text NOT NULL DEFAULT 'general',
  input_type text NOT NULL DEFAULT 'text',
  is_public boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.seo_settings TO authenticated;
GRANT SELECT ON public.seo_settings TO anon;
GRANT ALL ON public.seo_settings TO service_role;
ALTER TABLE public.seo_settings ENABLE ROW LEVEL SECURITY;

-- ============ ANNOUNCEMENTS ============
CREATE TABLE public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  type public.notification_type NOT NULL DEFAULT 'info',
  is_active boolean NOT NULL DEFAULT true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.announcements TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.announcements TO authenticated;
GRANT ALL ON public.announcements TO service_role;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- ============ NOTIFICATIONS ============
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text,
  type public.notification_type NOT NULL DEFAULT 'info',
  link text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============ PAGES ============
CREATE TABLE public.pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  content text,
  meta_title text,
  meta_description text,
  is_published boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.pages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pages TO authenticated;
GRANT ALL ON public.pages TO service_role;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- ============ ACTIVITY LOGS ============
CREATE TABLE public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text,
  entity_id text,
  description text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX activity_logs_created_at_idx ON public.activity_logs (created_at DESC);
CREATE INDEX activity_logs_user_idx ON public.activity_logs (user_id);
GRANT SELECT ON public.activity_logs TO authenticated;
GRANT ALL ON public.activity_logs TO service_role;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- ============ SYSTEM LOGS ============
CREATE TABLE public.system_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level public.log_level NOT NULL DEFAULT 'info',
  source text NOT NULL DEFAULT 'app',
  message text NOT NULL,
  context jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX system_logs_created_at_idx ON public.system_logs (created_at DESC);
GRANT SELECT ON public.system_logs TO authenticated;
GRANT ALL ON public.system_logs TO service_role;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- ============ POLICIES ============
-- profiles
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "profiles_select_admin" ON public.profiles FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update_admin" ON public.profiles FOR UPDATE TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "profiles_delete_admin" ON public.profiles FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

-- roles
CREATE POLICY "roles_select_all" ON public.roles FOR SELECT USING (true);
CREATE POLICY "roles_write_admin" ON public.roles FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- permissions
CREATE POLICY "permissions_select_auth" ON public.permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "permissions_write_admin" ON public.permissions FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- role_permissions
CREATE POLICY "role_permissions_select_auth" ON public.role_permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "role_permissions_write_admin" ON public.role_permissions FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- user_roles
CREATE POLICY "user_roles_select_own" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "user_roles_select_admin" ON public.user_roles FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "user_roles_write_admin" ON public.user_roles FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- settings
CREATE POLICY "settings_select_public" ON public.settings FOR SELECT USING (is_public = true);
CREATE POLICY "settings_select_admin" ON public.settings FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "settings_write_admin" ON public.settings FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- seo_settings
CREATE POLICY "seo_select_public" ON public.seo_settings FOR SELECT USING (is_public = true);
CREATE POLICY "seo_select_admin" ON public.seo_settings FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "seo_write_admin" ON public.seo_settings FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- announcements
CREATE POLICY "announcements_select_active" ON public.announcements FOR SELECT USING (
  is_active = true AND (starts_at IS NULL OR starts_at <= now()) AND (ends_at IS NULL OR ends_at >= now())
);
CREATE POLICY "announcements_select_staff" ON public.announcements FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "announcements_write_staff" ON public.announcements FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- notifications
CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "notifications_delete_own" ON public.notifications FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "notifications_select_admin" ON public.notifications FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

-- pages
CREATE POLICY "pages_select_published" ON public.pages FOR SELECT USING (is_published = true);
CREATE POLICY "pages_select_staff" ON public.pages FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "pages_write_staff" ON public.pages FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- logs
CREATE POLICY "activity_logs_select_own" ON public.activity_logs FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "activity_logs_select_admin" ON public.activity_logs FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "system_logs_select_admin" ON public.system_logs FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));

-- ============ TRIGGERS ============
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER roles_updated_at BEFORE UPDATE ON public.roles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER announcements_updated_at BEFORE UPDATE ON public.announcements FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER pages_updated_at BEFORE UPDATE ON public.pages FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(COALESCE(NEW.email,''), '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ SEED: ROLES ============
INSERT INTO public.roles (key, name, description, level, is_system) VALUES
  ('guest','Guest','Unauthenticated visitor with read-only access to public content.',0,true),
  ('user','Registered User','Signed-in user with access to their own profile and notifications.',10,true),
  ('editor','Editor','Can manage announcements and content pages.',50,true),
  ('admin','Admin','Full access to users, roles, settings and logs.',80,true),
  ('super_admin','Super Admin','Unrestricted access including role and permission management.',100,true);

-- ============ SEED: PERMISSIONS ============
INSERT INTO public.permissions (key, name, description, category) VALUES
  ('dashboard.view','View Dashboard','Access the admin dashboard.','dashboard'),
  ('users.view','View Users','List and inspect user accounts.','users'),
  ('users.create','Create Users','Invite or create new user accounts.','users'),
  ('users.update','Edit Users','Update user profile details and status.','users'),
  ('users.delete','Delete Users','Permanently remove user accounts.','users'),
  ('roles.view','View Roles','See the list of roles.','roles'),
  ('roles.manage','Manage Roles','Create, edit and delete roles.','roles'),
  ('permissions.view','View Permissions','See the permission catalogue.','permissions'),
  ('permissions.manage','Manage Permissions','Assign permissions to roles.','permissions'),
  ('announcements.view','View Announcements','See all announcements.','content'),
  ('announcements.manage','Manage Announcements','Create, edit and delete announcements.','content'),
  ('pages.view','View Pages','See all content pages.','content'),
  ('pages.manage','Manage Pages','Create, edit and delete content pages.','content'),
  ('settings.view','View Website Settings','See website configuration.','settings'),
  ('settings.manage','Manage Website Settings','Update website configuration.','settings'),
  ('seo.view','View SEO Settings','See SEO configuration.','seo'),
  ('seo.manage','Manage SEO Settings','Update SEO configuration.','seo'),
  ('logs.view','View Activity Logs','Read the audit trail.','logs'),
  ('system_logs.view','View System Logs','Read application system logs.','logs');

-- ============ SEED: ROLE PERMISSIONS ============
INSERT INTO public.role_permissions (role, permission_key)
SELECT 'super_admin'::public.app_role, key FROM public.permissions;

INSERT INTO public.role_permissions (role, permission_key)
SELECT 'admin'::public.app_role, key FROM public.permissions
WHERE key NOT IN ('permissions.manage','roles.manage');

INSERT INTO public.role_permissions (role, permission_key) VALUES
  ('editor','dashboard.view'),
  ('editor','announcements.view'),
  ('editor','announcements.manage'),
  ('editor','pages.view'),
  ('editor','pages.manage'),
  ('editor','seo.view');

-- ============ SEED: WEBSITE SETTINGS ============
INSERT INTO public.settings (key, value, label, group_name, input_type, is_public, sort_order) VALUES
  ('site_name','"EggRate India"','Website Name','general','text',true,1),
  ('logo_url','""','Logo URL','general','text',true,2),
  ('favicon_url','"/favicon.ico"','Favicon URL','general','text',true,3),
  ('contact_email','"hello@eggrateindia.com"','Contact Email','contact','email',true,4),
  ('support_email','"support@eggrateindia.com"','Support Email','contact','email',true,5),
  ('timezone','"Asia/Kolkata"','Timezone','localization','text',true,6),
  ('default_language','"en"','Default Language','localization','text',true,7),
  ('currency','"INR"','Currency','localization','text',true,8),
  ('theme','"system"','Default Theme','appearance','select',true,9),
  ('maintenance_mode','false','Maintenance Mode','system','boolean',true,10),
  ('announcement_bar_enabled','true','Announcement Bar','system','boolean',true,11);

-- ============ SEED: SEO SETTINGS ============
INSERT INTO public.seo_settings (key, value, label, group_name, input_type, is_public, sort_order) VALUES
  ('site_title','EggRate India','Site Title','general','text',true,1),
  ('default_meta_title','Today''s Egg Rate in India','Default Meta Title','general','text',true,2),
  ('meta_description','Daily egg rates for every state and city in India.','Meta Description','general','textarea',true,3),
  ('og_title','EggRate India','Open Graph Title','social','text',true,4),
  ('og_description','Daily egg rates across India.','Open Graph Description','social','textarea',true,5),
  ('og_image','','Open Graph Image URL','social','text',true,6),
  ('twitter_card','summary_large_image','Twitter Card Type','social','text',true,7),
  ('twitter_site','@eggrateindia','Twitter Handle','social','text',true,8),
  ('google_analytics_id','','Google Analytics ID','analytics','text',false,9),
  ('google_tag_manager_id','','Google Tag Manager ID','analytics','text',false,10),
  ('facebook_pixel_id','','Facebook Pixel ID','analytics','text',false,11),
  ('google_site_verification','','Google Search Console Verification','analytics','text',false,12),
  ('canonical_domain','','Canonical Domain','general','text',true,13),
  ('robots_txt','User-agent: *
Allow: /','Robots.txt Content','crawlers','textarea',true,14),
  ('sitemap_enabled','true','Sitemap Enabled','crawlers','boolean',true,15);