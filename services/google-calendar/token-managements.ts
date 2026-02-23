import {
  EventItemRow,
  GoogleTokenRow,
} from '@/types/transcriptions/transcription.db'
import { toAllDayEvent } from './utils'
import {
  updateEventAddedToGoogleInSupabase,
  updateRefreshTokenSupabase,
} from '@/lib/queries/server/google-token-operations'

export type GoogleRefreshTokenResponse = {
  access_token: string
  expires_in: number
  scope: string
  token_type: 'Bearer'
  id_token: string
}
export async function refreshAccessToken(
  refreshToken: string
): Promise<GoogleRefreshTokenResponse> {
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

  if (!res.ok) {
    const error = await res.json()
    throw new Error(
      `Failed to refresh token: ${error.error_description ?? res.statusText}`
    )
  }

  const data = await res.json()
  return data as GoogleRefreshTokenResponse
}

export type GoogleCalendarEventResponse = {
  id: string
  summary?: string
  description?: string
  status: 'confirmed' | 'tentative' | 'cancelled'
  htmlLink: string
  created: string
  updated: string
  start?: {
    date?: string
    dateTime?: string
    timeZone?: string
  }
  end?: {
    date?: string
    dateTime?: string
    timeZone?: string
  }
}
export async function sendToGoogleCalendar(
  accessToken: string,
  event: EventItemRow
) {
  const googleEvent = toAllDayEvent(event)

  const res = await fetch(
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
  if (!res.ok) {
    const errorBody = await res.text()
    throw new Error(`Google Calendar error: ${errorBody}`)
  }

  const data = await res.json()
  return data as GoogleCalendarEventResponse
}
export async function refreshTokenIfExpired(
  userId: string,
  token: GoogleTokenRow
) {
  let accessToken = token.access_token
  if (Date.now() > token.expiry_date) {
    const refreshed = await refreshAccessToken(token.refresh_token)

    accessToken = refreshed.access_token
    await updateRefreshTokenSupabase(userId, refreshed)
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
