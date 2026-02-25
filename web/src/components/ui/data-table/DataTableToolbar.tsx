import { cn } from "@/lib/utils"

interface DataTableToolbarProps {
  children: React.ReactNode
  className?: string
}

export function DataTableToolbar({ children, className }: DataTableToolbarProps) {
  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      {children}
    </div>
  )
}
