import {
  RealtimeTranscriptResponse,
  RealtimeTranslateResponse,
  RealtimeTranscriptionWord,
} from '@/types/transcriptions/transcription.ws'
import { log } from '@/utils/logger'
import { mergeRealtimeTranscriptWords } from './transcript-utils'
import React from 'react'

export function handleTranscriptResponse(
  response: RealtimeTranscriptResponse,
  setTranscriptWords: React.Dispatch<
    React.SetStateAction<RealtimeTranscriptionWord[]>
  >
) {
  const words = response.words ?? []

  if (words.length === 0) {
    log.warn('No words in transcription response')
    return
  }

  const newWords: RealtimeTranscriptionWord[] = words.map(word => ({
    text: word.text,
    word_is_final: word.word_is_final,
    start: word.start,
    end: word.end,
    confidence: word.confidence,
  }))

  setTranscriptWords(prev => mergeRealtimeTranscriptWords(prev, newWords))

  if (response.is_end_of_turn) {
    log.info('Received final transcript turn')
  }
}

export function handleTranslateResponse(
  response: RealtimeTranslateResponse,
  setTranslateWords: React.Dispatch<React.SetStateAction<string[]>>
) {
  if (!response.translated_text) {
    log.warn('No words in translation response')
    return
  }

  setTranslateWords(prev => [...prev, response.translated_text])
}
