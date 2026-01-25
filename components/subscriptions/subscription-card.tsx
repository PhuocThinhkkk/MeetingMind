"use client";

import { Subscription } from "@/services/stripe/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

type SubscriptionCardProps = {
  subscription: Subscription | null;
};

export function SubscriptionCard({ subscription }: SubscriptionCardProps) {
  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Active Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You don't have an active subscription. Upgrade to access premium
            features.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="mt-1 font-medium capitalize">{subscription.status}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Plan ID</p>
            <p className="mt-1 font-medium font-mono text-sm">
              {subscription.price_id}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Billing Period</p>
            <p className="mt-1 font-medium">
              {subscription.current_period_end
                ? format(new Date(subscription.current_period_end), "MMM dd, yyyy")
                : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Customer ID</p>
            <p className="mt-1 font-medium font-mono text-sm">
              {subscription.stripe_customer_id.slice(0, 20)}...
            </p>
          </div>
        </div>
        {subscription.cancel_at_period_end && (
          <div className="rounded-md bg-yellow-50 p-3 dark:bg-yellow-950">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              This subscription is scheduled to cancel at the end of the current billing period.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
