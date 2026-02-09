"use client"

import Link from "next/link"
import { Clock, Globe, Wifi, Monitor, Smartphone, Tv, Gamepad2, BookOpen, Check } from "lucide-react"
import { WaveTexture } from "./shared/WaveTexture"
import { GradientMesh } from "./shared/GradientMesh"
import { PhosraBurst } from "./shared/PhosraBurst"
import { FloatingElement } from "./shared/FloatingElement"
import { AnimatedSection } from "./shared/AnimatedSection"

const PLATFORM_NAMES = [
  "Bark", "Qustodio", "Aura", "Net Nanny", "Norton Family",
  "NextDNS", "CleanBrowsing", "Android", "Microsoft", "Apple",
  "YouTube", "Netflix", "Roblox", "TikTok", "Instagram",
  "Discord", "Snapchat", "Twitch", "Spotify", "Steam",
  "Disney+", "Fortnite", "ChatGPT", "Minecraft", "PlayStation",
]

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0D1B2A] via-[#0A2F2F] to-[#0D1B2A]">
      {/* Layered background textures */}
      <WaveTexture colorStart="#00D47E" colorEnd="#26A8C9" opacity={0.12} />
      <GradientMesh colors={["#00D47E", "#26A8C9", "#7B5CB8"]} />

      {/* Brand illustration — Phosra burst behind right column */}
      <div className="absolute right-[-5%] top-[-10%] lg:right-[5%] lg:top-[-5%]">
        <PhosraBurst size={700} color="#00D47E" opacity={0.06} animate />
      </div>

      <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pt-28 pb-16 sm:pt-36 sm:pb-24 lg:pt-48 lg:pb-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left — text */}
          <div>
            {/* Announcement badge */}
            <AnimatedSection delay={0}>
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.06] border border-white/[0.08] mb-8">
                <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
                <span className="text-xs text-white/60 font-medium">The API behind parental controls</span>
              </div>
            </AnimatedSection>

            {/* Headline with serif display + gradient */}
            <AnimatedSection delay={0.1}>
              <h1 className="font-display text-5xl sm:text-6xl lg:text-[72px] text-white leading-[1.05] mb-6 tracking-tight">
                Define once,{" "}
                <span className="bg-gradient-to-r from-[#00D47E] to-[#26A8C9] bg-clip-text text-transparent">
                  protect everywhere
                </span>
              </h1>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <p className="text-lg sm:text-xl text-white/50 leading-relaxed mb-10 max-w-lg">
                The infrastructure layer for parental control apps. Bark, Qustodio, and Aura define the policies — Phosra pushes them to Netflix, YouTube, and 188+ platforms.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={0.3}>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/login"
                  className="inline-flex items-center px-8 py-4 bg-brand-green text-foreground text-sm font-semibold rounded-sm hover:opacity-90 transition hover:shadow-[0_0_30px_-6px_rgba(0,212,126,0.4)]"
                >
                  Get Started Free
                </Link>
                <Link
                  href="/docs"
                  className="inline-flex items-center px-8 py-4 border border-white/20 text-white text-sm font-semibold rounded-sm hover:bg-white/5 hover:border-white/30 transition"
                >
                  Read the Docs
                </Link>
              </div>
            </AnimatedSection>
          </div>

          {/* Right — layered floating cards */}
          <div className="mt-10 lg:mt-0">
            <div className="relative">
              {/* Architecture flow card (offset behind) */}
              <AnimatedSection delay={0.5} direction="right">
                <FloatingElement duration={7} distance={6} delay={1}>
                  <div className="absolute -left-4 -top-4 lg:-left-8 lg:-top-6 w-[280px] bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-lg p-4 z-0">
                    {/* Layer 1: Parent Apps */}
                    <div className="mb-2">
                      <p className="text-[9px] text-white/30 uppercase tracking-wider mb-1.5">Parent Apps</p>
                      <div className="flex gap-1.5">
                        {["Bark", "Qustodio", "Aura"].map((app) => (
                          <span key={app} className="text-[10px] bg-white/[0.06] text-white/50 px-1.5 py-0.5 rounded">
                            {app}
                          </span>
                        ))}
                      </div>
                      <p className="text-[9px] text-white/25 mt-1">define policies</p>
                    </div>

                    {/* Arrow down */}
                    <div className="flex justify-center my-1">
                      <svg className="w-3.5 h-3.5 text-brand-green/60" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </div>

                    {/* Layer 2: Phosra API */}
                    <div className="mb-2">
                      <p className="text-[9px] text-white/30 uppercase tracking-wider mb-1.5">Phosra API</p>
                      <div className="flex gap-1.5">
                        <span className="text-[10px] bg-brand-green/20 text-brand-green px-2 py-0.5 rounded font-medium flex items-center gap-1">
                          <img src="/favicon.svg" alt="" className="w-3 h-3" />
                          Phosra
                        </span>
                      </div>
                      <p className="text-[9px] text-white/25 mt-1">translates &amp; pushes</p>
                    </div>

                    {/* Arrow down */}
                    <div className="flex justify-center my-1">
                      <svg className="w-3.5 h-3.5 text-brand-green/60" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </div>

                    {/* Layer 3: Platforms */}
                    <div>
                      <p className="text-[9px] text-white/30 uppercase tracking-wider mb-1.5">Platforms</p>
                      <div className="flex gap-1.5">
                        {["Netflix", "YouTube"].map((p) => (
                          <span key={p} className="text-[10px] bg-white/[0.06] text-white/50 px-1.5 py-0.5 rounded">
                            {p}
                          </span>
                        ))}
                        <span className="text-[10px] bg-white/[0.04] text-white/30 px-1.5 py-0.5 rounded">
                          +186
                        </span>
                      </div>
                      <p className="text-[9px] text-white/25 mt-1">enforce rules</p>
                    </div>
                  </div>
                </FloatingElement>
              </AnimatedSection>

              {/* Main policy card */}
              <AnimatedSection delay={0.4} direction="right">
                <FloatingElement duration={6} distance={8}>
                  <div className="relative z-10 bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] rounded-lg p-6 max-w-sm mx-auto lg:ml-auto shadow-[0_0_60px_-12px_rgba(0,212,126,0.2)]">
                    <div className="flex items-center gap-2 mb-5">
                      <img src="/favicon.svg" alt="" className="w-5 h-5" />
                      <span className="text-sm font-semibold text-white">Emma&apos;s Policy</span>
                      <span className="ml-auto text-[10px] bg-brand-green/20 text-brand-green px-2 py-0.5 rounded font-medium">Active</span>
                    </div>
                    <div className="space-y-3">
                      {[
                        { icon: Clock, label: "Screen time", value: "90 min/day" },
                        { icon: Tv, label: "Content rating", value: "PG / TV-Y7" },
                        { icon: Globe, label: "Web filtering", value: "Strict" },
                        { icon: Gamepad2, label: "Gaming", value: "E / PEGI 7" },
                        { icon: Smartphone, label: "Social media", value: "Blocked" },
                      ].map(({ icon: Icon, label, value }) => (
                        <div key={label} className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <Icon className="w-3.5 h-3.5 text-white/40" />
                            <span className="text-xs text-white/60">{label}</span>
                          </div>
                          <span className="text-xs font-medium text-white/80">{value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-5 pt-4 border-t border-white/10">
                      <p className="text-[10px] text-white/40 mb-2">Enforced on</p>
                      <div className="flex gap-2 flex-wrap">
                        {[
                          { icon: Wifi, label: "NextDNS" },
                          { icon: Smartphone, label: "Android" },
                          { icon: Monitor, label: "Microsoft" },
                          { icon: BookOpen, label: "CleanBrowsing" },
                        ].map(({ icon: Icon, label }) => (
                          <div key={label} className="flex items-center gap-1 bg-white/[0.06] px-2 py-1 rounded">
                            <Icon className="w-3 h-3 text-brand-green" />
                            <span className="text-[9px] text-white/60">{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </FloatingElement>
              </AnimatedSection>

              {/* Floating notification bubble */}
              <AnimatedSection delay={0.7} direction="right">
                <FloatingElement duration={5} distance={5} delay={2}>
                  <div className="absolute -right-2 bottom-4 lg:right-[-20px] lg:bottom-8 z-20 bg-white/[0.08] backdrop-blur border border-white/[0.08] rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-brand-green flex-shrink-0" />
                      <span className="text-[10px] text-white/60 whitespace-nowrap">Netflix — content rating updated</span>
                    </div>
                  </div>
                </FloatingElement>
              </AnimatedSection>
            </div>
          </div>
        </div>

        {/* Platform marquee */}
        <div className="mt-14 sm:mt-20 pt-8 sm:pt-10 border-t border-white/[0.06]">
          <p className="text-xs text-white/25 text-center mb-6 tracking-wider uppercase font-medium">
            Pushes rules to 188+ platforms
          </p>
          <div className="relative overflow-hidden">
            {/* Fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#0D1B2A] to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#0D1B2A] to-transparent z-10" />

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
    </section>
  )
}
