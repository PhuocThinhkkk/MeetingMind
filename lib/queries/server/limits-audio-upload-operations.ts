import { PLANS } from '@/constains/limits'
import { PlanKey } from '@/constains/plans'
import { getCurrentMonthRange } from '@/lib/limits/current-month-range'
import { supabaseAdmin } from '@/lib/supabase-init/supabase-server'

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
