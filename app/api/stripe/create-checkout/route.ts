import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"

export async function POST(req: Request) {
    const priceId = process.env.STRIPE_PRO_PLAN_PRICE_ID

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-failed`,
  })

  return NextResponse.json({ url: session.url })
}

