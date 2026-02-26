import { log } from '@/lib/logger'
import { Subscription } from '@/services/stripe/types'
import { supabase } from '@/lib/supabase-init/supabase-browser'

/**
 * Retrieve the subscription record for the given user from the subscriptions table.
 *
 * @param userId - The user's ID to query the subscriptions table.
 * @returns The user's subscription record from the subscriptions table, or `undefined` if none exists.
 * @throws The Supabase error object if the database query fails.
 */
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
/**
 * Retrieve a user's subscription status.
 *
 * @param userId - The user's id
 * @returns The subscription's status string
 */
export async function getUserPlan(userId: string) {
  const sub = await getUserSubscription(userId)
  return sub.status
}

/**
 * Compute a user-facing subscription status payload.
 *
 * @param subscription - The subscription record or `null`. Expected fields used: `current_period_end` (ISO date string), `status`, and `cancel_at_period_end`.
 * @returns An object with:
 *  - `status`: the subscription's status or `'inactive'` when `subscription` is `null`,
 *  - `daysLeft`: whole days remaining until `current_period_end`, clamped to `0` for past dates or when `subscription` is `null`,
 *  - `alertColor`: `'green'`, `'blue'`, or `'red'` indicating urgency (red if <= 3 days, blue if <= 7 days, green otherwise; `'red'` when `subscription` is `null`),
 *  - `isCanceled`: the `cancel_at_period_end` flag from the subscription (or `undefined` when `subscription` is `null`).
 */
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
