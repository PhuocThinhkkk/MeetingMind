import { getTokenByUserId } from '@/lib/queries/server/google-token-operations'
import { getUserAuthInSupabaseToken } from '@/lib/supabase-auth-server'
import { refreshTokenIfExpired } from '@/services/google-calendar/token-managements'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const user = await getUserAuthInSupabaseToken()
    if (!user?.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const token = await getTokenByUserId(user.id)
    if (!token) {
      return NextResponse.json(
        { error: 'Google account not connected' },
        { status: 400 }
      )
    }

    const access_token = await refreshTokenIfExpired(user.id, token)
    if (!access_token) {
      return NextResponse.json(
        { error: 'Failed to refresh token' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
