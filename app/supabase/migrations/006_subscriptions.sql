-- Subscriptions table for managing automation access
create table if not exists public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  automation_id text not null,
  status text not null default 'active' check (status in ('active', 'canceled', 'past_due', 'trialing')),
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_price_id text,
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  cancel_at_period_end boolean default false,
  canceled_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),

  -- Ensure one subscription per user per automation
  unique(user_id, automation_id)
);

-- Index for quick lookups
create index if not exists idx_subscriptions_user_id on public.subscriptions(user_id);
create index if not exists idx_subscriptions_automation_id on public.subscriptions(automation_id);
create index if not exists idx_subscriptions_stripe_customer on public.subscriptions(stripe_customer_id);
create index if not exists idx_subscriptions_stripe_subscription on public.subscriptions(stripe_subscription_id);

-- Enable RLS
alter table public.subscriptions enable row level security;

-- Users can read their own subscriptions
create policy "Users can view own subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- Only service role can insert/update/delete (via webhooks)
create policy "Service role can manage subscriptions"
  on public.subscriptions for all
  using (auth.role() = 'service_role');

-- Allow authenticated users to insert their own subscriptions (for checkout flow)
create policy "Users can create own subscriptions"
  on public.subscriptions for insert
  with check (auth.uid() = user_id);

-- Allow users to update their own subscriptions (for cancel)
create policy "Users can update own subscriptions"
  on public.subscriptions for update
  using (auth.uid() = user_id);

-- Updated at trigger
create or replace function update_subscriptions_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function update_subscriptions_updated_at();
