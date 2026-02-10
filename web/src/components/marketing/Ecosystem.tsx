"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatedSection, WaveTexture } from "./shared"
import { LogoMarquee, HubVisualization, CategoryGrid } from "./ecosystem/index"
import {
  CONTROL_SOURCES,
  ENFORCEMENT_TARGETS,
  MARQUEE_SOURCES,
  MARQUEE_TARGETS,
  SOURCE_COUNT,
  TARGET_COUNT,
  TOTAL_COUNT,
  CATEGORY_COUNT,
} from "./ecosystem-data"

/* ── Animated counter ─────────────────────────────────────────────── */

function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(value)
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  // Reset to 0 on client mount so the animation can run from 0 → value
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
          const duration = 1400
          const startTime = performance.now()
          const animate = (t: number) => {
            const p = Math.min((t - startTime) / duration, 1)
            setCount(Math.round((1 - Math.pow(1 - p, 3)) * value))
            if (p < 1) requestAnimationFrame(animate)
          }
          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.2 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [value, hasAnimated])

  return (
    <span ref={ref} className="tabular-nums">
      {count}
      {suffix}
    </span>
  )
}

/* ── Main Ecosystem Section ───────────────────────────────────────── */

export function Ecosystem() {
  return (
    <section id="ecosystem" className="relative py-20 sm:py-28 bg-white overflow-hidden">
      {/* Ambient texture */}
      <WaveTexture colorStart="#00D47E" colorEnd="#26A8C9" opacity={0.02} />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        {/* ── Header ──────────────────────────────────────────────── */}
        <AnimatedSection direction="up">
          <div className="text-center mb-10 sm:mb-14">
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-muted/60 backdrop-blur-sm mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
              <span className="text-xs font-medium text-muted-foreground">Ecosystem</span>
            </div>

            <h2 className="font-display text-4xl sm:text-5xl lg:text-[42px] xl:text-[52px] text-foreground leading-[1.15] mb-5">
              One API.{" "}
              <span className="bg-gradient-to-r from-brand-green to-accent-teal bg-clip-text text-transparent">
                {TOTAL_COUNT}+ platforms.
              </span>
            </h2>

            <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto">
              Connect the apps parents trust to every platform their kids use.{" "}
              <span className="text-foreground font-medium">
                <Counter value={SOURCE_COUNT} suffix="+" /> sources
              </span>{" "}
              flow through Phosra to{" "}
              <span className="text-foreground font-medium">
                <Counter value={TARGET_COUNT} suffix="+" /> enforcement targets
              </span>
              .
            </p>
          </div>
        </AnimatedSection>

        {/* ── Layer 1: Dual Logo Marquee ──────────────────────────── */}
        <AnimatedSection direction="up" delay={0.1}>
          <div className="space-y-3 mb-6 sm:mb-10">
            <LogoMarquee
              items={MARQUEE_SOURCES}
              direction="left"
              speed={50}
              fallbackHex="10B981"
            />
            <LogoMarquee
              items={MARQUEE_TARGETS}
              direction="right"
              speed={55}
              fallbackHex="0D9488"
              className="hidden sm:block"
            />
          </div>
        </AnimatedSection>

        {/* ── Layer 2: Central Hub Flow ────────────────────────────── */}
        <HubVisualization sources={CONTROL_SOURCES} targets={ENFORCEMENT_TARGETS} />

        {/* ── Layer 3: Interactive Category Grid ──────────────────── */}
        <div className="mt-10 sm:mt-14">
          <AnimatedSection direction="up" delay={0.1}>
            <div className="text-center mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-foreground">
                Explore every platform
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {CATEGORY_COUNT} categories covering{" "}
                <span className="text-foreground font-medium">{TOTAL_COUNT}+ integrations</span>
              </p>
            </div>
          </AnimatedSection>

          <CategoryGrid categories={ENFORCEMENT_TARGETS} />
        </div>

        {/* ── Bottom Stats Bar ────────────────────────────────────── */}
        <AnimatedSection direction="up" delay={0.2}>
          <div className="mt-12 sm:mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { value: TOTAL_COUNT, suffix: "+", label: "Total integrations" },
              { value: CATEGORY_COUNT, suffix: "", label: "Platform categories" },
              { value: 50, suffix: "+", label: "Compliance laws" },
              { value: 45, suffix: "", label: "Rule categories" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="text-center p-4 bg-white border border-border rounded-sm shadow-plaid-card border-l-[3px] border-l-brand-green/30"
              >
                <div className="text-xl sm:text-2xl font-bold text-foreground">
                  <Counter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
