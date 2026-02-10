import { TranscriptWordInsert } from '@/types/transcriptions/transcription.db'
import { AssemblyAIWord } from '@/types/transcriptions/transcription.assembly.upload'
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
