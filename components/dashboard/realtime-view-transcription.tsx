"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, Square, Highlighter, HelpCircle, FileText, Calendar, Sparkles, Languages } from "lucide-react"
import { TranscriptionWord } from "@/types/transcription"

interface RealTimeTranscriptionPageProps {
  words?: TranscriptionWord[]
  isVisible?: boolean
  onExit?: () => void
  onStopRecording?: () => void
}

export default function RealTimeTranscriptionPage({
  words = [],
  isVisible = true,
  onExit = () => {},
  onStopRecording = () => {},
}: RealTimeTranscriptionPageProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [highlightedWords, setHighlightedWords] = useState<Set<number>>(new Set())
  const [questionedWords, setQuestionedWords] = useState<Set<number>>(new Set())
  const [selectedWordIndex, setSelectedWordIndex] = useState<number | null>(null)
  const [showTranscript, setShowTranscript] = useState(true)
  const [showTranslate, setShowTranslate] = useState(true)

  //TODO: handle this later
  const translatedText =
    "Hola a todos, bienvenidos a nuestro sistema de transcripción en vivo. Esto está funcionando muy bien y podemos ver todas las palabras apareciendo en tiempo real."

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true)
    }
  }, [isVisible])

  const handleExit = () => {
    setIsAnimating(false)
    setTimeout(() => {
      onExit()
    }, 300)
  }

  const toggleHighlight = (index: number) => {
    const newHighlighted = new Set(highlightedWords)
    if (newHighlighted.has(index)) {
      newHighlighted.delete(index)
    } else {
      newHighlighted.add(index)
    }
    setHighlightedWords(newHighlighted)
    setSelectedWordIndex(null)
  }

  const toggleQuestion = (index: number) => {
    const newQuestioned = new Set(questionedWords)
    if (newQuestioned.has(index)) {
      newQuestioned.delete(index)
    } else {
      newQuestioned.add(index)
    }
    setQuestionedWords(newQuestioned)
    setSelectedWordIndex(null)
  }

  // TODO: handle this later
  const getConfidenceColor = (confidence: number) => {
    return "text-black"
    if (confidence >= 0.8) return "text-green-600"
    if (confidence >= 0.6) return "text-yellow-600"
    return "text-red-600"
  }

  const getWordClassName = (index: number, word: TranscriptionWord) => {
    let className = `inline-block px-0 py-1 m-1 rounded-lg cursor-pointer transition-all duration-200 text-sm ${getConfidenceColor(word.confidence)}`

    if (highlightedWords.has(index)) {
      className += " bg-yellow-200 border-2 border-yellow-400 shadow-sm"
    } else if (questionedWords.has(index)) {
      className += " bg-red-100 border-2 border-red-400 shadow-sm"
    } else if (selectedWordIndex === index) {
      className += " bg-blue-100 border-2 border-blue-400 shadow-sm"
    } else {
      className += " hover:bg-gray-100 border-2 border-transparent hover:shadow-sm"
    }

    if (!word.word_is_final) {
      className += " opacity-70 italic"
    }

    return className
  }

  const handleCloseTranscript = () => {
    setShowTranscript(false)
  }

  const handleCloseTranslate = () => {
    setShowTranslate(false)
  }

  const bothPanelsOpen = showTranscript && showTranslate
  const onlyOnePanel = showTranscript !== showTranslate

  if (!isVisible) return null

  return (
    <div
      className={`fixed inset-0 z-50 bg-white flex flex-col transform transition-all duration-300 ease-out ${
        isAnimating ? "translate-y-0" : "translate-y-full"
      }`}
    >
      {/* Header */}
      <div className="border-b bg-white shadow-sm">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse" />
            <h1 className="text-2xl font-bold text-gray-900">Live Transcription</h1>
            <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{words.length} words</div>
          </div>
          <Button
            variant="ghost"
            size="lg"
            onClick={handleExit}
            className="h-12 w-12 p-0 hover:bg-gray-100 rounded-full"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="px-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="h-8 px-3 bg-transparent">
                <Highlighter className="w-3 h-3 mr-1" />
                Highlight
              </Button>
              <Button variant="outline" size="sm" className="h-8 px-3 bg-transparent">
                <FileText className="w-3 h-3 mr-1" />
                Summary
              </Button>
              <Button variant="outline" size="sm" className="h-8 px-3 bg-transparent">
                <Calendar className="w-3 h-3 mr-1" />
                Note to Calendar
              </Button>
            </div>
            <Button variant="default" size="sm" className="h-9 px-4 bg-blue-600 hover:bg-blue-700">
              <Sparkles className="w-4 h-4 mr-2" />
              Ask AI
            </Button>
          </div>
        </div>

        {/* Transcript/Translate Toggle */}
        <div className="px-6 pb-4 border-t pt-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Button
                variant={showTranscript ? "default" : "outline"}
                size="sm"
                onClick={() => setShowTranscript(!showTranscript)}
                className="h-8"
              >
                <FileText className="w-3 h-3 mr-1" />
                Transcript
              </Button>
              <Button
                variant={showTranslate ? "default" : "outline"}
                size="sm"
                onClick={() => setShowTranslate(!showTranslate)}
                className="h-8"
              >
                <Languages className="w-3 h-3 mr-1" />
                Translate
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex">
          {/* Transcript Panel */}
          {showTranscript && (
            <div className={`${bothPanelsOpen ? "w-1/2" : "w-full"} border-r border-gray-200 flex flex-col`}>
              <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                <h2 className="font-semibold text-gray-900">Transcript</h2>
                {bothPanelsOpen && (
                  <Button variant="ghost" size="sm" onClick={handleCloseTranscript} className="h-6 w-6 p-0">
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                {words.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                      <div className="w-6 h-6 bg-red-500 rounded-full animate-pulse" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Listening...</h3>
                    <p className="text-gray-500">Start speaking to see your words appear here</p>
                  </div>
                ) : (
                  <div className="text-lg leading-relaxed">
                    {words.map((word, index) => (
                      <span
                        key={index}
                        className={getWordClassName(index, word)}
                        onClick={() => setSelectedWordIndex(selectedWordIndex === index ? null : index)}
                        title={`Confidence: ${(word.confidence * 100).toFixed(1)}% | ${word.start.toFixed(2)}s - ${word.end.toFixed(2)}s`}
                      >
                        {word.text}
                        {highlightedWords.has(index) && <Highlighter className="inline w-3 h-3 ml-1 text-yellow-600" />}
                        {questionedWords.has(index) && <HelpCircle className="inline w-3 h-3 ml-1 text-red-600" />}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Translate Panel */}
          {showTranslate && (
            <div className={`${bothPanelsOpen ? "w-1/2" : "w-full"} flex flex-col`}>
              <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                <div className="flex items-center space-x-2">
                  <h2 className="font-semibold text-gray-900">Translation</h2>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Spanish</span>
                </div>
                {bothPanelsOpen && (
                  <Button variant="ghost" size="sm" onClick={handleCloseTranslate} className="h-6 w-6 p-0">
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                {words.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <Languages className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Ready to translate</h3>
                    <p className="text-gray-500">Translation will appear as you speak</p>
                  </div>
                ) : (
                  <div className="text-lg leading-relaxed text-gray-800">{translatedText}</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Word Actions Panel */}
      {selectedWordIndex !== null && showTranscript && (
        <div className="px-8 py-4 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-lg font-medium text-gray-700">"{words[selectedWordIndex]?.text}"</span>
              <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full">
                Confidence: {((words[selectedWordIndex]?.confidence || 0) * 100).toFixed(1)}%
              </span>
              <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full">
                {words[selectedWordIndex]?.start.toFixed(2)}s - {words[selectedWordIndex]?.end.toFixed(2)}s
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant={highlightedWords.has(selectedWordIndex) ? "default" : "outline"}
                onClick={() => toggleHighlight(selectedWordIndex)}
                size="sm"
              >
                <Highlighter className="w-3 h-3 mr-1" />
                {highlightedWords.has(selectedWordIndex) ? "Remove Highlight" : "Highlight"}
              </Button>
              <Button
                variant={questionedWords.has(selectedWordIndex) ? "default" : "outline"}
                onClick={() => toggleQuestion(selectedWordIndex)}
                size="sm"
              >
                <HelpCircle className="w-3 h-3 mr-1" />
                {questionedWords.has(selectedWordIndex) ? "Remove Question" : "Question"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="p-8 border-t bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span>{words.filter((w) => w.word_is_final).length} final words</span>
            </div>
            {highlightedWords.size > 0 && (
              <div className="flex items-center space-x-2">
                <Highlighter className="w-3 h-3 text-yellow-600" />
                <span>{highlightedWords.size} highlighted</span>
              </div>
            )}
            {questionedWords.size > 0 && (
              <div className="flex items-center space-x-2">
                <HelpCircle className="w-3 h-3 text-red-600" />
                <span>{questionedWords.size} questioned</span>
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
    </div>
  )
}
