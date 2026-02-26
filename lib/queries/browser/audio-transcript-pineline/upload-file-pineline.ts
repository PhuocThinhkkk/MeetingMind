import { sanitizedFileName } from '@/lib/transcript/extract-file-name'
import { getAudioDuration } from '@/lib/transcript/transcript-realtime-utils'
import {
  fetchPresignedUrlAndUpload,
  fetchTriggerTranscript,
  triggerAnalyze,
  waitForTranscriptionDone,
} from './utils'
import { log } from '@/lib/logger'
/**
 * Orchestrates uploading an audio file, triggering its transcription, waiting for transcription to finish, and initiating analysis.
 *
 * @param file - The audio File to upload and process.
 * @param userId - Identifier of the user performing the upload.
 * @returns An object containing `audio` — the uploaded audio metadata as returned by the upload service.
 */
export async function fileUploadPineline(file: File, userId: string) {
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
    const triggerTranscriptInput = {
      ...presigedUrlInput,
      path,
    }
    await fetchTriggerTranscript(audio.id, triggerTranscriptInput)
    await waitForTranscriptionDone(audio.id)
    await triggerAnalyze(audio.id)
    return { audio }
  } catch (error) {
    log.error('Error when handle file upload.')
    throw error
  } finally {
    log.info('File upload function end.')
  }
}
