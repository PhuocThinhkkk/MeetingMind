import { supabase } from '@/lib/supabase-init/supabase-browser'
import { log } from '@/lib/logger'
import { MeetingExtractionResult } from '@/types/llm/llm-abstract'

export async function getEventAndSumariesByAudioId(audioId: string) {
  const { data: events, error: eventError } = await supabase
    .from('events')
    .select('*')
    .eq('audio_id', audioId)

  if (eventError) {
    log.error('query events error: ', eventError)
    throw eventError
  }
  const { data: summary, error: summaryError } = await supabase
    .from('summaries')
    .select('*')
    .eq('audio_id', audioId)
    .single()
  if (summaryError) {
    log.error('query summaries error: ', summaryError)
    throw summaryError
  }
  const result = {
    summary: summary,
    events: events,
  } as MeetingExtractionResult

  return result
}
