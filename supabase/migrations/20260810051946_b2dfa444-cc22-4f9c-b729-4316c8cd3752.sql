-- Add major localities/sectors to Chandigarh
INSERT INTO public.cities (state_id, name, slug, status) VALUES
('30fcad80-54dc-4208-9dd9-e59438ded70a', 'Sector 17', 'sector-17-chandigarh', 'active'),
('30fcad80-54dc-4208-9dd9-e59438ded70a', 'Sector 22', 'sector-22-chandigarh', 'active'),
('30fcad80-54dc-4208-9dd9-e59438ded70a', 'Sector 35', 'sector-35-chandigarh', 'active'),
('30fcad80-54dc-4208-9dd9-e59438ded70a', 'Sector 43', 'sector-43-chandigarh', 'active'),
('30fcad80-54dc-4208-9dd9-e59438ded70a', 'IT Park', 'it-park-chandigarh', 'active'),
('30fcad80-54dc-4208-9dd9-e59438ded70a', 'Industrial Area Phase 1', 'industrial-area-phase-1-chandigarh', 'active'),
('30fcad80-54dc-4208-9dd9-e59438ded70a', 'Industrial Area Phase 2', 'industrial-area-phase-2-chandigarh', 'active'),
('30fcad80-54dc-4208-9dd9-e59438ded70a', 'Burail', 'burail-chandigarh', 'active'),
('30fcad80-54dc-4208-9dd9-e59438ded70a', 'Kajheri', 'kajheri-chandigarh', 'active'),
('30fcad80-54dc-4208-9dd9-e59438ded70a', 'Dhanas', 'dhanas-chandigarh', 'active'),
('30fcad80-54dc-4208-9dd9-e59438ded70a', 'Daria', 'daria-chandigarh', 'active'),
('30fcad80-54dc-4208-9dd9-e59438ded70a', 'Hallo Majra', 'hallo-majra-chandigarh', 'active'),
('30fcad80-54dc-4208-9dd9-e59438ded70a', 'Maloya', 'maloya-chandigarh', 'active'),
('30fcad80-54dc-4208-9dd9-e59438ded70a', 'Palsora', 'palsora-chandigarh', 'active'),
('30fcad80-54dc-4208-9dd9-e59438ded70a', 'Sarangpur', 'sarangpur-chandigarh', 'active')
ON CONFLICT (slug) DO NOTHING;

-- Create corresponding markets
INSERT INTO public.markets (state_id, city_id, name, slug, status, market_type)
SELECT 
    state_id, 
    id, 
    name || ' Egg Market', 
    slug || '-market', 
    'active', 
    'wholesale'
FROM public.cities 
WHERE state_id = '30fcad80-54dc-4208-9dd9-e59438ded70a'
AND slug NOT IN ('chandigarh', 'manimajra', 'chandigarh-town')
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
    4.85 + (random() * 0.3), -- Random rate between 4.85 and 5.15
    60 + (random() * 5),
    485 + (random() * 30),
    '2026-08-10',
    'active',
    true
FROM public.markets m
JOIN public.cities c ON m.city_id = c.id
WHERE m.state_id = '30fcad80-54dc-4208-9dd9-e59438ded70a'
AND c.slug NOT IN ('chandigarh', 'manimajra', 'chandigarh-town')
AND NOT EXISTS (
    SELECT 1 FROM public.egg_rates er 
    WHERE er.market_id = m.id AND er.effective_date = '2026-08-10'
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.cities TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.markets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.egg_rates TO authenticated;
GRANT ALL ON public.cities TO service_role;
GRANT ALL ON public.markets TO service_role;
GRANT ALL ON public.egg_rates TO service_role;
