-- Drop the old url column
alter table public.audio_files
drop column if exists url;