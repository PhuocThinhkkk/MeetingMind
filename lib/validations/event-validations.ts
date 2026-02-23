import { EventItemRow } from '@/types/transcriptions/transcription.db'
import { getAudioById } from '../queries/server/audio-upload-operations'

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
