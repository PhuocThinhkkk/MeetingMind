SELECT
FROM storage.objects
WHERE bucket_id = 'audio-files'
  AND owner IS NULL
ORDER BY created_at DESC;

