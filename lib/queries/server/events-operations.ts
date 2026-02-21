import { MeetingExtractionResult } from '@/types/llm/llm-abstract'
import { supabaseAdmin } from '@/lib/supabase-init/supabase-server'
import { log } from '@/lib/logger'

/**
 * Deletes any existing events for the given audio ID, inserts the provided events for that audio ID, and returns the inserted rows.
 *
 * @param audioId - The identifier of the audio recording to associate events with
 * @param eventsArray - Array of event records to insert (each with title, description, start_time, end_time, and location)
 * @returns The rows inserted into the `events` table
 * @throws Rethrows the database error if the insert operation fails
 */
export async function insertManyEventsByAudioId(
  audioId: string,
  eventsArray: MeetingExtractionResult['events']
) {
  deleteAllExistingEventsByAudioId(audioId)

  const formattedEvents = eventsArray.map(event => ({
    audio_id: audioId,
    title: event.title,
    description: event.description,
    start_time: event.start_time,
    end_time: event.end_time,
    location: event.location,
  }))

  const { data, error } = await supabaseAdmin
    .from('events')
    .insert(formattedEvents)
    .select('*')

  if (error) {
    log.error('Error when insert events: ', {
      error,
      audioId,
      eventsArray,
    })
    throw error
  }
  return data
}
/**
 * Fetches all event records associated with the given audio ID from the `events` table.
 *
 * @param audioId - The audio identifier used to filter event rows
 * @returns The rows from the `events` table that match `audioId`
 * @throws The Supabase error if the query fails
 */
export async function getAllEventsByAudioId(audioId: string) {
  const { data, error } = await supabaseAdmin
    .from('events')
    .select('*')
    .eq('audio_id', audioId)

  if (error) {
    log.error('Error when insert events: ', {
      error,
      audioId,
      data,
    })
    throw error
  }
  return data
}

/**
 * Remove all event rows for the given audio ID from the `events` table.
 *
 * @param audioId - The audio identifier whose associated events will be deleted
 * @throws The Supabase error object if the delete operation fails
 */
async function deleteAllExistingEventsByAudioId(audioId: string) {
  const { error } = await supabaseAdmin
    .from('events')
    .delete()
    .eq('audio_id', audioId)

  if (error) {
    log.error('Error when deleting events: ', {
      audioId,
      error,
    })
    throw error
  }
}
export async function getEventById(eventId: string) {
  const { data, error } = await supabaseAdmin
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single()

  if (!data || error) {
    log.error('Error when query event: ', {
      eventId,
      error,
    })
    throw error
  }
  return data
}
