import { Info, AlertTriangle, Lightbulb, MessageSquare } from "lucide-react"

type CalloutVariant = "info" | "warning" | "tip" | "note"

const variants: Record<CalloutVariant, { icon: any; border: string; bg: string; iconColor: string }> = {
  info: {
    icon: Info,
    border: "border-blue-500/40",
    bg: "bg-blue-500/5",
    iconColor: "text-blue-500",
  },
  warning: {
    icon: AlertTriangle,
    border: "border-amber-500/40",
    bg: "bg-amber-500/5",
    iconColor: "text-amber-500",
  },
  tip: {
    icon: Lightbulb,
    border: "border-emerald-500/40",
    bg: "bg-emerald-500/5",
    iconColor: "text-emerald-500",
  },
  note: {
    icon: MessageSquare,
    border: "border-purple-500/40",
    bg: "bg-purple-500/5",
    iconColor: "text-purple-500",
  },
}

interface CalloutProps {
  variant?: CalloutVariant
  title?: string
  children: React.ReactNode
}

export function Callout({ variant = "info", title, children }: CalloutProps) {
  const v = variants[variant]
  const Icon = v.icon
  return (
    <div className={`my-6 rounded-lg border-l-4 ${v.border} ${v.bg} p-4`}>
      <div className="flex gap-3">
        <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${v.iconColor}`} />
        <div className="min-w-0">
          {title && <p className="font-semibold text-foreground mb-1">{title}</p>}
          <div className="text-sm text-muted-foreground [&>p]:m-0">{children}</div>
        </div>
      </div>
    </div>
  )
}
