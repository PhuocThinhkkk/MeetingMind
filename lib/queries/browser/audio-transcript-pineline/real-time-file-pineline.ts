import { sanitizedFileName } from '@/lib/transcript/extract-file-name'
import { getAudioDuration } from '@/lib/transcript/transcript-realtime-utils'
import { fetchPresignedUrlAndUpload, triggerAnalyze } from './utils'
import { log } from '@/lib/logger'
import { RealtimeTranscriptionWord } from '@/types/transcriptions/transcription.ws'
import {
  saveTranscript,
  saveTranscriptWords,
} from '@/lib/queries/browser/transcription-operations'
export async function realtimeUploadPineline(
  transcriptWords: RealtimeTranscriptionWord[],
  file: File,
  userId: string
) {
  try {
    const sanitizedName = sanitizedFileName(file.name)
    const presigedUrlInput = {
      name: sanitizedName,
      type: file.type,
      size: file.size,
      duration: await getAudioDuration(file),
      isUpload: true,
      path: undefined,
    }
    const { path, audio } = await fetchPresignedUrlAndUpload(
      presigedUrlInput,
      file,
      userId
    )
    await handlingSaveAudioAndTranscript(transcriptWords, audio.id)
    await triggerAnalyze(audio.id)
    return { audio }
  } catch (error) {
    log.error('Error when handle file upload.')
    throw error
  } finally {
    log.info('File upload function end.')
  }
}

export async function handlingSaveAudioAndTranscript(
  transcriptWords: RealtimeTranscriptionWord[],
  audioId: string
) {
  const transcription = await saveTranscript(audioId, transcriptWords)
  if (transcription) {
    log.info('Transcript saved with ID:', transcription)
  }
  const words = await saveTranscriptWords(transcription.id, transcriptWords)
  log.info('Success storing transcript and words: ', { transcription, words })
}
