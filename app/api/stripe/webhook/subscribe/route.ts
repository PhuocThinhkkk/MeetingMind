import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import type Stripe from "stripe"
import { assertInvoiceRuntime, assertSubscriptionRuntime } from "@/services/stripe/assertion.stripe"
import { createStripeSubscription, deleteStripeSubscription, invoiceStripeSubscription, updateStripeSubscription } from "@/lib/queries/server/stripe-subscription-operations"

/**
 * Handle incoming Stripe webhook POST requests, verify the signature, and route relevant events to subscription and invoice handlers.
 *
 * Processes events such as `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, and `invoice.payment_failed`. Logs unhandled event types.
 *
 * @returns A NextResponse: JSON `{ received: true }` on successful processing; a 400 response for missing or invalid Stripe signature; a 500 response if event handling fails.
 */
export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")

  if (!sig) {
    return new NextResponse("Missing Stripe signature", { status: 400 })
  }
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error("Webhook verification failed:", err)
    return new NextResponse("Invalid signature", { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session

        if (
          typeof session.subscription !== "string" ||
          typeof session.customer !== "string"
        ) {
          console.log("checkout.session.completed: skipping non-subscription checkout session")
          break
        }

        const userId = session.client_reference_id
        if (!userId) {
          throw new Error("Missing client_reference_id (user_id)")
        }

        const subscription = await stripe.subscriptions.retrieve(session.subscription)
        console.log("CUSTOMER SESSION COMPLETED OBJECT: ", subscription)
        await createStripeSubscription(userId, subscription)
        console.log("SESSION COMPLETED EVENT")
        break
      }
      case "customer.subscription.created": {
        const subscription = event.data.object 
        assertSubscriptionRuntime(subscription)
        await updateStripeSubscription(subscription)
        console.log("CUSTOMER SUBSCRIPTION CREATED EVENT")
        break
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object 
        assertSubscriptionRuntime(subscription)
        await updateStripeSubscription(subscription)
        console.log("CUSTOMER UPDATED EVENT")
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        await deleteStripeSubscription(subscription)
        console.log("CUSTOMER DELETE EVENT")
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        assertInvoiceRuntime(invoice)
        await invoiceStripeSubscription(invoice)
        console.log("INVOICE PAYMENT FAILED EVENT")
        break
      }

      default:
        console.log("Unhandled event:", event.type)
    }
  } catch (err) {
    console.error("Webhook handler error:", err)
    return new NextResponse("Webhook handler failed", { status: 500 })
  }

  return NextResponse.json({ received: true })
}