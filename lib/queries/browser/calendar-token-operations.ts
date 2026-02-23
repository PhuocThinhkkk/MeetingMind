import { supabase } from '@/lib/supabase-init/supabase-browser'

/**
 * Retrieve the Google token record associated with the specified user ID.
 *
 * @param userId - The user identifier to look up in the `google_tokens` table.
 * @returns The matching token record from `google_tokens`.
 * @throws Error if no token is found for the provided `userId`.
 */
export async function getTokenByUserId(userId: string) {
  const { data: token } = await supabase
    .from('google_tokens')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!token) {
    throw new Error(`Token not found for userId:  ${userId}`)
  }
  return token
}