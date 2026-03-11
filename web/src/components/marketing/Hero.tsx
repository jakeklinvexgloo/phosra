"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { ArrowRight, Code } from "lucide-react"
import { WaveTexture } from "./shared/WaveTexture"
import { GradientMesh } from "./shared/GradientMesh"
import { PhosraBurst } from "./shared/PhosraBurst"
import { AnimatedSection } from "./shared/AnimatedSection"
import { HeroChatDemo } from "./hero/HeroChatDemo"
import { HeroPromptBar } from "./hero/HeroPromptBar"
import { LiquidGlassModal } from "./hero/LiquidGlassModal"
import { HeroSandboxChat } from "./hero/HeroSandboxChat"
import { useHeroSession } from "./hero/useHeroSession"
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
  // Pre-warm sandbox session on page load so it's ready when the user clicks
  const heroSession = useHeroSession()

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

      <div className="relative w-full max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pt-24 pb-12 sm:pt-28 sm:pb-16 lg:pt-28 lg:pb-16 xl:pt-32 xl:pb-20 flex-1 flex flex-col justify-center">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-12 xl:gap-20 items-start">
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
              <p className="text-[15px] sm:text-xl text-white/50 leading-relaxed mb-4 max-w-lg">
                The open child safety API. One policy controls screen time, content, and privacy across {PLATFORM_STATS.liveCount}+ live platforms {"\u2014"} compliant with KOSA, COPPA 2.0, and 65+ laws.
              </p>
              <p className="text-[13px] sm:text-base text-white/35 leading-relaxed mb-6 max-w-lg">
                Right now you&apos;re configuring Netflix, Roblox, TikTok, and Discord one at a time, with settings that don&apos;t talk to each other. Phosra connects them so one set of rules protects every screen.
              </p>
            </AnimatedSection>

            {/* AI Prompt bar — above the fold, the best thing on the site */}
            <AnimatedSection delay={0.25}>
              <HeroPromptBar onSubmit={setModalPrompt} />
            </AnimatedSection>

            <AnimatedSection delay={0.35}>
              <div className="flex flex-wrap items-start gap-3 sm:gap-4 mt-6">
                {/* Primary: parent path */}
                <Link
                  href="/login"
                  className="inline-flex items-center px-7 sm:px-9 py-4 sm:py-4.5 bg-brand-green text-foreground text-sm font-bold rounded-lg hover:opacity-90 transition hover:shadow-[0_0_30px_-6px_rgba(0,212,126,0.4)]"
                >
                  Try for Families
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
                {/* Secondary: developer path */}
                <Link
                  href="/developers"
                  className="inline-flex items-center px-5 sm:px-6 py-3 sm:py-3.5 border border-white/15 text-white/60 text-xs font-medium rounded-lg hover:bg-white/5 hover:border-white/25 hover:text-white/80 transition"
                >
                  <Code className="w-3.5 h-3.5 mr-1.5 opacity-50" />
                  Explore the API
                </Link>
              </div>

              {/* Compatibility callout — kills the #1 objection */}
              <div className="mt-4 flex items-center gap-2 flex-wrap">
                <span className="text-[11px] text-white/30 font-medium">Integrates with</span>
                {["Parental control apps", "Streaming services", "Gaming platforms", "DNS filters"].map((name) => (
                  <span key={name} className="text-[11px] text-white/45 font-medium px-2.5 py-1 rounded-full border border-white/[0.08] bg-white/[0.03]">
                    {name}
                  </span>
                ))}
              </div>
            </AnimatedSection>

            {/* Founder social proof */}
            <AnimatedSection delay={0.4}>
              <div className="mt-6 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-green/30 to-accent-teal/30 border border-white/[0.1] flex items-center justify-center text-white/70 text-xs font-semibold flex-shrink-0">
                  JK
                </div>
                <p className="text-[12px] sm:text-[13px] text-white/40 leading-snug">
                  <span className="text-white/60 font-medium">Built by parents of 5.</span>{" "}
                  Jake &amp; Susannah Klinvex founded 3 companies (all acquired{" "}{"\u2014"}{" "}Mastercard, Fidelity, Gloo IPO). They built Phosra because they needed it themselves.{" "}
                  <Link href="/about" className="text-brand-green/60 hover:text-brand-green transition-colors">Read our story &rarr;</Link>
                </p>
              </div>
            </AnimatedSection>
          </div>

          {/* Right / below — animated split demo */}
          <div className="mt-8 lg:mt-0 lg:pt-12">
            <HeroChatDemo />
          </div>
        </div>

        {/* Platform marquee */}
        <div className="mt-14 sm:mt-20 pt-8 sm:pt-10 border-t border-white/[0.06]">
          <p className="text-xs text-white/25 text-center mb-6 tracking-wider uppercase font-medium">
            An open spec for {PLATFORM_STATS.liveCount}+ live platforms
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
            session={heroSession}
          />
        )}
      </LiquidGlassModal>
    </section>
  )
}
