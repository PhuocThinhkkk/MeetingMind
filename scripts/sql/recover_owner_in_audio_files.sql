UPDATE storage.objects
SET owner = ((storage.foldername(name))[2])::uuid
WHERE bucket_id = 'audio-files'
  AND owner IS NULL
  AND (storage.foldername(name))[2] ~* '^[0-9a-f-]{36}$';
