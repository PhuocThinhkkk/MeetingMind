import { TranscriptWithWordNested } from '@/types/transcriptions/transcription.db'

type Word = TranscriptWithWordNested['transcription_words'][number]
const COMMA_MIN_PAUSE = 400
const COMMA_MAX_PAUSE = 500
const SENTENCE_PAUSE_THRESHOLD = 800

export function splitWordsIntoSentences(words: Word[] = []) {
  if (!words.length) return []

  const sentences: Word[][] = []
  let current: Word[] = []

  for (let i = 0; i < words.length; i++) {
    const word = words[i]
    const next = words[i + 1]

    if (!word.start_time || !word.end_time) continue

    let newWord = { ...word }

    if (next?.start_time) {
      const pause = next.start_time - word.end_time

      const isPauseComa =
        pause >= COMMA_MIN_PAUSE &&
        pause <= COMMA_MAX_PAUSE &&
        !/[,.!?]$/.test(newWord.text)

      const isEndSentence = pause > SENTENCE_PAUSE_THRESHOLD

      if (isPauseComa) {
        newWord.text += ','
      }

      if (isEndSentence) {
        current.push(newWord)
        sentences.push(normalizeSentence(current))
        current = []
        continue
      }
    }

    current.push(newWord)

    const hasEndingPunctuation = /[.!?]$/.test(newWord.text)
    const isLast = i === words.length - 1

    if (hasEndingPunctuation || isLast) {
      sentences.push(normalizeSentence(current))
      current = []
    }
  }

  return sentences
}

function normalizeSentence(words: Word[]): Word[] {
  let result = words.map(w => ({ ...w })) // clone

  result = capitalizeFirstWord(result)
  result = capitalizePronounI(result)
  result = normalizeComma(result)
  result = ensureEndingPunctuation(result)

  return result
}

function capitalizeFirstWord(words: Word[]): Word[] {
  if (!words.length) return words

  const first = words[0]
  words[0] = {
    ...first,
    text: first.text.charAt(0).toUpperCase() + first.text.slice(1),
  }

  return words
}

function capitalizePronounI(words: Word[]): Word[] {
  return words.map(w => {
    let text = w.text

    if (/^i$/i.test(text)) text = 'I'
    else if (/^i['’]/i.test(text)) {
      text = 'I' + text.slice(1)
    }

    return { ...w, text }
  })
}

function normalizeComma(words: Word[]): Word[] {
  return words.map(w => {
    let text = w.text

    // remove space before comma if exists
    text = text.replace(/\s+,/g, ',')

    return { ...w, text }
  })
}

function ensureEndingPunctuation(words: Word[]): Word[] {
  if (!words.length) return words

  const lastIndex = words.length - 1
  const last = words[lastIndex]

  if (!/[.!?]$/.test(last.text)) {
    words[lastIndex] = {
      ...last,
      text: last.text + '.',
    }
  }

  return words
}
