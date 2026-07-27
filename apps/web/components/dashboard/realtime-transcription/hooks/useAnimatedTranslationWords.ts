import { useEffect, useRef, useState } from 'react'
import { RealtimeTranslateResponse } from '@/types/transcriptions/transcription.ws'

export function useAnimatedTranslationWords(
  translationTurns: RealtimeTranslateResponse[],
  delayMs = 60
) {
  const [displayTurns, setDisplayTurns] = useState<RealtimeTranslateResponse[]>(
    []
  )

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (translationTurns.length === 0) {
      setDisplayTurns([])
      return
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    function animate() {
      let changed = false

      setDisplayTurns(prev => {
        const next = [...prev]

        for (const incoming of translationTurns) {
          const incomingWords = incoming.translated_text
            .split(/\s+/)
            .filter(Boolean)

          const index = next.findIndex(t => t.turn_id === incoming.turn_id)

          // New turn
          if (index === -1) {
            next.push({
              ...incoming,
              translated_text: incomingWords.length > 0 ? incomingWords[0] : '',
            })

            if (incomingWords.length > 1) {
              changed = true
            }

            continue
          }

          const displayedWords = next[index].translated_text
            .split(/\s+/)
            .filter(Boolean)

          if (displayedWords.length < incomingWords.length) {
            next[index] = {
              ...incoming,
              translated_text: incomingWords
                .slice(0, displayedWords.length + 1)
                .join(' '),
            }

            changed = true
          } else {
            // Keep metadata in sync.
            next[index] = {
              ...incoming,
              translated_text: next[index].translated_text,
            }
          }
        }

        return next
      })

      if (changed) {
        timerRef.current = setTimeout(animate, delayMs)
      }
    }

    animate()

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [translationTurns, delayMs])

  return displayTurns
}
