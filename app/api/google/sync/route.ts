import { getEventById } from '@/lib/queries/server/events-operations'
import { getTokenByUserId } from '@/lib/queries/server/google-token-operations'
import { getUserAuthInSupabaseToken } from '@/lib/supabase-auth-server'
import {
  addEventToGoogleCalendar,
  refreshTokenIfExpired,
} from '@/services/google-calendar/token-managements'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const eventId = searchParams.get('event_id')
    if (!eventId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const user = await getUserAuthInSupabaseToken()
    if (!user?.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const token = await getTokenByUserId(user.id)
    const access_token = await refreshTokenIfExpired(token)
    const event = await getEventById(eventId)
    await addEventToGoogleCalendar(access_token, event)

    return Response.json({ success: true }, { status: 201 })
  } catch (e) {
    return Response.json({ error: 'Sever error' }, { status: 500 })
  }
}
