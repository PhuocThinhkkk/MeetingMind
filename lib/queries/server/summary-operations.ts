import { log } from '@/lib/logger'
import { supabaseAdmin } from '@/lib/supabase-init/supabase-server'
import { MeetingExtractionResult } from '@/types/llm/llm-abstract'

export async function getSummariesByAudioId(audioId: string) {
  const { data: existingSummary } = await supabaseAdmin
    .from('summaries')
    .select('*')
    .eq('audio_id', audioId)
    .maybeSingle()

  return existingSummary
}

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
