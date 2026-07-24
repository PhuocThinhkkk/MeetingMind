import { Highlighter } from 'lucide-react'

export function EmptyTranscript() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <div className="w-6 h-6 bg-red-500 rounded-full animate-pulse" />
      </div>
      <h3 className="text-xl font-semibold text-gray-700 mb-2">Listening...</h3>
      <p className="text-gray-500">
        Start speaking to see your words appear here
      </p>
    </div>
  )
}
