import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

/**
 * Initiates Google OAuth2 authorization by generating a CSRF state, building the authorization URL, and redirecting the client to Google's consent screen.
 *
 * @returns A Next.js response that redirects to the Google OAuth2 authorization URL and includes an `httpOnly` cookie `google_oauth_state` containing the generated CSRF state (secure in production, SameSite=lax, path='/', maxAge=600 seconds).
 */
export async function GET(req: NextRequest) {
  // Generate CSRF protection state
  const state = crypto.randomBytes(16).toString('hex')

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CALENDAR_CLIENT_ID!,
    redirect_uri: process.env.GOOGLE_CALENDAR_REDIRECT_URI!,
    response_type: 'code',
    scope: [
      'openid',
      'email',
      'profile',
      'https://www.googleapis.com/auth/calendar',
    ].join(' '),
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'true',
    state,
  })

  const url = `https://accounts.google.com/o/oauth2/v2/auth?${params}`

  const response = NextResponse.redirect(url)

  // Store state in cookie to verify in callback
  response.cookies.set('google_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 10, // 10 minutes,
  })
  return response
}