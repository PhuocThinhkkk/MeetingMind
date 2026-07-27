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
          <div className="text-base leading-8 text-foreground">
            {transcriptTurns.map(turn => (
              <span
                key={turn.turn_id}
                className={`inline rounded-lg px-1 py-0.5 transition-colors cursor-pointer ${
                  selectedTurnId === turn.turn_id ? 'bg-accent' : ''
                }`}
                onClick={() => onSelectTurn(turn.turn_id)}
              >
                {turn.words.map(word => {
                  globalWordIndex++
                  const currentWordIndex = globalWordIndex

                  const isSelectedWord = selectedWordIndex === currentWordIndex

                  return (
                    <span
                      key={`${turn.turn_id}-${word.start}-${Math.random().toString(36).substring(2, 7)}`}
                      className={`inline rounded px-1 py-0.5 transition-colors ${
                        isSelectedWord
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-accent'
                      }`}
                      onClick={e => {
                        e.stopPropagation()

                        onToggleSelectedWord(currentWordIndex)
                        onSelectTurn(turn.turn_id)
                      }}
                    >
                      {word.text}
                      {highlightedWords.has(currentWordIndex) && (
                        <Highlighter className="ml-1 inline h-3 w-3" />
                      )}
                      {questionedWords.has(currentWordIndex) && (
                        <HelpCircle className="ml-1 inline h-3 w-3" />
                      )}{' '}
                    </span>
                  )
                })}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
