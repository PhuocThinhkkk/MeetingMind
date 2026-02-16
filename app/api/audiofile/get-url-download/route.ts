import { NextRequest, NextResponse } from 'next/server'
import { getUserAuthInSupabaseToken } from '@/lib/supabase-auth-server'
import { log } from '@/lib/logger'
import { getSignedAudioUrl } from '@/lib/queries/server/storage-operations'
import { validateFilePathOwner } from '@/lib/validations/upload-validations'

export type GetUrlDownloadBody = {
  path: string
}

/**
 * Handle POST requests to return a signed download URL for an audio file owned by the authenticated user.
 *
 * @param req - The incoming NextRequest whose JSON body must contain `{ path: string }`.
 * @returns A NextResponse with `{ url }` and status 200 on success; `{ error: reason }` with status 401 when unauthorized; or `{ error: 'Server Error' }` with status 500 on unexpected failure.
 */
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