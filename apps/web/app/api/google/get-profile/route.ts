import { getTokenByUserId } from '@/modules/calendar/repository/server/google-token-operations'
import { getUserAuthInSupabaseToken } from '@/lib/supabase-auth-server'
import { refreshTokenIfExpired } from '@/modules/calendar/service/share/token-managements'
import { getGoogleUserProfile } from '@/modules/calendar/service/share/user-profile'
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
    const profile = await getGoogleUserProfile(access_token)
    return NextResponse.json(profile, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
