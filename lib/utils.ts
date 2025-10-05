import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 *
 * Converts a Float32Array buffer to an Int16Array buffer.
 * This is useful for audio processing where 16-bit PCM data is required.
 * Each float value in the input buffer is clamped between -1 and 1,
 * then scaled to the range of Int16 (-32768 to 32767).
 * Using this function because Assembly just supports Int16 PCM audio format.
 *
 * @param {Float32Array} buffer - The input Float32Array buffer containing audio samples.
 * @returns {Int16Array} - The resulting Int16Array buffer with converted audio samples.
 */
export function convertFloat32ToInt16(buffer: Float32Array) {
  const l = buffer.length;
  const int16Buffer = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    let s = Math.max(-1, Math.min(1, buffer[i]));
    int16Buffer[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return int16Buffer;
}

export function waitFor(timeout = 5000): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const seconds = timeout / 1000;
      console.log("Wait for ", seconds, " seconds!");
    }, timeout);
  });
}

/**
 *
 * Formats a duration given in seconds into a human-readable string.
 * examples:
 * - 3661 seconds -> "1h 1m 1s"
 * - 61 seconds -> "1m 1s"
 * @param {number} seconds - The duration in seconds to format.
 * @returns {string} - The formatted duration string.
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  }
  return `${minutes}m ${secs}s`;
}

/**
 *
 * Formats a file size given in bytes into a human-readable string in MB or GB.
 * examples:
 * - 10485760 bytes -> "10.00 MB"
 *   - 1073741824 bytes -> "1.00 GB"
 *   @param {number} bytes - The file size in bytes to format.
 *   @returns {string} - The formatted file size string.
 */
export function formatFileSize(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  if (mb >= 1000) {
    return `${(mb / 1024).toFixed(2)} GB`;
  }
  return `${mb.toFixed(2)} MB`;
}

/**
 *
 * Formats an ISO date string into a human-readable date and time string.
 * Example:
 * - "2023-10-05T14:48:00.000Z" -> "Oct 5, 2023, 02:48 PM"
 * @param {string} dateString - The ISO date string to format.
 * @returns {string} - The formatted date string.
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
