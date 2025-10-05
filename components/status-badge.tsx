import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, XCircle } from "lucide-react"

type StatusBadgeProps = {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    completed: {
      label: "Completed",
      variant: "default" as const,
      icon: CheckCircle2,
      className: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
    },
    processing: {
      label: "Processing",
      variant: "secondary" as const,
      icon: Clock,
      className: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    },
    failed: {
      label: "Failed",
      variant: "destructive" as const,
      icon: XCircle,
      className: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
    },
  }

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.processing
  const Icon = config.icon

  return (
    <Badge variant={config.variant} className={`flex items-center gap-1 ${config.className}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  )
}

