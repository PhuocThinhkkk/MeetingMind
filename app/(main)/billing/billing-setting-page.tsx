'use client'

import { log } from '@/lib/logger'
import { useEffect, useState } from 'react'
import { SubscriptionCard } from '@/components/subscriptions/subscription-card'
import { SubscriptionStatusAlert } from '@/components/subscriptions/subscription-status-alert'
import { CancelSubscriptionButton } from '@/components/subscriptions/cancel-subscription-button'
import {
  getSubscriptionStatus,
  getUserSubscription,
} from '@/lib/queries/browser/subscriptions'
import { Subscription } from '@/services/stripe/types'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { ResumeSubscriptionButton } from '@/components/subscriptions/resume-subscription-button'

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    fetchSubscription()
  }, [user])
  async function fetchSubscription() {
    try {
      setIsLoading(true)
      setError(null)
      if (!user) return

      const userId = user.id
      const sub = await getUserSubscription(userId)
      log.info('subscription object: ', sub)
      setSubscription(sub)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An error occurred while fetching'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const subscriptionStatus = getSubscriptionStatus(subscription)

  log.info('subscription status: ', subscriptionStatus)
  return (
    <div className="container mx-auto px-4 ">
      <p className="py-4 text-muted-foreground">
        View and manage your subscription details
      </p>
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          <p className="font-medium">Error loading subscription</p>
          <p className="text-sm">{error}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Status Alert */}
          <SubscriptionStatusAlert
            status={
              subscriptionStatus.status === 'active'
                ? 'active'
                : subscriptionStatus.status === 'canceled'
                  ? 'canceled'
                  : 'inactive'
            }
            daysLeft={subscriptionStatus.daysLeft}
            alertColor={
              subscriptionStatus.alertColor as 'green' | 'blue' | 'red'
            }
            isCanceled={subscriptionStatus.isCanceled}
          />

          {/* Subscription Details */}
          <SubscriptionCard subscription={subscription} />

          {/* Action Buttons */}
          {subscription && subscription.status === 'active' && (
            <div className="flex flex-col gap-3 sm:flex-row">
              {!subscriptionStatus.isCanceled ? (
                <CancelSubscriptionButton
                  subscriptionId={subscription.id}
                  onCancelSuccess={() => {
                    window.location.reload()
                  }}
                />
              ) : (
                <ResumeSubscriptionButton
                  subscriptionId={subscription.id}
                  onResumeSuccess={() => {
                    window.location.reload()
                  }}
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
