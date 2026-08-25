import { useEffect, useState } from 'react'
import {
  RealtimeTranscriptResponse,
  RealtimeTranslateResponse,
} from '@/types/transcriptions/transcription.ws'
import { FIGHTCLUBMEETING } from './meeting'

export function useTranscriptDebug() {
  const [transcriptTurns, setTranscriptTurns] = useState<
    RealtimeTranscriptResponse[]
  >([])

  const [translateTurns, setTranslateTurns] = useState<
    RealtimeTranslateResponse[]
  >([])

  useEffect(() => {
    let turnIndex = 0
    let wordIndex = 0
    let globalTime = 0
    let currentTurnId = ''
    let nextTurnId = 1

    function createTurn() {
      currentTurnId = String(nextTurnId++)

      const turnId = currentTurnId

      setTranscriptTurns(prev => [
        ...prev,
        {
          type: 'transcript',
          turn_id: turnId,
          is_end_of_turn: false,
          words: [],
        },
      ])
    }

    function appendWord() {
      const turn = FIGHTCLUBMEETING[turnIndex]
      const word = turn.transcript[wordIndex]
      const turnId = currentTurnId

      setTranscriptTurns(prev =>
        prev.map(t =>
          t.turn_id !== turnId
            ? t
            : {
                ...t,
                words: [
                  ...t.words,
                  {
                    text: word,
                    confidence: 0.99,
                    start: globalTime,
                    end: globalTime + 400,
                    word_is_final: true,
                  },
                ],
              }
        )
      )

      globalTime += 500
      wordIndex++
    }

    function finishTurn() {
      const turn = FIGHTCLUBMEETING[turnIndex]
      const turnId = currentTurnId

      setTranscriptTurns(prev =>
        prev.map(t =>
          t.turn_id === turnId
            ? {
                ...t,
                is_end_of_turn: true,
              }
            : t
        )
      )

      setTranslateTurns(prev => [
        ...prev,
        {
          type: 'translate',
          turn_id: turnId,
          language: 'vi',
          translated_text: turn.translation,
        },
      ])

      turnIndex++
      wordIndex = 0
      currentTurnId = ''
    }

    function tick() {
      if (turnIndex >= FIGHTCLUBMEETING.length) {
        turnIndex = 0
        wordIndex = 0
      }

      if (!currentTurnId) {
        createTurn()
      }

      if (wordIndex >= FIGHTCLUBMEETING[turnIndex].transcript.length) {
        finishTurn()
        return
      }

      appendWord()
    }

    const timer = setInterval(tick, 300)

    return () => clearInterval(timer)
  }, [])

  return {
    transcriptTurns,
    translateTurns,
  }
}
