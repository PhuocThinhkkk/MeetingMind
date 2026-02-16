import { log } from '@/lib/logger'
import { supabase } from '@/lib/supabase-init/supabase-browser'
import { sanitizedFileName } from '@/lib/transcript/extract-file-name'
import { getAudioDuration } from '@/lib/transcript/transcript-realtime-utils'
import {
  AudioFileRow,
  AudioFileStatus,
  AudioFileWithTranscriptNested,
} from '@/types/transcriptions/transcription.db'
import { CreateUploadUrlResult } from '@/types/transcriptions/transcription.storage.upload'

/**
 * Retrieve a user's audio files with their associated transcript (first transcript or `null`), ordered newest first.
 *
 * @param userId - The ID of the user whose audio history to fetch
 * @returns An array of `AudioFileWithTranscriptNested` where each item's `transcript` is the first related transcript object or `null`; returns an empty array if Supabase is not configured or no records are found
 * @throws The Supabase error when the database query fails
 */
export async function getAudioHistory(
  userId: string
): Promise<AudioFileWithTranscriptNested[]> {
  // Check if Supabase is configured
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    log.error(
      '❌ Supabase not configured! Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
    )
    return []
  }

  const { data, error } = await supabase
    .from('audio_files')
    .select(
      `
      *,
      transcript:transcripts!left(*)
    `
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    log.error('Supabase error:', error)
    throw error
  }
  const formatted = data?.map(a => ({
    ...a,
    transcript: a.transcript?.[0] ?? null,
  }))

  return formatted ?? []
}

/**
 * Save a newly uploaded audio file to storage and create its database record with metadata.
 *
 * Attempts to determine the file duration, uploads the file using the provided signed URL,
 * and inserts a row into `audio_files` with the sanitized name, path, duration, size, MIME type,
 * and an initial transcription status of `pending`.
 *
 * @param file - The audio File to upload (its `name`, `type`, and `size` are used)
 * @param userId - The ID of the user who owns the file
 * @param uploadRes - Result from creating an upload URL; must contain `signedUrl` for upload and `path` to store in the DB
 * @returns The inserted `AudioFileRow` for the saved audio file
 * @throws Error if the file has an invalid MIME type or file size, if the upload fails, or if the database insert fails
 */
export async function saveAudioFile(
  file: File,
  userId: string,
  uploadRes: CreateUploadUrlResult
) {
  const mimeType = file.type
  const fileSize = file.size

  if (!mimeType || mimeType.length === 0) {
    throw new Error('Blob must have a valid MIME type')
  }
  if (!fileSize || fileSize <= 0) {
    throw new Error('Blob must have a valid file size')
  }

  let duration
  try {
    duration = await getAudioDuration(file)
  } catch (err) {
    log.error('Error when saving audio file: ', err)
  }
  if (duration == undefined) {
    duration = 0
  }
  const name = sanitizedFileName(file.name)
  await uploadAudioFileUsingPath(uploadRes.signedUrl, file)
  const status: AudioFileStatus = 'pending'

  const { data, error } = await supabase
    .from('audio_files')
    .insert({
      user_id: userId,
      name,
      path: uploadRes.path,
      duration: Math.round(duration),
      file_size: fileSize,
      mime_type: mimeType,
      transcription_status: status,
    })
    .select()
    .single()

  if (error) {
    log.error('DB insert error:', error)
    throw error
  }
  log.info('Audio file saved:', data)

  return data as AudioFileRow
}

/**
 * Uploads a file to a pre-signed storage URL using an HTTP PUT request.
 *
 * @param uploadUrl - The pre-signed URL to upload the file to.
 * @param file - The File to upload; its MIME type is used for the `Content-Type` header.
 * @throws Error - If the upload HTTP response is not OK.
 */
export async function uploadAudioFileUsingPath(uploadUrl: string, file: File) {
  log.info('upload file to url: ', { uploadUrl })
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
    },
    body: file,
  })
  if (!res.ok) {
    log.error('Error in upload file to storage: ', { res })
    throw new Error('Can not upload file ')
  }
}

/**
 * Update an audio file's name and refresh its `updated_at` timestamp in the database.
 *
 * @param audioId - ID of the audio file to update
 * @param newName - New name for the audio file
 * @returns The updated `AudioFileRow`
 * @throws The Supabase error returned when the update operation fails
 */
export async function updateAudioName(audioId: string, newName: string) {
  const { data, error } = await supabase
    .from('audio_files')
    .update({ name: newName, updated_at: new Date().toISOString() })
    .eq('id', audioId)
    .select()
    .single()

  if (error) {
    log.error('❌ Error updating audio name:', error)
    throw error
  }

  log.info('✅ Audio name updated:', data)
  return data as AudioFileRow
}

/**
 * Update an audio file's transcription status and refresh its updated_at timestamp.
 *
 * @param audioId - ID of the audio file to update
 * @param newStatus - New transcription status to set for the audio file
 * @returns The updated `AudioFileRow`
 */
export async function updateAudioStatus(
  audioId: string,
  newStatus: AudioFileStatus
) {
  const { data, error } = await supabase
    .from('audio_files')
    .update({
      transcription_status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', audioId)
    .select()
    .single()

  if (error) {
    log.error('❌ Error updating audio status:', error)
    throw error
  }

  log.info('✅ Audio name updated:', data)
  return data as AudioFileRow
}

/**
 * Delete an audio file record by its ID.
 *
 * @param audioId - The ID of the audio file to delete
 * @returns `true` if the record was deleted
 * @throws The Supabase error returned when the delete operation fails
 */
export async function deleteAudioById(audioId: string) {
  const { error } = await supabase
    .from('audio_files')
    .delete()
    .eq('id', audioId)

  if (error) {
    log.error('❌ Error deleting audio:', error)
    throw error
  }

  log.info(`🗑️ Audio with ID ${audioId} deleted`)
  return true
}

/**
 * Fetches the audio file record with the given ID.
 *
 * @param audioId - The ID of the audio file to retrieve
 * @returns The audio file record matching `audioId`
 * @throws When the database query returns an error
 */
export async function getAudioById(audioId: string) {
  const { data, error } = await supabase
    .from('audio_files')
    .select('*')
    .eq('id', audioId)
    .single()

  if (error) {
    log.error('error: ', {
      error,
      data,
    })
    throw new Error('Error when get audio by id')
  }
  return data
}