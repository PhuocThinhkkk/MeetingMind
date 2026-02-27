import { NextRequest, NextResponse } from 'next/server'
import { getUserAuthInSupabaseToken } from '@/lib/supabase-auth-server'
import { log } from '@/lib/logger'
import {
  getAudioById,
  getStorageFileSize,
  updateAudioFileByJobId,
} from '@/lib/queries/server/audio-upload-operations'
import { createAssemblyAudioUploadWithWebhook } from '@/services/audio-upload/assembly-webhook'
import { getUserPlan } from '@/lib/queries/server/limits-audio-upload-operations'
import { checkFileSizeAllowed } from '@/lib/limits/usage.limit'
import { AudioFileRow } from '@/types/transcriptions/transcription.db'
import { BUCKET_NAME } from '@/constains/storage'
import { getSignedAudioUrl } from '@/lib/queries/server/storage-operations'

export type TriggerTranscriptBody = {
  path: string
  size: number
  duration: number
}
/**
 * Handle POST requests that trigger transcription for an existing audio file and start an upload job.
 *
 * @param req - The incoming Next.js request containing a JSON body with `path`, `size`, and `duration`.
 * @param params - An object with a promised `audioId` parameter identifying the audio record.
 * @returns A NextResponse JSON payload. On success (201) returns `{ status: "processing", audio: <updated audio object> }`. On failure returns `{ error: "<message>" }` with an appropriate HTTP status (401 for unauthorized or plan limits, 404 for not found, 500 for server error).
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ audioId: string }> }
) {
  try {
    const audioId = (await params).audioId

    const user = await getUserAuthInSupabaseToken()
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const audio = await getAudioById(audioId)
    if (!audio || audio.user_id !== user.id) {
      log.error(`User with id ${user.id} can not access with audio ${audio}`)
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const { path, size, duration }: TriggerTranscriptBody = await req.json()

    if (audio.path != path) {
      log.error(`User with id ${user.id} use wrong path ${path} `, {
        path,
        audioPath: audio.path,
      })
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const plan = await getUserPlan(user.id)
    // const audioFileSize = await getStorageFileSize(BUCKET_NAME, path)
    const { allowed, reason } = checkFileSizeAllowed({
      plan,
      fileSeconds: duration,
    })
    if (!allowed) {
      return NextResponse.json({ error: reason }, { status: 401 })
    }

    const url = await getSignedAudioUrl(path)
    const job = await createAssemblyAudioUploadWithWebhook(url)
    const updatedAudio = await updateAudioFileByJobId(audio.id, job.id)
    log.info('Jobs of uploading file: ', job)
    const res: TriggerTranscriptResponse = {
      status: 'processing ',
      audio: updatedAudio,
    }
    return NextResponse.json(res, { status: 201 })
  } catch (e) {
    log.error('Error in the upload server: ', e)
    return NextResponse.json(
      {
        error: 'Server Error',
      },
      { status: 500 }
    )
  }
}

export type TriggerTranscriptResponse = {
  status: 'processing '
  audio: AudioFileRow
}
