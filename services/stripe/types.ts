import Stripe from "stripe"
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
