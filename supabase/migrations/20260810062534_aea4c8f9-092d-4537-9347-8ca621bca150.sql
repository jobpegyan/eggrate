CREATE OR REPLACE FUNCTION public.handle_slug_change_redirect()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.slug IS DISTINCT FROM NEW.slug) THEN
        INSERT INTO public.seo_redirects (old_url, new_url, status_code)
        VALUES (
            CASE 
                WHEN TG_TABLE_NAME = 'states' THEN '/state/' || OLD.slug
                WHEN TG_TABLE_NAME = 'cities' THEN '/city/' || OLD.slug
                WHEN TG_TABLE_NAME = 'markets' THEN '/market/' || OLD.slug
                WHEN TG_TABLE_NAME = 'posts' THEN '/blog/' || OLD.slug
                ELSE '/' || OLD.slug
            END,
            CASE 
                WHEN TG_TABLE_NAME = 'states' THEN '/state/' || NEW.slug
                WHEN TG_TABLE_NAME = 'cities' THEN '/city/' || NEW.slug
                WHEN TG_TABLE_NAME = 'markets' THEN '/market/' || NEW.slug
                WHEN TG_TABLE_NAME = 'posts' THEN '/blog/' || NEW.slug
                ELSE '/' || NEW.slug
            END,
            301
        )
        ON CONFLICT (old_url) DO UPDATE SET new_url = EXCLUDED.new_url, updated_at = now();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
