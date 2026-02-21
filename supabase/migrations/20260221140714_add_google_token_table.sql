-- Create google_tokens table linked to Supabase Auth users

create table if not exists public.google_tokens (
  user_id uuid not null,
  access_token text not null,
  refresh_token text not null,
  expiry_date bigint not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),

  constraint google_tokens_pkey primary key (user_id),

  -- Link to Supabase Auth
  constraint google_tokens_user_id_fkey
    foreign key (user_id)
    references auth.users (id)
    on delete cascade
);

-- Optional index (useful if you ever query by expiry)
create index if not exists idx_google_tokens_expiry
on public.google_tokens (expiry_date);

-- Auto-update updated_at
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_google_tokens_updated_at
before update on public.google_tokens
for each row
execute function public.update_updated_at_column();


alter table public.google_tokens enable row level security;

create policy "Users can manage their own tokens"
on public.google_tokens
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);