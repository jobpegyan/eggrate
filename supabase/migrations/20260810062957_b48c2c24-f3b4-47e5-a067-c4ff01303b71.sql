UPDATE public.pages 
SET content = REPLACE(content, 'Last updated: August 10, 2026', 'Updated Sunday, 12 July 2026')
WHERE slug = 'privacy';