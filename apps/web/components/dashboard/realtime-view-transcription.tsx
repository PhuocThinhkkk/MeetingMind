'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { FileText, Languages } from 'lucide-react'
import { RealtimeTranscriptionWord } from '@/types/transcriptions/transcription.ws'
import { useWordActions } from './realtime-transcription/hooks/useWordActions'
import { TranscriptionHeader } from './realtime-transcription/TranscriptionHeader'
import { TranscriptPanel } from './realtime-transcription/TranscriptPanel'
import { TranslationPanel } from './realtime-transcription/TranslationPanel'
import { WordActionBar } from './realtime-transcription/WordActionBar'
import { BottomControls } from './realtime-transcription/BottomControls'

interface RealTimeTranscriptionPageProps {
  transcriptionWords?: RealtimeTranscriptionWord[]
  translationWords?: string[]
  isVisible?: boolean
  onExit?: () => void | Promise<void>
  onStopRecording?: () => void | Promise<void>
}

export default function RealTimeTranscriptionPage({
  transcriptionWords: words = [],
  translationWords = [],
  isVisible = true,
  onExit = async () => {},
  onStopRecording = async () => {},
}: RealTimeTranscriptionPageProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [showTranscript, setShowTranscript] = useState(true)
  const [showTranslate, setShowTranslate] = useState(false)

  const {
    highlightedWords,
    questionedWords,
    selectedWordIndex,
    toggleHighlight,
    toggleQuestion,
    toggleSelectedWord,
  } = useWordActions()

  useEffect(() => {
    if (isVisible) setIsAnimating(true)
  }, [isVisible])

  const finalWordCount = useMemo(
    () => words.filter(w => w.word_is_final).length,
    [words]
  )

  const bothPanelsOpen = useMemo(
    () => showTranscript && showTranslate,
    [showTranscript, showTranslate]
  )

  const handleExit = () => {
    onExit()
  }

  if (!isVisible) return null

  return (
    <div
      className={`fixed inset-0 z-50 bg-white flex flex-col transform transition-all duration-300 ease-out ${isAnimating ? 'translate-y-0' : 'translate-y-full'}`}
    >
      <TranscriptionHeader onExit={handleExit} wordsCount={words.length} />

      <div className="px-6 pb-4 border-t pt-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button
              variant={showTranscript ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowTranscript(prev => !prev)}
              className="h-8"
            >
              <FileText className="w-3 h-3 mr-1" />
              Transcript
            </Button>
            <Button
              variant={showTranslate ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowTranslate(prev => !prev)}
              className="h-8"
            >
              <Languages className="w-3 h-3 mr-1" />
              Translate
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="h-full flex">
          {showTranscript && (
            <TranscriptPanel
              words={words}
              bothPanelsOpen={bothPanelsOpen}
              highlightedWords={highlightedWords}
              questionedWords={questionedWords}
              selectedWordIndex={selectedWordIndex}
              onToggleSelectedWord={toggleSelectedWord}
              onClose={() => setShowTranscript(false)}
            />
          )}

          {showTranslate && (
            <TranslationPanel
              translationWords={translationWords}
              hasTranscriptWords={words.length > 0}
              bothPanelsOpen={bothPanelsOpen}
              onClose={() => setShowTranslate(false)}
            />
          )}
        </div>
      </div>

      <WordActionBar
        selectedWord={
          selectedWordIndex !== null ? words[selectedWordIndex] : undefined
        }
        isVisible={selectedWordIndex !== null && showTranscript}
        isHighlighted={
          selectedWordIndex !== null
            ? highlightedWords.has(selectedWordIndex)
            : false
        }
        isQuestioned={
          selectedWordIndex !== null
            ? questionedWords.has(selectedWordIndex)
            : false
        }
        onToggleHighlight={() =>
          selectedWordIndex !== null && toggleHighlight(selectedWordIndex)
        }
        onToggleQuestion={() =>
          selectedWordIndex !== null && toggleQuestion(selectedWordIndex)
        }
      />

      <BottomControls
        finalWordCount={finalWordCount}
        highlightedCount={highlightedWords.size}
        questionedCount={questionedWords.size}
        onStopRecording={onStopRecording}
      />
    </div>
  )
}
