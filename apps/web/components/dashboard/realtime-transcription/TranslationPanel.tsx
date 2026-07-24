import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { EmptyTranslation } from './EmptyTranslation'

export function TranslationPanel({
  translationWords,
  hasTranscriptWords,
  bothPanelsOpen,
  onClose,
}: {
  translationWords: string[]
  hasTranscriptWords: boolean
  bothPanelsOpen: boolean
  onClose: () => void
}) {
  return (
    <div className={`${bothPanelsOpen ? 'w-1/2' : 'w-full'} flex flex-col`}>
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center space-x-2">
          <h2 className="font-semibold text-primary">Translation</h2>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
            Spanish
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
        {!hasTranscriptWords ? (
          <EmptyTranslation />
        ) : (
          <div className="text-lg leading-relaxed text-gray-800">
            {translationWords.length > 0
              ? translationWords.join(' ')
              : ' Translating...'}
          </div>
        )}
      </div>
    </div>
  )
}
