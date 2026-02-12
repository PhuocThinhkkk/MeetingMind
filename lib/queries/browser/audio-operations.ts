import { CreateUrlUploadBody } from '@/app/api/audiofile/create-url-upload/route'
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

export async function uploadAudioFileUsingPath(uploadUrl: string, file: File) {
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
    },
    body: file,
  })
  if (!res.ok) {
    log.error('Error in upload file: ', { res: await res.json() })
    throw new Error('Can not upload file ')
  }
}

/**
 * Update an audio file's name and refresh its `updated_at` timestamp in the database.
 *
 * @param audioId - The ID of the audio file to update
 * @param newName - The new name to assign to the audio file
 * @returns The updated `AudioFile` record
 * @throws Supabase error when the update operation fails
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
