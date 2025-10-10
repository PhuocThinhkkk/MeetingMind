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
  return new Promise((resolve) => {
    setTimeout(() => {
      const seconds = timeout / 1000;
      console.log("Wait for ", seconds, " seconds!");
      resolve();
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
  const secs = Math.floor(seconds % 60);

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
  if (mb >= 1024) {
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

/**
 *
 * Encodes an Int16Array of audio samples into a WAV file Blob.
 * The function constructs the WAV file header and appends the PCM samples.
 * The resulting Blob can be used for playback or saving as a .wav file.
 *
 * @param {Int16Array} samples - The input Int16Array containing audio samples.
 * @param {number} sampleRate - The sample rate of the audio (default is 16000 Hz).
 * @returns {Blob} - A Blob representing the WAV file.
 */

export function encodeWAV(samples: Int16Array, sampleRate = 16000) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  // RIFF header
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, "WAVE");

  // fmt chunk
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true); // chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample

  // data chunk
  writeString(view, 36, "data");
  view.setUint32(40, samples.length * 2, true);

  // PCM samples
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    view.setInt16(offset, samples[i], true);
  }

  return new Blob([view], { type: "audio/wav" });
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}


/**
 *
 * Merges multiple Uint8Array chunks into a single Uint8Array.
 * This is useful for combining audio data received in chunks into a single buffer.
 *
 * @param {Uint8Array[]} chunks - An array of Uint8Array chunks to merge.
 * @returns {Uint8Array} - A single Uint8Array containing all the merged chunks.
 */
export function mergeChunks(chunks: Uint8Array[]): Uint8Array {
  let totalLength = 0;
  for (const chunk of chunks) {
    totalLength += chunk.length;
  }

  const merged = new Uint8Array(totalLength);

  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }

  return merged;
}
/**
 *
 * Gets the duration of an audio Blob in seconds.
 * This function creates an HTMLAudioElement, sets its source to the Blob,
 * and listens for the 'loadedmetadata' event to retrieve the duration.
 *
 * @param {Blob} blob - The audio Blob to get the duration of.
 * @returns {Promise<number>} - A promise that resolves to the duration in seconds.
 */

export async function getAudioDuration(blob: Blob): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = document.createElement("audio");
    const url = URL.createObjectURL(blob);
    audio.src = url;
    audio.addEventListener("loadedmetadata", () => {
      URL.revokeObjectURL(url);
      resolve(audio.duration);
    });
    audio.addEventListener("error", (error) => {
      URL.revokeObjectURL(url);
      reject(error);
    });
  });
}
