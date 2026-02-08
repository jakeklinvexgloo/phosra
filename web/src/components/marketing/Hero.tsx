"use client"

import Link from "next/link"
import { Shield, Clock, Globe, Wifi, Monitor, Smartphone, Tv, Gamepad2, BookOpen } from "lucide-react"

const PLATFORM_NAMES = [
  "NextDNS", "CleanBrowsing", "Android", "Microsoft", "Apple",
  "YouTube", "Netflix", "Roblox", "TikTok", "Instagram",
  "Discord", "Snapchat", "Twitch", "Spotify", "Steam",
]

export function Hero() {
  return (
    <section className="relative bg-[#111111] overflow-hidden">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#111111] via-[#111111] to-[#0a3d2a] opacity-100" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — text */}
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold text-white leading-[1.1] mb-6">
              Define once,{" "}
              <span className="text-brand-green">protect everywhere</span>
            </h1>
            <p className="text-lg text-white/60 leading-relaxed mb-10 max-w-lg">
              The universal parental controls API. One policy for your family, enforced across every platform, every device, automatically.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/login"
                className="inline-flex items-center px-7 py-3.5 bg-brand-green text-foreground text-sm font-semibold rounded-sm hover:opacity-90 transition"
              >
                Get Started Free
              </Link>
              <Link
                href="/dashboard/docs"
                className="inline-flex items-center px-7 py-3.5 border border-white/20 text-white text-sm font-semibold rounded-sm hover:bg-white/5 transition"
              >
                Read the Docs
              </Link>
            </div>
          </div>

          {/* Right — visual mockup */}
          <div className="hidden lg:block">
            <div className="relative">
              {/* Policy card */}
              <div className="bg-white/[0.06] backdrop-blur-sm border border-white/10 rounded-lg p-6 max-w-sm ml-auto">
                <div className="flex items-center gap-2 mb-5">
                  <Shield className="w-5 h-5 text-brand-green" />
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
                  <div className="flex gap-2">
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
            </div>
          </div>
        </div>

        {/* Platform logo bar */}
        <div className="mt-16 pt-10 border-t border-white/10">
          <p className="text-xs text-white/30 text-center mb-6 tracking-wide uppercase">Supports 15+ platforms</p>
          <div className="relative overflow-hidden">
            <div className="flex animate-scroll gap-10">
              {[...PLATFORM_NAMES, ...PLATFORM_NAMES].map((name, i) => (
                <span
                  key={`${name}-${i}`}
                  className="text-sm text-white/20 font-medium whitespace-nowrap flex-shrink-0"
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
