import { adaptAssemblyAIWords } from '@/lib/adapters/upload-transcript'
import { log } from '@/lib/logger'
import { supabaseAdmin } from '@/lib/supabase-init/supabase-server'
import {
  AudioFileInsertInput,
  AudioFileRow,
} from '@/types/transcriptions/transcription.db'
import { AssemblyAIWebhookPayload } from '@/types/transcriptions/transcription.assembly.upload'
import {
  CreateUploadUrlParams,
  CreateUploadUrlResult,
} from '@/types/transcriptions/transcription.storage.upload'

/**
 * Insert a new row into the `audio_files` table and return the inserted record.
 *
 * @param audioFileInput - Object containing fields for the new audio file record
 * @returns The inserted `AudioFileRow`
 * @throws Error if the insert fails or the inserted row is not returned
 */
export async function insertAudioFile(audioFileInput: AudioFileInsertInput) {
  const { data: audio, error: insertError } = await supabaseAdmin
    .from('audio_files')
    .insert(audioFileInput)
    .select()
    .single()
  if (insertError || !audio) {
    log.error('Failed to insert audio record', { error: insertError })
    throw insertError ?? new Error('Failed to insert audio record')
  }
  return audio as AudioFileRow
}

/**
 * Create a signed storage upload URL and return its path, token, and content type.
 *
 * @param params - Object containing `userId`, `fileName`, and `fileType` used to build the storage path and response
 * @param isUpload - If `true`, places the file under `uploads/{userId}`, otherwise under `recordings/{userId}`
 * @returns An object with `path` (storage path), `signedUrl` (temporary upload URL), `token` (upload token), and `contentType` (original file type)
 * @throws Error if creating the signed upload URL fails
 */
export async function createAudioUploadUrl(
  params: CreateUploadUrlParams,
  isUpload: boolean
): Promise<CreateUploadUrlResult> {
  const { userId, fileName, fileType } = params

  const ext = fileName.split('.').pop()
  let path
  if (isUpload) {
    path = `uploads/${userId}/${crypto.randomUUID()}.${ext}`
  } else {
    path = `recordings/${userId}/${crypto.randomUUID()}.${ext}`
  }

  const { data, error } = await supabaseAdmin.storage
    .from('audio-files')
    .createSignedUploadUrl(path)

  if (error || !data) {
    throw new Error(error?.message || 'Failed to create signed upload URL')
  }

  return {
    path,
    signedUrl: data.signedUrl,
    token: data.token,
    contentType: fileType,
  }
}

/**
 * Retrieve the size in bytes of a file stored at the specified bucket path.
 *
 * @param bucket - The storage bucket name
 * @param path - The full path to the file including filename
 * @returns The file size in bytes, or `0` if the size metadata is unavailable
 * @throws When the storage request fails or the specified file is not found
 */
export async function getStorageFileSize(
  bucket: string,
  path: string
): Promise<number> {
  const parts = path.split('/')
  const fileName = parts.pop()
  const folder = parts.join('/')

  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .list(folder, {
      search: fileName,
      limit: 1,
    })

  if (error) throw error

  const file = data?.[0]
  if (!file || file.name !== fileName) {
    throw new Error('File not found in storage')
  }

  return file.metadata.size || file.metadata.file_size || 0
}

/**
 * Retrieve the audio_files row matching the given assembly job ID.
 *
 * @param jobId - The assembly job identifier to look up
 * @returns The matching `AudioFileRow`
 * @throws The database error if the query fails, or an `Error` when no audio file is found for the provided job ID
 */
export async function findAudioFileByJobId(jobId: string) {
  const { data: audio, error } = await supabaseAdmin
    .from('audio_files')
    .select('*')
    .eq('assembly_job_id', jobId)
    .single()

  if (error || !audio) {
    throw new Error(
      `Audio file not found for job ID: ${jobId}, error: ${JSON.stringify(error)}`
    )
  }

  return audio as AudioFileRow
}
/**
 * Set the AssemblyAI job ID on an existing audio file record.
 *
 * @param audioId - The ID of the audio file to update
 * @param jobId - The AssemblyAI job ID to associate with the audio file
 * @returns The updated audio file row
 * @throws Error if the audio file does not exist or the update failed
 */
export async function updateAudioFileByJobId(audioId: string, jobId: string) {
  const { data: audio, error } = await supabaseAdmin
    .from('audio_files')
    .update({ assembly_job_id: jobId })
    .select('*')
    .eq('id', audioId)
    .single()

  if (error || !audio) {
    throw new Error(
      `Audio file not found for job ID: ${jobId}, error: ${JSON.stringify(error)}`
    )
  }

  return audio as AudioFileRow
}

/**
 * Fetches the audio_files row for the given audio ID.
 *
 * @param audioId - The ID of the audio file to retrieve
 * @returns The matching audio file row, or `undefined` if no row exists for the provided ID
 * @throws The original error if the database query fails
 */
export async function getAudioById(audioId: string) {
  const { data: audio, error: e } = await supabaseAdmin
    .from('audio_files')
    .select('*')
    .eq('id', audioId)

  if (e) {
    log.error('Error when get audio by id: ', { e, audio, audioId })
    throw e
  }
  return audio[0]
}

/**
 * Finalizes an audio record by saving its transcript and word-level transcription, then marks its transcription_status as 'done'.
 *
 * @param audio - Audio record whose `id` is used to link the created transcript and to update the audio row.
 * @param transcript - AssemblyAI transcript payload; `text`, optional `language_code`, `confidence`, and `words` are used to create records.
 * @throws The database insertion error if inserting the transcript or the transcription words fails.
 */
export async function updateAudioComplete(
  audio: AudioFileRow,
  transcript: AssemblyAIWebhookPayload
) {
  const { data: transcriptDb, error: insertError } = await supabaseAdmin
    .from('transcripts')
    .insert({
      audio_id: audio.id,
      text: transcript.text ?? '',
      language: transcript.language_code ?? 'en-US',
      confidence_score: transcript.confidence,
    })
    .select('*')
    .single()

  if (!transcriptDb || insertError) {
    log.error('Failed to insert transcript', {
      error: insertError,
      transcript,
      transcriptDb,
      audioId: audio.id,
    })
    throw insertError
  }

  const transcriptWordsInsert = adaptAssemblyAIWords(
    transcript.words,
    transcriptDb.id
  )

  const { error: insertError2 } = await supabaseAdmin
    .from('transcription_words')
    .insert(transcriptWordsInsert)

  if (insertError2) {
    log.error('Failed to insert transcript words: ', {
      error: insertError,
      transcript,
      transcriptDb,
      audioId: audio.id,
    })
    throw insertError2
  }

  await supabaseAdmin
    .from('audio_files')
    .update({ transcription_status: 'done' })
    .eq('id', audio.id)
}