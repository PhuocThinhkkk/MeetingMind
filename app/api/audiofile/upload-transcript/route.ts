import { NextRequest, NextResponse } from 'next/server'
import { getUserAuthInSupabaseToken } from '@/lib/supabase-auth-server'
import { log } from '@/lib/logger'
import { validateAudioFile } from '@/services/audio-upload/audio-validation'
import { uploadAudioFile } from '@/lib/queries/server/audio-upload-operations'
import { createAssemblyAudioUploadWithWebhook } from '@/services/audio-upload/assembly-webhook'

export async function POST(req: NextRequest) {
  const user = await getUserAuthInSupabaseToken()
  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('audio_file') as File | null

  validateAudioFile(file)
  const audio = await uploadAudioFile(user.id, file)

  const job = await createAssemblyAudioUploadWithWebhook(audio)
  log.info('Jobs of uploading file: ', job)

  if (!audio) {
    log.error('No audio found after insert, maybe internal error.')

    return NextResponse.json(
      {
        error: 'No audio found',
      },
      { status: 404 }
    )
  }

  return NextResponse.json({
    audio_id: audio.id,
    status: 'processing',
  })
}
