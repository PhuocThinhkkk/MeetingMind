import {
  RealtimeTranscriptResponse,
  RealtimeTranslateResponse,
} from '@/types/transcriptions/transcription.ws'
import { log } from '@/utils/logger'
import { upsertRealtimeTranscriptTurn } from './transcript-utils'
import React from 'react'

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
