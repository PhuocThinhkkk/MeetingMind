import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

export function TranscriptionHeader({
  onExit,
  wordsCount,
}: {
  onExit: () => void
  wordsCount: number
}) {
  return (
    <div className="border-b border-border bg-card shadow-sm">
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center space-x-3">
          <div className="h-4 w-4 animate-pulse rounded-full bg-destructive" />
          <h1 className="text-2xl font-bold text-foreground">
            Live Transcription
          </h1>
          <div className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
            {wordsCount} words
          </div>
        </div>
        <Button
          variant="ghost"
          size="lg"
          onClick={onExit}
          className="h-12 w-12 rounded-full p-0 hover:bg-muted"
        >
          <X className="h-6 w-6" />
        </Button>
      </div>
    </div>
  )
}
