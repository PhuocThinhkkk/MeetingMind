-- Create bucket if it doesn't exist (private by default)
insert into storage.buckets (id, name, public)
values ('audio-files', 'audio-files', false)
on conflict (id) do update
set public = false;
