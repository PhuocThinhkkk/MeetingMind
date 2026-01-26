import { log } from '@/lib/logger'
export function validateAudioTime(duration: number | null) {
  if (!duration || duration < 0) {
    duration = 0
    log.warn('Duration of audio file is :', duration)
  }
  return duration
}
