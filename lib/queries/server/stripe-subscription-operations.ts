import { StripeInvoiceRuntime, StripeSubscriptionRuntime } from "@/services/stripe/types";
import { supabaseAdmin } from "@/lib/supabase-init/supabase-server";
import Stripe from "stripe";

export async function createStripeSubscription(userId: string, subscription: Stripe.Subscription){
            const data = {
              user_id: userId,
              stripe_customer_id: subscription.customer as string,
export async function createStripeSubscription(userId: string, subscription: Stripe.Subscription){
  const { error } = await supabaseAdmin
          .from("subscriptions")
          .upsert(
            {
              user_id: userId,
              stripe_customer_id: subscription.customer as string,
              stripe_subscription_id: subscription.id,
              status: subscription.status,
              price_id: subscription.items.data[0].price.id,
              cancel_at_period_end: subscription.cancel_at_period_end,
            },
            {
              onConflict: "stripe_subscription_id",
            }
          )
  if (error) throw error
}


export async function updateStripeSubscription(subscription: StripeSubscriptionRuntime){
        const { error } = await supabaseAdmin
          .from("subscriptions")
          .update({
            status: subscription.status,
            price_id: subscription.items.data[0].price.id,
            current_period_end: new Date(
              subscription.current_period_end * 1000
            ).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
          })
          .eq("stripe_subscription_id", subscription.id)
        if (error) throw error
 }

export async function deleteStripeSubscription(subscription: Stripe.Subscription){
        const { error } = await supabaseAdmin
          .from("subscriptions")
          .update({
            status: "canceled",
            cancel_at_period_end: false,
          })
          .eq("stripe_subscription_id", subscription.id)
        if (error) throw error
        }

export async function invoiceStripeSubscription(invoice: StripeInvoiceRuntime){
        const { error } = await supabaseAdmin
          .from("subscriptions")
          .update({
            status: "past_due",
          })
          .eq("stripe_subscription_id", invoice.subscription)
        if (error) throw error
        }