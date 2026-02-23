import { EventItemRow } from '@/types/transcriptions/transcription.db'
import { getAudioById } from '../queries/server/audio-upload-operations'

/**
 * Validates on the server that the provided userId is the owner of the audio referenced by the event.
 *
 * @param event - Event row whose `audio_id` is used to look up the audio record
 * @returns `{ allowed: true, reason: 'owner satisfied.' }` if the audio's `user_id` matches `userId`, `{ allowed: false, reason: 'Forbidden' }` otherwise
 */
export async function validateEventAndUserIdOnServer(
  userId: string,
  event: EventItemRow
) {
  const audio = await getAudioById(event.audio_id)
  if (audio.user_id !== userId) {
    return { allowed: false, reason: 'Forbidden' }
  }
  return { allowed: true, reason: 'owner satisfied.' }
}