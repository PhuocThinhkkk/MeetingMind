'use client'

import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { EmptyTranslation } from './EmptyTranslation'
import { useAnimatedTranslationWords } from './hooks/useAnimatedTranslationWords'
import { RealtimeTranslateResponse } from '@/types/transcriptions/transcription.ws'
import { log } from '@/utils/logger'

export function TranslationPanel({
  translateTurns,
  bothPanelsOpen,
  selectedTurnId,
  onSelectTurn,
  onClose,
}: {
  translateTurns: RealtimeTranslateResponse[]
  bothPanelsOpen: boolean
  selectedTurnId: string | null
  onSelectTurn: (turnId: string) => void
  onClose: () => void
}) {
  const displayTranslationTurns = useAnimatedTranslationWords(translateTurns)

  return (
    <div
      className={`${bothPanelsOpen ? 'w-1/2' : 'w-full'} flex flex-col bg-card`}
    >
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/40">
        <div className="flex items-center space-x-2">
          <h2 className="font-semibold text-foreground">Translation</h2>
          <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
            Vietnamese
          </span>
        </div>
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
        {!translateTurns.length ? (
          <EmptyTranslation />
        ) : (
          <div className="text-base leading-8 text-foreground">
            {displayTranslationTurns.map(turn => (
              <span
                key={turn.turn_id}
                className={`inline cursor-pointer rounded-lg px-1 py-0.5 transition-colors ${
                  selectedTurnId === turn.turn_id
                    ? 'bg-accent'
                    : 'hover:bg-muted'
                }`}
                onClick={() => onSelectTurn(turn.turn_id)}
              >
                {turn.translated_text}{' '}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
