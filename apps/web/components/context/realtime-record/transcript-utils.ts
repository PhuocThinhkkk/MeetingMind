import { RealtimeTranscriptionWord } from '@/types/transcriptions/transcription.ws'

export function mergeRealtimeTranscriptWords(
  previousWords: RealtimeTranscriptionWord[],
  nextWords: RealtimeTranscriptionWord[]
): RealtimeTranscriptionWord[] {
  const stableCount = previousWords.filter(word => word.word_is_final).length

  return [
    ...previousWords.slice(0, stableCount),
    ...nextWords.slice(stableCount),
  ]
}
