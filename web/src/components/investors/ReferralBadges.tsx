"use client"

import { UserPlus, Users, Megaphone, Scale, Trophy } from "lucide-react"

interface Badge {
  key: string
  label: string
  description: string
  earned: boolean
  earnedAt: string | null
}

const BADGE_ICONS: Record<string, typeof Trophy> = {
  first_share: UserPlus,
  connector: Users,
  evangelist: Megaphone,
  closer: Scale,
  champion: Trophy,
}

export default function ReferralBadges({ badges }: { badges: Badge[] }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
      {badges.map((badge) => {
        const Icon = BADGE_ICONS[badge.key] || Trophy
        return (
          <div
            key={badge.key}
            className={`flex-shrink-0 rounded-xl border p-3 min-w-[120px] transition-all ${
              badge.earned
                ? "bg-brand-green/5 border-brand-green/20"
                : "bg-white/[0.02] border-white/5 opacity-40"
            }`}
          >
            <Icon className={`w-5 h-5 mb-2 ${badge.earned ? "text-brand-green" : "text-white/30"}`} />
            <p className={`text-xs font-semibold ${badge.earned ? "text-white" : "text-white/40"}`}>
              {badge.label}
            </p>
            <p className="text-[10px] text-white/30 mt-0.5 leading-tight">
              {badge.description}
            </p>
            {badge.earned && badge.earnedAt && (
              <p className="text-[9px] text-brand-green/60 mt-1">
                {new Date(badge.earnedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
