-- Expansion of Delhi localities with correct composite unique constraint handling
DO $$
DECLARE
    delhi_id UUID := 'b838a33c-dd48-4ef9-9bd5-76eed5379a98';
    city_names TEXT[] := ARRAY[
        'Azadpur', 'Okhla', 'Ghazipur', 'Kirti Nagar', 'Kalkaji', 'Hauz Khas', 
        'Vasant Kunj', 'Lajpat Nagar', 'Mayur Vihar', 'Paschim Vihar', 'Vikaspuri', 
        'Janakpuri', 'Rajouri Garden', 'Model Town', 'Ashok Vihar', 'Shalimar Bagh', 
        'Punjabi Bagh', 'Palam', 'Badarpur', 'Moti Nagar', 'Connaught Place', 
        'Chandni Chowk', 'Greater Kailash', 'Saket', 'Defence Colony', 'RK Puram'
    ];
    city_name TEXT;
    c_slug TEXT;
    new_city_id UUID;
    new_market_id UUID;
BEGIN
    FOREACH city_name IN ARRAY city_names
    LOOP
        c_slug := lower(replace(city_name, ' ', '-'));
        
        -- Get or Create city
        SELECT id INTO new_city_id FROM public.cities WHERE slug = c_slug;
        IF new_city_id IS NULL THEN
            INSERT INTO public.cities (name, slug, state_id)
            VALUES (city_name, c_slug, delhi_id)
            RETURNING id INTO new_city_id;
        END IF;

        -- Get or Create market
        SELECT id INTO new_market_id FROM public.markets WHERE slug = (c_slug || '-market');
        IF new_market_id IS NULL AND new_city_id IS NOT NULL THEN
            INSERT INTO public.markets (name, slug, city_id, state_id)
            VALUES (city_name || ' Market', c_slug || '-market', new_city_id, delhi_id)
            RETURNING id INTO new_market_id;
        END IF;
        
        -- Seed initial rate
        IF new_city_id IS NOT NULL AND new_market_id IS NOT NULL THEN
            INSERT INTO public.egg_rates (
                state_id,
                city_id, 
                market_id,
                effective_date, 
                wholesale_price, 
                retail_price, 
                egg_rate, 
                notes,
                status
            )
            VALUES (
                delhi_id,
                new_city_id, 
                new_market_id,
                '2026-08-10', 
                ROUND((500 + (random() * 50))::numeric, 2), 
                ROUND((550 + (random() * 50))::numeric, 2), 
                ROUND((6 + (random() * 2))::numeric, 2),
                'Delhi locality expansion seeding',
                'active'
            )
            ON CONFLICT (city_id, market_id, effective_date) DO NOTHING;
        END IF;
    END LOOP;
END $$;