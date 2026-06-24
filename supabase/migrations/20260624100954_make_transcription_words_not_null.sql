-- Fix existing rows first
UPDATE transcription_words
SET confidence = 0
WHERE confidence IS NULL;

UPDATE transcription_words
SET start_time = 0
WHERE start_time IS NULL;

UPDATE transcription_words
SET end_time = 0
WHERE end_time IS NULL;

UPDATE transcription_words
SET word_is_final = false
WHERE word_is_final IS NULL;

-- Add constraints
ALTER TABLE transcription_words
ALTER COLUMN confidence SET NOT NULL,
ALTER COLUMN start_time SET NOT NULL,
ALTER COLUMN end_time SET NOT NULL,
ALTER COLUMN word_is_final SET NOT NULL;