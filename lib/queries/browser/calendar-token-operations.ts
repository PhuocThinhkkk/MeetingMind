import { supabase } from '@/lib/supabase-init/supabase-browser'

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
