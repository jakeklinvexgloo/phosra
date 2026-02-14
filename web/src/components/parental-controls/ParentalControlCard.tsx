import Link from "next/link"
import { ChevronRight, Cpu, Shield, Smartphone } from "lucide-react"
import type { HubCardData } from "@/lib/parental-controls/adapters/to-hub-page"
import { PRICING_LABELS } from "@/lib/parental-controls/types"

export function ParentalControlCard({ card }: { card: HubCardData }) {
  return (
    <Link href={`/parental-controls/${card.slug}`} className="group block h-full">
      <div className="relative h-full rounded-xl border border-border bg-card p-5 hover:border-brand-green/30 hover:shadow-[0_0_24px_-8px_rgba(0,212,126,0.15)] transition-all duration-300">
        {/* Accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
          style={{ background: `linear-gradient(90deg, ${card.accentColor}60, ${card.accentColor}20)` }}
        />

        <div className="flex items-start justify-between mb-3 mt-1">
          <div className="flex items-center gap-3">
            {card.iconUrl ? (
              <img src={card.iconUrl} alt="" className="w-8 h-8 rounded-lg object-contain" />
            ) : (
              <span className="text-2xl">{card.iconEmoji}</span>
            )}
            <div>
              <h3 className="text-base font-semibold text-foreground group-hover:text-brand-green transition-colors">
                {card.name}
              </h3>
              <p className="text-[11px] text-muted-foreground">{card.sourceCategoryLabel}</p>
            </div>
          </div>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${card.apiColor} bg-muted`}>
            {card.apiLabel}
          </span>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">
          {card.description}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 text-[11px] text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            {card.fullSupportCount}/{card.capabilityCount} capabilities
          </span>
          <span className="flex items-center gap-1">
            <Smartphone className="w-3 h-3" />
            {card.deviceCount} platforms
          </span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <span className="text-xs text-muted-foreground">
            {PRICING_LABELS[card.pricingTier as keyof typeof PRICING_LABELS]} &middot; {card.pricingDetails}
          </span>
          <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-brand-green transition-colors" />
        </div>
      </div>
    </Link>
  )
}
