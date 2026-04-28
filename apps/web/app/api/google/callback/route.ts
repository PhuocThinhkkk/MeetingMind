import { log } from '@/utils/logger'
import { createUserToken } from '@/modules/calendar/repository/server/google-token-operations'
import { getUserAuthInSupabaseToken } from '@/lib/supabase-auth-server'
import { GoogleTokenResponse } from '@/types/google-response/google.response.type'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

type OAuthStatePayload = {
  csrf: string
  userId: string
  redirectTo: string
  mobile?: boolean
}

/**
 * Handle Google's OAuth callback: validate state, exchange the authorization code for tokens,
 * persist the tokens for the authenticated user, and redirect to the configured URL on success.
 *
 * @param req - Incoming request containing OAuth callback query parameters `code`, `state`, and `error`
 * @returns A Response that redirects to the configured post-integration URL on success, or a JSON error response with an appropriate HTTP status on failure
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const encodedState = searchParams.get('state')
  const storedState = (await cookies()).get('google_oauth_state')?.value

  if (!encodedState) {
    return NextResponse.json(
      { error: 'Invalid state parameter' },
      { status: 400 }
    )
  }

  let state: OAuthStatePayload | null = null
  try {
    state = JSON.parse(
      Buffer.from(encodedState, 'base64url').toString('utf8')
    ) as OAuthStatePayload
  } catch (parseError) {
    log.error('Invalid OAuth state payload', parseError)
    return NextResponse.json(
      { error: 'Invalid state parameter' },
      { status: 400 }
    )
  }

  const isMobile = Boolean(state.mobile)
  if (!state?.csrf || !state.userId || !state.redirectTo) {
    return NextResponse.json(
      { error: 'Invalid state parameter' },
      { status: 400 }
    )
  }
  if (!isMobile && (!storedState || storedState !== state.csrf)) {
    return NextResponse.json(
      { error: 'Invalid state parameter' },
      { status: 400 }
    )
  }

  if (error) {
    log.error('OAuth error:', error)
    return NextResponse.json(
      { error: 'OAuth authorization failed' },
      { status: 400 }
    )
  }

  if (!code) {
    log.error('Missing authorization code')
    return NextResponse.json(
      { error: 'Missing authorization code' },
      { status: 400 }
    )
  }

  let userId = state.userId
  if (!isMobile) {
    const user = await getUserAuthInSupabaseToken()
    if (!user?.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    userId = user.id
  }

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code,
      client_id: process.env.GOOGLE_CALENDAR_CLIENT_ID,
      client_secret: process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_CALENDAR_REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  })

  if (!tokenRes.ok) {
    const errorBody = await tokenRes.text()
    log.error('Token exchange failed:', errorBody)
    return NextResponse.json(
      { error: 'Failed to exchange authorization code' },
      { status: 500 }
    )
  }

  const tokens = (await tokenRes.json()) as GoogleTokenResponse

  if (!tokens.access_token) {
    log.error('Invalid token response:', tokens)
    return NextResponse.json(
      { error: 'Invalid token response from Google' },
      { status: 500 }
    )
  }

  await createUserToken(userId, tokens)

  return Response.redirect(state.redirectTo)
}
