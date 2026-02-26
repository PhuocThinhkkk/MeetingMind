import { supabaseAdmin } from '@/lib/supabase-init/supabase-server'
import { GoogleTokenResponse } from '@/types/google-response/google.response.type'
import { EventItemRow } from '@/types/transcriptions/transcription.db'

interface RefreshedToken {
  access_token: string
  expires_in: number
  id_token: string
}
/**
 * Update the user's Google access token and expiry timestamp in the google_tokens table.
 *
 * @param userId - The user ID whose token record will be updated
 * @param refreshed - Refreshed token data containing `access_token` and `expires_in` (seconds)
 * @throws The Supabase error if the update fails
 */
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
/**
 * Fetches the Google token row for a given user.
 *
 * @returns The matching row from the `google_tokens` table for the provided `userId`
 */
export async function getTokenByUserId(userId: string) {
  const { data: token } = await supabaseAdmin
    .from('google_tokens')
    .select('*')
    .eq('user_id', userId)
    .single()

  return token
}
/**
 * Fetches a Google token row by its token ID.
 *
 * @param tokenId - The ID of the token to retrieve.
 * @returns The token row from the `google_tokens` table.
 * @throws Error if no token exists for the provided `tokenId`.
 */
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

/**
 * Mark an event record as added to Google Calendar in the database.
 *
 * @param event - The event row whose `id` will be updated to set `added_to_google_calendar` to `true`
 */
export async function updateEventAddedToGoogleInSupabase(event: EventItemRow) {
  await supabaseAdmin
    .from('events')
    .update({ added_to_google_calendar: true })
    .eq('id', event.id)
}

/**
 * Inserts or updates a user's Google OAuth tokens in the `google_tokens` table.
 *
 * @param userId - The Supabase user id to associate with the tokens
 * @param tokens - The Google token response containing `access_token`, `refresh_token`, and `expires_in`
 * @throws Will rethrow the Supabase error if the upsert operation fails
 */
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
