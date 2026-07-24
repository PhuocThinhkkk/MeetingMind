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
    <div className="p-8 border-t bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span>{finalWordCount} final words</span>
          </div>
          {highlightedCount > 0 && (
            <div className="flex items-center space-x-2">
              <Highlighter className="w-3 h-3 text-yellow-600" />
              <span>{highlightedCount} highlighted</span>
            </div>
          )}
          {questionedCount > 0 && (
            <div className="flex items-center space-x-2">
              <HelpCircle className="w-3 h-3 text-red-600" />
              <span>{questionedCount} questioned</span>
            </div>
          )}
        </div>
        <Button
          onClick={onStopRecording}
          size="lg"
          className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg"
        >
          <Square className="w-5 h-5 mr-3 fill-current" />
          Stop Recording
        </Button>
      </div>
    </div>
  )
}
