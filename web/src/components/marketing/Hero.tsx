"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { WaveTexture } from "./shared/WaveTexture"
import { GradientMesh } from "./shared/GradientMesh"
import { PhosraBurst } from "./shared/PhosraBurst"
import { AnimatedSection } from "./shared/AnimatedSection"
import { HeroChatDemo } from "./hero/HeroChatDemo"
import { HeroPromptBar } from "./hero/HeroPromptBar"
import { LiquidGlassModal } from "./hero/LiquidGlassModal"
import { HeroSandboxChat } from "./hero/HeroSandboxChat"
import { PLATFORM_STATS } from "@/lib/platforms"

const PLATFORM_NAMES = [
  "Bark", "Qustodio", "Aura", "Net Nanny", "Norton Family",
  "NextDNS", "CleanBrowsing", "Android", "Microsoft", "Apple",
  "YouTube", "Netflix", "Roblox", "TikTok", "Instagram",
  "Discord", "Snapchat", "Twitch", "Spotify", "Steam",
  "Disney+", "Fortnite", "ChatGPT", "Minecraft", "PlayStation",
]

export function Hero() {
  const [modalPrompt, setModalPrompt] = useState<string | null>(null)

  const handleCloseModal = useCallback(() => setModalPrompt(null), [])
  const handleTryAnother = useCallback(() => {
    setModalPrompt(null)
    // Focus returns to prompt bar naturally since modal unmounts
  }, [])

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0D1B2A] via-[#0A2F2F] to-[#0D1B2A] min-h-dvh flex flex-col">
      {/* Layered background textures */}
      <WaveTexture colorStart="#00D47E" colorEnd="#26A8C9" opacity={0.12} />
      <GradientMesh colors={["#00D47E", "#26A8C9", "#7B5CB8"]} />

      {/* Brand illustration — Phosra burst behind right column */}
      <div className="absolute right-[-5%] top-[-10%] lg:right-[5%] lg:top-[-5%]">
        <PhosraBurst size={700} color="#00D47E" opacity={0.06} animate />
      </div>

      <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pt-24 pb-12 sm:pt-28 sm:pb-16 lg:pt-28 lg:pb-16 xl:pt-32 xl:pb-20 flex-1 flex flex-col justify-center">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-12 xl:gap-20 items-center">
          {/* Left — text */}
          <div>
            {/* Announcement badge */}
            <AnimatedSection delay={0}>
              <Link
                href="/research/ai-chatbots"
                className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.06] border border-white/[0.08] mb-8 group hover:bg-white/[0.1] hover:border-white/[0.15] transition-all"
              >
                <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
                <span className="text-xs text-white/60 font-medium group-hover:text-white/80 transition-colors">New: AI Safety Research — 8 chatbots tested</span>
                <ArrowRight className="w-3 h-3 text-white/40 group-hover:text-white/70 group-hover:translate-x-0.5 transition-all" />
              </Link>
            </AnimatedSection>

            {/* Headline with serif display + gradient */}
            <AnimatedSection delay={0.1}>
              <h1 className="font-display text-[26px] xs:text-[30px] sm:text-5xl md:text-6xl lg:text-[56px] xl:text-[72px] text-white leading-[1.1] mb-6 tracking-tight">
                Define once,{" "}
                <br className="sm:hidden" />
                <span className="bg-gradient-to-r from-[#00D47E] to-[#26A8C9] bg-clip-text text-transparent">
                  protect everywhere
                </span>
              </h1>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <p className="text-lg sm:text-xl text-white/50 leading-relaxed mb-10 max-w-lg">
                Kids use {PLATFORM_STATS.marketingTotal} apps and platforms {"\u2014"} each with different, fragmented parental controls. Phosra is an open specification and API that unifies them. Platforms adopt the spec; parents set rules once.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={0.3}>
              <div className="flex flex-wrap gap-3 sm:gap-4">
                <Link
                  href="/login"
                  className="inline-flex items-center px-6 sm:px-8 py-3.5 sm:py-4 bg-brand-green text-foreground text-sm font-semibold rounded-sm hover:opacity-90 transition hover:shadow-[0_0_30px_-6px_rgba(0,212,126,0.4)]"
                >
                  Get Started Free
                </Link>
                <Link
                  href="/docs"
                  className="inline-flex items-center px-6 sm:px-8 py-3.5 sm:py-4 border border-white/20 text-white text-sm font-semibold rounded-sm hover:bg-white/5 hover:border-white/30 transition"
                >
                  Read the Docs
                </Link>
              </div>
            </AnimatedSection>

            {/* Prompt bar */}
            <AnimatedSection delay={0.4}>
              <HeroPromptBar onSubmit={setModalPrompt} />
            </AnimatedSection>
          </div>

          {/* Right / below — animated split demo */}
          <div className="mt-8 lg:mt-0">
            <HeroChatDemo />
          </div>
        </div>

        {/* Platform marquee */}
        <div className="mt-14 sm:mt-20 pt-8 sm:pt-10 border-t border-white/[0.06]">
          <p className="text-xs text-white/25 text-center mb-6 tracking-wider uppercase font-medium">
            An open spec for {PLATFORM_STATS.marketingTotal} platforms
          </p>
          <div
            className="relative overflow-hidden"
            style={{
              maskImage: "linear-gradient(to right, transparent, black 80px, black calc(100% - 80px), transparent)",
              WebkitMaskImage: "linear-gradient(to right, transparent, black 80px, black calc(100% - 80px), transparent)",
            }}
          >

            <div className="flex animate-scroll gap-6">
              {[...PLATFORM_NAMES, ...PLATFORM_NAMES].map((name, i) => (
                <span
                  key={`${name}-${i}`}
                  className="text-xs text-white/25 font-medium whitespace-nowrap flex-shrink-0 px-3 py-1.5 border border-white/[0.06] rounded-full"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Liquid glass modal with live AI chat */}
      <LiquidGlassModal open={!!modalPrompt} onClose={handleCloseModal}>
        {modalPrompt && (
          <HeroSandboxChat
            prompt={modalPrompt}
            onClose={handleCloseModal}
            onTryAnother={handleTryAnother}
          />
        )}
      </LiquidGlassModal>
    </section>
  )
}
