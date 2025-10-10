insert into storage.buckets (id, name, public)
values ('audio-files', 'audio-files', true)
on conflict (id) do nothing;

create policy "Users can upload audio"
on storage.objects
for insert
with check (
  bucket_id = 'audio-files' 
  and auth.role() = 'authenticated'
);

create policy "Users can read audio"
on storage.objects
for select
using (
  bucket_id = 'audio-files' 
  and auth.role() = 'authenticated'
);

create policy "Users can delete their own audio"
on storage.objects
for delete
using (
  bucket_id = 'audio-files' 
  and auth.uid() = owner
);

