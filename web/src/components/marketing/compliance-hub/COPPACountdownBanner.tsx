"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, AlertTriangle, X } from "lucide-react"

const COPPA_DEADLINE = new Date("2026-04-22T00:00:00Z")

function getTimeRemaining() {
  const now = new Date()
  const diff = COPPA_DEADLINE.getTime() - now.getTime()

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  return { days, hours, minutes, seconds, expired: false }
}

function pad(n: number) {
  return String(n).padStart(2, "0")
}

export function COPPACountdownBanner() {
  const [dismissed, setDismissed] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [time, setTime] = useState(getTimeRemaining)

  useEffect(() => {
    setMounted(true)
    setTime(getTimeRemaining())
    const interval = setInterval(() => {
      setTime(getTimeRemaining())
    }, 1_000)

    return () => clearInterval(interval)
  }, [])

  if (dismissed) return null

  return (
    <Link
      href="/coppa-deadline"
      className="group relative block rounded-xl bg-[#1C1017] border border-amber-500/40 p-5 sm:p-6 transition hover:border-amber-400/60 hover:shadow-[0_0_30px_-8px_rgba(245,158,11,0.25)] overflow-hidden"
    >
      {/* Subtle warm glow behind content */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-900/30 via-amber-900/20 to-red-900/10 pointer-events-none" />

      {/* Dismiss button */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setDismissed(true)
        }}
        className="absolute top-3 right-3 p-1.5 rounded-md text-white/40 hover:text-white/80 hover:bg-white/10 transition z-10"
        aria-label="Dismiss banner"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="relative flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8">
        {/* Left: Label + Date */}
        <div className="shrink-0">
          <div className="flex items-center gap-2 mb-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-[11px] font-bold tracking-wider uppercase text-amber-400">
              FTC COPPA Enforcement
            </span>
          </div>
          <p className="text-lg font-display font-bold text-white">
            April 22, 2026
          </p>
        </div>

        {/* Center: Countdown boxes */}
        <div className="flex-1 flex items-center justify-center gap-2.5 sm:gap-3">
          {time.expired ? (
            <p className="text-lg font-bold text-red-400">
              Enforcement Active
            </p>
          ) : (
            <>
              {[
                { value: mounted ? String(time.days) : "--", label: "Days" },
                { value: mounted ? pad(time.hours) : "--", label: "Hours" },
                { value: mounted ? pad(time.minutes) : "--", label: "Min" },
                { value: mounted ? pad(time.seconds) : "--", label: "Sec" },
              ].map((unit, i) => (
                <div key={unit.label} className="flex items-center gap-2.5 sm:gap-3">
                  {i > 0 && (
                    <span className="text-amber-500/50 text-lg font-light select-none">:</span>
                  )}
                  <div className="text-center min-w-[3rem] sm:min-w-[3.5rem] rounded-lg bg-white/[0.07] border border-white/[0.08] py-2 px-1">
                    <p className="text-xl sm:text-2xl font-display font-bold text-white tabular-nums leading-none">
                      {unit.value}
                    </p>
                    <p className="text-[9px] uppercase tracking-widest text-amber-400/70 mt-1.5 font-medium">
                      {unit.label}
                    </p>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Right: CTA */}
        <div className="shrink-0 flex justify-center sm:justify-end">
          <span className="inline-flex items-center gap-1.5 bg-brand-green text-foreground text-sm font-semibold px-5 py-2.5 rounded-full group-hover:shadow-[0_0_24px_-4px_rgba(0,212,126,0.5)] transition">
            Get Compliant
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}
