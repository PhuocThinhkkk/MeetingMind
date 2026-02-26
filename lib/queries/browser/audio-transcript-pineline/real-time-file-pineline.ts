import { sanitizedFileName } from '@/lib/transcript/extract-file-name'
import { getAudioDuration } from '@/lib/transcript/transcript-realtime-utils'
import { fetchPresignedUrlAndUpload, triggerAnalyze } from './utils'
import { log } from '@/lib/logger'
import {
  saveTranscript,
  saveTranscriptWords,
} from '@/lib/queries/browser/transcription-operations'
import { SaveTranscriptInput } from '@/types/transcriptions/transcription.db'
import { updateAudioStatus } from '../audio-operations'
/**
 * Uploads a local audio file, saves its realtime transcript and words, and triggers analysis for the uploaded audio.
 *
 * @param transcriptWords - Array of realtime transcription word objects to be saved alongside the audio
 * @param file - Browser `File` object representing the audio to upload
 * @param userId - Identifier of the user performing the upload
 * @returns An object containing the saved `audio` record
 */
export async function realtimeUploadPineline(
  transcriptWords: SaveTranscriptInput,
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
      isUpload: false,
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

/**
 * Persist a transcript and its word-level entries for a given audio record.
 *
 * Saves a transcription linked to `audioId` and then stores the provided `transcriptWords` associated with the saved transcription, logging the saved entities.
 *
 * @param transcriptWords - Array of realtime transcription words to persist
 * @param audioId - Identifier of the audio record the transcript belongs to
 */
export async function handlingSaveAudioAndTranscript(
  transcriptWords: SaveTranscriptInput,
  audioId: string
) {
  const transcription = await saveTranscript(audioId, transcriptWords)
  if (transcription) {
    log.info('Transcript saved with ID:', transcription)
  }
  let words
  if (transcriptWords && transcriptWords.length > 0) {
    words = await saveTranscriptWords(transcription.id, transcriptWords)
  }
  await updateAudioStatus(audioId, 'done')
  log.info('Success storing transcript and words: ', { transcription, words })
}
