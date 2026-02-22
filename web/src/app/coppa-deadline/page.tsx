"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, Shield, Clock, AlertTriangle, CheckCircle2, FileText, Users, Lock, Eye, Database, Bell } from "lucide-react"
import { AnimatedSection, WaveTexture, GradientMesh, PhosraBurst, StaggerChildren } from "@/components/marketing/shared"

/* ── Constants ──────────────────────────────────────────────────── */

const DEADLINE = new Date("2026-04-22T00:00:00-04:00")

const REQUIREMENTS = [
  {
    icon: Users,
    title: "Separate Parental Consent",
    description:
      "Operators need separate VPC before disclosing children's data for advertising or non-integral purposes",
  },
  {
    icon: FileText,
    title: "Written Data Retention Policy",
    description:
      "Must document purpose, business need, and deletion timeline — publish in COPPA privacy notice",
  },
  {
    icon: Bell,
    title: "Enhanced Direct Notice",
    description:
      "Notices to parents must disclose how the operator intends to use children's data",
  },
  {
    icon: Eye,
    title: "Third-Party Oversight",
    description:
      "Written confirmation from every service provider that they have reasonable security measures",
  },
  {
    icon: Database,
    title: "Expanded Personal Information",
    description:
      "Now includes biometric identifiers and government-issued identifiers",
  },
  {
    icon: Lock,
    title: "New Consent Methods",
    description:
      "Knowledge-based questions, facial recognition with gov ID, text-plus verification",
  },
]

const CHECKLIST_ITEMS = [
  { requirement: "Separate parental consent for ads", feature: "parental_consent_gate" },
  { requirement: "Data retention policy enforcement", feature: "data_deletion_request" },
  { requirement: "Enhanced direct notice to parents", feature: "parental_event_notification" },
  { requirement: "Third-party provider oversight", feature: "commercial_data_ban" },
  { requirement: "Expanded PII protection", feature: "targeted_ad_block" },
  { requirement: "New consent method support", feature: "screen_time_report" },
]

const ENFORCEMENT_STATS = [
  { amount: "$520M", label: "Epic Games COPPA settlement" },
  { amount: "$170M", label: "YouTube COPPA settlement" },
  { amount: "$5.7M", label: "TikTok COPPA fine" },
]

const TRUST_BADGES = [
  { icon: "🔒", label: "AES-256 Encrypted" },
  { icon: "✓", label: "COPPA Aligned" },
]

const CODE_SNIPPET = `POST /v1/children/{id}/enforce
{
  "rules": [
    "parental_consent_gate",
    "targeted_ad_block",
    "commercial_data_ban",
    "data_deletion_request"
  ],
  "platforms": ["youtube", "instagram", "tiktok", "roblox"]
}`

/* ── Helpers ─────────────────────────────────────────────────────── */

function getTimeRemaining() {
  const now = new Date().getTime()
  const distance = DEADLINE.getTime() - now

  if (distance <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, totalDays: 0 }
  }

  return {
    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((distance % (1000 * 60)) / 1000),
    totalDays: Math.ceil(distance / (1000 * 60 * 60 * 24)),
  }
}

/* ── Page ────────────────────────────────────────────────────────── */

