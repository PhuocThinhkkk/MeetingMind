import { NextRequest, NextResponse } from 'next/server'
import { getUserAuthInSupabaseToken } from '@/lib/supabase-auth-server'
import { log } from '@/lib/logger'
import { createAudioUploadUrl } from '@/lib/queries/server/audio-upload-operations'
import {
  getMonthlyUploadCount,
  getMonthlyUsageSeconds,
  getUserPlan,
} from '@/lib/queries/server/limits-audio-upload-operations'
import { checkTranscriptionAllowed } from '@/lib/limits/usage.limit'
export type CreateUrlUploadBody = {
  name: string
  duration: number
  size: number
  type: string
  isUpload: boolean
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserAuthInSupabaseToken()
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, duration, size, type, isUpload }: CreateUrlUploadBody =
      await req.json()

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
        { status: 403 }
      )
    }

    const result = await createAudioUploadUrl(
      { userId: user.id, fileName: name, fileType: type },
      isUpload
    )

    return NextResponse.json(result, { status: 201 })
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
