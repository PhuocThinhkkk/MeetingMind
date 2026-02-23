import { getEventById } from '@/lib/queries/server/events-operations'
import { getTokenByUserId } from '@/lib/queries/server/google-token-operations'
import { getUserAuthInSupabaseToken } from '@/lib/supabase-auth-server'
import { validateEventAndUserIdOnServer } from '@/lib/validations/event-validations'
import {
  addEventToGoogleCalendar,
  refreshTokenIfExpired,
} from '@/services/google-calendar/token-managements'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Adds the specified event to the authenticated user's Google Calendar using the `event_id` query parameter.
 *
 * @param req - Incoming NextRequest; must include `event_id` in the URL search params and an authenticated Supabase user session.
 * @returns A NextResponse whose JSON body is `{ success: true }` with status `201` on success; on failure a JSON `{ error: string }` with an appropriate status code (`400`, `403`, `404`, or `500`) describing the error.
 */
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
    const event = await getEventById(eventId)
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }
    const { allowed, reason } = await validateEventAndUserIdOnServer(
      user.id,
      event
    )
    if (!allowed) {
      return NextResponse.json({ error: reason }, { status: 403 })
    }
    await addEventToGoogleCalendar(access_token, event)
    return NextResponse.json({ success: true }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}