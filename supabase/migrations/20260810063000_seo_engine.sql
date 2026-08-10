-- SEO Redirects table
CREATE TABLE public.seo_redirects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    old_url text NOT NULL UNIQUE,
    new_url text NOT NULL,
    status_code integer NOT NULL DEFAULT 301,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.seo_redirects TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.seo_redirects TO authenticated;
GRANT ALL ON public.seo_redirects TO service_role;

ALTER TABLE public.seo_redirects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read for redirects" ON public.seo_redirects
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow staff to manage redirects" ON public.seo_redirects
    FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- SEO Title & Meta Templates table
CREATE TABLE public.seo_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    page_type text NOT NULL UNIQUE, -- 'homepage', 'state', 'city', 'market', 'history', 'article', 'analysis'
    title_template text NOT NULL,
    description_template text NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.seo_templates TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.seo_templates TO authenticated;
GRANT ALL ON public.seo_templates TO service_role;

ALTER TABLE public.seo_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read for templates" ON public.seo_templates
    FOR SELECT TO anon, authenticated USING (is_active = true);

CREATE POLICY "Allow staff to manage templates" ON public.seo_templates
    FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- Add Robots setting if not present
INSERT INTO public.seo_settings (key, value, label, group_name, input_type, is_public, sort_order)
VALUES 
('robots_txt', 'User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\nDisallow: /search\nSitemap: https://eggrateindia.com/sitemap.xml', 'Robots.txt Content', 'general', 'textarea', true, 100),
('google_verification', '', 'Google Search Console Verification', 'general', 'text', true, 110)
ON CONFLICT (key) DO NOTHING;

-- Seed default templates
INSERT INTO public.seo_templates (page_type, title_template, description_template)
VALUES
('homepage', 'Egg Rate Today in India – {date} Daily Prices', 'Check today''s NECC egg rates across every Indian state and city. Latest wholesale and retail egg prices updated for {date}.'),
('state', '{state} Egg Rate Today – {date} City Wise Prices', 'Today''s egg rate in {state}. Get daily NECC egg prices for all cities in {state} for {date}. Wholesale and retail trends.'),
('city', 'Egg Rate Today in {city} – {date} Price: {rate}', 'Latest egg rate in {city}, {state} is {rate} per egg. Check wholesale, retail, dozen and tray prices for {date} with historical trends.'),
('market', 'Egg Price in {market} Market, {city} – {date}', 'Live egg rate in {market} market, {city}. Today''s wholesale and retail prices for NECC and local eggs for {date}.'),
('history', 'Egg Rate History in {city} – Price Trends {year}', 'Historical egg price data for {city}. View 7-day, 30-day and yearly egg rate trends for {year}. Download CSV/Excel data.'),
('analysis', 'Egg Market Analysis & Trends – {date} Market Insights', 'AI-powered egg market analysis for {date}. Expert insights on price movements, supply-demand factors and trend predictions for India.')
ON CONFLICT (page_type) DO NOTHING;
