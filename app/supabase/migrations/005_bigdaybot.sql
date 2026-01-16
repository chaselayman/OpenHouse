-- BigDayBot Automation Schema
-- Migration 005: Add tables for BigDayBot contacts and events

-- ============================================
-- BIGDAYBOT_CONTACTS (contacts with important dates)
-- ============================================
create table public.bigdaybot_contacts (
  id uuid default uuid_generate_v4() primary key,
  agent_id uuid references public.profiles(id) on delete cascade not null,

  -- Basic Info
  first_name text not null,
  last_name text,
  email text,
  phone text,

  -- Important Dates
  birthday date,
  wedding_anniversary date,
  home_purchase_date date,
  move_in_date date,
  is_first_home boolean default false,

  -- Property Info (for home anniversary context)
  property_address text,
  property_city text,
  property_state text,
  property_zip text,

  -- Kids (up to 4)
  kid1_name text,
  kid1_birthday date,
  kid2_name text,
  kid2_birthday date,
  kid3_name text,
  kid3_birthday date,
  kid4_name text,
  kid4_birthday date,

  -- Status
  status text default 'active' check (status in ('active', 'paused', 'unsubscribed')),
  tags text[], -- for filtering/grouping
  notes text,

  -- Import tracking
  import_source text, -- 'csv', 'manual', 'google', 'crm'
  import_batch_id uuid, -- to group imports together

  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- BIGDAYBOT_CAMPAIGNS (campaign settings per agent)
-- ============================================
create table public.bigdaybot_campaigns (
  id uuid default uuid_generate_v4() primary key,
  agent_id uuid references public.profiles(id) on delete cascade not null,

  campaign_type text not null check (campaign_type in (
    'birthday',
    'wedding_anniversary',
    'home_anniversary',
    'move_in_anniversary',
    'first_home_anniversary',
    'kids_birthday'
  )),

  -- Settings
  enabled boolean default true,
  days_before integer default 0, -- send X days before the event (0 = day of)
  send_time time default '09:00', -- what time to send
  channel text default 'email' check (channel in ('email', 'sms', 'both')),

  -- Email template customization
  email_subject text,
  email_body text,

  -- SMS template
  sms_body text,

  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  unique(agent_id, campaign_type)
);

-- ============================================
-- BIGDAYBOT_SENT_MESSAGES (log of sent messages)
-- ============================================
create table public.bigdaybot_sent_messages (
  id uuid default uuid_generate_v4() primary key,
  agent_id uuid references public.profiles(id) on delete cascade not null,
  contact_id uuid references public.bigdaybot_contacts(id) on delete cascade not null,
  campaign_type text not null,

  -- Message details
  channel text not null check (channel in ('email', 'sms')),
  recipient text not null, -- email address or phone number
  subject text,
  body text,

  -- Status
  status text default 'sent' check (status in ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed')),
  error_message text,

  -- Tracking
  sent_at timestamp with time zone default timezone('utc'::text, now()) not null,
  delivered_at timestamp with time zone,
  opened_at timestamp with time zone,
  clicked_at timestamp with time zone
);

-- ============================================
-- BIGDAYBOT_UPCOMING_EVENTS (materialized view for quick queries)
-- ============================================
create table public.bigdaybot_upcoming_events (
  id uuid default uuid_generate_v4() primary key,
  agent_id uuid references public.profiles(id) on delete cascade not null,
  contact_id uuid references public.bigdaybot_contacts(id) on delete cascade not null,

  event_type text not null,
  event_date date not null,
  event_year integer, -- the year this event occurs (for anniversaries, it's the next occurrence)
  years_since integer, -- for anniversaries, how many years

  -- Denormalized contact info for quick display
  contact_name text not null,
  contact_email text,

  -- Status
  message_sent boolean default false,
  sent_at timestamp with time zone,

  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table public.bigdaybot_contacts enable row level security;
alter table public.bigdaybot_campaigns enable row level security;
alter table public.bigdaybot_sent_messages enable row level security;
alter table public.bigdaybot_upcoming_events enable row level security;

-- Contacts policies
create policy "Agents can view own bigdaybot contacts" on public.bigdaybot_contacts
  for select using (auth.uid() = agent_id);

create policy "Agents can insert own bigdaybot contacts" on public.bigdaybot_contacts
  for insert with check (auth.uid() = agent_id);

create policy "Agents can update own bigdaybot contacts" on public.bigdaybot_contacts
  for update using (auth.uid() = agent_id);

create policy "Agents can delete own bigdaybot contacts" on public.bigdaybot_contacts
  for delete using (auth.uid() = agent_id);

-- Campaigns policies
create policy "Agents can view own bigdaybot campaigns" on public.bigdaybot_campaigns
  for select using (auth.uid() = agent_id);

create policy "Agents can insert own bigdaybot campaigns" on public.bigdaybot_campaigns
  for insert with check (auth.uid() = agent_id);

create policy "Agents can update own bigdaybot campaigns" on public.bigdaybot_campaigns
  for update using (auth.uid() = agent_id);

create policy "Agents can delete own bigdaybot campaigns" on public.bigdaybot_campaigns
  for delete using (auth.uid() = agent_id);

-- Sent messages policies
create policy "Agents can view own bigdaybot sent messages" on public.bigdaybot_sent_messages
  for select using (auth.uid() = agent_id);

create policy "Agents can insert own bigdaybot sent messages" on public.bigdaybot_sent_messages
  for insert with check (auth.uid() = agent_id);

-- Upcoming events policies
create policy "Agents can view own bigdaybot upcoming events" on public.bigdaybot_upcoming_events
  for select using (auth.uid() = agent_id);

create policy "Agents can insert own bigdaybot upcoming events" on public.bigdaybot_upcoming_events
  for insert with check (auth.uid() = agent_id);

create policy "Agents can update own bigdaybot upcoming events" on public.bigdaybot_upcoming_events
  for update using (auth.uid() = agent_id);

create policy "Agents can delete own bigdaybot upcoming events" on public.bigdaybot_upcoming_events
  for delete using (auth.uid() = agent_id);

-- ============================================
-- INDEXES
-- ============================================

create index idx_bigdaybot_contacts_agent_id on public.bigdaybot_contacts(agent_id);
create index idx_bigdaybot_contacts_status on public.bigdaybot_contacts(status);
create index idx_bigdaybot_contacts_birthday on public.bigdaybot_contacts(birthday);
create index idx_bigdaybot_contacts_home_purchase on public.bigdaybot_contacts(home_purchase_date);
create index idx_bigdaybot_contacts_wedding on public.bigdaybot_contacts(wedding_anniversary);

create index idx_bigdaybot_campaigns_agent_id on public.bigdaybot_campaigns(agent_id);
create index idx_bigdaybot_campaigns_type on public.bigdaybot_campaigns(campaign_type);

create index idx_bigdaybot_sent_messages_agent_id on public.bigdaybot_sent_messages(agent_id);
create index idx_bigdaybot_sent_messages_contact_id on public.bigdaybot_sent_messages(contact_id);
create index idx_bigdaybot_sent_messages_sent_at on public.bigdaybot_sent_messages(sent_at);

create index idx_bigdaybot_upcoming_events_agent_id on public.bigdaybot_upcoming_events(agent_id);
create index idx_bigdaybot_upcoming_events_date on public.bigdaybot_upcoming_events(event_date);

-- ============================================
-- TRIGGERS
-- ============================================

create trigger handle_bigdaybot_contacts_updated_at
  before update on public.bigdaybot_contacts
  for each row execute procedure public.handle_updated_at();

create trigger handle_bigdaybot_campaigns_updated_at
  before update on public.bigdaybot_campaigns
  for each row execute procedure public.handle_updated_at();

-- ============================================
-- DEFAULT CAMPAIGN TEMPLATES
-- ============================================

-- Function to create default campaigns for new users
create or replace function public.create_default_bigdaybot_campaigns()
returns trigger as $$
begin
  -- Birthday campaign
  insert into public.bigdaybot_campaigns (agent_id, campaign_type, enabled, email_subject, email_body)
  values (
    new.id,
    'birthday',
    true,
    'Happy Birthday, {{first_name}}! 🎂',
    'Hi {{first_name}},

Wishing you a wonderful birthday filled with joy and celebration!

It''s been a pleasure working with you, and I hope this year brings you everything you''ve been hoping for.

Warmest wishes,
{{agent_name}}'
  );

  -- Home anniversary campaign
  insert into public.bigdaybot_campaigns (agent_id, campaign_type, enabled, email_subject, email_body)
  values (
    new.id,
    'home_anniversary',
    true,
    'Happy Home Anniversary, {{first_name}}! 🏠',
    'Hi {{first_name}},

Can you believe it''s been {{years}} year(s) since you got the keys to {{property_address}}?

I hope your home has been everything you dreamed of and more. If you ever have any real estate questions or know someone looking to buy or sell, I''m always here to help!

Best,
{{agent_name}}'
  );

  -- Wedding anniversary campaign
  insert into public.bigdaybot_campaigns (agent_id, campaign_type, enabled, email_subject, email_body)
  values (
    new.id,
    'wedding_anniversary',
    false,
    'Happy Anniversary, {{first_name}}! 💕',
    'Hi {{first_name}},

Wishing you and your spouse a very happy anniversary! May your special day be filled with love and cherished memories.

Warmly,
{{agent_name}}'
  );

  return new;
end;
$$ language plpgsql security definer;

-- Note: You may want to call this function manually for existing users
-- or create a trigger on profile creation if you want auto-setup
