import { StripeInvoiceRuntime, StripeSubscriptionRuntime } from "./types"

export function assertSubscriptionRuntime(
  sub: unknown
): asserts sub is StripeSubscriptionRuntime {
  if (
    !sub ||
    typeof sub !== "object" ||
    !("id" in sub) ||
    !("status" in sub) ||
    !("items" in sub) ||
    !("current_period_end" in sub) ||
    !("cancel_at_period_end" in sub)
  ) {
    throw new Error("Invalid Stripe subscription runtime shape")
  }
}

export function assertInvoiceRuntime(
  invoice: unknown
): asserts invoice is StripeInvoiceRuntime {
  if (
    !invoice ||
    typeof invoice !== "object" ||
    !("subscription" in invoice) ||
    typeof (invoice as any).subscription !== "string"
  ) {
    throw new Error("Invalid Stripe invoice runtime shape")
  }
}

