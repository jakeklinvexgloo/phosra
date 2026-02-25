import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: React.ReactNode
  description?: string
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("flex items-end justify-between gap-4", className)}>
      <div>
        <h1 className="text-xl font-semibold text-foreground tracking-tight">{title}</h1>
        {description && (
          <p className="text-xs text-muted-foreground mt-1 tracking-wide uppercase">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
