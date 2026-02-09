"use client"

import { PhosraBurst } from "@/components/marketing/shared"

interface ComplianceHeroProps {
  lawName: string
  shortName: string
  jurisdiction: string
  stage: string
  stageColor: "enacted" | "passed" | "pending"
  description: string
}

const stageBadgeColors: Record<ComplianceHeroProps["stageColor"], string> = {
  enacted: "bg-emerald-500/20 text-emerald-400",
  passed: "bg-amber-500/20 text-amber-400",
  pending: "bg-zinc-500/20 text-zinc-400",
}

export function ComplianceHero({
  lawName,
  shortName,
  jurisdiction,
  stage,
  stageColor,
  description,
}: ComplianceHeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0D1B2A] via-[#0F2035] to-[#0A1628]">
      {/* Brand watermark */}
      <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4">
        <PhosraBurst size={500} opacity={0.04} />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-8 py-16 sm:py-20">
        {/* Badge row */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-white/10 text-white/70 px-3 py-1 rounded-full text-xs font-medium">
            {jurisdiction}
          </span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${stageBadgeColors[stageColor]}`}
          >
            {stage}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display text-white mt-4">
          {lawName}{" "}
          <span className="text-white/40">({shortName})</span>
        </h1>

        {/* Description */}
        <p className="text-base sm:text-lg text-white/60 mt-4 max-w-2xl leading-relaxed">
          {description}
        </p>
      </div>
    </section>
  )
}
