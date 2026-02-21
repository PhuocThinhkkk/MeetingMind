import {
  EventItemRow,
  GoogleTokenRow,
} from '@/types/transcriptions/transcription.db'
import { toAllDayEvent } from './utils'
import {
  updateEventAddedToGoogleInSupabase,
  updateRefreshTokenSupabase,
} from '@/lib/queries/server/google-token-operations'

export async function refreshAccessToken(refreshToken: string) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.GOOGLE_CALENDAR_CLIENT_ID,
      client_secret: process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })

  return res.json()
}

export async function sendToGoogleCalendar(
  accessToken: string,
  event: EventItemRow
) {
  const googleEvent = toAllDayEvent(event)

  await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(googleEvent),
    }
  )
}
export async function refreshTokenIfExpired(token: GoogleTokenRow) {
  let accessToken = token.access_token
  if (Date.now() > token.expiry_date) {
    const refreshed = await refreshAccessToken(token.refresh_token)

    accessToken = refreshed.access_token
    updateRefreshTokenSupabase(refreshed)
  }
  return accessToken
}
export async function addEventToGoogleCalendar(
  accessToken: string,
  event: EventItemRow
) {
  await sendToGoogleCalendar(accessToken, event)
  await updateEventAddedToGoogleInSupabase(event)
}
