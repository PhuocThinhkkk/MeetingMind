import { log } from '@/lib/logger'
import { supabaseAdmin } from '@/lib/supabase-init/supabase-server'
import { Database } from '@/types/database.types'
import { AudioFileRow } from '@/types/transcription.db'

/**
 * Uploads an audio file to storage, creates an `audio_files` record with transcription status set to `processing`, and returns the created row.
 *
 * @param userId - ID of the user who owns the uploaded file
 * @param file - The file to upload
 * @returns The inserted `AudioFileRow` for the uploaded audio
 * @throws When the storage upload fails or when inserting the audio record into the database fails
 */
export async function uploadAudioFile(userId: string, file: File) {
  const ext = file.name.split('.').pop()
  const storagePath = `uploads/${userId}/${crypto.randomUUID()}.${ext}`

  const { error: uploadError } = await supabaseAdmin.storage
    .from('audio-files')
    .upload(storagePath, file, { contentType: file.type })

  if (uploadError) throw uploadError

  const { data: urlData } = supabaseAdmin.storage
    .from('audio-files')
    .getPublicUrl(storagePath)

  return urlData.publicUrl
}
export async function insertAudioFile(
  audioFileInput: Database['public']['Tables']['audio_files']['Insert']
) {
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
 * Finalize an audio record by saving its transcript and marking its transcription status as done.
 *
 * @param audio - The audio record to update; its `id` is used to link the transcript and update status.
 * @param transcript - Transcript data with shape `{ text: string, language_code?: string, confidence?: number }`.
 * @throws The database insert error when inserting the transcript fails.
 */
export async function updateAudioComplete(
  audio: AudioFileRow,
  transcript: any
) {
  const { error: insertError } = await supabaseAdmin
    .from('transcripts')
    .insert({
      audio_id: audio.id,
      text: transcript.text,
      language: transcript.language_code ?? 'en-US',
      confidence_score: transcript.confidence,
    })
  if (insertError) {
    log.error('Failed to insert transcript', {
      error: insertError,
      audioId: audio.id,
    })
    throw insertError
  }

  await supabaseAdmin
    .from('audio_files')
    .update({ transcription_status: 'done' })
    .eq('id', audio.id)
}