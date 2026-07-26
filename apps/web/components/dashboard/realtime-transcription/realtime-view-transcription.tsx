'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { FileText, Languages } from 'lucide-react'
import { useWordActions } from './hooks/useWordActions'
import { TranscriptionHeader } from './TranscriptionHeader'
import { TranscriptPanel } from './TranscriptPanel'
import { TranslationPanel } from './TranslationPanel'
import { WordActionBar } from './WordActionBar'
import { BottomControls } from './BottomControls'
import { useRecorder } from '@/components/context/realtime-record/realtime-recorder-context'

interface RealTimeTranscriptionPageProps {
  isVisible?: boolean
  onExit?: () => void | Promise<void>
  onStopRecording?: () => void | Promise<void>
}

export default function RealTimeTranscriptionPage({
  isVisible = true,
  onExit = async () => {},
  onStopRecording = async () => {},
}: RealTimeTranscriptionPageProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [showTranscript, setShowTranscript] = useState(true)
  const [showTranslate, setShowTranslate] = useState(false)
  const { transcriptWords } = useRecorder()

  const {
    highlightedWords,
    questionedWords,
    selectedWordIndex,
    selectedTurnId,
    toggleHighlight,
    toggleQuestion,
    toggleSelectedWord,
    selectSelectedTurn,
  } = useWordActions()

  useEffect(() => {
    if (isVisible) setIsAnimating(true)
  }, [isVisible])

  const finalWordCount = useMemo(
    () => transcriptWords.filter(w => w.word_is_final).length,
    [transcriptWords]
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
      className={`fixed inset-0 z-50 flex flex-col bg-background transform transition-all duration-300 ease-out ${isAnimating ? 'translate-y-0' : 'translate-y-full'}`}
    >
      <TranscriptionHeader
        onExit={handleExit}
        wordsCount={transcriptWords.length}
      />

      <div className="border-t border-border px-6 pb-4 pt-4">
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
              bothPanelsOpen={bothPanelsOpen}
              highlightedWords={highlightedWords}
              questionedWords={questionedWords}
              selectedWordIndex={selectedWordIndex}
              selectedTurnId={selectedTurnId}
              onToggleSelectedWord={toggleSelectedWord}
              onSelectTurn={selectSelectedTurn}
              onClose={() => setShowTranscript(false)}
            />
          )}

          {showTranslate && (
            <TranslationPanel
              bothPanelsOpen={bothPanelsOpen}
              selectedTurnId={selectedTurnId}
              onSelectTurn={selectSelectedTurn}
              onClose={() => setShowTranslate(false)}
            />
          )}
        </div>
      </div>

      <WordActionBar
        selectedWord={
          selectedWordIndex !== null
            ? transcriptWords[selectedWordIndex]
            : undefined
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
