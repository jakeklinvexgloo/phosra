import { cn } from "@/lib/utils"

interface DataTableProps {
  children: React.ReactNode
  className?: string
}

export function DataTable({ children, className }: DataTableProps) {
  return (
    <div className={cn("plaid-card-flush overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          {children}
        </table>
      </div>
    </div>
  )
}
