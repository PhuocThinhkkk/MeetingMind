-- ===========================================================
-- MIGRATE GOOGLE-AUTH USERS FROM auth.users → public.users
-- ===========================================================

-- 1. Insert any missing Google users into your public.users table
insert into public.users (id, email, name, google_auth_token, settings, created_at, updated_at)
select 
  au.id,
  au.email,
  coalesce(au.raw_user_meta_data->>'name', ''),
  null,              -- we don't have google_auth_token from auth.users; set null
  '{}'::jsonb,       -- initialize empty settings
  now(),
  now()
from auth.users au
where 
  au.id not in (select id from public.users)
  and exists (
    select 1
    from auth.identities ai
    where ai.user_id = au.id
      and ai.provider = 'google'
  );

-- 2. Optional sanity check: see what was inserted
-- select * from public.users order by created_at desc limit 10;

