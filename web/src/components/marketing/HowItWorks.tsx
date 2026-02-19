"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence, useInView } from "framer-motion"
import { AnimatedSection, WaveTexture, GradientMesh } from "./shared"
import { PLATFORM_STATS } from "@/lib/platforms"

/* ── Step data ───────────────────────────── */

const STEPS = [
  {
    number: "01",
    title: "Define",
    description:
      "Create a family, add your children, set age. Phosra generates rules automatically based on age-appropriate defaults and legislative requirements.",
    detail: "24 rules generated in <100ms",
  },
  {
    number: "02",
    title: "Connect",
    description:
      "Link your platforms — DNS filters, mobile devices, browsers, and more. One credential per platform, verified and encrypted with AES-256-GCM.",
    detail: `${PLATFORM_STATS.marketingTotal} platform integrations`,
  },
  {
    number: "03",
    title: "Enforce",
    description:
      "Push rules to every connected platform with one API call. Monitor compliance in real-time and get notified when enforcement fails.",
    detail: "Real-time sync & monitoring",
  },
]

const STEP_INTERVAL = 4000

/* ── Main Component ──────────────────────── */

export function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: false, amount: 0.3 })
  const [activeStep, setActiveStep] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Reduced-motion check
  useEffect(() => {
    if (typeof window !== "undefined") {
      setPrefersReducedMotion(
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      )
    }
  }, [])

  // Auto-advance timer
  const startTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3)
    }, STEP_INTERVAL)
  }, [])

  const stopTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  // Start/stop based on visibility + hover
  useEffect(() => {
    if (prefersReducedMotion) return

    if (isInView && !isHovered) {
      startTimer()
    } else {
      stopTimer()
    }

    return stopTimer
  }, [isInView, isHovered, prefersReducedMotion, startTimer, stopTimer])

  const handleStepClick = (index: number) => {
    setActiveStep(index)
    // Reset the timer so it counts a full interval from the click
    if (isInView && !isHovered && !prefersReducedMotion) {
      startTimer()
    }
  }

  return (
    <section
      ref={sectionRef}
      className="relative py-24 sm:py-32 overflow-hidden bg-gradient-to-br from-[#0D1B2A] via-[#0A2F2F] to-[#0D1B2A]"
    >
      {/* Background textures */}
      <WaveTexture colorStart="#00D47E" colorEnd="#26A8C9" opacity={0.06} />
      <GradientMesh
        colors={["#00D47E", "#26A8C9", "#7B5CB8", "#0D1B2A"]}
        className="opacity-20"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-16 sm:mb-20">
          <h2 className="font-display text-4xl sm:text-5xl text-white leading-tight mb-5">
            Three steps to total protection
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            From zero to fully enforced parental controls in minutes, not hours.
          </p>
        </AnimatedSection>

        {/* Interactive step-through */}
        <div
          className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Left: step tabs */}
          <div className="space-y-3">
            {STEPS.map((step, i) => {
              const isActive = activeStep === i
              return (
                <button
                  key={step.number}
                  onClick={() => handleStepClick(i)}
                  className={`
                    relative w-full text-left rounded-xl p-5 sm:p-6 transition-all duration-300
                    border backdrop-blur-xl cursor-pointer
                    ${
                      isActive
                        ? "bg-white/[0.07] border-brand-green/30 shadow-[0_0_40px_-12px_rgba(0,212,126,0.15)]"
                        : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.1]"
                    }
                  `}
                >
                  {/* Active indicator bar */}
                  <div
                    className={`absolute left-0 top-4 bottom-4 w-[3px] rounded-full transition-all duration-300 ${
                      isActive ? "bg-brand-green" : "bg-transparent"
                    }`}
                  />

                  <div className="flex items-start gap-4">
                    {/* Step number */}
                    <span
                      className={`shrink-0 font-mono text-sm font-semibold transition-colors duration-300 mt-0.5 ${
                        isActive ? "text-brand-green" : "text-white/25"
                      }`}
                    >
                      {step.number}
                    </span>

                    <div className="flex-1 min-w-0">
                      <h3
                        className={`font-display text-xl sm:text-2xl transition-colors duration-300 mb-1.5 ${
                          isActive ? "text-white" : "text-white/40"
                        }`}
                      >
                        {step.title}
                      </h3>

                      {/* Description — only visible when active */}
                      <AnimatePresence mode="wait">
                        {isActive && (
                          <motion.div
                            initial={prefersReducedMotion ? false : { height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={prefersReducedMotion ? undefined : { height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden"
                          >
                            <p className="text-white/45 text-sm leading-relaxed mb-3">
                              {step.description}
                            </p>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-green/10 border border-brand-green/20">
                              <div className="w-1.5 h-1.5 rounded-full bg-brand-green" />
                              <span className="text-xs font-medium text-brand-green">
                                {step.detail}
                              </span>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Progress bar for active step */}
                  {isActive && !prefersReducedMotion && isInView && !isHovered && (
                    <div className="absolute bottom-0 left-4 right-4 h-[2px] rounded-full overflow-hidden bg-white/[0.06]">
                      <motion.div
                        className="h-full bg-brand-green/40 origin-left"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: STEP_INTERVAL / 1000, ease: "linear" }}
                        key={`progress-${activeStep}`}
                      />
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Right: animated visuals */}
          <div className="relative min-h-[340px] sm:min-h-[380px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              {activeStep === 0 && (
                <StepDefineVisual key="define" reduced={prefersReducedMotion} />
              )}
              {activeStep === 1 && (
                <StepConnectVisual key="connect" reduced={prefersReducedMotion} />
              )}
              {activeStep === 2 && (
                <StepEnforceVisual key="enforce" reduced={prefersReducedMotion} />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── Step Visuals ────────────────────────── */

const cardTransition = {
  initial: { opacity: 0, y: 16, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -12, scale: 0.97 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
}

/* Step 1: Define — child profile creation */
function StepDefineVisual({ reduced }: { reduced: boolean }) {
  const [phase, setPhase] = useState(0) // 0=name, 1=age, 2=rules

  useEffect(() => {
    if (reduced) {
      setPhase(2)
      return
    }
    setPhase(0)
    const t1 = setTimeout(() => setPhase(1), 800)
    const t2 = setTimeout(() => setPhase(2), 2000)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [reduced])

  return (
    <motion.div {...cardTransition} className="w-full max-w-sm">
      <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden shadow-[0_0_60px_-12px_rgba(0,212,126,0.1)]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-green/20 to-accent-teal/20 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-brand-green" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <span className="text-sm font-medium text-white/70">New Child Profile</span>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          {/* Name field */}
          <div>
            <label className="block text-xs font-medium text-white/30 mb-1.5">Name</label>
            <div className="h-10 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center px-3">
              <motion.span
                className="text-sm text-white/80 font-medium"
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: phase >= 0 ? 1 : 0 }}
                transition={{ duration: 0.4 }}
              >
                Emma
              </motion.span>
              {phase === 0 && !reduced && (
                <motion.span
                  className="w-px h-4 bg-brand-green ml-0.5"
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                />
              )}
            </div>
          </div>

          {/* Age slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-white/30">Age</label>
              <motion.span
                className="text-xs font-semibold text-brand-green"
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: phase >= 1 ? 1 : 0 }}
              >
                8 years old
              </motion.span>
            </div>
            <div className="relative h-2 rounded-full bg-white/[0.08]">
              <motion.div
                className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-brand-green to-accent-teal"
                initial={reduced ? { width: "40%" } : { width: "0%" }}
                animate={{ width: phase >= 1 ? "40%" : "0%" }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              />
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-md border-2 border-brand-green"
                initial={reduced ? { left: "calc(40% - 8px)" } : { left: "-8px" }}
                animate={{ left: phase >= 1 ? "calc(40% - 8px)" : "-8px" }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-white/20">0</span>
              <span className="text-[10px] text-white/20">17</span>
            </div>
          </div>

          {/* Rules generated */}
          <motion.div
            className="flex items-center gap-3 p-3.5 rounded-xl bg-brand-green/[0.08] border border-brand-green/20"
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: phase >= 2 ? 1 : 0, y: phase >= 2 ? 0 : 8 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="w-8 h-8 rounded-full bg-brand-green/20 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-brand-green" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-white/90">24 rules generated</p>
              <p className="text-xs text-white/40">Age-appropriate defaults applied</p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

/* Step 2: Connect — platform icons connecting to central node */
function StepConnectVisual({ reduced }: { reduced: boolean }) {
  const platforms = [
    { name: "NextDNS", icon: "N", color: "#00D47E", delay: 0 },
    { name: "Netflix", icon: "N", color: "#E50914", delay: 0.6 },
    { name: "Android", icon: "A", color: "#3DDC84", delay: 1.2 },
  ]
  const [connected, setConnected] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (reduced) {
      setConnected(new Set([0, 1, 2]))
      return
    }
    setConnected(new Set())
    const timers: ReturnType<typeof setTimeout>[] = []
    platforms.forEach((p, i) => {
      timers.push(setTimeout(() => setConnected((prev) => { const next = new Set(Array.from(prev)); next.add(i); return next }), 600 + p.delay * 1000))
    })
    return () => timers.forEach(clearTimeout)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced])

  return (
    <motion.div {...cardTransition} className="w-full max-w-sm">
      <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden shadow-[0_0_60px_-12px_rgba(0,212,126,0.1)]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-green/20 to-accent-teal/20 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-brand-green" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <span className="text-sm font-medium text-white/70">Connect Platforms</span>
        </div>

        {/* Body */}
        <div className="p-5">
          {/* Central Phosra node */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-green/20 to-accent-teal/20 border border-brand-green/30 flex items-center justify-center">
                <img src="/favicon.svg" alt="" className="w-7 h-7" />
              </div>
              {/* Pulse ring */}
              {!reduced && (
                <div className="absolute inset-0 rounded-2xl border border-brand-green/20 animate-ping" style={{ animationDuration: "2s" }} />
              )}
            </div>
          </div>

          {/* Connection lines + platform icons */}
          <div className="space-y-3">
            {platforms.map((platform, i) => {
              const isConnected = connected.has(i)
              return (
                <motion.div
                  key={platform.name}
                  className="flex items-center gap-3"
                  initial={reduced ? false : { opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: reduced ? 0 : platform.delay * 0.8, duration: 0.4 }}
                >
                  {/* Platform icon */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-500"
                    style={{
                      backgroundColor: `${platform.color}15`,
                      borderColor: isConnected ? `${platform.color}40` : "rgba(255,255,255,0.06)",
                    }}
                  >
                    <span className="text-sm font-bold" style={{ color: platform.color }}>
                      {platform.icon}
                    </span>
                  </div>

                  {/* Connection line */}
                  <div className="flex-1 h-px relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/[0.06]" />
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-brand-green/50"
                      initial={reduced ? { width: "100%" } : { width: "0%" }}
                      animate={{ width: isConnected ? "100%" : "0%" }}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 min-w-0 sm:min-w-[100px]">
                    <span className="text-xs text-white/50">{platform.name}</span>
                    <motion.div
                      initial={reduced ? false : { scale: 0 }}
                      animate={{ scale: isConnected ? 1 : 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    >
                      <div className="w-5 h-5 rounded-full bg-brand-green/20 flex items-center justify-center">
                        <svg className="w-3 h-3 text-brand-green" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Connected summary */}
          <motion.div
            className="mt-5 pt-4 border-t border-white/[0.06] flex items-center gap-2"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: connected.size === 3 ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
            <span className="text-xs text-white/40">
              {connected.size}/3 platforms verified
            </span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

/* Step 3: Enforce — dashboard with progress bars */
function StepEnforceVisual({ reduced }: { reduced: boolean }) {
  const rules = [
    { platform: "NextDNS", count: 5, delay: 0 },
    { platform: "Netflix", count: 6, delay: 0.4 },
    { platform: "Android", count: 8, delay: 0.8 },
  ]
  const [completedCount, setCompletedCount] = useState(0)

  useEffect(() => {
    if (reduced) {
      setCompletedCount(3)
      return
    }
    setCompletedCount(0)
    const timers: ReturnType<typeof setTimeout>[] = []
    rules.forEach((r, i) => {
      timers.push(setTimeout(() => setCompletedCount((prev) => Math.max(prev, i + 1)), 800 + r.delay * 1000 + 600))
    })
    return () => timers.forEach(clearTimeout)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced])

  return (
    <motion.div {...cardTransition} className="w-full max-w-sm">
      <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden shadow-[0_0_60px_-12px_rgba(0,212,126,0.1)]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-green/20 to-accent-teal/20 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-brand-green" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className="text-sm font-medium text-white/70">Enforcement</span>
          <span className="ml-auto text-xs text-white/30 font-mono">PUSH</span>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {rules.map((rule, i) => {
            const isDone = i < completedCount
            return (
              <motion.div
                key={rule.platform}
                initial={reduced ? false : { opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: reduced ? 0 : rule.delay * 0.6, duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-white/60">{rule.platform}</span>
                  <span className="text-[10px] font-mono text-white/30">
                    {isDone ? `${rule.count} rules` : "pushing..."}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${
                      isDone
                        ? "bg-gradient-to-r from-brand-green to-accent-teal"
                        : "bg-brand-green/40"
                    }`}
                    initial={reduced ? { width: "100%" } : { width: "0%" }}
                    animate={{ width: isDone ? "100%" : i < completedCount ? "100%" : "0%" }}
                    transition={{
                      duration: reduced ? 0 : 0.8,
                      delay: reduced ? 0 : rule.delay * 0.6,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  />
                </div>
                {/* Status line */}
                <motion.div
                  className="flex items-center gap-1.5 mt-1"
                  initial={reduced ? false : { opacity: 0 }}
                  animate={{ opacity: isDone ? 1 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <svg className="w-3 h-3 text-brand-green" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-[10px] text-brand-green/70">{rule.count} rules applied</span>
                </motion.div>
              </motion.div>
            )
          })}

          {/* All synced banner */}
          <motion.div
            className="mt-2 flex items-center justify-center gap-2.5 p-3.5 rounded-xl bg-brand-green/[0.08] border border-brand-green/20"
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{
              opacity: completedCount === 3 ? 1 : 0,
              y: completedCount === 3 ? 0 : 8,
            }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="w-6 h-6 rounded-full bg-brand-green/20 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-brand-green" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-brand-green">All synced</span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
