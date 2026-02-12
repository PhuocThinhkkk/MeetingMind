import { NextRequest, NextResponse } from 'next/server'
import { getUserAuthInSupabaseToken } from '@/lib/supabase-auth-server'
import { log } from '@/lib/logger'
import {
  getStorageFileSize,
  insertAudioFile,
} from '@/lib/queries/server/audio-upload-operations'
import { createAssemblyAudioUploadWithWebhook } from '@/services/audio-upload/assembly-webhook'
import { getUserPlan } from '@/lib/queries/server/limits-audio-upload-operations'
import { checkFileSizeAllowed } from '@/lib/limits/usage.limit'
import { getSignedAudioUrl } from '@/lib/queries/server/storage-operations'

export type TriggerTranscriptBody = {
  path: string
  type: string
  name: string
  size: number
  duration: number
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserAuthInSupabaseToken()
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { path, type, name, size, duration }: TriggerTranscriptBody =
      await req.json()
    const sizeInStorage = await getStorageFileSize('audio-files', path)
    log.info('audio size: ', { sizeInStorage, size })
    const plan = await getUserPlan(user.id)
    const { allowed, reason } = checkFileSizeAllowed({
      plan,
      fileSeconds: sizeInStorage,
    })
    if (!allowed) {
      return NextResponse.json({ error: reason }, { status: 401 })
    }

    const url = await getSignedAudioUrl(path)
    const job = await createAssemblyAudioUploadWithWebhook(url)
    log.info('Jobs of uploading file: ', job)
    const dataInsert = {
      user_id: user.id,
      name: name,
      file_size: size,
      duration,
      mine_tyep: type,
      path: path,
      assembly_job_id: job.id,
      transcription_status: 'processing',
    }
    const audio = await insertAudioFile(dataInsert)

    return NextResponse.json(
      {
        audio_id: audio.id,
        audio,
        status: 'processing',
      },
      { status: 201 }
    )
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
