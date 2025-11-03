-- =============================================
-- 1. Create transcription_words Table
-- =============================================

drop table if exists transcription_words cascade;

create table if not exists transcription_words (
  id bigserial primary key,
  transcript_id uuid not null references transcripts(id) on delete cascade,
  text text not null,
  confidence double precision,
  start_time double precision,
  end_time double precision,
  word_is_final boolean
);

-- =============================================
-- 2. Enable Row Level Security
-- =============================================
alter table transcription_words enable row level security;
drop policy if exists "Users can read their own transcription words" on transcription_words;
drop policy if exists "Users can insert their own transcription words" on transcription_words;
drop policy if exists "Users can update their own transcription words" on transcription_words;
drop policy if exists "Users can delete their own transcription words" on transcription_words;

-- =============================================
-- 3. Create RLS Policies
-- =============================================

-- SELECT Policy: Allow users to read their own transcription words
create policy "Users can read their own transcription words"
on transcription_words
for select
using (
  exists (
    select 1
    from transcripts t
    join audio_files af on af.id = t.audio_id
    where t.id = transcription_words.transcript_id
    and af.user_id = auth.uid()
  )
);

-- INSERT Policy: Allow users to insert words for their own audio files
create policy "Users can insert their own transcription words"
on transcription_words
for insert
with check (
  exists (
    select 1
    from transcripts t
    join audio_files af on af.id = t.audio_id
    where t.id = transcription_words.transcript_id
    and af.user_id = auth.uid()
  )
);

-- UPDATE Policy: Allow users to update their own transcription words
create policy "Users can update their own transcription words"
on transcription_words
for update
using (
  exists (
    select 1
    from transcripts t
    join audio_files af on af.id = t.audio_id
    where t.id = transcription_words.transcript_id
    and af.user_id = auth.uid()
  )
);

-- DELETE Policy: Allow users to delete their own transcription words
create policy "Users can delete their own transcription words"
on transcription_words
for delete
using (
  exists (
    select 1
    from transcripts t
    join audio_files af on af.id = t.audio_id
    where t.id = transcription_words.transcript_id
    and af.user_id = auth.uid()
  )
);

