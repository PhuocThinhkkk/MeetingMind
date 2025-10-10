-- 20251009_seed_7_audios_with_transcripts.sql

-- Delete old seeded data first
DELETE FROM transcripts
WHERE audio_id IN (
    SELECT id FROM audio_files WHERE user_id = '99f17d87-9f0c-432c-a504-2178a1cebaf5'
);
DELETE FROM audio_files
WHERE user_id = '99f17d87-9f0c-432c-a504-2178a1cebaf5';

-- Seed 7 audios + transcripts
WITH seed_data AS (
  SELECT *
  FROM UNNEST(
    ARRAY[
      'Audio 1','Audio 2','Audio 3','Audio 4','Audio 5','Audio 6','Audio 7'
    ],
    ARRAY[
      'https://example.com/audio/1.mp3',
      'https://example.com/audio/2.mp3',
      'https://example.com/audio/3.mp3',
      'https://example.com/audio/4.mp3',
      'https://example.com/audio/5.mp3',
      'https://example.com/audio/6.mp3',
      'https://example.com/audio/7.mp3'
    ],
    ARRAY[120, 90, 150, 200, 110, 95, 180]
  ) AS t(name, url, duration)
),
new_audios AS (
  INSERT INTO audio_files (
      id, user_id, name, url, duration, file_size, mime_type, transcription_status, created_at, updated_at
  )
  SELECT
      gen_random_uuid(),
      '99f17d87-9f0c-432c-a504-2178a1cebaf5',
      name,
      url,
      duration,
      2048000,
      'audio/mpeg',
      'done',
      now(),
      now()
  FROM seed_data
  RETURNING id, name
)
INSERT INTO transcripts (
    id, audio_id, text, language, confidence_score, speakers_detected, created_at
)
SELECT
    gen_random_uuid(),
    id,
    'Transcript for ' || name,
    'en-US',
    0.95,
    1,
    now()
FROM new_audios;

