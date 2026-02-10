"use client"

import Link from "next/link"
import { AnimatedSection, WaveTexture, GradientMesh, PhosraBurst } from "./shared"
import { getStandardsStats } from "@/lib/standards"

const { totalAdoptions } = getStandardsStats()

const TRUST_BADGES = [
  { icon: "🔒", label: "AES-256 Encrypted" },
  { icon: "✓", label: "SOC 2 Type II" },
  { icon: "✓", label: "COPPA Compliant" },
]

export function CTASection() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden bg-gradient-to-br from-[#0D1B2A] via-[#0A2F2F] to-[#0D1B2A]">
      {/* Background textures */}
      <WaveTexture
        colorStart="#00D47E"
        colorEnd="#26A8C9"
        opacity={0.1}
      />
      <GradientMesh
        colors={["#00D47E", "#26A8C9", "#7B5CB8", "#0D1B2A"]}
        className="opacity-30"
      />
      {/* Brand mark at bottom right */}
      <div className="absolute -bottom-20 -right-20">
        <PhosraBurst size={500} color="#00D47E" opacity={0.05} rotate={15} animate />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-12 xl:gap-20 items-center">
          {/* Left — headline */}
          <AnimatedSection direction="left">
            <h2 className="font-display text-4xl sm:text-5xl lg:text-[42px] xl:text-[52px] text-white leading-[1.15] mb-6">
              Start protecting{" "}
              <span className="bg-gradient-to-r from-brand-green to-accent-teal bg-clip-text text-transparent">
                every child
              </span>{" "}
              today
            </h2>
            <p className="text-white/50 text-lg leading-relaxed mb-8 max-w-lg">
              Free for families. Pay only when you build. Get started in under five minutes.
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-4">
              {TRUST_BADGES.map((badge) => (
                <div
                  key={badge.label}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm"
                >
                  <span className="text-sm">{badge.icon}</span>
                  <span className="text-xs font-medium text-white/60">{badge.label}</span>
                </div>
              ))}
            </div>
          </AnimatedSection>

          {/* Right — action card */}
          <AnimatedSection direction="right" delay={0.15}>
            <div className="relative">
              {/* Card glow */}
              <div className="absolute -inset-3 bg-gradient-to-br from-brand-green/20 via-accent-teal/10 to-transparent rounded-3xl blur-2xl" />

              <div className="relative bg-white/[0.06] backdrop-blur-xl rounded-2xl border border-white/10 p-8 sm:p-10 cta-gradient-border">
                <h3 className="text-xl font-semibold text-white mb-2">
                  Ready to get started?
                </h3>
                <p className="text-white/40 text-sm mb-8">
                  Create a free account — no credit card required.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/login"
                    className="flex-1 inline-flex items-center justify-center px-8 py-3.5 bg-brand-green text-foreground text-sm font-semibold rounded-lg transition-all hover:shadow-[0_0_28px_-4px_rgba(0,212,126,0.5)]"
                  >
                    Create Free Account
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                  <Link
                    href="/contact"
                    className="flex-1 inline-flex items-center justify-center px-8 py-3.5 border border-white/20 text-white text-sm font-semibold rounded-lg hover:bg-white/5 hover:border-white/30 transition-all"
                  >
                    Talk to Sales
                  </Link>
                </div>

                {/* Social proof line */}
                <div className="mt-6 pt-6 border-t border-white/[0.06] flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
                  <p className="text-xs text-white/40">
                    Trusted by {totalAdoptions.toLocaleString()}+ families and growing
                  </p>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}
