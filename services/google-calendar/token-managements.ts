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
/**
 * Exchange a Google OAuth refresh token for a refreshed token response.
 *
 * @param refreshToken - The Google OAuth refresh token to exchange.
 * @returns The refreshed token response containing `access_token`, `expires_in`, `scope`, `token_type`, and `id_token`.
 * @throws Error if the token endpoint responds with a non-OK status; the error message includes Google's `error_description` when available.
 */
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
/**
 * Creates an all-day Google Calendar event from an internal event and returns the created event resource.
 *
 * @param accessToken - OAuth2 access token with permission to manage the primary calendar
 * @param event - Internal event row to convert into an all-day Google Calendar event
 * @returns The created Google Calendar event resource
 * @throws Error when Google Calendar responds with a non-OK status; the error message contains the response body
 */
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
/**
 * Ensure and return a valid Google OAuth access token for the specified user.
 *
 * If the provided token is expired, exchanges the refresh token for a new access token and persists the refreshed token; otherwise returns the existing access token.
 *
 * @param userId - Supabase user ID whose token may be updated
 * @param token - Stored Google token row containing `access_token`, `refresh_token`, and `expiry_date`
 * @returns The valid access token string
 */
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
/**
 * Posts an event to the user's Google Calendar and marks that event as added in Supabase.
 *
 * @param accessToken - OAuth2 access token with permission to create calendar events
 * @param event - The EventItemRow to send to Google Calendar and to mark as added in Supabase
 */
export async function addEventToGoogleCalendar(
  accessToken: string,
  event: EventItemRow
) {
  await sendToGoogleCalendar(accessToken, event)
  await updateEventAddedToGoogleInSupabase(event)
}
