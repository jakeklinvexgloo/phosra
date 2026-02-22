"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, AlertTriangle, X } from "lucide-react"

const COPPA_DEADLINE = new Date("2026-04-22T00:00:00Z")

function getTimeRemaining() {
  const now = new Date()
  const diff = COPPA_DEADLINE.getTime() - now.getTime()

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, expired: true }
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  return { days, hours, minutes, expired: false }
}

export function COPPACountdownBanner() {
  const [dismissed, setDismissed] = useState(false)
  const [time, setTime] = useState(getTimeRemaining)

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getTimeRemaining())
    }, 60_000)

    return () => clearInterval(interval)
  }, [])

  if (dismissed) return null

  return (
    <Link
      href="/coppa-deadline"
      className="group relative block rounded-xl border border-red-500/20 bg-gradient-to-r from-red-950/80 via-amber-950/40 to-[#0D1B2A] p-4 sm:p-5 transition hover:border-red-500/40"
    >
      {/* Dismiss button */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setDismissed(true)
        }}
        className="absolute top-2.5 right-2.5 p-1 rounded-md text-white/30 hover:text-white/70 hover:bg-white/10 transition"
        aria-label="Dismiss banner"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
        {/* Left: Warning label */}
        <div className="flex items-center gap-2.5 shrink-0">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <span className="text-[11px] font-semibold tracking-wider uppercase text-amber-400/90">
            FTC COPPA Enforcement
          </span>
        </div>

        {/* Center: Date + Countdown */}
        <div className="flex-1 text-center">
          <p className="text-xl sm:text-2xl font-display font-bold text-white">
            April 22, 2026
          </p>
          {time.expired ? (
            <p className="text-sm font-medium text-red-400 mt-1">
              Enforcement Active
            </p>
          ) : (
            <p className="text-sm text-white/50 mt-1">
              <span className="text-white/80 font-medium">{time.days}</span>{" "}
              days{" · "}
              <span className="text-white/80 font-medium">{time.hours}</span>{" "}
              hours{" · "}
              <span className="text-white/80 font-medium">{time.minutes}</span>{" "}
              minutes
            </p>
          )}
        </div>

        {/* Right: CTA */}
        <div className="shrink-0 flex justify-center sm:justify-end">
          <span className="inline-flex items-center gap-1.5 bg-brand-green text-foreground text-sm font-medium px-4 py-1.5 rounded-full group-hover:shadow-[0_0_20px_-4px_rgba(0,212,126,0.4)] transition">
            Get Compliant
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}
