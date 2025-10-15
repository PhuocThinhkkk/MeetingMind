-- 1. Drop the old update policy
drop policy if exists "Users can update their own transcription words"
on transcription_words;

-- 2. Re-create it with WITH CHECK
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
)
with check (
  exists (
    select 1
    from transcripts t
    join audio_files af on af.id = t.audio_id
    where t.id = transcription_words.transcript_id
    and af.user_id = auth.uid()
  )
);

