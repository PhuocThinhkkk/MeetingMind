import { RealtimeTranscriptionWord } from './transcription.ws'

export type AudioFile = {
  id: string
  user_id: string
  name: string
  url: string
  duration: number
  file_size: number
  mime_type: string
  transcription_status: string
  created_at: string
  updated_at: string
  transcript?: Transcript | null
}
export type SaveAudioFileInput = Omit<
  AudioFile,
  'id' | 'created_at' | 'updated_at'
>

export type Transcript = {
  id: string
  audio_id: string
  text: string
  words?: TranscriptionWord[]
  created_at: string
}

export type TranscriptionWord = {
  id: number
  start_time: number
  end_time: number
  text: string
  confidence: number
}
export type SaveTranscriptInput = RealtimeTranscriptionWord[]
