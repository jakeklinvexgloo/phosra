"use client"

import { Users, MessageSquare, Mail, MessageCircle, Clock } from "lucide-react"

interface OutreachStatsProps {
  total: number
  active: number
  emailed: number
  replied: number
  followUp: number
}

export function OutreachStats({ total, active, emailed, replied, followUp }: OutreachStatsProps) {
  const cards = [
    { label: "Total", value: total, icon: Users, color: "text-foreground" },
    { label: "Active", value: active, icon: MessageSquare, color: "text-blue-600 dark:text-blue-400" },
    { label: "Emailed", value: emailed, icon: Mail, color: "text-purple-600 dark:text-purple-400" },
    { label: "Replied", value: replied, icon: MessageCircle, color: "text-brand-green" },
    { label: "Follow-up", value: followUp, icon: Clock, color: followUp > 0 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground" },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
      {cards.map((card) => (
        <div key={card.label} className="plaid-card py-2.5 px-3">
          <div className="flex items-center gap-1.5 mb-0.5">
            <card.icon className={`w-3 h-3 ${card.color}`} />
            <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider font-semibold">
              {card.label}
            </span>
          </div>
          <div className={`text-xl font-semibold tabular-nums ${card.color}`}>{card.value}</div>
        </div>
      ))}
    </div>
  )
}
