"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { AnimatedSection, WaveTexture, GradientMesh } from "./shared"
import { PLATFORM_STATS } from "@/lib/platforms"

const ROTATE_INTERVAL = 5000
const FADE_DURATION = 250

export function DevSection() {
  const [tab, setTab] = useState<"request" | "response">("request")
  const [fading, setFading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pausedRef = useRef(false)

  const switchTab = useCallback(() => {
    setFading(true)
    setTimeout(() => {
      setTab((prev) => (prev === "request" ? "response" : "request"))
      setFading(false)
    }, FADE_DURATION)
  }, [])

  useEffect(() => {
    const start = () => {
      timerRef.current = setInterval(() => {
        if (!pausedRef.current) switchTab()
      }, ROTATE_INTERVAL)
    }
    start()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [switchTab])

  const handleTab = (t: "request" | "response") => {
    if (t === tab) return
    if (timerRef.current) clearInterval(timerRef.current)
    setFading(true)
    setTimeout(() => {
      setTab(t)
      setFading(false)
    }, FADE_DURATION)
    timerRef.current = setInterval(() => {
      if (!pausedRef.current) switchTab()
    }, ROTATE_INTERVAL)
  }

  const handleMouseEnter = () => {
    pausedRef.current = true
  }
  const handleMouseLeave = () => {
    pausedRef.current = false
  }

  return (
    <section id="developers" className="relative py-24 sm:py-32 overflow-hidden bg-[#0A1628]">
      {/* Layered background textures */}
      <WaveTexture
        colorStart="#00D47E"
        colorEnd="#26A8C9"
        opacity={0.08}
      />
      <GradientMesh
        colors={["#00D47E", "#26A8C9", "#7B5CB8", "#0A1628"]}
        className="opacity-40"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">
          {/* Left — text */}
          <AnimatedSection direction="left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
              <span className="text-xs font-medium text-white/70">For Developers</span>
            </div>

            <h2 className="font-display text-3xl sm:text-5xl lg:text-[52px] text-white leading-[1.15] mb-6">
              {PLATFORM_STATS.marketingTotal} platforms.{" "}
              <span className="bg-gradient-to-r from-brand-green to-accent-teal bg-clip-text text-transparent">
                One API call.
              </span>
            </h2>

            <p className="text-white/60 text-base sm:text-lg leading-relaxed mb-10 max-w-sm sm:max-w-lg">
              Quick Setup creates a family, adds a child, generates 24 age-appropriate rules, and pushes them to every connected platform &mdash; Netflix, Kindle Fire, NextDNS, YouTube &mdash; all in a single request.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/login"
                className="group relative inline-flex items-center px-7 py-3.5 bg-brand-green text-foreground text-sm font-semibold rounded-sm transition-all hover:shadow-[0_0_24px_-4px_rgba(0,212,126,0.5)]"
              >
                Get API Keys
                <svg className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/dashboard/docs"
                className="inline-flex items-center px-7 py-3.5 border border-white/20 text-white text-sm font-semibold rounded-sm hover:bg-white/5 hover:border-white/30 transition-all"
              >
                Read the Docs
              </Link>
            </div>
          </AnimatedSection>

          {/* Right — code block */}
          <AnimatedSection direction="right" delay={0.2} className="min-w-0">
            <div
              className="relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {/* Glow behind code block */}
              <div className="absolute -inset-4 bg-gradient-to-br from-brand-green/10 via-accent-teal/5 to-transparent rounded-2xl blur-2xl" />

              <div className="relative bg-[#0D1117] rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                {/* Title bar */}
                <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.06] bg-white/[0.02]">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                    <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
                    <div className="w-3 h-3 rounded-full bg-[#28C840]" />
                  </div>
                  <div className="flex gap-1 ml-3">
                    <button
                      onClick={() => handleTab("request")}
                      className={`px-3 py-1 text-[11px] font-mono rounded transition-colors ${
                        tab === "request"
                          ? "text-white bg-white/10"
                          : "text-white/40 hover:text-white/60"
                      }`}
                    >
                      Request
                    </button>
                    <button
                      onClick={() => handleTab("response")}
                      className={`px-3 py-1 text-[11px] font-mono rounded transition-colors ${
                        tab === "response"
                          ? "text-white bg-white/10"
                          : "text-white/40 hover:text-white/60"
                      }`}
                    >
                      Response
                    </button>
                  </div>
                  <span className="ml-auto text-[11px] text-white/30 font-mono">/v1/setup/quick</span>
                </div>

                {/* Code content with line numbers */}
                <div className="relative overflow-x-auto">
                  {/* Invisible height holder */}
                  <pre
                    className="p-0 text-[11px] sm:text-[13px] leading-6 font-mono invisible"
                    aria-hidden="true"
                  >
                    <ResponseCode />
                  </pre>
                  {/* Visible layer */}
                  <pre
                    className="absolute inset-0 overflow-x-auto text-[11px] sm:text-[13px] leading-6 font-mono transition-opacity"
                    style={{
                      opacity: fading ? 0 : 1,
                      transitionDuration: `${FADE_DURATION}ms`,
                    }}
                  >
                    {tab === "request" ? <RequestCode /> : <ResponseCode />}
                  </pre>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}

/* ── Line-numbered code helpers ─────────────────────────── */

function LineNumber({ n }: { n: number }) {
  return (
    <span className="inline-block w-8 text-right text-white/20 select-none mr-4">
      {n}
    </span>
  )
}

function RequestCode() {
  return (
    <code className="block px-5 py-5">
      <LineNumber n={1} /><span className="text-slate-400">curl</span>{" "}
      <span className="text-sky-400">-X POST</span>{" "}
      <span className="text-brand-green">https://api.phosra.com/v1/setup/quick</span>{" "}
      <span className="text-white/30">\</span>{"\n"}
      <LineNumber n={2} />{"  "}<span className="text-sky-400">-H</span>{" "}
      <span className="text-amber-300">&quot;Authorization: Bearer $API_KEY&quot;</span>{" "}
      <span className="text-white/30">\</span>{"\n"}
      <LineNumber n={3} />{"  "}<span className="text-sky-400">-H</span>{" "}
      <span className="text-amber-300">&quot;Content-Type: application/json&quot;</span>{" "}
      <span className="text-white/30">\</span>{"\n"}
      <LineNumber n={4} />{"  "}<span className="text-sky-400">-d</span>{" "}
      <span className="text-amber-300">&apos;{"{"}</span>{"\n"}
      <LineNumber n={5} />{"    "}<span className="text-sky-300">&quot;family_name&quot;</span>
      <span className="text-white/40">:</span>{" "}
      <span className="text-brand-green">&quot;The Smiths&quot;</span>
      <span className="text-white/40">,</span>{"\n"}
      <LineNumber n={6} />{"    "}<span className="text-sky-300">&quot;child_name&quot;</span>
      <span className="text-white/40">:</span>{" "}
      <span className="text-brand-green">&quot;Emma&quot;</span>
      <span className="text-white/40">,</span>{"\n"}
      <LineNumber n={7} />{"    "}<span className="text-sky-300">&quot;child_birth_date&quot;</span>
      <span className="text-white/40">:</span>{" "}
      <span className="text-brand-green">&quot;2017-03-15&quot;</span>
      <span className="text-white/40">,</span>{"\n"}
      <LineNumber n={8} />{"    "}<span className="text-sky-300">&quot;strictness&quot;</span>
      <span className="text-white/40">:</span>{" "}
      <span className="text-brand-green">&quot;recommended&quot;</span>{"\n"}
      <LineNumber n={9} />{"  "}<span className="text-amber-300">{"}"}&apos;</span>
    </code>
  )
}

function ResponseCode() {
  return (
    <code className="block px-5 py-5">
      <LineNumber n={1} /><span className="text-white/30">{"// 200 OK — 24 rules enforced across 4 platforms"}</span>{"\n"}
      <LineNumber n={2} /><span className="text-white/40">{"{"}</span>{"\n"}
      <LineNumber n={3} />{"  "}<span className="text-sky-300">&quot;family_id&quot;</span><span className="text-white/40">:</span> <span className="text-brand-green">&quot;fam_8x2kP4nL&quot;</span><span className="text-white/40">,</span>{"\n"}
      <LineNumber n={4} />{"  "}<span className="text-sky-300">&quot;child&quot;</span><span className="text-white/40">:</span> <span className="text-white/40">{"{"}</span> <span className="text-sky-300">&quot;name&quot;</span><span className="text-white/40">:</span> <span className="text-brand-green">&quot;Emma&quot;</span><span className="text-white/40">,</span> <span className="text-sky-300">&quot;age&quot;</span><span className="text-white/40">:</span> <span className="text-amber-300">8</span> <span className="text-white/40">{"}"}</span><span className="text-white/40">,</span>{"\n"}
      <LineNumber n={5} />{"  "}<span className="text-sky-300">&quot;rules_generated&quot;</span><span className="text-white/40">:</span> <span className="text-amber-300">24</span><span className="text-white/40">,</span>{"\n"}
      {/* Highlighted enforcement line */}
      <span className="block bg-brand-green/[0.06] -mx-5 px-5 border-l-2 border-brand-green">
        <LineNumber n={6} />{"  "}<span className="text-sky-300">&quot;enforcement&quot;</span><span className="text-white/40">:</span> <span className="text-white/40">[</span>{"\n"}
      </span>
      <LineNumber n={7} />{"    "}<span className="text-white/40">{"{"}</span> <span className="text-white font-medium">&quot;Netflix&quot;</span><span className="text-white/40">:</span>{"      "}<span className="text-brand-green">&quot;applied&quot;</span><span className="text-white/40">,</span> <span className="text-sky-300">&quot;rules&quot;</span><span className="text-white/40">:</span> <span className="text-amber-300">6</span> <span className="text-white/40">{"}"}</span><span className="text-white/40">,</span>{"\n"}
      <LineNumber n={8} />{"    "}<span className="text-white/40">{"{"}</span> <span className="text-white font-medium">&quot;Kindle Fire&quot;</span><span className="text-white/40">:</span>{"  "}<span className="text-brand-green">&quot;applied&quot;</span><span className="text-white/40">,</span> <span className="text-sky-300">&quot;rules&quot;</span><span className="text-white/40">:</span> <span className="text-amber-300">8</span> <span className="text-white/40">{"}"}</span><span className="text-white/40">,</span>{"\n"}
      <LineNumber n={9} />{"    "}<span className="text-white/40">{"{"}</span> <span className="text-white font-medium">&quot;NextDNS&quot;</span><span className="text-white/40">:</span>{"      "}<span className="text-brand-green">&quot;applied&quot;</span><span className="text-white/40">,</span> <span className="text-sky-300">&quot;rules&quot;</span><span className="text-white/40">:</span> <span className="text-amber-300">5</span> <span className="text-white/40">{"}"}</span><span className="text-white/40">,</span>{"\n"}
      <LineNumber n={10} />{"    "}<span className="text-white/40">{"{"}</span> <span className="text-white font-medium">&quot;YouTube&quot;</span><span className="text-white/40">:</span>{"      "}<span className="text-brand-green">&quot;applied&quot;</span><span className="text-white/40">,</span> <span className="text-sky-300">&quot;rules&quot;</span><span className="text-white/40">:</span> <span className="text-amber-300">5</span> <span className="text-white/40">{"}"}</span>{"\n"}
      <LineNumber n={11} />{"  "}<span className="text-white/40">]</span>{"\n"}
      <LineNumber n={12} /><span className="text-white/40">{"}"}</span>
    </code>
  )
}
