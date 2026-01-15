-- Seed Test Data for OpenHouse Client Portal
-- Run this in Supabase SQL Editor

-- First, ensure profiles exist for all auth users
INSERT INTO public.profiles (id, email, full_name)
SELECT id, email, COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1))
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- Get the first agent ID (we'll use this for test data)
DO $$
DECLARE
  agent_uuid UUID;
  client_uuid UUID;
  prop1_uuid UUID;
  prop2_uuid UUID;
  prop3_uuid UUID;
  prop4_uuid UUID;
  prop5_uuid UUID;
  prop6_uuid UUID;
BEGIN
  -- Get the first agent
  SELECT id INTO agent_uuid FROM public.profiles LIMIT 1;

  IF agent_uuid IS NULL THEN
    RAISE NOTICE 'No agents found. Please sign up/login first.';
    RETURN;
  END IF;

  RAISE NOTICE 'Using agent ID: %', agent_uuid;

  -- Create a test client
  INSERT INTO public.clients (id, agent_id, full_name, email, phone, status, min_price, max_price, min_beds, locations)
  VALUES (
    gen_random_uuid(),
    agent_uuid,
    'Test Buyer',
    'testbuyer@example.com',
    '405-555-1234',
    'active',
    200000,
    600000,
    3,
    ARRAY['Edmond', 'Oklahoma City', 'Norman']
  )
  RETURNING id INTO client_uuid;

  RAISE NOTICE 'Created client ID: %', client_uuid;

  -- Create test properties
  INSERT INTO public.properties (id, agent_id, address, city, state, zip, price, beds, baths, sqft, property_type, status, description, highlights, photos)
  VALUES (
    gen_random_uuid(),
    agent_uuid,
    '123 Oak Street',
    'Edmond',
    'OK',
    '73034',
    425000,
    4,
    3,
    2450,
    'Single Family',
    'active',
    'Beautiful 4 bedroom home with open floor plan, updated kitchen with granite countertops, and large backyard perfect for entertaining.',
    ARRAY['Updated Kitchen', 'Large Backyard', 'Open Floor Plan'],
    ARRAY['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800']
  )
  RETURNING id INTO prop1_uuid;

  INSERT INTO public.properties (id, agent_id, address, city, state, zip, price, beds, baths, sqft, property_type, status, description, highlights, photos)
  VALUES (
    gen_random_uuid(),
    agent_uuid,
    '456 Maple Avenue',
    'Oklahoma City',
    'OK',
    '73120',
    385000,
    3,
    2,
    1850,
    'Single Family',
    'active',
    'Charming home in established neighborhood. Features hardwood floors throughout, cozy fireplace, and mature trees providing natural shade.',
    ARRAY['Hardwood Floors', 'Fireplace', 'Mature Trees'],
    ARRAY['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800']
  )
  RETURNING id INTO prop2_uuid;

  INSERT INTO public.properties (id, agent_id, address, city, state, zip, price, beds, baths, sqft, property_type, status, description, highlights, photos)
  VALUES (
    gen_random_uuid(),
    agent_uuid,
    '789 Cedar Lane',
    'Norman',
    'OK',
    '73072',
    299000,
    3,
    2,
    1650,
    'Single Family',
    'active',
    'Move-in ready starter home near OU campus. New roof, HVAC, and water heater. Perfect for young families or investors.',
    ARRAY['New Roof', 'Near OU', 'Move-in Ready'],
    ARRAY['https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800']
  )
  RETURNING id INTO prop3_uuid;

  INSERT INTO public.properties (id, agent_id, address, city, state, zip, price, beds, baths, sqft, property_type, status, description, highlights, photos)
  VALUES (
    gen_random_uuid(),
    agent_uuid,
    '321 Birch Court',
    'Edmond',
    'OK',
    '73013',
    525000,
    5,
    4,
    3200,
    'Single Family',
    'active',
    'Stunning executive home in gated community. Chef kitchen, home theater, pool, and 3-car garage. Edmond schools.',
    ARRAY['Pool', 'Home Theater', 'Gated Community'],
    ARRAY['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800']
  )
  RETURNING id INTO prop4_uuid;

  INSERT INTO public.properties (id, agent_id, address, city, state, zip, price, beds, baths, sqft, property_type, status, description, highlights, photos)
  VALUES (
    gen_random_uuid(),
    agent_uuid,
    '555 Elm Drive',
    'Yukon',
    'OK',
    '73099',
    275000,
    3,
    2,
    1500,
    'Single Family',
    'active',
    'Well-maintained home with recent updates. New flooring, fresh paint, and energy-efficient windows. Great starter home!',
    ARRAY['New Flooring', 'Energy Efficient', 'Great Value'],
    ARRAY['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800']
  )
  RETURNING id INTO prop5_uuid;

  INSERT INTO public.properties (id, agent_id, address, city, state, zip, price, beds, baths, sqft, property_type, status, description, highlights, photos)
  VALUES (
    gen_random_uuid(),
    agent_uuid,
    '888 Willow Way',
    'Moore',
    'OK',
    '73160',
    345000,
    4,
    2.5,
    2100,
    'Single Family',
    'active',
    'Spacious family home with storm shelter. Open concept living, large master suite, and covered patio.',
    ARRAY['Storm Shelter', 'Open Concept', 'Covered Patio'],
    ARRAY['https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800']
  )
  RETURNING id INTO prop6_uuid;

  RAISE NOTICE 'Created 6 properties';

  -- Link properties to client
  INSERT INTO public.client_properties (client_id, property_id, status)
  VALUES
    (client_uuid, prop1_uuid, 'suggested'),
    (client_uuid, prop2_uuid, 'suggested'),
    (client_uuid, prop3_uuid, 'suggested'),
    (client_uuid, prop4_uuid, 'suggested'),
    (client_uuid, prop5_uuid, 'suggested'),
    (client_uuid, prop6_uuid, 'suggested');

  RAISE NOTICE 'Linked 6 properties to client';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Test data created!';
  RAISE NOTICE 'Client portal URL: http://localhost:3000/p/%', client_uuid;

END $$;

-- Output the client ID for easy access
SELECT
  c.id as client_id,
  c.full_name,
  'http://localhost:3000/p/' || c.id as portal_url
FROM public.clients c
ORDER BY c.created_at DESC
LIMIT 1;
