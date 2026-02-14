import { AudioFileRow } from '@/types/transcriptions/transcription.db'

export function isAudioFileStatusDone(audio: AudioFileRow) {
  return audio.transcription_status == 'done'
}

import { parseStream } from 'music-metadata'
import { Readable } from 'stream'

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
