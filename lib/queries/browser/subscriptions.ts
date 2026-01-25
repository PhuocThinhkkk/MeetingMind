import { log } from '@/lib/logger'
import { Subscription } from '@/services/stripe/types'
import { supabase } from '@/lib/supabase-init/supabase-browser'

export async function getUserSubscription(userId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)

  if (error) {
    log.error('Supabase Error Details:', JSON.stringify(error, null, 2))
    log.error('Error fetching audio history from Supabase:', {
      error,
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    })
    throw error
  }
  return data[0]
}
export async function getUserPlan(userId: string) {
  const sub = await getUserSubscription(userId)
  return sub.status
}

export function getSubscriptionStatus(subscription: Subscription | null) {
  if (!subscription) {
    return { status: 'inactive', daysLeft: 0, alertColor: 'red' }
  }

  const periodEnd = new Date(subscription.current_period_end || '')
  const today = new Date()
  const daysLeft = Math.ceil(
    (periodEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  )

  let alertColor = 'green'
  if (daysLeft <= 3) alertColor = 'red'
  else if (daysLeft <= 7) alertColor = 'blue'

  return {
    status: subscription.status,
    daysLeft: Math.max(0, daysLeft),
    alertColor,
    isCanceled: subscription.cancel_at_period_end,
  }
}
