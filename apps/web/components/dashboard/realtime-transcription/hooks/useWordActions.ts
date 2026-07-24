import { useState } from 'react'

export function useWordActions() {
  const [highlightedWords, setHighlightedWords] = useState<Set<number>>(
    new Set()
  )
  const [questionedWords, setQuestionedWords] = useState<Set<number>>(new Set())
  const [selectedWordIndex, setSelectedWordIndex] = useState<number | null>(
    null
  )

  const toggleSelectedWord = (index: number) => {
    setSelectedWordIndex(prev => (prev === index ? null : index))
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
    toggleSelectedWord,
    toggleHighlight,
    toggleQuestion,
  }
}
