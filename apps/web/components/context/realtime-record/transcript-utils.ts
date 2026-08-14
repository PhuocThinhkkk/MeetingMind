import { RealtimeTranscriptResponse } from '@/types/transcriptions/transcription.ws'

/**
 * Adds a transcript turn, replacing the latest entry when it is in progress or shares its turn ID; otherwise appends it.
 *
 * @param previousTurns - Previously collected transcript turns
 * @param nextTurn - Transcript turn to insert or update
 * @returns The updated transcript turns
 */
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
