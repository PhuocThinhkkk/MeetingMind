import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { getSupabseAuthServer } from "@/lib/supabase-auth-server"

/**
 * Create a Stripe Checkout Session for the authenticated user and return the session URL.
 *
 * Creates a subscription-mode Checkout Session using the configured price ID and sets the
 * authenticated user's ID as `client_reference_id`. On success returns the session URL
 * suitable for redirecting the user to Stripe Checkout.
 *
 * @returns JSON with `url` containing the Stripe Checkout session URL on success; if no
 * authenticated user is present returns JSON with `error` and an HTTP 400 status.
 */
export async function POST(req: Request) {
    const priceId = process.env.STRIPE_PRO_PLAN_PRICE_ID
    const supabaseAuth = await getSupabseAuthServer()
    const { data: { user } } = await supabaseAuth.auth.getUser()
    if (!user){
      console.error("There was no user in the request auth!")
      console.log("supbase auth: ",supabaseAuth)
      return NextResponse.json({error: "Please sign in to do this"}, { status: 400 })
    }

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
    client_reference_id: user.id,
  })

  return NextResponse.json({ url: session.url })
}
