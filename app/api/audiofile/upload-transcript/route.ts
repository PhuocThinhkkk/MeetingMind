import { NextRequest, NextResponse } from 'next/server'
import { getUserAuthInSupabaseToken } from '@/lib/supabase-auth-server'
import { log } from '@/lib/logger'
import { validateAudioFile } from '@/services/audio-upload/audio-validation'
import {
  insertAudioFile,
  uploadAudioFile,
} from '@/lib/queries/server/audio-upload-operations'
import { createAssemblyAudioUploadWithWebhook } from '@/services/audio-upload/assembly-webhook'
import { getAudioDuration } from '@/lib/transcript/transcript-realtime-utils'
import {
  getMonthlyUploadCount,
  getMonthlyUsageSeconds,
  getUserPlan,
} from '@/lib/queries/server/limits-audio-upload-operations'
import { checkTranscriptionAllowed } from '@/lib/limits/usage.limit'

/**
 * Handle an audio file upload request, validate and persist the file, and enqueue a webhook-based processing job.
 *
 * @param req - Incoming NextRequest containing multipart/form-data with the audio file under the `audio_file` field
 * @returns A NextResponse with JSON:
 * - on success: `{ audio_id: string, status: 'processing' }` (HTTP 200)
 * - if unauthenticated: `{ error: 'Unauthorized' }` (HTTP 401)
 * - on server error: `{ error: 'Server Error' }` (HTTP 500)
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getUserAuthInSupabaseToken()
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('audio_file') as File | null

    validateAudioFile(file)
    const duration = await getAudioDuration(file)
    const [totalSeconds, uploadsCount] = await Promise.all([
      getMonthlyUsageSeconds(user.id),
      getMonthlyUploadCount(user.id),
    ])

    const userPlan = await getUserPlan(user.id)
    const { allowed, reason } = checkTranscriptionAllowed({
      plan: userPlan,
      usedSeconds: totalSeconds,
      fileSeconds: duration,
    })
    if (!allowed) {
      return NextResponse.json(
        {
          error: reason,
        },
        { status: 500 }
      )
    }

    const audioUrl = await uploadAudioFile(user.id, file)
    const job = await createAssemblyAudioUploadWithWebhook(audioUrl)
    log.info('Jobs of uploading file: ', job)
    const dataInsert = {
      user_id: user.id,
      name: file.name,
      file_size: file.size,
      duration,
      mine_tyep: file.type,
      url: audioUrl,
      assembly_job_id: job.id,
      transcription_status: 'processing',
    }
    const audio = await insertAudioFile(dataInsert)

    return NextResponse.json({
      audio_id: audio.id,
      audio,
      status: 'processing',
    })
  } catch (e) {
    log.error('Error in the upload server: ', e)
    return NextResponse.json(
      {
        error: 'Servr Error',
      },
      { status: 500 }
    )
  }
}
