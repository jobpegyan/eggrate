-- Mumbai Localities (Cities)
INSERT INTO public.cities (state_id, name, slug, status) VALUES
('ab5677c3-e23d-4552-892e-99e77f611213', 'Andheri', 'andheri-mumbai', 'active'),
('ab5677c3-e23d-4552-892e-99e77f611213', 'Dadar', 'dadar-mumbai', 'active'),
('ab5677c3-e23d-4552-892e-99e77f611213', 'Borivali West', 'borivali-west-mumbai', 'active'),
('ab5677c3-e23d-4552-892e-99e77f611213', 'Ghatkopar', 'ghatkopar-mumbai', 'active'),
('ab5677c3-e23d-4552-892e-99e77f611213', 'Chembur', 'chembur-mumbai', 'active'),
('ab5677c3-e23d-4552-892e-99e77f611213', 'Malad', 'malad-mumbai', 'active'),
('ab5677c3-e23d-4552-892e-99e77f611213', 'Mulund', 'mulund-mumbai', 'active'),
('ab5677c3-e23d-4552-892e-99e77f611213', 'Kandivali', 'kandivali-mumbai', 'active'),
('ab5677c3-e23d-4552-892e-99e77f611213', 'Parel', 'parel-mumbai', 'active'),
('ab5677c3-e23d-4552-892e-99e77f611213', 'Bandra West', 'bandra-west-mumbai', 'active'),
-- Pune Localities (Cities)
('ab5677c3-e23d-4552-892e-99e77f611213', 'Hadapsar', 'hadapsar-pune', 'active'),
('ab5677c3-e23d-4552-892e-99e77f611213', 'Kothrud', 'kothrud-pune', 'active'),
('ab5677c3-e23d-4552-892e-99e77f611213', 'Baner', 'baner-pune', 'active'),
('ab5677c3-e23d-4552-892e-99e77f611213', 'Viman Nagar', 'viman-nagar-pune', 'active'),
('ab5677c3-e23d-4552-892e-99e77f611213', 'Wakad', 'wakad-pune', 'active'),
('ab5677c3-e23d-4552-892e-99e77f611213', 'Pimple Saudagar', 'pimple-saudagar-pune', 'active'),
('ab5677c3-e23d-4552-892e-99e77f611213', 'Hinjewadi', 'hinjewadi-pune', 'active'),
('ab5677c3-e23d-4552-892e-99e77f611213', 'Kondhwa', 'kondhwa-pune', 'active'),
('ab5677c3-e23d-4552-892e-99e77f611213', 'Magarpatta', 'magarpatta-pune', 'active'),
('ab5677c3-e23d-4552-892e-99e77f611213', 'Kharadi', 'kharadi-pune', 'active')
ON CONFLICT (slug) DO NOTHING;

-- Create corresponding markets for Mumbai and Pune localities
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
AND slug LIKE '%-mumbai' OR slug LIKE '%-pune'
ON CONFLICT (slug) DO NOTHING;

-- Seed today's rates (2026-08-10) for these new markets
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
    5.40 + (random() * 0.4), -- Realistic rates for MH metros
    68 + (random() * 6),
    540 + (random() * 40),
    '2026-08-10',
    'active',
    true
FROM public.markets m
JOIN public.cities c ON m.city_id = c.id
WHERE m.state_id = 'ab5677c3-e23d-4552-892e-99e77f611213'
AND (c.slug LIKE '%-mumbai' OR c.slug LIKE '%-pune')
AND NOT EXISTS (
    SELECT 1 FROM public.egg_rates er 
    WHERE er.market_id = m.id AND er.effective_date = '2026-08-10'
);
