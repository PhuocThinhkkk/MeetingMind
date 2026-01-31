-- Remove duplicate foreign key that breaks PostgREST embedding
ALTER TABLE transcription_words
DROP CONSTRAINT IF EXISTS fk_transcript;
