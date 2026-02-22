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
      className="group relative block rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/15 via-red-500/10 to-amber-500/5 backdrop-blur-sm p-4 sm:p-5 transition hover:border-amber-500/50 hover:bg-gradient-to-r hover:from-amber-500/20 hover:via-red-500/15 hover:to-amber-500/10"
    >
      {/* Dismiss button */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setDismissed(true)
        }}
        className="absolute top-2.5 right-2.5 p-1 rounded-md text-white/40 hover:text-white/80 hover:bg-white/10 transition z-10"
        aria-label="Dismiss banner"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
        {/* Left: Warning label */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="relative">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <div className="absolute inset-0 animate-ping">
              <AlertTriangle className="w-5 h-5 text-amber-400 opacity-40" />
            </div>
          </div>
          <span className="text-[11px] font-bold tracking-wider uppercase text-amber-300">
            FTC COPPA Enforcement
          </span>
        </div>

        {/* Center: Countdown */}
        <div className="flex-1 flex items-center justify-center gap-3 sm:gap-4">
          {time.expired ? (
            <p className="text-lg font-bold text-red-400">
              Enforcement Active
            </p>
          ) : (
            <>
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-display font-bold text-white tabular-nums">
                  {mounted ? time.days : "--"}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-white/50 mt-0.5">Days</p>
              </div>
              <span className="text-white/30 text-xl font-light">:</span>
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-display font-bold text-white tabular-nums">
                  {mounted ? pad(time.hours) : "--"}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-white/50 mt-0.5">Hours</p>
              </div>
              <span className="text-white/30 text-xl font-light">:</span>
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-display font-bold text-white tabular-nums">
                  {mounted ? pad(time.minutes) : "--"}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-white/50 mt-0.5">Min</p>
              </div>
              <span className="text-white/30 text-xl font-light">:</span>
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-display font-bold text-white tabular-nums">
                  {mounted ? pad(time.seconds) : "--"}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-white/50 mt-0.5">Sec</p>
              </div>
            </>
          )}
        </div>

        {/* Right: CTA */}
        <div className="shrink-0 flex justify-center sm:justify-end">
          <span className="inline-flex items-center gap-1.5 bg-brand-green text-foreground text-sm font-semibold px-5 py-2 rounded-full group-hover:shadow-[0_0_24px_-4px_rgba(0,212,126,0.5)] transition">
            Get Compliant
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}
