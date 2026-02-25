import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface DataTableEmptyProps {
  icon?: LucideIcon
  title?: string
  description: string
  action?: React.ReactNode
  colSpan: number
  className?: string
}

export function DataTableEmpty({ icon: Icon, title, description, action, colSpan, className }: DataTableEmptyProps) {
  return (
    <tr>
      <td colSpan={colSpan} className={cn("px-6 py-16 text-center", className)}>
        {Icon && (
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3 mx-auto">
            <Icon className="w-4 h-4 text-muted-foreground" />
          </div>
        )}
        {title && <h3 className="text-sm font-medium text-foreground mb-1">{title}</h3>}
        <p className="text-sm text-muted-foreground">{description}</p>
        {action && <div className="mt-4">{action}</div>}
      </td>
    </tr>
  )
}
