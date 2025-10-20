export interface TranscriptionData {
  id: string;
  name: string;
  type: "file" | "realtime";
  status: "pending" | "processing" | "done" | "failed" | "recording";
  duration?: number;
  created_at: string;
  transcript?: {
    text: string;
    words: RealtimeTranscriptionWord[];
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

export type RealtimeTranscriptionWord= {
  text: string;
  confidence: number;
  start: number;
  end: number;
  word_is_final: boolean;
}

export interface RealtimeTranscriptChunk{
  isEndOfTurn: boolean;
  words: RealtimeTranscriptionWord[];
}

export interface RealtimeBeginMsg {
  type: "ready";
}

export interface RealtimeAudioChunk {
  data: ArrayBuffer;
  timestamp: number;
}

export interface RealtimeTranslateResponse {
  type: "translate";
  words: string;
}
