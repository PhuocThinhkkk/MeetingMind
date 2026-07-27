import { useEffect, useState } from 'react'
import {
  RealtimeTranscriptResponse,
  RealtimeTranslateResponse,
} from '@/types/transcriptions/transcription.ws'

const MEETING = [
  {
    transcript: ['Hello', 'everyone,', 'welcome', 'to', 'MeetingMind.'],
    translation: [
      'Xin',
      'chào',
      'mọi',
      'người,',
      'chào',
      'mừng',
      'đến',
      'MeetingMind.',
    ],
  },
  {
    transcript: ['Today', 'we', 'are', 'testing', 'the', 'new', 'UI.'],
    translation: [
      'Hôm',
      'nay',
      'chúng',
      'ta',
      'đang',
      'kiểm',
      'thử',
      'giao',
      'diện',
      'mới.',
    ],
  },
  {
    transcript: [
      'The',
      'translation',
      'should',
      'stay',
      'aligned',
      'with',
      'each',
      'turn.',
    ],
    translation: [
      'Bản',
      'dịch',
      'cần',
      'được',
      'đồng',
      'bộ',
      'với',
      'từng',
      'lượt',
      'nói.',
    ],
  },
]

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
      const turn = MEETING[turnIndex]
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
      if (turnIndex >= MEETING.length) {
        nextMeeting()
        return
      }

      if (wordIndex >= MEETING[turnIndex].transcript.length) {
        finishTurn()

        if (turnIndex < MEETING.length) {
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
