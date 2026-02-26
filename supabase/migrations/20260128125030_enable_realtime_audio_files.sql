-- ===============================
-- Enable Realtime for audio_files
-- ===============================

-- Ensure full row data is available for UPDATE events
alter table audio_files
  replica identity full;

-- Add table to Supabase Realtime publication (idempotent)
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and tablename = 'audio_files'
  ) then
    alter publication supabase_realtime
      add table audio_files;
  end if;
end $$;

-- ===============================
-- RLS: allow realtime SELECT
-- ===============================

alter table audio_files enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where tablename = 'audio_files'
      and policyname = 'realtime_select_own_audio_files'
  ) then
    create policy "realtime_select_own_audio_files"
    on audio_files
    for select
    using (auth.uid() = user_id);
  end if;
end $$;
