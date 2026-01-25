import { log } from '@/lib/logger'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines multiple class value inputs into a single merged class string, resolving Tailwind CSS class conflicts.
 *
 * @param inputs - One or more class values (strings, arrays, objects, etc.) to be combined and merged
 * @returns The resulting merged class name string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convert a Float32Array of normalized PCM samples to 16-bit PCM samples.
 *
 * Each input sample is clamped to the range -1 to 1 and mapped to the signed 16-bit integer range (-32768 to 32767).
 *
 * @param buffer - Input Float32Array of normalized audio samples.
 * @returns The converted Int16Array containing 16-bit PCM samples.
 */
export function convertFloat32ToInt16(buffer: Float32Array) {
  const l = buffer.length
  const int16Buffer = new Int16Array(l)
  for (let i = 0; i < l; i++) {
    let s = Math.max(-1, Math.min(1, buffer[i]))
    int16Buffer[i] = s < 0 ? s * 0x8000 : s * 0x7fff
  }
  return int16Buffer
}

/**
 * Pause execution for a given number of milliseconds.
 *
 * @param timeout - Delay duration in milliseconds
 * @returns No value.
 */
export function waitFor(timeout = 5000): Promise<void> {
  return new Promise(resolve => {
    setTimeout(() => {
      const seconds = timeout / 1000
      log.info('Wait for ', seconds)
      resolve()
    }, timeout)
  })
}
/**
 * Formats a duration in seconds into a human-readable string.
 *
 * @param seconds - Duration in seconds to format.
 * @returns The formatted duration as "Xh Ym Zs" when hours are present, otherwise "Ym Zs".
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`
  }
  return `${minutes}m ${secs}s`
}
/**
 * Format a byte count into a human-readable size string using MB or GB.
 *
 * @param bytes - File size in bytes.
 * @returns The size formatted with two decimal places, using "MB" when under 1024 MB and "GB" otherwise.
 */
export function formatFileSize(bytes: number): string {
  const mb = bytes / (1024 * 1024)
  if (mb >= 1024) {
    return `${(mb / 1024).toFixed(2)} GB`
  }
  return `${mb.toFixed(2)} MB`
}

/**
 * Formats an ISO date string into an en-US localized date and time string.
 *
 * @param dateString - The ISO date string to format (e.g., "2023-10-05T14:48:00.000Z").
 * @returns The formatted date and time in en-US locale (e.g., "Oct 5, 2023, 02:48 PM").
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
