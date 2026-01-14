-- OpenHouse Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- PROFILES (extends Supabase auth.users)
-- ============================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  phone text,
  brokerage text,
  license_number text,
  avatar_url text,
  plan_type text default 'individual' check (plan_type in ('individual', 'brokerage')),
  plan_tier text default 'base' check (plan_tier in ('base', 'unlimited')),
  client_limit integer default 5,
  -- Anti-sharing restrictions
  showingtime_connected boolean default false,
  calendar_connected boolean default false,
  mls_connected boolean default false,
  last_session_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- CLIENTS (buyer clients)
-- ============================================
create table public.clients (
  id uuid default uuid_generate_v4() primary key,
  agent_id uuid references public.profiles(id) on delete cascade not null,
  full_name text not null,
  email text,
  phone text,
  status text default 'active' check (status in ('active', 'inactive', 'closed')),
  -- Search criteria
  min_price integer,
  max_price integer,
  min_beds integer,
  max_beds integer,
  min_baths numeric(3,1),
  max_baths numeric(3,1),
  min_sqft integer,
  max_sqft integer,
  property_types text[], -- ['single_family', 'condo', 'townhouse', etc.]
  locations text[], -- cities, neighborhoods, zip codes
  must_haves text[], -- ['pool', 'garage', 'updated_kitchen', etc.]
  dealbreakers text[], -- ['busy_road', 'hoa', 'foundation_issues', etc.]
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- PROPERTIES (listings from MLS or manual)
-- ============================================
create table public.properties (
  id uuid default uuid_generate_v4() primary key,
  agent_id uuid references public.profiles(id) on delete cascade not null,
  mls_id text,
  address text not null,
  city text,
  state text,
  zip text,
  price integer,
  beds integer,
  baths numeric(3,1),
  sqft integer,
  lot_size numeric(10,2),
  year_built integer,
  property_type text,
  status text default 'active' check (status in ('active', 'pending', 'sold', 'off_market')),
  listing_agent_name text,
  listing_agent_phone text,
  listing_agent_email text,
  photos text[], -- array of photo URLs
  description text,
  features text[],
  -- AI Analysis
  ai_score integer, -- 0-100
  ai_analysis jsonb, -- detailed AI analysis results
  red_flags text[], -- identified issues
  highlights text[], -- positive features
  analyzed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- CLIENT_PROPERTIES (which properties shown to which clients)
-- ============================================
create table public.client_properties (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references public.clients(id) on delete cascade not null,
  property_id uuid references public.properties(id) on delete cascade not null,
  status text default 'suggested' check (status in ('suggested', 'viewed', 'interested', 'rejected', 'toured')),
  client_rating integer check (client_rating >= 1 and client_rating <= 5),
  client_notes text,
  agent_notes text,
  sent_at timestamp with time zone,
  viewed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(client_id, property_id)
);

-- ============================================
-- SHOWINGS (scheduled property tours)
-- ============================================
create table public.showings (
  id uuid default uuid_generate_v4() primary key,
  agent_id uuid references public.profiles(id) on delete cascade not null,
  client_id uuid references public.clients(id) on delete cascade not null,
  property_id uuid references public.properties(id) on delete cascade not null,
  scheduled_date date not null,
  scheduled_time time not null,
  duration_minutes integer default 30,
  status text default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  -- ShowingTime integration
  showingtime_id text,
  confirmation_code text,
  -- Notes
  notes text,
  feedback text,
  client_feedback text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- INTEGRATIONS (MLS, ShowingTime, Calendar credentials)
-- ============================================
create table public.integrations (
  id uuid default uuid_generate_v4() primary key,
  agent_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('mls', 'showingtime', 'google_calendar', 'outlook_calendar')),
  credentials jsonb, -- encrypted credentials
  settings jsonb, -- integration-specific settings
  connected_at timestamp with time zone,
  last_sync_at timestamp with time zone,
  status text default 'disconnected' check (status in ('connected', 'disconnected', 'error')),
  error_message text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(agent_id, type)
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.properties enable row level security;
alter table public.client_properties enable row level security;
alter table public.showings enable row level security;
alter table public.integrations enable row level security;

-- Profiles: users can only see/edit their own profile
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Clients: agents can only see their own clients
create policy "Agents can view own clients" on public.clients
  for select using (auth.uid() = agent_id);

create policy "Agents can insert own clients" on public.clients
  for insert with check (auth.uid() = agent_id);

create policy "Agents can update own clients" on public.clients
  for update using (auth.uid() = agent_id);

create policy "Agents can delete own clients" on public.clients
  for delete using (auth.uid() = agent_id);

-- Properties: agents can only see their own properties
create policy "Agents can view own properties" on public.properties
  for select using (auth.uid() = agent_id);

create policy "Agents can insert own properties" on public.properties
  for insert with check (auth.uid() = agent_id);

create policy "Agents can update own properties" on public.properties
  for update using (auth.uid() = agent_id);

create policy "Agents can delete own properties" on public.properties
  for delete using (auth.uid() = agent_id);

-- Client Properties: agents can manage through their clients
create policy "Agents can view client properties" on public.client_properties
  for select using (
    exists (
      select 1 from public.clients
      where clients.id = client_properties.client_id
      and clients.agent_id = auth.uid()
    )
  );

create policy "Agents can insert client properties" on public.client_properties
  for insert with check (
    exists (
      select 1 from public.clients
      where clients.id = client_properties.client_id
      and clients.agent_id = auth.uid()
    )
  );

create policy "Agents can update client properties" on public.client_properties
  for update using (
    exists (
      select 1 from public.clients
      where clients.id = client_properties.client_id
      and clients.agent_id = auth.uid()
    )
  );

create policy "Agents can delete client properties" on public.client_properties
  for delete using (
    exists (
      select 1 from public.clients
      where clients.id = client_properties.client_id
      and clients.agent_id = auth.uid()
    )
  );

-- Showings: agents can only see their own showings
create policy "Agents can view own showings" on public.showings
  for select using (auth.uid() = agent_id);

create policy "Agents can insert own showings" on public.showings
  for insert with check (auth.uid() = agent_id);

create policy "Agents can update own showings" on public.showings
  for update using (auth.uid() = agent_id);

create policy "Agents can delete own showings" on public.showings
  for delete using (auth.uid() = agent_id);

-- Integrations: agents can only see their own integrations
create policy "Agents can view own integrations" on public.integrations
  for select using (auth.uid() = agent_id);

create policy "Agents can insert own integrations" on public.integrations
  for insert with check (auth.uid() = agent_id);

create policy "Agents can update own integrations" on public.integrations
  for update using (auth.uid() = agent_id);

create policy "Agents can delete own integrations" on public.integrations
  for delete using (auth.uid() = agent_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on signup
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Apply updated_at trigger to all tables
create trigger handle_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger handle_clients_updated_at
  before update on public.clients
  for each row execute procedure public.handle_updated_at();

create trigger handle_properties_updated_at
  before update on public.properties
  for each row execute procedure public.handle_updated_at();

create trigger handle_client_properties_updated_at
  before update on public.client_properties
  for each row execute procedure public.handle_updated_at();

create trigger handle_showings_updated_at
  before update on public.showings
  for each row execute procedure public.handle_updated_at();

create trigger handle_integrations_updated_at
  before update on public.integrations
  for each row execute procedure public.handle_updated_at();

-- ============================================
-- INDEXES
-- ============================================

create index idx_clients_agent_id on public.clients(agent_id);
create index idx_clients_status on public.clients(status);
create index idx_properties_agent_id on public.properties(agent_id);
create index idx_properties_status on public.properties(status);
create index idx_properties_mls_id on public.properties(mls_id);
create index idx_client_properties_client_id on public.client_properties(client_id);
create index idx_client_properties_property_id on public.client_properties(property_id);
create index idx_showings_agent_id on public.showings(agent_id);
create index idx_showings_client_id on public.showings(client_id);
create index idx_showings_property_id on public.showings(property_id);
create index idx_showings_date on public.showings(scheduled_date);
create index idx_integrations_agent_id on public.integrations(agent_id);
