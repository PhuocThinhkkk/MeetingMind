import { TranscriptWordInsert } from '@/types/transcriptions/transcription.db'
import { AssemblyAIWord } from '@/types/transcriptions/transcription.assembly.upload'
import { RealtimeTranscriptionWord } from '@/types/transcriptions/transcription.ws'
export function adaptAssemblyAIWords(
  words: AssemblyAIWord[] | undefined,
  transcriptionId: string
): TranscriptWordInsert[] {
  if (!words || words.length === 0) return []

  return words.map(word => ({
    transcript_id: transcriptionId,
    text: word.text,
    start_time: word.start,
    end_time: word.end,
    confidence: word.confidence,
  }))
}

export function adaptRealtimeWords(
  words: RealtimeTranscriptionWord[],
  transcriptionId: string
) {
  if (!words || words.length === 0) return []

  const rows = words.map(word => ({
    transcript_id: transcriptionId,
    text: word.text,
    confidence: word.confidence,
    start_time: word.start,
    end_time: word.end,
    word_is_final: word.word_is_final,
  }))
  return rows
}
