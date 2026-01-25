"use client";

import { AlertCircle, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type StatusAlertProps = {
  status: "active" | "inactive" | "canceled";
  daysLeft: number;
  alertColor: "green" | "blue" | "red";
  isCanceled?: boolean;
};

export function SubscriptionStatusAlert({
  status,
  daysLeft,
  alertColor,
  isCanceled = false,
}: StatusAlertProps) {
  const getAlertStyles = () => {
    switch (alertColor) {
      case "green":
        return {
          bg: "bg-green-50 dark:bg-green-950",
          border: "border-green-200 dark:border-green-800",
          icon: "text-green-600 dark:text-green-400",
          text: "text-green-800 dark:text-green-200",
          label: "text-green-700 dark:text-green-300",
        };
      case "blue":
        return {
          bg: "bg-blue-50 dark:bg-blue-950",
          border: "border-blue-200 dark:border-blue-800",
          icon: "text-blue-600 dark:text-blue-400",
          text: "text-blue-800 dark:text-blue-200",
          label: "text-blue-700 dark:text-blue-300",
        };
      case "red":
        return {
          bg: "bg-red-50 dark:bg-red-950",
          border: "border-red-200 dark:border-red-800",
          icon: "text-red-600 dark:text-red-400",
          text: "text-red-800 dark:text-red-200",
          label: "text-red-700 dark:text-red-300",
        };
    }
  };

  const styles = getAlertStyles();

  const getStatusMessage = () => {
    if (isCanceled) {
      return `Your subscription is set to cancel on ${new Date(Date.now() + daysLeft * 24 * 60 * 60 * 1000).toLocaleDateString()}`;
    }
    if (alertColor === "red") {
      return `Your subscription expires in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}`;
    }
    if (alertColor === "blue") {
      return `Your subscription expires in ${daysLeft} days`;
    }
    return `Your subscription is active and in good standing`;
  };

  const getIcon = () => {
    if (isCanceled) return <Clock className="h-5 w-5" />;
    if (alertColor === "red") return <AlertCircle className="h-5 w-5" />;
    return <CheckCircle className="h-5 w-5" />;
  };

  return (
    <div
      className={cn(
        "w-full rounded-lg border-2 p-4",
        styles.bg,
        styles.border
      )}
    >
      <div className="flex items-start gap-3">
        <div className={styles.icon}>{getIcon()}</div>
        <div className="flex-1">
          <h3 className={cn("text-sm font-semibold", styles.label)}>
            {isCanceled ? "Subscription Ending" : "Subscription Status"}
          </h3>
          <p className={cn("mt-1 text-sm", styles.text)}>
            {getStatusMessage()}
          </p>
        </div>
      </div>
    </div>
  );
}
