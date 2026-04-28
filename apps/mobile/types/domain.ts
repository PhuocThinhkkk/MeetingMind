export type AudioStatus = 'pending' | 'processing' | 'done' | 'failed' | 'unknown';

export type AudioFileRow = {
  id: string;
  user_id: string;
  name: string;
  path: string;
  duration: number | null;
  file_size: number | null;
  mime_type: string | null;
  transcription_status: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type TranscriptRow = {
  id: string;
  audio_id: string;
  confidence_score: number | null;
  created_at: string | null;
  language: string | null;
  speakers_detected: number | null;
  text: string;
};

export type TranscriptWordRow = {
  id: number;
  start_time: number | null;
  end_time: number | null;
  text: string;
  confidence: number | null;
  word_is_final: boolean | null;
  transcript_id: string;
};

export type SummaryRow = {
  id: string;
  audio_id: string;
  created_at: string | null;
  text: string;
  highlights: string[] | null;
  key_topics: string[] | null;
  sentiment: string | null;
  todo: string[] | null;
};

export type EventItemRow = {
  id: string;
  audio_id: string;
  created_at: string | null;
  title: string;
  description: string | null;
  location: string | null;
  start_time: string;
  end_time: string | null;
  added_to_google_calendar: boolean | null;
  notified: boolean | null;
};

export type QALogRow = {
  id: string;
  audio_id: string;
  user_id: string;
  question: string;
  answer: string;
  created_at: string | null;
  confidence_score: number | null;
};

export type AudioWithTranscript = AudioFileRow & {
  transcript?: TranscriptRow | null;
};

export type MeetingDetail = {
  audio: AudioFileRow;
  transcript: (TranscriptRow & { transcription_words?: TranscriptWordRow[] }) | null;
  summary: SummaryRow | null;
  events: EventItemRow[];
  qaLogs: QALogRow[];
};

export type GoogleProfile = {
  id: string;
  email: string;
  name: string;
  picture?: string;
};

export type UploadAsset = {
  uri: string;
  mimeType: string;
  name: string;
  size: number;
  durationSeconds?: number;
};
