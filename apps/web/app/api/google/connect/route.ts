import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import {
  getUserAuthInSupabaseToken,
  getUserFromAccessToken,
} from '@/lib/supabase-auth-server'

type OAuthStatePayload = {
  csrf: string
  userId: string
  redirectTo: string
  mobile: boolean
}

/**
 * Initiates Google OAuth2 authorization by generating a CSRF state, building the authorization URL, and redirecting the client to Google's consent screen.
 *
 * @returns A Next.js response that redirects to the Google OAuth2 authorization URL and includes an `httpOnly` cookie `google_oauth_state` containing the generated CSRF state (secure in production, SameSite=lax, path='/', maxAge=600 seconds).
 */
export async function GET(req: NextRequest) {
  const tokenFromQuery = req.nextUrl.searchParams.get('access_token')
  const user = tokenFromQuery
    ? await getUserFromAccessToken(tokenFromQuery)
    : await getUserAuthInSupabaseToken(req)
  if (!user?.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const csrf = crypto.randomBytes(16).toString('hex')
  const redirectTo =
    req.nextUrl.searchParams.get('redirect_to') ||
    process.env.REDIRECT_URL_AFTER_GOOGLE_INTEGRATION ||
    '/'
  const isMobile = req.nextUrl.searchParams.has('access_token')
  const statePayload: OAuthStatePayload = {
    csrf,
    userId: user.id,
    redirectTo,
    mobile: isMobile,
  }
  const state = Buffer.from(JSON.stringify(statePayload)).toString('base64url')

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
  if (!isMobile) {
    response.cookies.set('google_oauth_state', csrf, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 10,
    })
  }
  return response
}
