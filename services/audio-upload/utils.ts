import { AudioFileRow } from '@/types/transcriptions/transcription.db'

export function isAudioFileStatusDone(audio: AudioFileRow) {
  return audio.transcription_status == 'done'
}
