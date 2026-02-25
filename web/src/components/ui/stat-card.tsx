import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  label: string
  value: string | number
  icon?: LucideIcon
  iconColor?: string
  className?: string
}

export function StatCard({ label, value, icon: Icon, iconColor = "text-foreground/60", className }: StatCardProps) {
  return (
    <div className={cn("bg-card rounded-lg px-3.5 py-2.5 border border-border/50 hover:border-border transition-colors", className)}>
      <div className="flex items-center gap-2">
        {Icon && <Icon className={cn("w-3.5 h-3.5", iconColor)} />}
        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">{label}</span>
      </div>
      <div className="text-xl font-semibold tabular-nums mt-0.5 text-foreground">{value}</div>
    </div>
  )
}
