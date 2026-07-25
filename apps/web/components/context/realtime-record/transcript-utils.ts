import { RealtimeTranscriptResponse } from '@/types/transcriptions/transcription.ws'

export function upsertRealtimeTranscriptTurn(
  previousTurns: RealtimeTranscriptResponse[],
  nextTurn: RealtimeTranscriptResponse
): RealtimeTranscriptResponse[] {
  if (previousTurns.length === 0) {
    return [nextTurn]
  }

  const lastTurn = previousTurns[previousTurns.length - 1]
  const isSameTurn =
    Boolean(lastTurn.turn_id) &&
    Boolean(nextTurn.turn_id) &&
    lastTurn.turn_id === nextTurn.turn_id

  if (!lastTurn.is_end_of_turn || isSameTurn) {
    return [...previousTurns.slice(0, -1), nextTurn]
  }

  return [...previousTurns, nextTurn]
}
