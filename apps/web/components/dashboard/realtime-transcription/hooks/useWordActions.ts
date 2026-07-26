import { useState } from 'react'

/**
 * Manages word highlighting, questioning, and selection state.
 *
 * @returns The current word interaction state and actions for updating it
 */
export function useWordActions() {
  const [highlightedWords, setHighlightedWords] = useState<Set<number>>(
    new Set()
  )
  const [questionedWords, setQuestionedWords] = useState<Set<number>>(new Set())
  const [selectedWordIndex, setSelectedWordIndex] = useState<number | null>(
    null
  )
  const [selectedTurnId, setSelectedTurnId] = useState<string | null>(null)

  const toggleSelectedWord = (index: number) => {
    setSelectedWordIndex(prev => (prev === index ? null : index))
  }

  const selectSelectedTurn = (turnId: string) => {
    setSelectedTurnId(turnId)
  }

  const toggleHighlight = (index: number) => {
    setHighlightedWords(prev => {
      const next = new Set(prev)
      next.has(index) ? next.delete(index) : next.add(index)
      return next
    })
    setSelectedWordIndex(null)
  }

  const toggleQuestion = (index: number) => {
    setQuestionedWords(prev => {
      const next = new Set(prev)
      next.has(index) ? next.delete(index) : next.add(index)
      return next
    })
    setSelectedWordIndex(null)
  }

  return {
    highlightedWords,
    questionedWords,
    selectedWordIndex,
    selectedTurnId,
    toggleSelectedWord,
    selectSelectedTurn,
    toggleHighlight,
    toggleQuestion,
  }
}
