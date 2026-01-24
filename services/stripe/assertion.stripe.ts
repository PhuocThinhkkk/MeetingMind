import { StripeInvoiceRuntime, StripeSubscriptionRuntime } from "./types"

/**
 * Asserts that `sub` matches the runtime shape of a Stripe subscription and narrows its type to `StripeSubscriptionRuntime`.
 *
 * @param sub - Value to validate as a Stripe subscription runtime object
 * @throws Error if `sub` is not an object containing the required properties: `id`, `status`, `items` (with `items.data[0].current_period_end`) and `cancel_at_period_end`
 */
export function assertSubscriptionRuntime(
  sub: unknown
): asserts sub is StripeSubscriptionRuntime {
  if (
    !sub ||
    typeof sub !== "object" ||
    !("id" in sub) ||
    !("status" in sub) ||
    !("items" in sub) ||
    // @ts-ignore
  !("current_period_end" in sub.items.data[0]) ||
    !("cancel_at_period_end" in sub)
  ) {
    console.log("SUBSCRIPTION OBJECT: ", sub)
    // @ts-ignore
    console.log("Subscriptions items: ", sub.items.data)
    throw new Error("Invalid Stripe subscription runtime shape")
  }
}

/**
 * Validate that a runtime value conforms to the expected Stripe invoice shape and narrow its type.
 *
 * @param invoice - The runtime value to validate as a Stripe invoice
 * @throws Error if `invoice` is not an object or does not have a string `subscription` property
 */
export function assertInvoiceRuntime(
  invoice: unknown
): asserts invoice is StripeInvoiceRuntime {
  if (
    !invoice ||
    typeof invoice !== "object" ||
    !("subscription" in invoice) ||
    typeof (invoice as any).subscription !== "string"
  ) {
    console.log("INVOICE OBJECT: ", invoice)
    throw new Error("Invalid Stripe invoice runtime shape")
  }
}
