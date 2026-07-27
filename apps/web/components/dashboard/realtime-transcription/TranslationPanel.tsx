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

  log.info('Translation turns in panel: ', translateTurns)
  log.info('Translation display in panel: ', displayTranslationTurns)
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
          <div className="space-y-3 text-base leading-7 text-foreground">
            {displayTranslationTurns.length > 0 ? (
              displayTranslationTurns.map(turn => (
                <button
                  key={`${turn.turn_id}---${Math.floor(Math.random() * 100)}`}
                  type="button"
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card ${
                    selectedTurnId === turn.turn_id
                      ? 'border-primary bg-accent/70'
                      : 'border-transparent hover:border-border hover:bg-muted/40'
                  }`}
                  onClick={() => onSelectTurn(turn.turn_id)}
                >
                  <span className="block">{turn.translated_text}</span>
                </button>
              ))
            ) : (
              <div className="text-muted-foreground">Translating...</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
