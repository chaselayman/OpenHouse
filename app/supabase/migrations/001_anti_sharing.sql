-- Anti-Sharing Enforcement Migration
-- Run this in your Supabase SQL Editor after the initial schema

-- ============================================
-- 1. UNIQUE LICENSE NUMBER ENFORCEMENT
-- ============================================

-- Add unique constraint on license_number (only for non-null values)
-- This prevents multiple agents from using the same license
create unique index if not exists profiles_license_number_unique
  on public.profiles (license_number)
  where license_number is not null and license_number != '';

-- ============================================
-- 2. SESSION TRACKING TABLE
-- ============================================

-- Track active sessions for concurrent login detection
create table if not exists public.user_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  session_id text not null,
  device_info text, -- browser/device fingerprint
  ip_address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_active_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_active boolean default true
);

-- Index for quick lookups
create index if not exists user_sessions_user_id_idx on public.user_sessions(user_id);
create index if not exists user_sessions_session_id_idx on public.user_sessions(session_id);

-- RLS for user_sessions
alter table public.user_sessions enable row level security;

create policy "Users can view own sessions"
  on public.user_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert own sessions"
  on public.user_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own sessions"
  on public.user_sessions for update
  using (auth.uid() = user_id);

create policy "Users can delete own sessions"
  on public.user_sessions for delete
  using (auth.uid() = user_id);

-- ============================================
-- 3. FUNCTION: Enforce Single Active Session
-- ============================================

-- This function deactivates old sessions when a new one is created
create or replace function public.enforce_single_session()
returns trigger as $$
begin
  -- Deactivate all other sessions for this user
  update public.user_sessions
  set is_active = false
  where user_id = NEW.user_id
    and id != NEW.id
    and is_active = true;

  -- Update profile's last_session_id
  update public.profiles
  set last_session_id = NEW.session_id,
      updated_at = now()
  where id = NEW.user_id;

  return NEW;
end;
$$ language plpgsql security definer;

-- Trigger to enforce single session on insert
drop trigger if exists enforce_single_session_trigger on public.user_sessions;
create trigger enforce_single_session_trigger
  after insert on public.user_sessions
  for each row
  execute function public.enforce_single_session();

-- ============================================
-- 4. FUNCTION: Validate License Number
-- ============================================

-- Function to check if license number is already in use
create or replace function public.check_license_number_available(
  p_license_number text,
  p_user_id uuid default null
)
returns boolean as $$
declare
  existing_count integer;
begin
  -- Empty license numbers are always "available"
  if p_license_number is null or p_license_number = '' then
    return true;
  end if;

  -- Check if license exists for a different user
  select count(*) into existing_count
  from public.profiles
  where license_number = p_license_number
    and (p_user_id is null or id != p_user_id);

  return existing_count = 0;
end;
$$ language plpgsql security definer;

-- ============================================
-- 5. INTEGRATION LIMITS (ShowingTime, Calendar)
-- ============================================

-- These are already boolean flags in profiles table:
-- showingtime_connected, calendar_connected
-- The app will check these before allowing connections

-- Add columns to track when integrations were connected
alter table public.profiles
  add column if not exists showingtime_connected_at timestamp with time zone,
  add column if not exists calendar_connected_at timestamp with time zone;

-- ============================================
-- 6. HELPER FUNCTION: Get Session Status
-- ============================================

-- Check if user's current session is valid
create or replace function public.validate_session(
  p_user_id uuid,
  p_session_id text
)
returns table (
  is_valid boolean,
  is_current_session boolean,
  sessions_kicked integer
) as $$
declare
  v_last_session_id text;
  v_kicked_count integer;
begin
  -- Get user's last session ID from profile
  select last_session_id into v_last_session_id
  from public.profiles
  where id = p_user_id;

  -- Count how many sessions were kicked
  select count(*) into v_kicked_count
  from public.user_sessions
  where user_id = p_user_id
    and is_active = false;

  return query
  select
    (v_last_session_id is not null) as is_valid,
    (v_last_session_id = p_session_id) as is_current_session,
    v_kicked_count as sessions_kicked;
end;
$$ language plpgsql security definer;
