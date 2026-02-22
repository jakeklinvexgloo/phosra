"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatedSection, GradientMesh, PhosraBurst } from "./shared"
import { PLATFORM_STATS } from "@/lib/platforms"
import { getRegistryStats } from "@/lib/compliance"

const complianceStats = getRegistryStats()

const STATS = [
  { value: complianceStats.totalCategories, suffix: "", label: "Rule categories", description: "Covering every aspect of child digital safety" },
  { value: PLATFORM_STATS.total, suffix: "+", label: "Platform integrations", description: "YouTube, TikTok, Roblox, and more \u2014 all connected" },
  { value: 5, suffix: "", label: "Rating systems", description: "MPAA, TV, ESRB, PEGI, CSM \u2014 mapped automatically" },
  { value: complianceStats.totalLaws, suffix: "+", label: "Compliance laws", description: "KOSA, COPPA 2.0, EU DSA, and more \u2014 built in" },
]

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
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

export function Stats() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden bg-[#0D1B2A]">
      {/* Background layers */}
      <GradientMesh
        colors={["#00D47E", "#26A8C9", "#7B5CB8", "#0D1B2A"]}
        className="opacity-30"
      />
      {/* Centered brand mark watermark */}
      <div className="absolute inset-0 flex items-center justify-center">
        <PhosraBurst size={600} color="#ffffff" opacity={0.03} animate />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-12 sm:mb-20">
          <h2 className="font-display text-4xl sm:text-5xl text-white leading-tight mb-5">
            Built for the laws that matter
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            Phosra encodes child safety legislation from around the world into enforceable policy rules.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-0">
          {STATS.map((stat, i) => (
            <AnimatedSection key={stat.label} delay={i * 0.1}>
              <div className={`text-center py-4 sm:py-0 ${
                i < STATS.length - 1
                  ? "lg:border-r lg:border-white/[0.08]"
                  : ""
              }`}>
                <div className="font-display text-4xl sm:text-6xl lg:text-6xl xl:text-7xl bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent mb-2 sm:mb-3">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-xs sm:text-sm font-semibold text-white mb-1 sm:mb-1.5">{stat.label}</div>
                <p className="text-[11px] sm:text-xs text-white/40 max-w-[160px] sm:max-w-[180px] mx-auto leading-tight">{stat.description}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}
