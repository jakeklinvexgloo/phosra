"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { AnimatedSection, WaveTexture } from "./shared"
import { PLATFORM_STATS } from "@/lib/platforms"

const STEPS = [
  {
    number: "01",
    title: "Define",
    description:
      "Create a family, add your children, set age. Phosra generates rules automatically based on age-appropriate defaults and legislative requirements.",
    detail: "24 rules generated in <100ms",
  },
  {
    number: "02",
    title: "Connect",
    description:
      "Link your platforms — NextDNS, Android, Apple, and more. One credential per platform, verified and encrypted with AES-256-GCM.",
    detail: `${PLATFORM_STATS.marketingTotal} platform integrations`,
  },
  {
    number: "03",
    title: "Enforce",
    description:
      "Push rules to every connected platform with one API call. Monitor compliance in real-time and get notified when enforcement fails.",
    detail: "Real-time sync & monitoring",
  },
]

export function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 80%", "end 40%"],
  })

  return (
    <section
      ref={containerRef}
      className="relative py-24 sm:py-32 overflow-hidden bg-white"
    >
      {/* Subtle background wave */}
      <WaveTexture colorStart="#00D47E" colorEnd="#26A8C9" opacity={0.03} />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-16 sm:mb-24">
          <h2 className="font-display text-4xl sm:text-5xl text-foreground leading-tight mb-5">
            Three steps to total protection
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From zero to fully enforced parental controls in minutes, not hours.
          </p>
        </AnimatedSection>

        {/* Vertical timeline */}
        <div className="relative max-w-3xl mx-auto">
          {/* Timeline track (desktop) */}
          <div className="hidden md:block absolute left-8 top-0 bottom-0 w-px">
            {/* Gray background track */}
            <div className="absolute inset-0 bg-gray-200" />
            {/* Animated green fill */}
            <motion.div
              className="absolute top-0 left-0 w-full bg-brand-green origin-top"
              style={{ scaleY: scrollYProgress, height: "100%" }}
            />
          </div>

          {/* Steps */}
          <div className="space-y-16 sm:space-y-20">
            {STEPS.map((step, i) => (
              <AnimatedSection key={step.number} direction="left" delay={i * 0.15}>
                <div className="flex gap-8 md:gap-12 items-start">
                  {/* Number badge */}
                  <div className="relative z-10 shrink-0">
                    <div className="w-16 h-16 rounded-full bg-white border-2 border-brand-green/20 flex items-center justify-center shadow-sm">
                      <span className="font-display text-xl text-brand-green">
                        {step.number}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-2">
                    <h3 className="font-display text-2xl sm:text-3xl text-foreground mb-3">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground text-base leading-relaxed mb-4 max-w-lg">
                      {step.description}
                    </p>
                    {/* Detail chip */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-green/5 border border-brand-green/10">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-green" />
                      <span className="text-xs font-medium text-brand-green">
                        {step.detail}
                      </span>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
