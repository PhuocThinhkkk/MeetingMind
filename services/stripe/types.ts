import Stripe from 'stripe'
export type StripeSubscriptionRuntime = {
  id: string
  customer: string | Stripe.Customer
  status: Stripe.Subscription.Status
  items: Stripe.ApiList<Stripe.SubscriptionItem>
  current_period_start: number
  cancel_at_period_end: boolean
}

export type StripeInvoiceRuntime = {
  subscription: string
}
export type Subscription = {
  cancel_at_period_end: boolean
  created_at: string
  current_period_end: string | null
  id: string
  price_id: string
  status: string
  stripe_customer_id: string
  stripe_subscription_id: string
  updated_at: string
  user_id: string
}
