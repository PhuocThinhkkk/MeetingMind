export interface TranscriptionData {
  id: string;
  name: string;
  type: "file" | "realtime";
  status: "pending" | "processing" | "done" | "failed" | "recording";
  duration?: number;
  created_at: string;
  transcript?: {
    text: string;
    words: TranscriptionWord[];
    speakers_detected?: number;
    confidence_score?: number;
  };
  summary?: {
    text: string;
    highlights: string[];
    todo: string[];
    key_topics: string[];
  };
  file_url?: string;
}
//TODO: name this properly later
export type TranscriptionWord = {
  text: string;
  confidence: number;
  start: number;
  end: number;
  word_is_final: boolean;
}

export interface RealtimeTranscriptChunk {
  isEndOfTurn: boolean;
  words: TranscriptionWord[];
}

export interface BeginMsg {
  type: "ready";
}

export interface AudioChunk {
  data: ArrayBuffer;
  timestamp: number;
}

export interface RealtimeTranslateResponse {
  type: "translate";
  words: string;
}

export type AudioFile = {
  id: string;
  user_id: string;
  name: string;
  url: string;
  duration: number;
  file_size: number;
  mime_type: string;
  transcription_status: string;
  created_at: string;
  updated_at: string;
  transcript?: Transcript | null;
};
export type SaveAudioFileInput = Omit<
  AudioFile,
  "id" | "created_at" | "updated_at"
>;

export type Transcript = {
  id: string;
  audio_id: string;
  text: string;
  created_at: string;
};

//TODO: this thing use for db call i will clean this later
export type Transcript_Word = TranscriptionWord & { 
    id: string;
    create_at: string;
    update_at: string;
}
export type SaveTranscriptInput = TranscriptionWord[];
