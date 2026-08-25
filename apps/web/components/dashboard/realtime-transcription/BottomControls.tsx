import { Button } from '@/components/ui/button'
import { Highlighter, HelpCircle, Square } from 'lucide-react'

export function BottomControls({
  finalWordCount,
  highlightedCount,
  questionedCount,
  onStopRecording,
}: {
  finalWordCount: number
  highlightedCount: number
  questionedCount: number
  onStopRecording: () => void | Promise<void>
}) {
  return (
    <div className="border-t border-border bg-card p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-primary" />
            <span>{finalWordCount} final words</span>
          </div>
          {highlightedCount > 0 && (
            <div className="flex items-center space-x-2">
              <Highlighter className="h-3 w-3 text-primary" />
              <span>{highlightedCount} highlighted</span>
            </div>
          )}
          {questionedCount > 0 && (
            <div className="flex items-center space-x-2">
              <HelpCircle className="h-3 w-3 text-destructive" />
              <span>{questionedCount} questioned</span>
            </div>
          )}
        </div>
        <Button
          onClick={onStopRecording}
          size="lg"
          className="bg-destructive px-8 py-3 text-lg text-destructive-foreground hover:bg-destructive/90"
        >
          <Square className="w-5 h-5 mr-3 fill-current" />
          Stop Recording
        </Button>
      </div>
    </div>
  )
}
