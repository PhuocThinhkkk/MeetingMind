-- I fk up the previous migration about this table and it didnt apply, so I create this one again
create table if not exists public.subscriptions (
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

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_subscriptions_updated_at on public.subscriptions;
create trigger set_subscriptions_updated_at
before update on public.subscriptions
for each row
execute procedure public.set_updated_at();

alter table public.subscriptions enable row level security;

drop policy if exists "Users can read own subscription" on public.subscriptions;
create policy "Users can read own subscription"
on public.subscriptions
for select
using (auth.uid() = user_id);
