import { log } from '@/lib/logger'
import { supabaseAdmin } from '@/lib/supabase-init/supabase-server'
import { AudioFileRow } from '@/types/transcription.db'

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

  const { data: audio } = await supabaseAdmin
    .from('audio_files')
    .insert({
      user_id: userId,
      name: file.name,
      url: urlData.publicUrl,
      transcription_status: 'processing',
    })
    .select()
    .single()
  if (!audio) {
    log.error('There was something wrong with the insert audio')
    throw new Error('There was something wrong with the insert audio')
  }
  return audio as AudioFileRow
}
export async function findAudioFileByJobId(jobId: string) {
  const { data: audio } = await supabaseAdmin
    .from('audio_files')
    .select('*')
    .eq('assembly_job_id', jobId)
    .single()

  return audio as AudioFileRow
}

export async function updateAudioComplete(
  audio: AudioFileRow,
  transcript: any
) {
  await supabaseAdmin.from('transcripts').insert({
    audio_id: audio.id,
    text: transcript.text,
    language: transcript.language_code ?? 'en-US',
    confidence_score: transcript.confidence,
  })

  await supabaseAdmin
    .from('audio_files')
    .update({ transcription_status: 'done' })
    .eq('id', audio.id)
}
