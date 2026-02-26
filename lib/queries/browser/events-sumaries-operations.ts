import { supabase } from '@/lib/supabase-init/supabase-browser'
import { log } from '@/lib/logger'
import { EventItemRow } from '@/types/transcriptions/transcription.db'

/**
 * Retrieve events and the first summary record associated with an audio ID.
 *
 * @param audioId - The audio identifier to filter events and summaries by.
 * @returns An object with `summary` set to the first matching summary record (or `undefined`) and `events` as the array of matching event records.
 * @throws If a database query for events or summaries fails, the corresponding error is thrown.
 */
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
  if (summaryError) {
    log.error('query summaries error: ', summaryError)
    throw summaryError
  }
  const result = {
    summary: summary[0],
    events: events,
  }

  return result
}

/**
 * Retrieve all event records from the events table.
 *
 * @returns An array of event records retrieved from the database.
 * @throws The underlying database error when the query fails (the error is logged before being rethrown).
 */
export async function getAllEventsByUserId() {
  const { data: events, error } = await supabase.from('events').select('*')

  if (error) {
    log.error('query events error: ', { error, events })
    throw error
  }
  return events
}

export async function updateEventById(
  id: string,
  updates: Partial<EventItemRow>
) {
  const { data, error } = await supabase
    .from('events')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    log.error('Error when update event: ', { updates, data, error })
    throw error
  }
  return data
}

export async function deleteEventById(id: string) {
  const { error } = await supabase.from('events').delete().eq('id', id)
  if (error) throw error
}
