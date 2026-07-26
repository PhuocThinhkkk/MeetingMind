import { useEffect, useRef, useState } from 'react'
import { RealtimeTranslateResponse } from '@/types/transcriptions/transcription.ws'

export function useAnimatedTranslationWords(
  translationTurns: RealtimeTranslateResponse[],
  delayMs = 60
) {
  const [displayTranslationTurns, setDisplayTranslationTurns] = useState<
    RealtimeTranslateResponse[]
  >([])
  const queueRef = useRef<RealtimeTranslateResponse[]>([])
  const indexRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (translationTurns.length === 0) {
      queueRef.current = []
      indexRef.current = 0
      setDisplayTranslationTurns([])
      return
    }

    if (translationTurns.length < indexRef.current) {
      queueRef.current = []
      indexRef.current = 0
      setDisplayTranslationTurns([])
    }

    const nextTurns = translationTurns.slice(indexRef.current)
    if (nextTurns.length > 0) {
      queueRef.current.push(...nextTurns)
      indexRef.current = translationTurns.length
    }
  }, [translationTurns])

  useEffect(() => {
    const clearTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }

    const step = () => {
      clearTimer()

      if (queueRef.current.length === 0) return

      const [currentTurn, ...rest] = queueRef.current
      const words = currentTurn.translated_text.split(/\s+/).filter(Boolean)

      if (words.length === 0) {
        setDisplayTranslationTurns(prev => {
          const withoutCurrent = prev.filter(
            turn => turn.turn_id !== currentTurn.turn_id
          )
          return [...withoutCurrent, currentTurn]
        })
        queueRef.current = rest
        step()
        return
      }

      let wordIndex = 0
      let currentText = ''

      const reveal = () => {
        currentText = currentText
          ? `${currentText} ${words[wordIndex]}`
          : words[wordIndex]
        setDisplayTranslationTurns(prev => {
          const withoutCurrent = prev.filter(
            turn => turn.turn_id !== currentTurn.turn_id
          )
          return [
            ...withoutCurrent,
            { ...currentTurn, translated_text: currentText },
          ]
        })
        wordIndex += 1

        if (wordIndex < words.length) {
          timerRef.current = setTimeout(reveal, delayMs)
          return
        }

        queueRef.current = rest
        step()
      }

      reveal()
    }

    step()

    return clearTimer
  }, [delayMs, translationTurns])

  return displayTranslationTurns
}
