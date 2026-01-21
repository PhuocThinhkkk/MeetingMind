import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import type Stripe from "stripe"

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")

  if (!sig) {
    return new NextResponse("Missing signature", { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    return new NextResponse("Webhook signature verification failed", {
      status: 400,
    })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session

    const customerId = session.customer as string
    const subscriptionId = session.subscription as string

    // Example:
    // await db.user.update({
    //   where: { stripeCustomerId: customerId },
    //   data: {
    //     subscriptionId,
    //     plan: "pro",
    //     isActive: true,
    //   },
    // })

    console.log("Subscription active:", subscriptionId)
  }

  return NextResponse.json({ received: true })
}
