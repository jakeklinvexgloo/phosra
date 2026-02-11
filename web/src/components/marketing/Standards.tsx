"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight, Shield, Sparkles, ChevronDown } from "lucide-react"
import { AnimatedSection, WaveTexture, GradientMesh, StandardIcon } from "./shared"
import { STANDARDS_REGISTRY, getStandardsStats } from "@/lib/standards"
import type { StandardEntry } from "@/lib/standards"

function StandardCard({ standard, index }: { standard: StandardEntry; index: number }) {
  return (
    <div
      className="stagger-card opacity-0"
      style={{
        animation: "fadeSlideUp 0.5s ease-out forwards",
        animationDelay: `${Math.min(index * 0.04, 0.6)}s`,
      }}
    >
      <Link
        href={`/standards/${standard.slug}`}
        className="group block h-full"
      >
        <div className="relative h-full bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] rounded-xl p-6 hover:bg-white/[0.07] hover:border-white/[0.14] transition-all duration-300">
          {/* Accent top bar */}
          <div
            className="absolute top-0 left-6 right-6 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${standard.accentColor}40, transparent)` }}
          />

          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <StandardIcon standard={standard} size="md" />
              <div>
                <h3 className="text-base font-semibold text-white group-hover:text-brand-green transition-colors">
                  {standard.name}
                </h3>
                <p className="text-[11px] text-white/40">{standard.organization}</p>
              </div>
            </div>
            {standard.status === "active" ? (
              <span className="text-[10px] font-medium bg-brand-green/15 text-brand-green px-2 py-0.5 rounded-full">
                Active
              </span>
            ) : (
              <span className="text-[10px] font-medium bg-amber-500/15 text-amber-400 px-2 py-0.5 rounded-full">
                Coming Soon
              </span>
            )}
          </div>

          <p className="text-sm text-white/50 leading-relaxed mb-5 line-clamp-2">
            {standard.description}
          </p>

          {/* Rule count */}
          <div className="flex items-center gap-4 text-[11px] text-white/35">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3 h-3" />
              {standard.rules.length} rules
            </span>
          </div>

          {/* Hover arrow */}
          <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowRight className="w-4 h-4 text-brand-green" />
          </div>
        </div>
      </Link>
    </div>
  )
}

const INITIAL_COUNT = 12

export function Standards() {
  const stats = useMemo(() => getStandardsStats(), [])
  const [showAll, setShowAll] = useState(false)
  const visibleStandards = showAll ? STANDARDS_REGISTRY : STANDARDS_REGISTRY.slice(0, INITIAL_COUNT)

  return (
    <section
      id="standards"
      className="relative py-24 sm:py-32 overflow-hidden bg-gradient-to-b from-[#0A1628] to-[#0D1B2A]"
    >
      <WaveTexture colorStart="#7B5CB8" colorEnd="#00D47E" opacity={0.06} />
      <GradientMesh
        colors={["#7B5CB8", "#00D47E", "#26A8C9", "#0D1B2A"]}
        className="opacity-30"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        {/* Header */}
        <AnimatedSection className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-6">
            <Sparkles className="w-3 h-3 text-brand-green" />
            <span className="text-xs font-medium text-white/70">Community Standards</span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-white leading-tight mb-5">
            Standards that protect,{" "}
            <span className="bg-gradient-to-r from-accent-purple to-brand-green bg-clip-text text-transparent">
              not just promise
            </span>
          </h2>
          <p className="text-white/50 text-base sm:text-lg max-w-2xl mx-auto mb-10">
            Movements define the rules. Phosra enforces them. Adopt a community
            standard and every connected platform enforces it automatically.
          </p>
        </AnimatedSection>

        {/* Stats bar */}
        <AnimatedSection delay={0.1} className="mb-12">
          <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
            {[
              { value: `${stats.total}`, label: "Standards" },
              { value: `${stats.active}`, label: "Active" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl sm:text-3xl font-display text-white">{stat.value}</p>
                <p className="text-xs text-white/40 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </AnimatedSection>

        {/* Standard cards grid */}
        <AnimatedSection className="mb-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {visibleStandards.map((standard, i) => (
              <StandardCard key={standard.id} standard={standard} index={i} />
            ))}
          </div>

          {!showAll && STANDARDS_REGISTRY.length > INITIAL_COUNT && (
            <div className="text-center mt-8">
              <button
                onClick={() => setShowAll(true)}
                className="inline-flex items-center gap-2 px-6 py-2.5 border border-white/15 text-white/60 text-sm font-medium rounded-lg hover:bg-white/5 hover:text-white hover:border-white/25 transition-all"
              >
                Show All {STANDARDS_REGISTRY.length} Standards
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </AnimatedSection>

        {/* How it works — 3 step mini */}
        <AnimatedSection delay={0.3} className="mb-12">
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6 sm:p-8">
            <h3 className="text-center text-sm font-semibold text-white/60 uppercase tracking-wider mb-6">
              How Community Standards Work
            </h3>
            <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
              {[
                {
                  step: "01",
                  title: "Movements define",
                  description: "Organizations like Wait Until 8th and The Anxious Generation define rule sets based on their values and research.",
                },
                {
                  step: "02",
                  title: "Families adopt",
                  description: "One click to adopt a standard for your child. Rules are generated automatically from the standard definition.",
                },
                {
                  step: "03",
                  title: "Phosra enforces",
                  description: "Rules push to every connected platform — Netflix, YouTube, NextDNS, and more. Verified, not just promised.",
                },
              ].map((item) => (
                <div key={item.step} className="text-center sm:text-left">
                  <span className="text-2xl font-display text-brand-green/30">{item.step}</span>
                  <h4 className="text-sm font-semibold text-white mt-1 mb-2">{item.title}</h4>
                  <p className="text-xs text-white/40 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* CTA */}
        <AnimatedSection delay={0.4} className="text-center">
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/standards"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-green text-foreground text-sm font-semibold rounded-sm hover:shadow-[0_0_24px_-4px_rgba(0,212,126,0.5)] transition-all"
            >
              Browse All Standards
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 text-white text-sm font-semibold rounded-sm hover:bg-white/5 hover:border-white/30 transition-all"
            >
              Adopt a Standard
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
