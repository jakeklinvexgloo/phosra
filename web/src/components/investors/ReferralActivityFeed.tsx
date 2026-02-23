"use client"

import { UserPlus, Eye, Scale } from "lucide-react"

interface ActivityItem {
  type: "invite_claimed" | "deck_viewed" | "safe_signed"
  actorName: string
  detail: string
  timestamp: string
}

const TYPE_ICONS = {
  invite_claimed: UserPlus,
  deck_viewed: Eye,
  safe_signed: Scale,
} as const

const TYPE_COLORS = {
  invite_claimed: "text-brand-green",
  deck_viewed: "text-blue-400",
  safe_signed: "text-amber-400",
} as const

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return "just now"
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHrs = Math.floor(diffMin / 60)
  if (diffHrs < 24) return `${diffHrs}h ago`
  const diffDays = Math.floor(diffHrs / 24)
  if (diffDays < 7) return `${diffDays}d ago`
  return new Date(dateStr).toLocaleDateString()
}

export default function ReferralActivityFeed({ activity }: { activity: ActivityItem[] }) {
  if (activity.length === 0) {
    return (
      <div className="glass-card rounded-xl p-6 text-center">
        <p className="text-xs text-white/30">No activity yet. Share an invite to get started!</p>
      </div>
    )
  }

  return (
    <div className="glass-card rounded-xl p-4 space-y-3">
      <p className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-2">Recent Activity</p>
      {activity.map((item, i) => {
        const Icon = TYPE_ICONS[item.type]
        const color = TYPE_COLORS[item.type]
        return (
          <div key={i} className="flex items-start gap-3">
            <div className={`mt-0.5 ${color}`}>
              <Icon className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white/70">
                <span className="text-white font-medium">{item.actorName}</span>{" "}
                {item.detail}
              </p>
            </div>
            <span className="text-[10px] text-white/20 flex-shrink-0 tabular-nums">
              {timeAgo(item.timestamp)}
            </span>
          </div>
        )
      })}
    </div>
  )
}
