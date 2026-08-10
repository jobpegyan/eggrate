-- Add major Palghar district localities (as cities)
INSERT INTO public.cities (state_id, name, slug, status) VALUES
('ab5677c3-e23d-4552-892e-99e77f611213', 'Vasai', 'vasai-palghar', 'active'),
('ab5677c3-e23d-4552-892e-99e77f611213', 'Virar', 'virar-palghar', 'active'),
('ab5677c3-e23d-4552-892e-99e77f611213', 'Nallasopara', 'nallasopara-palghar', 'active'),
('ab5677c3-e23d-4552-892e-99e77f611213', 'Boisar', 'boisar-palghar', 'active'),
('ab5677c3-e23d-4552-892e-99e77f611213', 'Manor', 'manor-palghar', 'active'),
('ab5677c3-e23d-4552-892e-99e77f611213', 'Saphale', 'saphale-palghar', 'active'),
('ab5677c3-e23d-4552-892e-99e77f611213', 'Vikramgad', 'vikramgad-palghar', 'active'),
('ab5677c3-e23d-4552-892e-99e77f611213', 'Jawhar', 'jawhar-palghar', 'active'),
('ab5677c3-e23d-4552-892e-99e77f611213', 'Mokhada', 'mokhada-palghar', 'active'),
('ab5677c3-e23d-4552-892e-99e77f611213', 'Talasari', 'talasari-palghar', 'active')
ON CONFLICT (slug) DO NOTHING;

-- Create corresponding markets for these new Palghar localities
INSERT INTO public.markets (state_id, city_id, name, slug, status, market_type)
SELECT 
    state_id, 
    id, 
    name || ' Egg Market', 
    slug || '-market', 
    'active', 
    'wholesale'
FROM public.cities 
WHERE state_id = 'ab5677c3-e23d-4552-892e-99e77f611213'
AND slug LIKE '%-palghar'
ON CONFLICT (slug) DO NOTHING;

-- Seed today's rates (2026-08-10) for Palghar localities
INSERT INTO public.egg_rates (
    state_id, 
    city_id, 
    market_id, 
    egg_rate, 
    dozen_price, 
    hundred_price, 
    effective_date, 
    status, 
    is_published
)
SELECT 
    m.state_id, 
    m.city_id, 
    m.id, 
    5.35 + (random() * 0.4), -- Realistic rates for Palghar region
    67 + (random() * 6),
    535 + (random() * 40),
    '2026-08-10',
    'active',
    true
FROM public.markets m
JOIN public.cities c ON m.city_id = c.id
WHERE m.state_id = 'ab5677c3-e23d-4552-892e-99e77f611213'
AND c.slug LIKE '%-palghar'
AND NOT EXISTS (
    SELECT 1 FROM public.egg_rates er 
    WHERE er.market_id = m.id AND er.effective_date = '2026-08-10'
);
