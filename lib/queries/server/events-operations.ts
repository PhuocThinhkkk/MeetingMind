import { MeetingExtractionResult } from '@/types/llm/llm-abstract'
import { supabaseAdmin } from '@/lib/supabase-init/supabase-server'
import { log } from '@/lib/logger'

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
