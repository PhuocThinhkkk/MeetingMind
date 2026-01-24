"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"


export default function PricingSection() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annually">("annually")

  const plans = [
    {
      name: "Starter",
      description: "Perfect for individuals and small teams",
      price: { monthly: 0, annually: 0 },
      cta: "Start for free",
      features: ["Up to 3 projects", "Basic tools", "Community support", "Standard templates", "Basic analytics"],
    },
    {
      name: "Professional",
      description: "Advanced features for growing teams",
      price: { monthly: 20, annually: 16 },
      cta: "Get started",
      features: [
        "Unlimited projects",
        "Advanced tools",
        "Priority support",
        "Custom templates",
        "Advanced analytics",
        "Team collaboration",
        "API access",
        "Custom integrations",
      ],
      featured: true,
    },
    {
      name: "Enterprise",
      description: "Complete solution for large organizations",
      price: { monthly: 200, annually: 160 },
      cta: "Contact sales",
      features: [
        "Everything in Professional",
        "Dedicated account manager",
        "24/7 phone support",
        "Custom onboarding",
        "Advanced security",
        "SSO integration",
        "Custom contracts",
        "White-label options",
      ],
    },
  ]

  async function fetchCheckoutSession(){
    try{
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        credentials: 'include',
      })
      if(!res.ok){
        throw new Error("SHIT!")
      }
      const { url } = await res.json()
      window.location.href = url

    }catch(e){
      console.error(e)
    }

  }

  return (
    <div className="w-full py-3 md:py-4">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">Plans & Pricing</Badge>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Choose the perfect plan
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Scale your operations with flexible pricing that grows with your team. Start free, upgrade when ready.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex rounded-lg border border-border bg-muted p-1">
            <button
              onClick={() => setBillingPeriod("annually")}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                billingPeriod === "annually"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Annually
            </button>
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                billingPeriod === "monthly"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`flex flex-col ${
                plan.featured
                  ? "md:scale-105 border-primary shadow-lg bg-primary text-primary-foreground"
                  : ""
              }`}
            >
              <CardHeader>
                <CardTitle className={plan.featured ? "text-primary-foreground" : ""}>
                  {plan.name}
                </CardTitle>
                <CardDescription
                  className={plan.featured ? "text-primary-foreground/80" : ""}
                >
                  {plan.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="mb-6">
                  <div className="text-4xl font-bold mb-1">
                    ${plan.price[billingPeriod]}
                  </div>
                  <p
                    className={`text-sm ${
                      plan.featured ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}
                  >
                    per {billingPeriod === "monthly" ? "month" : "year"}, per user
                  </p>
                </div>

                <Button
                  className="w-full mb-6"
                  variant={plan.featured ? "secondary" : "default"}
                  onClick={fetchCheckoutSession}
                >
                  {plan.cta}
                </Button>

                <div className="space-y-3 flex-1">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <svg
                        className="w-4 h-4 mt-0.5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 12 12"
                      >
                        <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" fill="none" />
                      </svg>
                      <span
                        className={`text-sm ${
                          plan.featured
                            ? "text-primary-foreground/90"
                            : "text-muted-foreground"
                        }`}
                      >
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}