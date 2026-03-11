"use client"

import { useEffect, useRef, useState, useMemo } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { AnimatedSection, WaveTexture, GradientMesh } from "./shared"
import { JurisdictionSummaryRow } from "./compliance-section/JurisdictionSummaryRow"
import { HighlightLawCard } from "./compliance-section/HighlightLawCard"
import { LawCounter } from "./compliance-section/LawCounter"
import { getRegistryStats } from "@/lib/compliance"
import { getLawById } from "@/lib/compliance"
import { PLATFORM_STATS } from "@/lib/platforms"

const HIGHLIGHT_IDS = ["kosa", "coppa-2", "eu-dsa", "uk-aadc"]

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(value)
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    setCount(0)
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          const duration = 1200
          const startTime = performance.now()

          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.round(eased * value))

            if (progress < 1) {
              requestAnimationFrame(animate)
            }
          }

          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [value, hasAnimated])

  return (
    <span ref={ref} className="tabular-nums">
      {count}{suffix}
    </span>
  )
}

export function Compliance() {
  const stats = useMemo(() => getRegistryStats(), [])

  const STAT_STRIP = useMemo(() => [
    { value: stats.totalCategories, suffix: "", label: "Rule categories", description: "Covering every aspect of child digital safety" },
    { value: PLATFORM_STATS.liveCount, suffix: "+", label: "Live integrations", description: "YouTube, TikTok, Roblox, and more — all connected" },
    { value: 5, suffix: "", label: "Rating systems", description: "MPAA, TV, ESRB, PEGI, CSM — mapped automatically" },
    { value: stats.totalLaws, suffix: "+", label: "Compliance laws", description: "KOSA, COPPA 2.0, EU DSA, and more — built in" },
  ], [stats])

  const highlightLaws = useMemo(
    () =>
      HIGHLIGHT_IDS.map((id) => getLawById(id)).filter(
        (l): l is NonNullable<typeof l> => l != null
      ),
    []
  )

  return (
    <section
      id="compliance"
      className="relative py-24 sm:py-32 overflow-hidden bg-gradient-to-br from-[#0D1B2A] via-[#0A2F2F] to-[#0D1B2A]"
    >
      <WaveTexture colorStart="#00D47E" colorEnd="#7B5CB8" opacity={0.08} />
      <GradientMesh
        colors={["#00D47E", "#26A8C9", "#7B5CB8", "#0D1B2A"]}
        className="opacity-20"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        {/* Header */}
        <AnimatedSection className="text-center mb-10 sm:mb-14">
          <h2 className="font-display text-4xl sm:text-5xl text-white leading-tight mb-5">
            Always compliant. Automatically updated.
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto mb-4">
            {stats.totalLaws}+ child safety laws across {stats.totalJurisdictions}+ jurisdictions {"\u2014"} tracked, mapped to rule categories, and enforced. Updated weekly as legislation evolves.
          </p>
          <p className="text-white/40 text-base max-w-xl mx-auto mb-8">
            You don&apos;t need to know the laws. We do.
          </p>

          {/* Updated weekly badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-brand-green/20 bg-brand-green/[0.06] mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
            <span className="text-xs font-medium text-brand-green/80">Updated weekly</span>
            <span className="text-[10px] text-white/30">Last scan: {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
          </div>

          <LawCounter
            totalLaws={stats.totalLaws}
            jurisdictions={stats.totalJurisdictions}
            categories={stats.totalCategories}
            enacted={stats.enacted}
          />
        </AnimatedSection>

        {/* Animated stat strip */}
        <AnimatedSection delay={0.1} className="mb-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-0 border border-white/[0.08] rounded-xl overflow-hidden">
            {STAT_STRIP.map((stat, i) => (
              <div
                key={stat.label}
                className={`text-center py-6 px-4 ${
                  i < STAT_STRIP.length - 1
                    ? "lg:border-r lg:border-white/[0.08]"
                    : ""
                }`}
              >
                <div className="font-display text-4xl sm:text-5xl bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent mb-1.5">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-xs sm:text-sm font-semibold text-white mb-1">{stat.label}</div>
                <p className="text-[10px] sm:text-xs text-white/40 max-w-[160px] sm:max-w-[180px] mx-auto leading-tight">{stat.description}</p>
              </div>
            ))}
          </div>
        </AnimatedSection>

        {/* Jurisdiction summary badges */}
        <AnimatedSection delay={0.15} className="mb-10">
          <JurisdictionSummaryRow />
        </AnimatedSection>

        {/* Highlight cards — 2x2 grid */}
        <div className="grid md:grid-cols-2 gap-5 mb-12">
          {highlightLaws.map((law) => (
            <HighlightLawCard key={law.id} law={law} />
          ))}
        </div>

        {/* CTA */}
        <AnimatedSection delay={0.2} className="text-center">
          <Link
            href="/compliance"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-green text-foreground text-sm font-semibold rounded-lg transition-all hover:shadow-[0_0_28px_-4px_rgba(0,212,126,0.5)]"
          >
            See all {stats.totalLaws}+ laws in the Compliance Hub
            <ArrowRight className="w-4 h-4" />
          </Link>
        </AnimatedSection>
      </div>
    </section>
  )
}