export default function COPPADeadlinePage() {
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => {
      setTimeLeft(getTimeRemaining())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div>
      {/* ──────────────────────────────────────────────────────────
          HERO
      ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0D1B2A] via-[#0F2035] to-[#0A1628]">
        {/* Background layers */}
        <div className="absolute inset-0">
          <WaveTexture colorStart="#00D47E" colorEnd="#26A8C9" opacity={0.1} />
        </div>
        <GradientMesh
          colors={["#00D47E", "#26A8C9", "#7B5CB8", "#0D1B2A"]}
          className="opacity-30"
        />
        <div className="absolute -bottom-24 -right-24">
          <PhosraBurst size={600} color="#00D47E" opacity={0.05} rotate={15} animate />
        </div>
        <div className="absolute -top-20 -left-20">
          <PhosraBurst size={350} color="#26A8C9" opacity={0.04} rotate={-30} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-8 py-20 sm:py-28 lg:py-36">
          <AnimatedSection initiallyVisible>
            {/* Urgency badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/30 bg-red-500/10 backdrop-blur-sm mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              <span className="text-xs font-bold tracking-wide text-red-300 uppercase">
                Enforcement in {mounted ? timeLeft.totalDays : "—"} days
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display text-white leading-tight max-w-4xl mb-6">
              The FTC&apos;s COPPA Deadline Is{" "}
              <span className="bg-gradient-to-r from-brand-green to-accent-teal bg-clip-text text-transparent">
                April 22.
              </span>
            </h1>

            <p className="text-xl sm:text-2xl font-display text-white/80 mb-4">
              One API to get compliant.
            </p>

            <p className="text-base sm:text-lg text-white/50 max-w-2xl leading-relaxed mb-10">
              $53,088 per violation. Per child. Per instance. The FTC has called
              COPPA enforcement its top priority for 2026.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 bg-brand-green text-foreground px-6 py-3 rounded-full font-medium hover:shadow-[0_0_28px_-4px_rgba(0,212,126,0.5)] transition"
              >
                Get Compliant Now
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/newsroom/coppa-rule-deadline-april-2026"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium border border-white/20 text-white/80 hover:bg-white/5 transition"
              >
                Read the Full Analysis
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          COUNTDOWN
      ────────────────────────────────────────────────────────── */}
      <section className="relative py-20 sm:py-28 bg-background overflow-hidden">
        <AnimatedSection className="max-w-4xl mx-auto px-4 sm:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-muted/50 mb-8">
            <Clock className="w-3.5 h-3.5 text-brand-green" />
            <span className="text-xs font-medium text-muted-foreground">Live Countdown</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 max-w-xl mx-auto mb-8">
            {[
              { value: timeLeft.days, label: "Days" },
              { value: timeLeft.hours, label: "Hours" },
              { value: timeLeft.minutes, label: "Minutes" },
              { value: timeLeft.seconds, label: "Seconds" },
            ].map((unit) => (
              <div
                key={unit.label}
                className="relative rounded-xl border border-border bg-card/80 backdrop-blur-sm p-4 sm:p-6 shadow-sm"
              >
                <p className="text-3xl sm:text-5xl font-display text-foreground tabular-nums">
                  {mounted
                    ? String(unit.value).padStart(2, "0")
                    : "—"}
                </p>
                <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider mt-1">
                  {unit.label}
                </p>
              </div>
            ))}
          </div>

          <p className="text-sm sm:text-base text-muted-foreground">
            Until full FTC COPPA Rule enforcement begins
          </p>
        </AnimatedSection>
      </section>

      {/* ──────────────────────────────────────────────────────────
          WHAT'S REQUIRED
      ────────────────────────────────────────────────────────── */}
      <section className="relative py-20 sm:py-28 bg-muted/30 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-8">
          <AnimatedSection className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-muted/50 mb-6">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs font-medium text-muted-foreground">New Requirements</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display text-foreground">
              6 New Requirements by April 22
            </h2>
          </AnimatedSection>

          <StaggerChildren
            staggerDelay={0.08}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {REQUIREMENTS.map((req) => {
              const Icon = req.icon
              return (
                <div
                  key={req.title}
                  className="plaid-card rounded-xl p-6 hover:border-brand-green/30 hover:shadow-[0_0_24px_-8px_rgba(0,212,126,0.15)] transition-all duration-300"
                >
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-brand-green/10 mb-4">
                    <Icon className="w-5 h-5 text-brand-green" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">
                    {req.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {req.description}
                  </p>
                </div>
              )
            })}
          </StaggerChildren>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          WHAT PHOSRA HANDLES
      ────────────────────────────────────────────────────────── */}
      <section className="relative py-20 sm:py-28 overflow-hidden bg-gradient-to-br from-[#0D1B2A] via-[#0F2035] to-[#0A1628]">
        <div className="absolute inset-0">
          <WaveTexture colorStart="#00D47E" colorEnd="#26A8C9" opacity={0.08} />
        </div>
        <div className="absolute -bottom-16 -left-16">
          <PhosraBurst size={400} color="#00D47E" opacity={0.04} rotate={-20} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-8">
          <AnimatedSection className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-6">
              <Shield className="w-3.5 h-3.5 text-brand-green" />
              <span className="text-xs font-medium text-white/70">One Integration</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display text-white">
              One API. Every Requirement.
            </h2>
          </AnimatedSection>

          <div className="grid lg:grid-cols-2 gap-6 lg:gap-14 items-start">
            {/* Left — checklist */}
            <AnimatedSection direction="left" delay={0.1}>
              <div className="space-y-4">
                {CHECKLIST_ITEMS.map((item) => (
                  <div
                    key={item.feature}
                    className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.04] border border-white/[0.06]"
                  >
                    <CheckCircle2 className="w-5 h-5 text-brand-green flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-white">
                        {item.requirement}
                      </p>
                      <p className="text-xs text-white/40 font-mono mt-0.5">
                        {item.feature}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </AnimatedSection>

            {/* Right — code snippet */}
            <AnimatedSection direction="right" delay={0.2}>
              <div className="relative">
                {/* Card glow */}
                <div className="absolute -inset-3 bg-gradient-to-br from-brand-green/15 via-accent-teal/8 to-transparent rounded-2xl blur-2xl" />

                <div className="relative bg-[#0B1520] border border-white/10 rounded-xl overflow-hidden">
                  {/* Tab bar */}
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                    </div>
                    <span className="text-[10px] font-mono text-white/30 ml-2">
                      enforce.sh
                    </span>
                  </div>

                  <pre className="p-5 text-sm leading-relaxed overflow-x-auto">
                    <code className="text-white/80 font-mono">{CODE_SNIPPET}</code>
                  </pre>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          THE STAKES
      ────────────────────────────────────────────────────────── */}
      <section className="relative py-20 sm:py-28 bg-background overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-8">
          <AnimatedSection className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-muted/50 mb-6">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
              <span className="text-xs font-medium text-muted-foreground">Enforcement Precedent</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display text-foreground">
              The Cost of Non-Compliance
            </h2>
          </AnimatedSection>

          <StaggerChildren
            staggerDelay={0.1}
            className="grid sm:grid-cols-3 gap-5 mb-12"
          >
            {ENFORCEMENT_STATS.map((stat) => (
              <div
                key={stat.label}
                className="plaid-card rounded-xl p-8 text-center hover:border-red-500/20 transition-all duration-300"
              >
                <p className="text-4xl sm:text-5xl font-display text-foreground mb-3">
                  {stat.amount}
                </p>
                <p className="text-sm text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </StaggerChildren>

          <AnimatedSection delay={0.3} className="text-center">
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Penalties under the amended rule:{" "}
              <span className="font-semibold text-foreground">
                $53,088 per violation. Per child. Per instance.
              </span>
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          CTA
      ────────────────────────────────────────────────────────── */}
      <section className="relative py-24 sm:py-32 overflow-hidden bg-gradient-to-br from-[#0D1B2A] via-[#0A2F2F] to-[#0D1B2A]">
        {/* Background textures */}
        <WaveTexture colorStart="#00D47E" colorEnd="#26A8C9" opacity={0.1} />
        <GradientMesh
          colors={["#00D47E", "#26A8C9", "#7B5CB8", "#0D1B2A"]}
          className="opacity-30"
        />
        <div className="absolute -bottom-20 -right-20">
          <PhosraBurst size={500} color="#00D47E" opacity={0.05} rotate={15} animate />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 xl:gap-20 items-center">
            {/* Left — headline */}
            <AnimatedSection direction="left">
              <h2 className="font-display text-4xl sm:text-5xl lg:text-[42px] xl:text-[52px] text-white leading-[1.15] mb-6">
                {mounted ? timeLeft.totalDays : "59"} Days.{" "}
                <span className="bg-gradient-to-r from-brand-green to-accent-teal bg-clip-text text-transparent">
                  One API Call.
                </span>
              </h2>
              <p className="text-white/50 text-lg leading-relaxed mb-8 max-w-lg">
                Don&apos;t build compliance infrastructure from scratch. Get
                COPPA-ready with Phosra.
              </p>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-4">
                {TRUST_BADGES.map((badge) => (
                  <div
                    key={badge.label}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm"
                  >
                    <span className="text-sm">{badge.icon}</span>
                    <span className="text-xs font-medium text-white/60">
                      {badge.label}
                    </span>
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
                    Ready to get compliant?
                  </h3>
                  <p className="text-white/40 text-sm mb-8">
                    Create a free account — no credit card required.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      href="/login"
                      className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-3.5 bg-brand-green text-foreground text-sm font-semibold rounded-lg transition-all hover:shadow-[0_0_28px_-4px_rgba(0,212,126,0.5)]"
                    >
                      Start Free — No Credit Card
                      <svg
                        className="ml-2 w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </Link>
                  </div>

                  {/* Social proof line */}
                  <div className="mt-6 pt-6 border-t border-white/[0.06] flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
                    <p className="text-xs text-white/40">
                      Supporting families across 31 community movements
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </div>
  )
}
