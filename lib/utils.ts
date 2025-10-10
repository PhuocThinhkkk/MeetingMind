import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class value inputs into a single merged class string, resolving Tailwind CSS class conflicts.
 *
 * @param inputs - One or more class values (strings, arrays, objects, etc.) to be combined and merged
 * @returns The resulting merged class name string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
  const l = buffer.length;
  const int16Buffer = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    let s = Math.max(-1, Math.min(1, buffer[i]));
    int16Buffer[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return int16Buffer;
}

/**
 * Delays execution for the specified number of milliseconds.
 *
 * @param timeout - Delay duration in milliseconds (default: 5000)
 * @returns No value.
 */
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
 * Formats a duration in seconds into a human-readable string.
 *
 * @param seconds - Duration in seconds to format.
 * @returns The formatted duration as "Xh Ym Zs" when hours are present, otherwise "Ym Zs".
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
 * Format a byte count into a human-readable size string using MB or GB.
 *
 * @param bytes - File size in bytes.
 * @returns The size formatted with two decimal places, using "MB" when under 1024 MB and "GB" otherwise.
 */
export function formatFileSize(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  if (mb >= 1024) {
    return `${(mb / 1024).toFixed(2)} GB`;
  }
  return `${mb.toFixed(2)} MB`;
}

/**
 * Formats an ISO date string into an en-US localized date and time string.
 *
 * @param dateString - The ISO date string to format (e.g., "2023-10-05T14:48:00.000Z").
 * @returns The formatted date and time in en-US locale (e.g., "Oct 5, 2023, 02:48 PM").
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
 * Encodes 16-bit PCM samples into a WAV file Blob.
 *
 * Constructs a RIFF/WAVE file with a mono, 16-bit PCM fmt chunk and a data chunk, and returns a Blob with MIME type `audio/wav`.
 *
 * @param samples - The Int16Array of 16-bit PCM audio samples.
 * @param sampleRate - The audio sample rate in hertz (defaults to 16000).
 * @returns A Blob containing the encoded WAV file suitable for playback or saving.
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

/**
 * Writes an ASCII string into a DataView as consecutive bytes starting at the given offset.
 *
 * Each character's UTF-16 code unit is written as a single byte (low 8 bits) using `setUint8`.
 *
 * @param view - The DataView to write bytes into
 * @param offset - The byte offset in `view` where writing begins
 * @param str - The string whose characters will be written as bytes
 */
function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}


/**
 * Concatenates an array of Uint8Array chunks into a single contiguous Uint8Array, preserving order.
 *
 * @param chunks - The byte chunks to concatenate.
 * @returns A Uint8Array containing the concatenated bytes of all chunks in order.
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
 * Retrieve the duration of an audio Blob in seconds.
 *
 * @param blob - The audio Blob to measure
 * @returns The audio duration in seconds
 * @throws If the audio metadata cannot be loaded, rejects with the underlying error
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