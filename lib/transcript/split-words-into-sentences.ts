import { TranscriptWithWordNested } from '@/types/transcriptions/transcription.db'

type Word = TranscriptWithWordNested['transcription_words'][number]
const COMMA_MIN_PAUSE = 400
const COMMA_MAX_PAUSE = 500
const SENTENCE_PAUSE_THRESHOLD = 800

/**
 * Split a sequence of timed words into sentences and normalize each sentence.
 *
 * Splitting uses inter-word pauses and existing punctuation to infer commas and sentence boundaries; each resulting sentence is normalized (capitalizes the first word, normalizes the pronoun "I", fixes comma spacing, and ensures ending punctuation).
 *
 * @param words - Array of word objects (each should include `text`, `start_time`, and `end_time`) to split into sentences
 * @returns An array of sentences, where each sentence is an array of normalized `Word` objects
 */
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

/**
 * Produce a normalized copy of a sentence represented as an array of word objects.
 *
 * The returned array is a shallow-cloned transformation of `words` with these normalizations applied in order:
 * capitalize the first word, normalize the pronoun "I", remove spaces before commas, and ensure the sentence ends with punctuation.
 *
 * @param words - The sentence as an array of word objects; the input array and its objects are not mutated.
 * @returns A new array of word objects representing the normalized sentence.
 */
function normalizeSentence(words: Word[]): Word[] {
  let result = words.map(w => ({ ...w })) // clone

  result = capitalizeFirstWord(result)
  result = capitalizePronounI(result)
  result = normalizeComma(result)
  result = ensureEndingPunctuation(result)

  return result
}

/**
 * Capitalize the first word of a sentence.
 *
 * @param words - Array of word objects representing a sentence; the array is mutated in place.
 * @returns The input array with the first word's `text` updated so its initial character is uppercase. If the array is empty, it is returned unchanged.
 */
function capitalizeFirstWord(words: Word[]): Word[] {
  if (!words.length) return words

  const first = words[0]
  words[0] = {
    ...first,
    text: first.text.charAt(0).toUpperCase() + first.text.slice(1),
  }

  return words
}

/**
 * Normalize occurrences of the pronoun "I" in a sequence of word objects.
 *
 * Converts standalone "i" to "I" and transforms tokens that start with "i'" or "i’" (e.g., "i'm", "i’ve") to start with "I" while preserving the rest of the token.
 *
 * @param words - The array of word objects to normalize
 * @returns A new array of word objects with the pronoun "I" capitalized where applicable
 */
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

/**
 * Remove any spaces immediately preceding commas in each word's text.
 *
 * @param words - The list of word objects to normalize
 * @returns The updated list of words with spaces before commas removed in each `text`
 */
function normalizeComma(words: Word[]): Word[] {
  return words.map(w => {
    let text = w.text

    // remove space before comma if exists
    text = text.replace(/\s+,/g, ',')

    return { ...w, text }
  })
}

/**
 * Ensure the last word in the array ends with a sentence-ending punctuation mark.
 *
 * @returns The input `words` array where the final word's `text` is appended with `.` if it did not already end with `.`, `!`, or `?`.
 */
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