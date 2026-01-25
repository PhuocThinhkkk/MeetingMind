'use client'

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

type PlanKey = 'free' | 'pro'

export default function PricingSection() {
  const { user } = useAuth()
  const [currentPlan, setCurrentPlan] = useState<PlanKey>('free')
  const [loading, setLoading] = useState(true)

  const plans = [
    {
      key: 'free' as PlanKey,
      name: 'Free',
      description: 'For trying things out',
      price: 0,
      features: [
        'Up to 3 hours of transcription / month',
        'Max 30 minutes per recording',
        'Basic translation tools',
        'Limited calendar usage',
      ],
      cta: 'Get started',
    },
    {
      key: 'pro' as PlanKey,
      name: 'Pro',
      description: 'Built for serious work',
      price: 14.99,
      features: [
        'All features unlocked',
        '50 hours of transcription / month',
        'Unlimited recording length',
        'Priority processing',
      ],
      cta: 'Upgrade to Pro',
      featured: true,
    },
  ]

  useEffect(() => {
    fetchUserPlan()
  }, [user?.id])

  async function fetchUserPlan() {
    try {
      if (!user) {
        setCurrentPlan('free')
        return
      }

      const sub = await getUserSubscription(user.id)

      if (sub?.status === 'active') {
        setCurrentPlan('pro')
      } else {
        setCurrentPlan('free')
      }
    } catch (e) {
      console.error(e)
      setCurrentPlan('free')
    } finally {
      setLoading(false)
    }
  }

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
            const isFreePlan = plan.key === 'free'
            const isProPlan = plan.key === 'pro'

            return (
              <Card
                key={plan.key}
                className={`relative flex flex-col rounded-2xl border transition-all ${
                  plan.featured
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
