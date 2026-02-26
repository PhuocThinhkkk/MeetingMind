'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { TranscriptWithWordNested } from '@/types/transcriptions/transcription.db'
import { splitWordsIntoSentences } from '@/lib/transcript/split-words-into-sentences'

type Word = TranscriptWithWordNested['transcription_words'][number]

type Props = {
  words?: Word[]
  currentMs: number
  audioRef: React.RefObject<HTMLAudioElement>
}

const WINDOW_BEFORE = 200
const WINDOW_AFTER = 200
const WINDOW_CURRENT_POSITION = 400

export function TranscriptSentences({
  words = [],
  currentMs,
  audioRef,
}: Props) {
  const sentences = useMemo(() => splitWordsIntoSentences(words), [words])

  return (
    <div className="space-y-3">
      {sentences.map((sentence, i) => (
        <div key={i} className="flex flex-wrap">
          {sentence.map(word => {
            if (!word.start_time || !word.end_time) return null

            const isActive =
              currentMs + WINDOW_CURRENT_POSITION >=
                word.start_time - WINDOW_BEFORE &&
              currentMs + WINDOW_CURRENT_POSITION <=
                word.end_time + WINDOW_AFTER

            return (
              <span
                key={word.id}
                onClick={() => {
                  if (!audioRef.current) return
                  audioRef.current.currentTime = word.start_time! / 1000
                }}
                className={cn(
                  'cursor-pointer rounded-xs px-1 py-0.5 transition',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                )}
              >
                {word.text}{' '}
              </span>
            )
          })}
        </div>
      ))}
    </div>
  )
}
