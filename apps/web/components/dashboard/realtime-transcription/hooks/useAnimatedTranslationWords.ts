import { useEffect, useRef, useState } from 'react'
import { RealtimeTranslateResponse } from '@/types/transcriptions/transcription.ws'

export function useAnimatedTranslationWords(
  translationTurns: RealtimeTranslateResponse[],
  delayMs = 60
) {
  const [displayTurns, setDisplayTurns] = useState<RealtimeTranslateResponse[]>(
    []
  )

  const initializedRef = useRef(false)
  const queueRef = useRef<RealtimeTranslateResponse[]>([])

  // Initialize.
  // Old translations appear immediately.
  // Only the newest one is animated.
  useEffect(() => {
    if (initializedRef.current) return
    if (translationTurns.length === 0) return

    initializedRef.current = true

    if (translationTurns.length === 1) {
      queueRef.current.push(translationTurns[0])
      return
    }

    setDisplayTurns(translationTurns.slice(0, -1))

    queueRef.current.push(translationTurns.at(-1)!)
  }, [translationTurns])

  // Queue newly arrived translations.
  useEffect(() => {
    if (!initializedRef.current) return

    const displayedIds = new Set(displayTurns.map(t => t.turn_id))
    const queuedIds = new Set(queueRef.current.map(t => t.turn_id))

    for (const turn of translationTurns) {
      if (!displayedIds.has(turn.turn_id) && !queuedIds.has(turn.turn_id)) {
        queueRef.current.push(turn)
      }
    }
  }, [translationTurns, displayTurns])

  // Animation loop.
  useEffect(() => {
    const timer = setInterval(() => {
      if (queueRef.current.length === 0) return

      setDisplayTurns(prev => {
        const next = [...prev]
        const current = queueRef.current[0]

        const fullWords = current.translated_text.split(/\s+/).filter(Boolean)

        const index = next.findIndex(t => t.turn_id === current.turn_id)

        // First word.
        if (index === -1) {
          next.push({
            ...current,
            translated_text: fullWords[0] ?? '',
          })

          return next
        }

        const shownWords = next[index].translated_text
          .split(/\s+/)
          .filter(Boolean)

        // Already finished.
        if (shownWords.length >= fullWords.length) {
          queueRef.current.shift()
          return next
        }

        // Reveal one more word.
        next[index] = {
          ...current,
          translated_text: fullWords.slice(0, shownWords.length + 1).join(' '),
        }

        // Finished after this tick.
        if (shownWords.length + 1 >= fullWords.length) {
          queueRef.current.shift()
        }

        return next
      })
    }, delayMs)

    return () => clearInterval(timer)
  }, [delayMs])

  return displayTurns
}
