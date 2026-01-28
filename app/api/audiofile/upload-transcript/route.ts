import { NextRequest, NextResponse } from 'next/server'
import { getUserAuthInSupabaseToken } from '@/lib/supabase-auth-server'
import { log } from '@/lib/logger'
import { validateAudioFile } from '@/services/audio-upload/audio-validation'
import { uploadAudioFile } from '@/lib/queries/server/audio-upload-operations'
import { createAssemblyAudioUploadWithWebhook } from '@/services/audio-upload/assembly-webhook'

export async function POST(req: NextRequest) {
  try {
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

    return NextResponse.json({
      audio_id: audio.id,
      status: 'processing',
    })
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
