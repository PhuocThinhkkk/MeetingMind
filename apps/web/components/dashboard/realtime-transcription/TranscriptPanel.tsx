'use client'

import { Button } from '@/components/ui/button'
import { Highlighter, HelpCircle, X } from 'lucide-react'
import { EmptyTranscript } from './EmptyTranscript'
import { RealtimeTranscriptResponse } from '@/types/transcriptions/transcription.ws'

export function TranscriptPanel({
  transcriptTurns,
  bothPanelsOpen,
  highlightedWords,
  questionedWords,
  selectedWordIndex,
  selectedTurnId,
  onToggleSelectedWord,
  onSelectTurn,
  onClose,
}: {
  transcriptTurns: RealtimeTranscriptResponse[]
  bothPanelsOpen: boolean
  highlightedWords: Set<number>
  questionedWords: Set<number>
  selectedWordIndex: number | null
  selectedTurnId: string | null
  onToggleSelectedWord: (index: number) => void
  onSelectTurn: (turnId: string) => void
  onClose: () => void
}) {
  let globalWordIndex = -1

  return (
    <div
      className={`${bothPanelsOpen ? 'w-1/2' : 'w-full'} border-r border-border flex flex-col bg-card`}
    >
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/40">
        <h2 className="font-semibold text-foreground">Transcript</h2>
        {bothPanelsOpen && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        {transcriptTurns.length === 0 ? (
          <EmptyTranscript />
        ) : (
          <div className="space-y-3 text-base leading-7">
            {transcriptTurns.map(turn => (
              <div
                key={turn.turn_id}
                className={`rounded-2xl border px-4 py-3 transition-colors ${
                  selectedTurnId === turn.turn_id
                    ? 'border-primary bg-accent/70'
                    : 'border-transparent hover:border-border hover:bg-muted/40'
                }`}
              >
                <div className="flex flex-wrap items-baseline gap-x-1 gap-y-2">
                  {turn.words.map(word => {
                    globalWordIndex += 1
                    const currentWordIndex = globalWordIndex
                    const isSelectedWord =
                      selectedWordIndex === currentWordIndex

                    return (
                      <button
                        key={`${turn.turn_id}-${word.start}-${word.end}----${Math.random().toString(36).substring(2, 7)}`}
                        type="button"
                        className={`inline-flex items-center gap-1 rounded-lg px-1.5 py-0.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card ${
                          isSelectedWord
                            ? 'bg-primary text-primary-foreground'
                            : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                        } ${word.word_is_final ? '' : 'opacity-70'}`}
                        onClick={() => {
                          onToggleSelectedWord(currentWordIndex)
                          onSelectTurn(turn.turn_id)
                        }}
                        title={`Confidence: ${(word.confidence * 100).toFixed(1)}% | ${word.start.toFixed(2)}s - ${word.end.toFixed(2)}s`}
                      >
                        <span>{word.text}</span>
                        {highlightedWords.has(currentWordIndex) && (
                          <Highlighter className="h-3 w-3 text-primary" />
                        )}
                        {questionedWords.has(currentWordIndex) && (
                          <HelpCircle className="h-3 w-3 text-destructive" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
