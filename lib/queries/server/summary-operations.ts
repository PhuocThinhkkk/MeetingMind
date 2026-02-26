import { log } from '@/lib/logger'
import { supabaseAdmin } from '@/lib/supabase-init/supabase-server'
import { MeetingExtractionResult } from '@/types/llm/llm-abstract'

/**
 * Retrieve the summary record for a given audio ID from the summaries table.
 *
 * @param audioId - The audio identifier to look up
 * @returns The summary record for `audioId`, or `null` if no matching summary exists
 */
export async function getSummariesByAudioId(audioId: string) {
  const { data: existingSummary } = await supabaseAdmin
    .from('summaries')
    .select('*')
    .eq('audio_id', audioId)
    .maybeSingle()

  return existingSummary
}

/**
 * Persist a meeting summary for the specified audio ID, replacing any existing summary.
 *
 * Deletes any existing summary row for `audioId` and inserts a new summary record containing
 * `text`, `highlights`, `todo`, `key_topics`, and `sentiment`.
 *
 * @param audioId - Identifier of the audio recording to associate the summary with
 * @param summary - Summary object containing `text`, `highlights`, `todo`, `key_topics`, and `sentiment`
 * @throws Propagates any database error encountered while deleting the existing summary or inserting the new one
 */
export async function saveSummaryByAudioId(
  audioId: string,
  summary: MeetingExtractionResult['summary']
) {
  await deleteExistingSummaryByAudioId(audioId)

  const { error } = await supabaseAdmin.from('summaries').insert({
    audio_id: audioId,
    text: summary.text,
    highlights: summary.highlights,
    todo: summary.todo,
    key_topics: summary.key_topics,
    sentiment: summary.sentiment,
  })

  if (error) {
    log.error('Error when saving summary: ', {
      audioId,
      summary: summary,
    })
    throw error
  }
}

/**
 * Remove all summary rows associated with the specified audio ID.
 *
 * @param audioId - The audio identifier to match against the `summaries.audio_id` column
 * @throws The Supabase error object if the delete operation fails
 */
async function deleteExistingSummaryByAudioId(audioId: string) {
  const { error } = await supabaseAdmin
    .from('summaries')
    .delete()
    .eq('audio_id', audioId)

  if (error) {
    log.error('Error when deleting summary: ', {
      audioId,
      error,
    })
    throw error
  }
}
