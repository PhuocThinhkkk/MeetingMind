import { Database } from '../database.types'
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
export type TranscriptWithWordNested = TranscriptRow & {
  transcription_words: TranscriptWordRow[]
}

export type AudioFileRow = Database['public']['Tables']['audio_files']['Row']
export type AudioFileWithTranscriptNested = AudioFileRow & {
  transcript: TranscriptRow
}
export type TranscriptRow = Database['public']['Tables']['transcripts']['Row']
export type TranscriptWordRow =
  Database['public']['Tables']['transcription_words']['Row']
export type SummaryRow = Database['public']['Tables']['summaries']['Row']
export type EventItemRow = Database['public']['Tables']['events']['Row']
export type QALogRow = Database['public']['Tables']['qa_logs']['Row']

export type TranscriptionDataUpload = {
  audioFile: AudioFileRow
  transcript?: TranscriptWithWordNested
  summary?: SummaryBase
  events: EventItemBase[]
  qaLogs: QALogBase[]
}
export type TranscriptWordInsert =
  Database['public']['Tables']['transcription_words']['Insert']
export type QALogInsert = Database['public']['Tables']['qa_logs']['Insert']

export type QALogBase = Omit<QALogRow, 'id' | 'user_id' | 'audio_id'>
export type SummaryBase = Omit<SummaryRow, 'id' | 'user_id' | 'audio_id'>
export type EventItemBase = Omit<EventItemRow, 'id' | 'user_id' | 'audio_id'>
