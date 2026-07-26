import { Button } from '@/components/ui/button'
import { Highlighter, HelpCircle } from 'lucide-react'
import { RealtimeTranscriptionWord } from '@/types/transcriptions/transcription.ws'

export function WordActionBar({
  selectedWord,
  isVisible,
  isHighlighted,
  isQuestioned,
  onToggleHighlight,
  onToggleQuestion,
}: {
  selectedWord?: RealtimeTranscriptionWord
  isVisible: boolean
  isHighlighted: boolean
  isQuestioned: boolean
  onToggleHighlight: () => void
  onToggleQuestion: () => void
}) {
  if (!isVisible || !selectedWord) return null

  return (
    <div className="px-8 py-4 border-t bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-lg font-medium text-gray-700">
            &quot;{selectedWord.text}&quot;
          </span>
          <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full">
            Confidence: {(selectedWord.confidence * 100).toFixed(1)}%
          </span>
          <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full">
            {selectedWord.start.toFixed(2)}s - {selectedWord.end.toFixed(2)}s
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant={isHighlighted ? 'default' : 'outline'}
            onClick={onToggleHighlight}
            size="sm"
          >
            <Highlighter className="w-3 h-3 mr-1" />
            {isHighlighted ? 'Remove Highlight' : 'Highlight'}
          </Button>
          <Button
            variant={isQuestioned ? 'default' : 'outline'}
            onClick={onToggleQuestion}
            size="sm"
          >
            <HelpCircle className="w-3 h-3 mr-1" />
            {isQuestioned ? 'Remove Question' : 'Question'}
          </Button>
        </div>
      </div>
    </div>
  )
}
