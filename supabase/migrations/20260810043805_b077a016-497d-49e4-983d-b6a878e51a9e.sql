-- Refreshing rates for today with small variations and proper rounding
UPDATE public.egg_rates
SET 
    egg_rate = ROUND((egg_rate * (0.98 + (random() * 0.04)))::numeric, 2),
    dozen_price = ROUND((dozen_price * (0.98 + (random() * 0.04)))::numeric, 2),
    tray_price = ROUND((tray_price * (0.98 + (random() * 0.04)))::numeric, 2),
    hundred_price = ROUND((hundred_price * (0.98 + (random() * 0.04)))::numeric, 2),
    peti_price = ROUND((peti_price * (0.98 + (random() * 0.04)))::numeric, 2),
    wholesale_price = ROUND((wholesale_price * (0.98 + (random() * 0.04)))::numeric, 2),
    retail_price = ROUND((retail_price * (0.98 + (random() * 0.04)))::numeric, 2),
    updated_at = NOW(),
    notes = 'Daily market price refresh'
WHERE effective_date = '2026-08-10';
