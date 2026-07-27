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

    function createTurn() {
      currentTurnId = crypto.randomUUID()

      setTranscriptTurns(prev => [
        ...prev,
        {
          type: 'transcript',
          turn_id: currentTurnId,
          is_end_of_turn: false,
          words: [],
        },
      ])

      setTranslateTurns(prev => [
        ...prev,
        {
          type: 'translate',
          turn_id: currentTurnId,
          language: 'vi',
          translated_text: '',
        },
      ])
    }

    function appendWord() {
      const turn = FIGHTCLUBMEETING[turnIndex]
      const word = turn.transcript[wordIndex]

      setTranscriptTurns(prev =>
        prev.map(t =>
          t.turn_id !== currentTurnId
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

      setTranslateTurns(prev =>
        prev.map(t =>
          t.turn_id !== currentTurnId
            ? t
            : {
                ...t,
                translated_text: turn.translation
                  .slice(0, wordIndex + 1)
                  .join(' '),
              }
        )
      )

      globalTime += 500
      wordIndex++
    }

    function finishTurn() {
      setTranscriptTurns(prev =>
        prev.map(t =>
          t.turn_id === currentTurnId ? { ...t, is_end_of_turn: true } : t
        )
      )

      turnIndex++
      wordIndex = 0
    }

    function nextMeeting() {
      turnIndex = 0
      wordIndex = 0

      // Keep transcriptTurns, translateTurns and globalTime.
      // Just start another meeting.
      createTurn()
    }

    function tick() {
      if (turnIndex >= FIGHTCLUBMEETING.length) {
        nextMeeting()
        return
      }

      if (wordIndex >= FIGHTCLUBMEETING[turnIndex].transcript.length) {
        finishTurn()

        if (turnIndex < FIGHTCLUBMEETING.length) {
          createTurn()
        }

        return
      }

      appendWord()
    }

    createTurn()

    const timer = setInterval(tick, 300)

    return () => clearInterval(timer)
  }, [])

  return {
    transcriptTurns,
    translateTurns,
  }
}
