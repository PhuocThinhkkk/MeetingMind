-- seed_audio_files.sql
-- Seeding 20 rows into audio_files

create extension if not exists "pgcrypto";

insert into audio_files (
  id,
  user_id,
  name,
  url,
  duration,
  file_size,
  mime_type,
  transcription_status,
  created_at,
  updated_at
)
select
  gen_random_uuid(),
  '99f17d87-9f0c-432c-a504-2178a1cebaf5'::uuid, -- hardcoded user
  (array[
    'Morning Interview', 'Evening Chat', 'Tech Talk', 'Startup Podcast',
    'Music Demo', 'Lecture 01', 'Lecture 02', 'Daily Journal',
    'Meditation Guide', 'AI Basics', 'Cooking Show', 'Developer Log',
    'Gaming Review', 'History Session', 'Motivation Talk',
    'Language Lesson', 'Market Recap', 'News Summary',
    'Science Weekly', 'Weekend Special'
  ])[g.id],
  format('https://example.com/audio/file_%s.mp3', g.id),
  (floor(random() * (3600 - 60 + 1)) + 60)::int, -- duration
  (floor(random() * (100000000 - 1000000 + 1)) + 1000000)::bigint, -- file_size
  (array['audio/mpeg', 'audio/wav', 'audio/aac'])[ceil(random() * 3)],
  (array['pending', 'processing', 'done', 'failed'])[ceil(random() * 4)],
  now() - (interval '1 day' * floor(random() * 30)),
  now() - (interval '1 day' * floor(random() * 30))
from generate_series(1, 20) as g(id);

