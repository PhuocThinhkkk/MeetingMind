-- ============================================
-- Make audio-files bucket private
-- ============================================
update storage.buckets
set public = false
where id = 'audio-files';


-- ============================================
-- Remove existing storage policies (clean state)
-- ============================================
drop policy if exists "Users can read audio" on storage.objects;
drop policy if exists "Users can upload audio" on storage.objects;
drop policy if exists "Users can delete their own audio" on storage.objects;


-- ============================================
-- Allow users to READ only their own files
-- ============================================
create policy "Users can read own audio"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'audio-files'
  and owner = auth.uid()
);


-- ============================================
-- Allow users to DELETE only their own files
-- ============================================
create policy "Users can delete own audio"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'audio-files'
  and owner = auth.uid()
);


-- ============================================
-- IMPORTANT:
-- No INSERT policy
-- Uploads must use createSignedUploadUrl
-- ============================================
