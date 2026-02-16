import { TranscriptWordInsert } from '@/types/transcriptions/transcription.db'
import { AssemblyAIWord } from '@/types/transcriptions/transcription.assembly.upload'
import { RealtimeTranscriptionWord } from '@/types/transcriptions/transcription.ws'
/**
 * Convert AssemblyAI word objects into TranscriptWordInsert records for a given transcription ID.
 *
 * @param words - AssemblyAI word objects; may be `undefined` or empty
 * @param transcriptionId - The transcription ID to assign to each resulting record
 * @returns An array of TranscriptWordInsert objects with `transcript_id`, `text`, `start_time`, `end_time`, and `confidence`; empty if `words` is `undefined` or empty
 */
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

/**
 * Convert realtime transcription words into rows suitable for inserting as transcript words.
 *
 * Returns an array of adapted word objects; if `words` is `undefined` or empty, returns an empty array.
 *
 * @param words - Realtime transcription word objects to adapt
 * @param transcriptionId - The transcript ID to assign to each adapted word (`transcript_id`)
 * @returns An array of objects with fields `transcript_id`, `text`, `confidence`, `start_time`, `end_time`, and `word_is_final`
 */
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