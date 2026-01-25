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
  const buffer = new ArrayBuffer(44 + samples.length * 2)
  const view = new DataView(buffer)

  // RIFF header
  writeString(view, 0, 'RIFF')
  view.setUint32(4, 36 + samples.length * 2, true)
  writeString(view, 8, 'WAVE')

  // fmt chunk
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true) // chunk size
  view.setUint16(20, 1, true) // PCM format
  view.setUint16(22, 1, true) // mono
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true) // byte rate
  view.setUint16(32, 2, true) // block align
  view.setUint16(34, 16, true) // bits per sample

  // data chunk
  writeString(view, 36, 'data')
  view.setUint32(40, samples.length * 2, true)

  // PCM samples
  let offset = 44
  for (let i = 0; i < samples.length; i++, offset += 2) {
    view.setInt16(offset, samples[i], true)
  }

  return new Blob([view], { type: 'audio/wav' })
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
    view.setUint8(offset + i, str.charCodeAt(i))
  }
}

/**
 * Concatenates an array of Uint8Array chunks into a single contiguous Uint8Array, preserving order.
 *
 * @param chunks - The byte chunks to concatenate.
 * @returns A Uint8Array containing the concatenated bytes of all chunks in order.
 */
export function mergeChunks(chunks: Uint8Array[]): Uint8Array {
  let totalLength = 0
  for (const chunk of chunks) {
    totalLength += chunk.length
  }

  const merged = new Uint8Array(totalLength)

  let offset = 0
  for (const chunk of chunks) {
    merged.set(chunk, offset)
    offset += chunk.length
  }

  return merged
}
/**
 * Determines the duration of an audio Blob in seconds.
 *
 * @param blob - The audio Blob to measure
 * @returns The duration of the audio in seconds
 * @throws The underlying error if audio metadata cannot be loaded
 */

export async function getAudioDuration(blob: Blob): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = document.createElement('audio')
    const url = URL.createObjectURL(blob)
    audio.src = url
    audio.addEventListener('loadedmetadata', () => {
      URL.revokeObjectURL(url)
      resolve(audio.duration)
    })
    audio.addEventListener('error', error => {
      URL.revokeObjectURL(url)
      reject(error)
    })
  })
}

/**
 * Resamples a mono Float32Array assumed at 48000 Hz to 16000 Hz using an OfflineAudioContext.
 *
 * @param float32 - Mono audio samples sampled at 48000 Hz.
 * @returns A Float32Array containing the resampled mono audio at 16000 Hz.
 */
/**
 * Resamples a mono Float32Array from 48000 Hz to 16000 Hz.
 *
 * @param float32 - Mono PCM samples sampled at 48000 Hz (normalized floats, typically in [-1, 1])
 * @returns A Float32Array containing the resampled mono PCM samples at 16000 Hz
 */
export async function resampleTo16kHz(float32) {
  const originalSampleRate = 48000
  const targetSampleRate = 16000
  const audioBuffer = new AudioBuffer({
    length: float32.length,
    numberOfChannels: 1,
    sampleRate: originalSampleRate,
  })

  audioBuffer.copyToChannel(float32, 0, 0)

  const offlineContext = new OfflineAudioContext({
    numberOfChannels: 1,
    length: Math.round(
      (float32.length * targetSampleRate) / originalSampleRate
    ),
    sampleRate: targetSampleRate,
  })

  const source = offlineContext.createBufferSource()
  source.buffer = audioBuffer
  source.connect(offlineContext.destination)
  source.start()

  const rendered = await offlineContext.startRendering()
  return rendered.getChannelData(0)
}

/**
 * Convert normalized 32-bit float PCM samples to signed 16-bit PCM samples.
 *
 * Clamps input samples to the range [-1, 1] and scales them to the signed 16-bit range.
 *
 * @param float32 - The input Float32Array of audio samples, typically in the range [-1, 1].
 * @returns An Int16Array containing the converted signed 16-bit PCM samples (approximately -32768 to 32767).
 */
/**
 * Converts normalized 32-bit float PCM samples to signed 16-bit PCM samples.
 *
 * @param float32 - Mono audio samples in the range [-1, 1]; values outside this range will be clamped.
 * @returns An Int16Array where negative inputs are scaled to the [-32768, -1] range and non-negative inputs to the [0, 32767] range.
 */
/**
 * Convert normalized 32-bit float PCM samples to signed 16-bit PCM samples.
 *
 * Samples are clamped to the range -1 to 1 before scaling.
 *
 * @param float32 - The input Float32Array (or array-like) of normalized PCM samples in the range -1 to 1
 * @returns An Int16Array containing samples scaled to the signed 16-bit PCM range (-32768 to 32767)
 */
export function float32ToInt16(float32) {
  const int16 = new Int16Array(float32.length)
  for (let i = 0; i < float32.length; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]))
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff
  }
  return int16
}