'use client'
import { log } from '@/lib/logger'

import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Sparkles } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { getUserSubscription } from '@/lib/queries/browser/subscriptions'
import { plans, PlanKey } from '@/constains/plans'
import { PLANS } from '@/constains/limits'



export default function PricingSection() {
  const { user } = useAuth()
  const [currentPlan, setCurrentPlan] = useState<PlanKey>(PLANS.FREE)
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    fetchUserPlan()
  }, [user?.id])

  /**
   * Fetches the current user's subscription and updates component state accordingly.
   *
   * If there is no authenticated user, sets the plan to PLANS.FREE and returns early. Otherwise,
   * retrieves the user's subscription and sets the current plan to PLANS.PRO when the subscription
   * status is 'active', or to PLANS.FREE otherwise. On error, logs the failure and sets the plan to
   * PLANS.FREE. Always marks loading as finished when complete.
   */
  async function fetchUserPlan() {
    try {
      if (!user) {
        setCurrentPlan(PLANS.FREE)
        return
      }

      const sub = await getUserSubscription(user.id)

      if (sub?.status === 'active') {
        setCurrentPlan(PLANS.PRO)
      } else {
        setCurrentPlan(PLANS.FREE)
      }
    } catch (e) {
      log.error("Error when fetching user plan: ", e)
      setCurrentPlan(PLANS.FREE)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Initiates a Stripe checkout session and redirects the browser to the returned checkout URL.
   *
   * Sends a POST request to '/api/stripe/create-checkout' with credentials included, extracts the `url`
   * field from the JSON response, and sets `window.location.href` to navigate to the checkout page.
   */
  async function fetchCheckoutSession() {
    const res = await fetch('/api/stripe/create-checkout', {
      method: 'POST',
      credentials: 'include',
    })

    const { url } = await res.json()
    window.location.href = url
  }

  if (loading) return null

  return (
    <section className="relative w-full py-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-14">
          <Badge variant="outline" className="mb-4">
            Pricing
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Start free, upgrade when you need more power. No hidden fees.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {plans.map(plan => {
            const isCurrentPlan = currentPlan === plan.key
            const isFreePlan = plan.key === PLANS.FREE
            const isProPlan = plan.key === PLANS.PRO

            return (
              <Card
                key={plan.key}
                className={`relative flex flex-col rounded-2xl border transition-all ${plan.featured
                  ? 'border-primary/50 shadow-lg'
                  : 'border-border'
                  } ${isCurrentPlan ? 'ring-2 ring-primary' : ''}`}
              >
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="gap-1">
                      <Sparkles className="w-3 h-3" /> Most popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="flex flex-col flex-1">
                  {/* Price */}
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold">${plan.price}</div>
                    <p className="text-sm text-muted-foreground">per month</p>
                  </div>

                  {isCurrentPlan ? (
                    <Button disabled variant="secondary" className="mb-6">
                      Current plan
                    </Button>
                  ) : isFreePlan ? (
                    <Button disabled variant="outline" className="mb-6">
                      Included
                    </Button>
                  ) : (
                    <Button onClick={fetchCheckoutSession} className="mb-6">
                      Upgrade to Pro
                    </Button>
                  )}

                  <ul className="space-y-3 mt-auto">
                    {plan.features.map(feature => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="w-4 h-4 text-primary mt-1" />
                        <span className="text-sm text-muted-foreground">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}