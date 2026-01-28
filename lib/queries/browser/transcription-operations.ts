import { log } from '@/lib/logger'
import { SaveTranscriptInput, Transcript } from '@/types/transcription.db'
import { supabase } from '@/lib/supabase-init/supabase-browser'
import { RealtimeTranscriptionWord } from '@/types/transcription.ws'
import { TranscriptionWord } from '@/types/transcription.db'

/**
 * Save a transcript for an audio file to the database.
 *
 * @param audioId - The ID of the associated audio file.
 * @param transcripts - Array of transcript segments whose `text` fields will be concatenated and stored.
 * @returns The inserted transcript record from the database.
 * @throws If `transcripts` is empty.
 * @throws If the database insert operation fails.
 */
export async function saveTranscript(
  audioId: string,
  transcripts: SaveTranscriptInput
) {
  if (!transcripts || transcripts.length === 0) {
    throw new Error('Transcripts array cannot be empty')
  }
  const transcriptText = transcripts.map(t => t.text).join(' ')
  const { data, error } = await supabase
    .from('transcripts')
    .insert({
      audio_id: audioId,
      text: transcriptText,
    })
    .select()
    .single()
  if (error) {
    log.error('Error saving transcript:', error)
    throw error
  }
  return data as Transcript
}

/**
 * Persist an array of realtime word tokens for a transcription into the database.
 *
 * @param transcriptionId - The ID of the transcription to associate each word with
 * @param transcriptWords - Realtime word objects containing `text`, `start`, `end`, `confidence`, and `word_is_final`
 * @returns The inserted `TranscriptionWord` records; returns an empty array if the insert returned no data
 * @throws Error when the database insert operation fails
 */
export async function saveTranscriptWords(
  transcriptionId: string,
  transcriptWords: RealtimeTranscriptionWord[]
) {
  const rows = transcriptWords.map(word => ({
    transcript_id: transcriptionId,
    text: word.text,
    confidence: word.confidence,
    start_time: word.start,
    end_time: word.end,
    word_is_final: word.word_is_final,
  }))

  const { data, error } = await supabase
    .from('transcription_words')
    .insert(rows)
    .select()

  if (error) {
    throw new Error('Error when saving transcript words: ' + error.message)
  }
  if (!data) return []
  return data as TranscriptionWord[]
}

/**
 * Retrieve the transcript record associated with a given audio ID.
 *
 * @param audioId - The audio file identifier to query.
 * @returns The transcript record matching `audioId`.
 * @throws If the database query fails or if no transcript is found.
 */
export async function getTranscriptByAudioId(audioId: string) {
  const { data, error } = await supabase
    .from('transcripts')
    .select('*')
    .eq('audio_id', audioId)
    .single()

  if (error) {
    throw new Error('Error when saving transcript words: ' + error.message)
  }
  if (!data) {
    throw new Error('No transcript found.')
  }
  return data
}