import { RealtimeTranscriptionWord } from '@/types/transcriptions/transcription.ws'

export function getConfidenceColor(confidence: number) {
  return 'text-black'
}

export function getWordClassName(
  index: number,
  word: RealtimeTranscriptionWord,
  highlightedWords: Set<number>,
  questionedWords: Set<number>,
  selectedWordIndex: number | null
) {
  let className = `inline-block px-0 py-1 m-1 rounded-lg cursor-pointer transition-all duration-200 text-sm ${getConfidenceColor(word.confidence)}`

  if (highlightedWords.has(index)) {
    className += ' bg-yellow-200 border-2 border-yellow-400 shadow-sm'
  } else if (questionedWords.has(index)) {
    className += ' bg-red-100 border-2 border-red-400 shadow-sm'
  } else if (selectedWordIndex === index) {
    className += ' bg-blue-100 border-2 border-blue-400 shadow-sm'
  } else {
    className +=
      ' hover:bg-gray-100 border-2 border-transparent hover:shadow-sm'
  }

  return className
}
