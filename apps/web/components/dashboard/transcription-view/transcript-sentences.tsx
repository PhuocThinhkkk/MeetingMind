'use client'

import { useMemo } from 'react'
import { Fragment } from 'react'
import { cn } from '@/lib/utils'
import { TranscriptWithWordNested } from '@/types/transcriptions/transcription.db'
import {
  splitWordsIntoSentences,
  type SentenceGroup,
} from '@/modules/transcription/service/client/split-words-into-sentences'
import { useAudioPlayback } from '@/components/context/audio-playback-context'

type Word = TranscriptWithWordNested['transcription_words'][number]

type Props = {
  words?: Word[]
  currentMs: number
}

const WINDOW_BEFORE = 200
const WINDOW_AFTER = 200
const WINDOW_CURRENT_POSITION = 400

export function TranscriptSentences({ words = [], currentMs }: Props) {
  const { audioRef } = useAudioPlayback()
  const sentences = useMemo(() => splitWordsIntoSentences(words), [words])

  return (
    <div className="space-y-3">
      {sentences.map((sentence, i) => (
        <SentenceBlock
          key={`${sentence.startTime}-${i}`}
          sentence={sentence}
          currentMs={currentMs}
          audioRef={audioRef}
        />
      ))}
    </div>
  )
}

function SentenceBlock({
  sentence,
  currentMs,
  audioRef,
}: {
  sentence: SentenceGroup
  currentMs: number
  audioRef: React.RefObject<HTMLAudioElement | null>
}) {
  return (
    <div className="space-y-2 rounded-md border border-border/60 bg-muted/10 p-2">
      <div className="text-xs font-medium text-muted-foreground">
        {sentence.label}
      </div>

      <div className="flex flex-wrap">
        {sentence.words.map(word => {
          if (!word.start_time || !word.end_time) return null

          const isActive =
            currentMs + WINDOW_CURRENT_POSITION >=
              word.start_time - WINDOW_BEFORE &&
            currentMs + WINDOW_CURRENT_POSITION <= word.end_time + WINDOW_AFTER

          return (
            <Fragment key={word.id}>
              <span
                onClick={() => {
                  if (!audioRef.current || word.start_time == null) return
                  audioRef.current.currentTime = word.start_time / 1000
                }}
                className={cn(
                  'cursor-pointer rounded-xs px-1 py-0.5 transition',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                )}
              >
                {word.text}
              </span>{' '}
              {word.paragraphBreakAfter && <div className="basis-full h-3" />}
            </Fragment>
          )
        })}
      </div>
    </div>
  )
}
