import { cn } from "@/lib/utils"

interface DataTableFooterProps {
  showing: number
  total: number
  children?: React.ReactNode
  className?: string
}

export function DataTableFooter({ showing, total, children, className }: DataTableFooterProps) {
  return (
    <div className={cn("px-4 py-3 border-t border-border flex items-center justify-between text-sm text-muted-foreground", className)}>
      <span>Showing {showing} of {total}</span>
      {children}
    </div>
  )
}
