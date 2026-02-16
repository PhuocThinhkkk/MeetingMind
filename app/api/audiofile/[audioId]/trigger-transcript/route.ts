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
    const audioDuration = await getStorageFileSize(BUCKET_NAME, path)
    const { allowed, reason } = checkFileSizeAllowed({
      plan,
      fileSeconds: audioDuration,
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
