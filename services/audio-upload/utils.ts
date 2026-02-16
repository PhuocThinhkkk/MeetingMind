import { AudioFileRow } from '@/types/transcriptions/transcription.db'

/**
 * Check whether an audio file's transcription is completed.
 *
 * @param audio - The audio file record to inspect
 * @returns `true` if the audio file's `transcription_status` is `'done'`, `false` otherwise
 */
export function isAudioFileStatusDone(audio: AudioFileRow) {
  return audio.transcription_status == 'done'
}

import { parseStream } from 'music-metadata'
import { Readable } from 'stream'

/**
 * Gets the duration in seconds of an audio resource at the specified URL.
 *
 * @param url - The URL of the audio resource to inspect.
 * @returns The audio duration in seconds, or 0 if the duration is unavailable.
 * @throws Error when the audio cannot be fetched.
 */
export async function getAudioDurationFromUrl(url: string): Promise<number> {
  const res = await fetch(url)

  if (!res.ok || !res.body) {
    throw new Error('Failed to fetch audio')
  }

  // Convert Web Stream -> Node Stream
  const nodeStream = Readable.fromWeb(res.body as any)

  const metadata = await parseStream(nodeStream, {}, { duration: true })

  return metadata.format.duration || 0
}