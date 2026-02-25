import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface EmptyStateProps {
  icon?: LucideIcon
  title?: string
  description: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center py-16 text-center", className)}>
      {Icon && (
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
      )}
      {title && <h2 className="text-lg font-medium text-foreground mb-1">{title}</h2>}
      <p className="text-sm text-muted-foreground max-w-md">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
