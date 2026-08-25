import {
  RealtimeTranscriptResponse,
  RealtimeTranslateResponse,
} from '@/types/transcriptions/transcription.ws'
import { log } from '@/utils/logger'
import { upsertRealtimeTranscriptTurn } from './transcript-utils'
import React from 'react'

/**
 * Applies an incoming transcript response to the transcript state.
 *
 * Missing end-of-turn indicators default to `false`, and missing words default
 * to an empty array.
 *
 * @param response - The incoming transcript response
 * @param setTranscriptTurns - State updater for transcript turns
 */
export function handleTranscriptResponse(
  response: RealtimeTranscriptResponse,
  setTranscriptTurns: React.Dispatch<
    React.SetStateAction<RealtimeTranscriptResponse[]>
  >
) {
  const normalizedResponse: RealtimeTranscriptResponse = {
    ...response,
    turn_id: response.turn_id,
    is_end_of_turn: response.is_end_of_turn ?? false,
    words: response.words ?? [],
  }

  if (normalizedResponse.words.length === 0) {
    log.warn('No words in transcription response')
  }

  setTranscriptTurns(prev =>
    upsertRealtimeTranscriptTurn(prev, normalizedResponse)
  )

  if (normalizedResponse.is_end_of_turn) {
    log.info('Received final transcript turn')
  }
}

/**
 * Appends a translation response to the translation state when it contains translated text.
 *
 * @param response - The translation response to process.
 * @param setTranslateWords - The state setter for translation responses.
 */
export function handleTranslateResponse(
  response: RealtimeTranslateResponse,
  setTranslateWords: React.Dispatch<
    React.SetStateAction<RealtimeTranslateResponse[]>
  >
) {
  if (!response.translated_text) {
    log.warn('No words in translation response')
    return
  }

  setTranslateWords(prev => [...prev, response])
}
