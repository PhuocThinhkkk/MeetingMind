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
    <div className="border-b bg-white shadow-sm">
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center space-x-3">
          <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse" />
          <h1 className="text-2xl font-bold text-primary">
            Live Transcription
          </h1>
          <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {wordsCount} words
          </div>
        </div>
        <Button
          variant="ghost"
          size="lg"
          onClick={onExit}
          className="h-12 w-12 p-0 hover:bg-gray-100 rounded-full"
        >
          <X className="h-6 w-6" />
        </Button>
      </div>
    </div>
  )
}
