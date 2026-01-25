'server-only'
import { log } from '@/lib/logger'
import {
  StripeInvoiceRuntime,
  StripeSubscriptionRuntime,
  Subscription,
} from '@/services/stripe/types'
import { supabaseAdmin } from '@/lib/supabase-init/supabase-server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'

/**
 * Create or upsert a subscription record for a user based on a Stripe subscription.
 *
 * @param userId - The application's user ID to associate with the subscription
 * @param subscription - The Stripe subscription object to persist
 * @throws The Supabase error returned when the upsert operation fails
 */

export async function createStripeSubscription(
  userId: string,
  subscription: Stripe.Subscription
) {
  const data = {
    user_id: userId,
    stripe_customer_id: subscription.customer as string,
    stripe_subscription_id: subscription.id,
    status: subscription.status,
    price_id: subscription.items.data[0].price.id,
    cancel_at_period_end: subscription.cancel_at_period_end,
  }

  const { error } = await supabaseAdmin.from('subscriptions').upsert(data, {
    onConflict: 'user_id',
  })
  if (error) throw error
}

/**
 * Update an existing subscription record with the latest Stripe subscription data.
 *
 * @param subscription - The Stripe subscription runtime object containing updated fields; `current_period_end` is stored as an ISO timestamp
 * @throws The Supabase error returned when the update operation fails
 */
export async function updateStripeSubscription(
  subscription: Stripe.Subscription
) {
  const { error } = await supabaseAdmin
    .from('subscriptions')
    .update({
      status: subscription.status,
      price_id: subscription.items.data[0].price.id,
      current_period_end: new Date(
        subscription.items.data[0].current_period_end * 1000
      ).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
    })
    .eq('stripe_subscription_id', subscription.id)
  if (error) throw error
}

/**
 * Mark a Stripe subscription record as canceled in the database.
 *
 * Updates the `subscriptions` row for the provided Stripe subscription ID to set `status` to `"canceled"` and `cancel_at_period_end` to `false`.
 *
 * @param subscription - The Stripe subscription whose corresponding database record will be marked canceled
 * @throws The Supabase error returned when the update operation fails
 */
export async function deleteStripeSubscription(
  subscription: Stripe.Subscription
) {
  const { error } = await supabaseAdmin
    .from('subscriptions')
    .update({
      status: 'canceled',
      cancel_at_period_end: false,
    })
    .eq('stripe_subscription_id', subscription.id)
  if (error) throw error
}

/**
 * Mark the subscription referenced by the invoice as past due in the database.
 *
 * @param invoice - Stripe invoice object containing the `subscription` ID to update
 * @throws The Supabase error returned if the update operation fails
 */
export async function invoiceStripeSubscription(invoice: StripeInvoiceRuntime) {
  const { error } = await supabaseAdmin
    .from('subscriptions')
    .update({
      status: 'past_due',
    })
    .eq('stripe_subscription_id', invoice.subscription)
  if (error) throw error
}

/**
 * Retrieve the subscription record for a specific user from the server-side database.
 *
 * @param userId - The user's ID to look up in the subscriptions table
 * @returns The subscription row for the user, or `undefined` if no subscription exists
 * @throws The Supabase error object if the database query fails
 */
export async function getUserSubscriptionServer(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)

  if (error) {
    log.error('Supabase Error Details:', JSON.stringify(error, null, 2))
    throw error
  }
  return data[0]
}

/**
 * Sets a subscription to cancel at the end of its current period in Stripe.
 *
 * @param sub - Local subscription record containing `stripe_subscription_id` used to identify the Stripe subscription to update.
 * @returns The updated Stripe subscription object.
 */
export async function updateCancelSubscription(sub: Subscription) {
  const subscription = await stripe.subscriptions.update(
    sub.stripe_subscription_id,
    {
      cancel_at_period_end: true,
    }
  )
  return subscription
}
/**
 * Resume a Stripe subscription by unsetting its cancel-at-period-end flag.
 *
 * @param sub - Subscription record containing a valid `stripe_subscription_id` for the Stripe subscription to resume
 * @returns The updated Stripe subscription object
 */
export async function updateResumeSubscription(sub: Subscription) {
  return stripe.subscriptions.update(sub.stripe_subscription_id, {
    cancel_at_period_end: false,
  })
}