import { NextRequest, NextResponse } from 'next/server'
import { getUserAuthInSupabaseToken } from '@/lib/supabase-auth-server'
import { log } from '@/lib/logger'
import { getSignedAudioUrl } from '@/lib/queries/server/storage-operations'
import { validateFilePathOwner } from '@/lib/validations/upload-validations'

export type GetUrlDownloadBody = {
  path: string
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserAuthInSupabaseToken()
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { path }: GetUrlDownloadBody = await req.json()
    const { allowed, reason } = validateFilePathOwner(path, user.id)
    if (!allowed) {
      return NextResponse.json(
        {
          error: reason,
        },
        { status: 401 }
      )
    }

    const url = await getSignedAudioUrl(path)

    return NextResponse.json(
      {
        url,
      },
      { status: 200 }
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
