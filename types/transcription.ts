export interface TranscriptionData {
  id: string;
  name: string;
  type: 'file' | 'realtime';
  status: 'pending' | 'processing' | 'done' | 'failed' | 'recording';
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

export interface TranscriptionWord {
  text: string;
  timestamp?: number;
  confidence?: number;
  speaker?: string;
  isStable: boolean;
}

export interface RealtimeTranscriptChunk {
  isEndOfTurn: boolean;
  words: string[];
}

export interface BeginMsg {
  type : "ready"
}

export interface AudioChunk {
  data: ArrayBuffer;
  timestamp: number;
}