import { Button } from '@/components/ui/button'
import { Highlighter, HelpCircle, X } from 'lucide-react'
import { RealtimeTranscriptionWord } from '@/types/transcriptions/transcription.ws'
import { EmptyTranscript } from './EmptyTranscript'
import { getWordClassName } from './utils'

export function TranscriptPanel({
  words,
  bothPanelsOpen,
  highlightedWords,
  questionedWords,
  selectedWordIndex,
  onToggleSelectedWord,
  onClose,
}: {
  words: RealtimeTranscriptionWord[]
  bothPanelsOpen: boolean
  highlightedWords: Set<number>
  questionedWords: Set<number>
  selectedWordIndex: number | null
  onToggleSelectedWord: (index: number) => void
  onClose: () => void
}) {
  return (
    <div
      className={`${bothPanelsOpen ? 'w-1/2' : 'w-full'} border-r border-gray-200 flex flex-col`}
    >
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <h2 className="font-semibold text-primary">Transcript</h2>
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
        {words.length === 0 ? (
          <EmptyTranscript />
        ) : (
          <div className="text-lg leading-relaxed">
            {words.map((word, index) => (
              <span
                key={index}
                className={getWordClassName(
                  index,
                  word,
                  highlightedWords,
                  questionedWords,
                  selectedWordIndex
                )}
                onClick={() => onToggleSelectedWord(index)}
                title={`Confidence: ${(word.confidence * 100).toFixed(1)}% | ${word.start.toFixed(2)}s - ${word.end.toFixed(2)}s`}
              >
                {word.text}
                {highlightedWords.has(index) && (
                  <Highlighter className="inline w-3 h-3 ml-1 text-yellow-600" />
                )}
                {questionedWords.has(index) && (
                  <HelpCircle className="inline w-3 h-3 ml-1 text-red-600" />
                )}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
