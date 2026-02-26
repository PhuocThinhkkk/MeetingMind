-- Supabase SQL migration (subscriptions table)
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null unique
    references auth.users(id) on delete cascade,

  stripe_customer_id text not null unique,
  stripe_subscription_id text not null unique,

  status text not null
    check (status in ('active', 'trialing', 'past_due', 'canceled')),

  price_id text not null,
  current_period_end timestamptz not null,

  cancel_at_period_end boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-update updated_at 
-- Supabase does not auto-update updated_at unless adding a trigger.

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_subscriptions_updated_at
before update on public.subscriptions
for each row
execute procedure public.set_updated_at();

-- Row Level Security 
alter table public.subscriptions enable row level security;

-- Allow users to read their own subscription only
create policy "Users can read own subscription"
on public.subscriptions
for select
using (auth.uid() = user_id);

-- No insert/update/delete from client
-- All writes should come only from webhooks (server-side)