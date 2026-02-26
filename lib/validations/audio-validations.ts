import { log } from '@/lib/logger'
/**
 * Normalize an audio duration to a non-negative value.
 *
 * @param duration - The audio duration; if `null`, `undefined`, `0`, or a negative value, it will be normalized to `0`.
 * @returns The validated duration, guaranteed to be greater than or equal to `0`.
 */
export function validateAudioTime(duration: number | null | undefined) {
  if (!duration || duration < 0) {
    log.warn('Duration of audio file is :', duration)
    return 0
  }
  return duration
}
