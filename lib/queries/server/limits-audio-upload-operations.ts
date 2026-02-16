import { PLANS } from '@/constains/limits'
import { PlanKey } from '@/constains/plans'
import { getCurrentMonthRange } from '@/lib/limits/current-month-range'
import { supabaseAdmin } from '@/lib/supabase-init/supabase-server'

/**
 * Calculate the total duration, in seconds, of a user's audio files created during the current month.
 *
 * @param userId - The ID of the user whose audio file durations will be aggregated
 * @returns The sum of the `duration` fields (in seconds) for the user's audio files created within the current month
 */
export async function getMonthlyUsageSeconds(userId: string) {
  const { start, end } = getCurrentMonthRange()

  const { data, error } = await supabaseAdmin
    .from('audio_files')
    .select('duration')
    .eq('user_id', userId)
    .gte('created_at', start)
    .lt('created_at', end)

  if (error) throw error

  const totalSeconds =
    data?.reduce((sum, file) => sum + (file.duration || 0), 0) || 0

  return totalSeconds
}

/**
 * Get the number of audio files a user uploaded during the current month.
 *
 * @param userId - The ID of the user to count uploads for
 * @returns The number of audio files the user uploaded during the current month
 * @throws The database error raised when the query fails
 */
export async function getMonthlyUploadCount(userId: string) {
  const { start, end } = getCurrentMonthRange()

  const { count, error } = await supabaseAdmin
    .from('audio_files')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', start)
    .lt('created_at', end)

  if (error) throw error

  return count || 0
}

/**
 * Determine the user's current plan key.
 *
 * @returns `PLANS.PRO` if the user's subscription status is `"active"` or `"trialing"`, `PLANS.FREE` if no subscription exists or for any other status.
 * @throws Propagates the Supabase query error if the database request fails.
 */
export async function getUserPlan(userId: string): Promise<PlanKey> {
  const { data, error } = await supabaseAdmin
    .from('subscriptions')
    .select('status')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error

  if (!data) return PLANS.FREE

  if (data.status === 'active' || data.status === 'trialing') {
    return PLANS.PRO
  }

  return PLANS.FREE
}