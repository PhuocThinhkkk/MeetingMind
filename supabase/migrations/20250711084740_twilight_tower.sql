/*
  # Meeting Transcription App Database Schema

  1. New Tables
    - `users` - User accounts with authentication
    - `audio_files` - Raw audio file information
    - `transcripts` - Transcription results from audio files
    - `summaries` - AI-generated summaries and extracted content
    - `qa_logs` - User question and answer interactions
    - `events` - AI-extracted calendar events
    - `email_logs` - Notification tracking

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Proper foreign key relationships

  3. Features
    - Full-text search on transcripts
    - JSON fields for flexible data storage
    - Comprehensive audit trail
*/

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  google_auth_token text,
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Raw audio files
CREATE TABLE IF NOT EXISTS audio_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  url text NOT NULL,
  duration integer DEFAULT 0,
  file_size bigint DEFAULT 0,
  mime_type text,
  transcription_status text DEFAULT 'pending' CHECK (transcription_status IN ('pending', 'processing', 'done', 'failed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Transcription results
CREATE TABLE IF NOT EXISTS transcripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  audio_id uuid NOT NULL REFERENCES audio_files(id) ON DELETE CASCADE,
  text text NOT NULL,
  language text DEFAULT 'en-US',
  confidence_score numeric(3,2),
  speakers_detected integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- AI summaries and extracted content
CREATE TABLE IF NOT EXISTS summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  audio_id uuid NOT NULL REFERENCES audio_files(id) ON DELETE CASCADE,
  text text NOT NULL,
  highlights text[] DEFAULT '{}',
  todo text[] DEFAULT '{}',
  key_topics text[] DEFAULT '{}',
  sentiment text,
  created_at timestamptz DEFAULT now()
);

-- Q&A interactions
CREATE TABLE IF NOT EXISTS qa_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  audio_id uuid NOT NULL REFERENCES audio_files(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question text NOT NULL,
  answer text NOT NULL,
  confidence_score numeric(3,2),
  created_at timestamptz DEFAULT now()
);

-- Extracted events and calendar items
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  audio_id uuid NOT NULL REFERENCES audio_files(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  location text,
  added_to_google_calendar boolean DEFAULT false,
  notified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Email notification log
CREATE TABLE IF NOT EXISTS email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('summary', 'event', 'reminder', 'digest')),
  subject text NOT NULL,
  content text,
  sent_at timestamptz DEFAULT now(),
  status text DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending'))
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE qa_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- RLS Policies for audio_files
CREATE POLICY "Users can read own audio files"
  ON audio_files FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own audio files"
  ON audio_files FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own audio files"
  ON audio_files FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own audio files"
  ON audio_files FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for transcripts
CREATE POLICY "Users can read own transcripts"
  ON transcripts FOR SELECT
  TO authenticated
  USING (
    audio_id IN (
      SELECT id FROM audio_files WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service can insert transcripts"
  ON transcripts FOR INSERT
  TO authenticated
  WITH CHECK (
    audio_id IN (
      SELECT id FROM audio_files WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for summaries
CREATE POLICY "Users can read own summaries"
  ON summaries FOR SELECT
  TO authenticated
  USING (
    audio_id IN (
      SELECT id FROM audio_files WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service can insert summaries"
  ON summaries FOR INSERT
  TO authenticated
  WITH CHECK (
    audio_id IN (
      SELECT id FROM audio_files WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for qa_logs
CREATE POLICY "Users can read own qa logs"
  ON qa_logs FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own qa logs"
  ON qa_logs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for events
CREATE POLICY "Users can read own events"
  ON events FOR SELECT
  TO authenticated
  USING (
    audio_id IN (
      SELECT id FROM audio_files WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service can insert events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (
    audio_id IN (
      SELECT id FROM audio_files WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own events"
  ON events FOR UPDATE
  TO authenticated
  USING (
    audio_id IN (
      SELECT id FROM audio_files WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for email_logs
CREATE POLICY "Users can read own email logs"
  ON email_logs FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service can insert email logs"
  ON email_logs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_audio_files_user_id ON audio_files(user_id);
CREATE INDEX IF NOT EXISTS idx_audio_files_status ON audio_files(transcription_status);
CREATE INDEX IF NOT EXISTS idx_transcripts_audio_id ON transcripts(audio_id);
CREATE INDEX IF NOT EXISTS idx_summaries_audio_id ON summaries(audio_id);
CREATE INDEX IF NOT EXISTS idx_qa_logs_audio_id ON qa_logs(audio_id);
CREATE INDEX IF NOT EXISTS idx_qa_logs_user_id ON qa_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_events_audio_id ON events(audio_id);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON email_logs(user_id);

-- Full-text search index for transcripts
CREATE INDEX IF NOT EXISTS idx_transcripts_text_fts ON transcripts USING gin(to_tsvector('english', text));

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_audio_files_updated_at BEFORE UPDATE ON audio_files FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();