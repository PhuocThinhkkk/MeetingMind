import { saveAudioFile } from '@/lib/queries/browser/audio-operations'
import { CreateUrlUploadBody } from '@/app/api/audiofile/create-url-upload/route'
import { CreateUploadUrlResult } from '@/types/transcriptions/transcription.storage.upload'
import { TriggerTranscriptBody } from '@/app/api/audiofile/[audioId]/trigger-transcript/route'
import { GetUrlDownloadBody } from '@/app/api/audiofile/get-url-download/route'
import { supabase } from '@/lib/supabase-init/supabase-browser'
import { log } from '@/lib/logger'

/**
 * Request a presigned upload URL for an audio file.
 *
 * @param input - Payload describing the audio upload to create (e.g., filename, content type, and any metadata required by the server)
 * @returns An object containing the data required to perform the upload, including the presigned upload URL and the storage path
 */
async function fetchPresignedUrl(input: CreateUrlUploadBody) {
  const res = await fetch('/api/audiofile/create-url-upload', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    throw new Error(
      `Error when creating url upload: ${(await res.json()).error}`
    )
  }
  const data: CreateUploadUrlResult = await res.json()
  log.info('presigned url res: ', data)
  return data
}

/**
 * Orchestrates obtaining a presigned upload URL and saving the provided audio file for the specified user.
 *
 * @param input - Parameters used to create the presigned upload URL.
 * @param file - The audio `File` to upload.
 * @param userId - ID of the user who will be associated with the saved audio.
 * @returns An object containing `path` (the upload path from the presigned URL response) and `audio` (the saved audio record).
 */
export async function fetchPresignedUrlAndUpload(
  input: CreateUrlUploadBody,
  file: File,
  userId: string
) {
  const uploadRes = await fetchPresignedUrl(input)
  const audio = await saveAudioFile(file, userId, uploadRes)
  return { path: uploadRes.path, audio: audio }
}

/**
 * Requests a server-side transcript to be triggered for the given audio file.
 *
 * @param audioId - The ID of the audio file to trigger transcription for
 * @param input - Options for triggering transcription (see `TriggerTranscriptBody`)
 * @returns The server's upload/trigger result as a `CreateUploadUrlResult`
 * @throws If the server responds with a non-OK status (includes server-provided error message)
 */
export async function fetchTriggerTranscript(
  audioId: string,
  input: TriggerTranscriptBody
) {
  const res = await fetch(`/api/audiofile/${audioId}/trigger-transcript`, {
    method: 'POST',
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(
      `Error when creating url upload: ${body?.error ?? res.statusText}`
    )
  }
  const data: TriggerTranscriptBody = await res.json()
  return data
}

/**
 * Obtain a presigned download URL for an audio file.
 *
 * @param input - Request body identifying the audio file (e.g., file path or id)
 * @returns The download URL as a string
 * @throws Error if the server responds with an error; message contains the server-provided error
 */
export async function fetchUrlDownload(input: GetUrlDownloadBody) {
  const res = await fetch('/api/audiofile/get-url-download', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    throw new Error(
      `Error when fetching url download: ${(await res.json()).error}`
    )
  }
  const data = await res.json()
  return data.url
}

/**
 * Waits until the transcription for the specified audio file completes.
 *
 * @param audioId - The audio file's id to monitor
 * @returns Resolves when the audio file's transcription status becomes `done`; rejects if the status becomes `failed`
 */
export async function waitForTranscriptionDone(audioId: string): Promise<void> {
  const { data } = await supabase
    .from('audio_files')
    .select('transcription_status')
    .eq('id', audioId)
    .single()

  if (data?.transcription_status === 'done') return
  if (data?.transcription_status === 'failed') {
    throw new Error('Transcription failed')
  }

  return new Promise((resolve, reject) => {
    const channel = supabase
      .channel(`audio-status-${audioId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'audio_files',
          filter: `id=eq.${audioId}`,
        },
        payload => {
          const status = payload.new.transcription_status

          if (status === 'done') {
            supabase.removeChannel(channel)
            resolve()
          }

          if (status === 'failed') {
            supabase.removeChannel(channel)
            reject(new Error('Transcription waiting failed'))
          }
        }
      )
      .subscribe()
  })
}

/**
 * Triggers analysis for the specified audio file and returns the analysis result.
 *
 * @param audioId - The identifier of the audio file to analyze
 * @returns The parsed response data containing the analysis result
 */
export async function triggerAnalyze(audioId: string) {
  const res = await fetch(`/api/audiofile/${audioId}/analyze`, {
    method: 'POST',
  })
  if (!res.ok) {
    throw new Error(
      `Error when trigger analyzing : ${(await res.json()).error}`
    )
  }
  const data = await res.json()
  return data
}
