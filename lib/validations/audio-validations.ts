import { log } from '@/lib/logger'
/**
 * Normalize an audio duration to a non-negative value.
 *
 * @param duration - The audio duration (may be `null`). If `null`, `0`, or negative, it will be normalized to `0`.
 * @returns The validated duration, guaranteed to be greater than or equal to `0`.
 */
export function validateAudioTime(duration: number | null) {
  if (!duration || duration < 0) {
    duration = 0
    log.warn('Duration of audio file is :', duration)
  }
  return duration
}