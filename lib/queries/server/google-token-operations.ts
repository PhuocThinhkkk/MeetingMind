import { supabaseAdmin } from '@/lib/supabase-init/supabase-server'
import { GoogleTokenResponse } from '@/types/google-response/google.response.type'
import { EventItemRow } from '@/types/transcriptions/transcription.db'

interface RefreshedToken {
  access_token: string
  expires_in: number
  id_token: string
}
export async function updateRefreshTokenSupabase(
  userId: string,
  refreshed: RefreshedToken
) {
  const { error } = await supabaseAdmin
    .from('google_tokens')
    .update({
      access_token: refreshed.access_token,
      expiry_date: Date.now() + refreshed.expires_in * 1000,
    })
    .eq('user_id', userId)

  if (error) {
    throw error
  }
}
export async function getTokenByUserId(userId: string) {
  const { data: token } = await supabaseAdmin
    .from('google_tokens')
    .select('*')
    .eq('user_id', userId)
    .single()

  return token
}
export async function getTokenById(tokenId: string) {
  const { data: token } = await supabaseAdmin
    .from('google_tokens')
    .select('*')
    .eq('id', tokenId)
    .single()

  if (!token) {
    throw new Error(`Token not found for tokenId:  ${tokenId}`)
  }
  return token
}

export async function updateEventAddedToGoogleInSupabase(event: EventItemRow) {
  await supabaseAdmin
    .from('events')
    .update({ added_to_google_calendar: true })
    .eq('id', event.id)
}

export async function createUserToken(
  userId: string,
  tokens: GoogleTokenResponse
) {
  const { error } = await supabaseAdmin.from('google_tokens').upsert(
    {
      user_id: userId,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: Date.now() + tokens.expires_in * 1000,
    },
    { onConflict: 'user_id' }
  )

  if (error) {
    throw error
  }
}
