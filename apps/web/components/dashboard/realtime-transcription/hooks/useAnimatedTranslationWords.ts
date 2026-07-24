import { useEffect, useRef, useState } from 'react'

export function useAnimatedTranslationWords(
  translationWords: string[],
  delayMs = 60
) {
  const [displayTranslationWords, setDisplayTranslationWords] = useState<
    string[]
  >([])
  const queueRef = useRef<string[]>([])
  const indexRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const nextChunks = translationWords.slice(indexRef.current)
    if (nextChunks.length > 0) {
      queueRef.current.push(...nextChunks)
      indexRef.current = translationWords.length
    }
  }, [translationWords])

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

      const [currentChunk, ...rest] = queueRef.current
      const words = currentChunk.split(/\s+/).filter(Boolean)

      if (words.length === 0) {
        queueRef.current = rest
        step()
        return
      }

      let wordIndex = 0
      const reveal = () => {
        setDisplayTranslationWords(prev => [...prev, words[wordIndex]])
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
  }, [delayMs, translationWords])

  return displayTranslationWords
}
