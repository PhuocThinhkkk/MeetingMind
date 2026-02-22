import { log } from '@/lib/logger'
import { getUserAuthInSupabaseToken } from '@/lib/supabase-auth-server'
import { supabaseAdmin } from '@/lib/supabase-init/supabase-server'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

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

  const user = await getUserAuthInSupabaseToken()

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

  const tokens = await tokenRes.json()

  if (!tokens.access_token) {
    log.error('Invalid token response:', tokens)
    return NextResponse.json(
      { error: 'Invalid token response from Google' },
      { status: 500 }
    )
  }

  await supabaseAdmin.from('google_tokens').upsert({
    user_id: user!.id,
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expiry_date: Date.now() + tokens.expires_in * 1000,
  })
  const redirect_url = process.env.REDIRECT_URL_AFTER_GOOGLE_INTEGRATION
  if (!redirect_url) {
    log.error('redirect url not found!')
    return NextResponse.json({ error: 'Server Error' }, { status: 500 })
  }
  return Response.redirect(redirect_url)
}
