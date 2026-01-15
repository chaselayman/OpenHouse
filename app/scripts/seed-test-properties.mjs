import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') });

// Prefer Service Role Key for bypassing RLS
const apiKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.log('⚠️  SUPABASE_SERVICE_ROLE_KEY not found. Using anon key (may fail due to RLS).');
  console.log('   Add SUPABASE_SERVICE_ROLE_KEY to .env.local from Supabase Dashboard → Settings → API');
  console.log('');
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  apiKey
);

async function seedTestData() {
  // Get the first agent
  const { data: agents } = await supabase.from('profiles').select('id').limit(1);
  if (!agents?.length) {
    console.log('No agents found');
    return;
  }
  const agentId = agents[0].id;
  console.log('Agent ID:', agentId);

  // Get the first client for this agent
  const { data: clients } = await supabase
    .from('clients')
    .select('id, full_name')
    .eq('agent_id', agentId)
    .limit(1);

  if (!clients?.length) {
    console.log('No clients found. Create a client first.');
    return;
  }
  const clientId = clients[0].id;
  console.log('Client:', clients[0].full_name, clientId);

  // Test properties
  const testProperties = [
    {
      agent_id: agentId,
      address: '123 Oak Street',
      city: 'Edmond',
      state: 'OK',
      zip: '73034',
      price: 425000,
      beds: 4,
      baths: 3,
      sqft: 2450,
      property_type: 'Single Family',
      status: 'active',
      description: 'Beautiful 4 bedroom home with open floor plan, updated kitchen with granite countertops, and large backyard perfect for entertaining.',
      highlights: ['Updated Kitchen', 'Large Backyard', 'Open Floor Plan'],
      photos: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'],
    },
    {
      agent_id: agentId,
      address: '456 Maple Avenue',
      city: 'Oklahoma City',
      state: 'OK',
      zip: '73120',
      price: 385000,
      beds: 3,
      baths: 2,
      sqft: 1850,
      property_type: 'Single Family',
      status: 'active',
      description: 'Charming home in established neighborhood. Features hardwood floors throughout, cozy fireplace, and mature trees providing natural shade.',
      highlights: ['Hardwood Floors', 'Fireplace', 'Mature Trees'],
      photos: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'],
    },
    {
      agent_id: agentId,
      address: '789 Cedar Lane',
      city: 'Norman',
      state: 'OK',
      zip: '73072',
      price: 299000,
      beds: 3,
      baths: 2,
      sqft: 1650,
      property_type: 'Single Family',
      status: 'active',
      description: 'Move-in ready starter home near OU campus. New roof, HVAC, and water heater. Perfect for young families or investors.',
      highlights: ['New Roof', 'Near OU', 'Move-in Ready'],
      photos: ['https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800'],
    },
    {
      agent_id: agentId,
      address: '321 Birch Court',
      city: 'Edmond',
      state: 'OK',
      zip: '73013',
      price: 525000,
      beds: 5,
      baths: 4,
      sqft: 3200,
      property_type: 'Single Family',
      status: 'active',
      description: 'Stunning executive home in gated community. Chef kitchen, home theater, pool, and 3-car garage. Edmond schools.',
      highlights: ['Pool', 'Home Theater', 'Gated Community'],
      photos: ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800'],
    },
    {
      agent_id: agentId,
      address: '555 Elm Drive',
      city: 'Yukon',
      state: 'OK',
      zip: '73099',
      price: 275000,
      beds: 3,
      baths: 2,
      sqft: 1500,
      property_type: 'Single Family',
      status: 'active',
      description: 'Well-maintained home with recent updates. New flooring, fresh paint, and energy-efficient windows. Great starter home!',
      highlights: ['New Flooring', 'Energy Efficient', 'Great Value'],
      photos: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'],
    },
    {
      agent_id: agentId,
      address: '888 Willow Way',
      city: 'Moore',
      state: 'OK',
      zip: '73160',
      price: 345000,
      beds: 4,
      baths: 2.5,
      sqft: 2100,
      property_type: 'Single Family',
      status: 'active',
      description: 'Spacious family home with storm shelter. Open concept living, large master suite, and covered patio.',
      highlights: ['Storm Shelter', 'Open Concept', 'Covered Patio'],
      photos: ['https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800'],
    },
  ];

  // Insert properties
  const { data: insertedProperties, error: propError } = await supabase
    .from('properties')
    .insert(testProperties)
    .select('id, address');

  if (propError) {
    console.log('Error inserting properties:', propError.message);
    return;
  }

  console.log('Inserted', insertedProperties?.length, 'properties');

  // Link properties to client
  const clientProperties = insertedProperties?.map(prop => ({
    client_id: clientId,
    property_id: prop.id,
    status: 'suggested',
  }));

  const { error: linkError } = await supabase
    .from('client_properties')
    .insert(clientProperties);

  if (linkError) {
    console.log('Error linking properties:', linkError.message);
    return;
  }

  console.log('Linked', clientProperties?.length, 'properties to client');
  console.log('\n✅ Test data created!');
  console.log('Client portal URL: http://localhost:3000/p/' + clientId);
}

seedTestData();
