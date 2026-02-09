"use client"

import { PhosraBurst, FloatingElement, AnimatedSection } from "../shared"
import type { PlatformCategory } from "../ecosystem-data"

interface HubVisualizationProps {
  sources: PlatformCategory[]
  targets: PlatformCategory[]
}

function CategoryPill({
  category,
  count,
  accentClass,
  side,
}: {
  category: string
  count: number
  accentClass: string
  side: "left" | "right"
}) {
  const borderSide = side === "left" ? "border-r-2" : "border-l-2"
  const accentBorder = accentClass.split(" ").find((c) => c.startsWith("border-")) ?? "border-emerald-400"

  return (
    <div
      className={`flex items-center justify-between gap-3 px-4 py-2.5 bg-white border border-border rounded-sm shadow-sm ${borderSide} ${accentBorder}`}
    >
      <span className="text-xs font-semibold text-foreground">{category}</span>
      <span className={`text-[10px] font-bold tabular-nums ${accentClass.split(" ")[0]}`}>
        {count}
      </span>
    </div>
  )
}

function ConnectionLines({ side }: { side: "left" | "right" }) {
  const color = side === "left" ? "#00D47E" : "#2DB8A5"

  return (
    <svg
      className="hidden lg:block w-16 xl:w-24 h-full flex-shrink-0"
      viewBox="0 0 80 200"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {/* Multiple converging/diverging dashed lines */}
      {[30, 70, 110, 150, 170].map((y, i) => {
        const midY = 100
        const cx1 = side === "left" ? 25 : 55
        const cx2 = side === "left" ? 55 : 25
        const startX = side === "left" ? 0 : 80
        const endX = side === "left" ? 80 : 0

        return (
          <path
            key={i}
            d={`M ${startX} ${y} C ${cx1} ${y}, ${cx2} ${midY}, ${endX} ${midY}`}
            fill="none"
            stroke={color}
            strokeWidth={1.5}
            strokeDasharray="4 6"
            strokeOpacity={0.4}
            className="animate-dash-flow"
            style={{ animationDelay: `${i * 0.4}s` }}
          />
        )
      })}
    </svg>
  )
}

export function HubVisualization({ sources, targets }: HubVisualizationProps) {
  // Take the top 6 target categories for the right side
  const topTargets = targets.slice(0, 6)

  return (
    <div className="py-10 sm:py-16">
      {/* Desktop: horizontal flow */}
      <div className="hidden lg:flex items-center justify-center gap-0">
        {/* Left — Source Category Pills */}
        <AnimatedSection direction="left" className="flex-shrink-0 w-52 xl:w-60">
          <div className="space-y-2">
            {sources.map((source) => (
              <CategoryPill
                key={source.category}
                category={source.shortLabel}
                count={source.items.length}
                accentClass={source.accentClass}
                side="left"
              />
            ))}
          </div>
        </AnimatedSection>

        {/* Left connection lines */}
        <ConnectionLines side="left" />

        {/* Center — Phosra Hub */}
        <AnimatedSection direction="up" delay={0.15} className="flex-shrink-0">
          <FloatingElement duration={8} distance={4}>
            <div className="relative flex flex-col items-center">
              {/* Glow ring */}
              <div className="absolute -inset-6 rounded-full bg-brand-green/10 blur-2xl animate-pulse-glow" />

              {/* Hub node */}
              <div className="relative flex flex-col items-center gap-2 px-8 py-7 bg-[#111111] rounded-2xl border border-white/10 shadow-2xl">
                <PhosraBurst size={56} color="#00D47E" opacity={0.9} animate />
                <span className="text-white text-xs font-bold tracking-wide mt-1">PHOSRA API</span>
                <div className="flex flex-col items-center gap-0.5 mt-1.5">
                  <span className="text-[8px] text-white/35 uppercase tracking-wider">Regulatory Intelligence</span>
                  <span className="text-[8px] text-white/35 uppercase tracking-wider">Policy Resolution</span>
                  <span className="text-[8px] text-white/35 uppercase tracking-wider">Universal Enforcement</span>
                </div>
              </div>
            </div>
          </FloatingElement>
        </AnimatedSection>

        {/* Right connection lines */}
        <ConnectionLines side="right" />

        {/* Right — Target Category Pills */}
        <AnimatedSection direction="right" delay={0.15} className="flex-shrink-0 w-52 xl:w-60">
          <div className="space-y-2">
            {topTargets.map((target) => (
              <CategoryPill
                key={target.category}
                category={target.shortLabel}
                count={target.items.length}
                accentClass={target.accentClass}
                side="right"
              />
            ))}
          </div>
        </AnimatedSection>
      </div>

      {/* Mobile/Tablet: vertical flow */}
      <div className="flex lg:hidden flex-col items-center gap-6">
        {/* Source pills — horizontal scroll */}
        <AnimatedSection direction="up">
          <div className="flex gap-2 overflow-x-auto pb-2 px-1 no-scrollbar">
            {sources.map((source) => (
              <div
                key={source.category}
                className={`flex items-center gap-2 px-3 py-2 bg-white border border-border rounded-full flex-shrink-0 shadow-sm`}
              >
                <span className="text-[10px] font-semibold text-foreground whitespace-nowrap">{source.shortLabel}</span>
                <span className={`text-[10px] font-bold tabular-nums ${source.accentClass.split(" ")[0]}`}>
                  {source.items.length}
                </span>
              </div>
            ))}
          </div>
        </AnimatedSection>

        {/* Down arrow */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-px h-8 bg-gradient-to-b from-brand-green/60 to-brand-green/20" />
          <svg className="w-4 h-4 text-brand-green" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>

        {/* Hub — centered */}
        <AnimatedSection direction="up" delay={0.1}>
          <div className="relative flex flex-col items-center">
            <div className="absolute -inset-4 rounded-full bg-brand-green/10 blur-xl" />
            <div className="relative flex items-center gap-3 px-6 py-4 bg-[#111111] rounded-xl border border-white/10 shadow-xl">
              <PhosraBurst size={36} color="#00D47E" opacity={0.9} animate />
              <div>
                <span className="text-white text-xs font-bold">PHOSRA API</span>
                <p className="text-[8px] text-white/35 uppercase tracking-wider mt-0.5">Universal Enforcement</p>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Down arrow */}
        <div className="flex flex-col items-center gap-2">
          <svg className="w-4 h-4 text-accent-teal" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          <div className="w-px h-8 bg-gradient-to-b from-accent-teal/60 to-accent-teal/20" />
        </div>

        {/* Target pills — horizontal scroll */}
        <AnimatedSection direction="up" delay={0.2}>
          <div className="flex gap-2 overflow-x-auto pb-2 px-1 no-scrollbar">
            {topTargets.map((target) => (
              <div
                key={target.category}
                className={`flex items-center gap-2 px-3 py-2 bg-white border border-border rounded-full flex-shrink-0 shadow-sm`}
              >
                <span className="text-[10px] font-semibold text-foreground whitespace-nowrap">{target.shortLabel}</span>
                <span className={`text-[10px] font-bold tabular-nums ${target.accentClass.split(" ")[0]}`}>
                  {target.items.length}
                </span>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </div>
  )
}
