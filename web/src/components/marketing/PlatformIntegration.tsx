"use client"

import { useRef, useState, useEffect, useId } from "react"
import { motion, useInView } from "framer-motion"
import {
  AnimatedSection,
  WaveTexture,
  GradientMesh,
  PhosraBurst,
  FloatingElement,
} from "./shared"

/* ── Step durations (ms) ────────────────── */
const STEP_DURATIONS = [2500, 2200, 1800, 2200, 2500, 3000, 3000] as const

/* ── Step pill labels ───────────────────── */
const STEP_PILLS = [
  { label: "Initiate", steps: [0] },
  { label: "Verify", steps: [1] },
  { label: "Authorize", steps: [2, 3] },
  { label: "Connected", steps: [4] },
  { label: "Enforce", steps: [5, 6] },
]

/* ── Helpers ─────────────────────────────── */

function CheckIcon({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function Spinner({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.351-.166-2A11.954 11.954 0 0110 1.944z"
        clipRule="evenodd"
      />
    </svg>
  )
}

/* ── Phone Mockup ────────────────────────── */

function PhoneMockup({ step }: { step: number }) {
  const showConsent = step === 1 || step === 2

  return (
    <div className="relative z-10 flex-shrink-0">
      {/* Phone frame */}
      <div className="relative bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-[2rem] w-[240px] h-[440px] sm:w-[280px] sm:h-[520px] overflow-hidden shadow-[0_0_80px_-12px_rgba(0,212,126,0.12)]">
        {/* Dynamic island */}
        <div className="absolute top-2.5 sm:top-3 left-1/2 -translate-x-1/2 w-20 sm:w-24 h-5 sm:h-6 bg-black rounded-full z-20" />

        {/* Status bar */}
        <div className="flex items-center justify-between px-5 sm:px-6 pt-8 sm:pt-10 pb-1 text-[9px] sm:text-[10px] text-white/40">
          <span>9:41</span>
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor" opacity={0.4}>
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-4a1 1 0 011-1h2a1 1 0 011 1v13a1 1 0 01-1 1h-2a1 1 0 01-1-1V3z" />
            </svg>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} opacity={0.4}>
              <path d="M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0M12 20h.01" />
            </svg>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" opacity={0.4}>
              <rect x="2" y="7" width="18" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth={1.5} />
              <rect x="3.5" y="8.5" width="12" height="7" rx="1" />
              <rect x="21" y="10" width="2" height="4" rx="0.5" />
            </svg>
          </div>
        </div>

        {/* App content */}
        <div className="px-3 sm:px-4 pt-1 sm:pt-2 relative h-[calc(100%-60px)] sm:h-[calc(100%-72px)]">
          {/* App header */}
          <div className="flex items-center gap-1.5 mb-3 sm:mb-4">
            <div className="text-brand-green">
              <ShieldIcon />
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-white">
              FamilyShield
            </span>
          </div>

          {/* Child card */}
          <div className="flex items-center gap-2.5 mb-3 sm:mb-4 p-2 sm:p-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-[10px] sm:text-xs font-bold text-white">
              E
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-semibold text-white">
                Emma
              </p>
              <p className="text-[8px] sm:text-[9px] text-white/30">Age 8</p>
            </div>
          </div>

          {/* Connected Platforms */}
          <p className="text-[8px] sm:text-[9px] uppercase tracking-wider text-white/25 mb-1.5 sm:mb-2 font-medium">
            Connected Platforms
          </p>

          <div className="space-y-1 sm:space-y-1.5">
            {/* NextDNS */}
            <div className="flex items-center justify-between px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-md bg-white/[0.03] border border-white/[0.05]">
              <span className="text-[9px] sm:text-[10px] text-white/60">
                NextDNS
              </span>
              <span className="flex items-center gap-0.5 text-[8px] sm:text-[9px] text-emerald-400">
                <CheckIcon className="w-2.5 h-2.5" /> Verified
              </span>
            </div>

            {/* CleanBrowsing */}
            <div className="flex items-center justify-between px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-md bg-white/[0.03] border border-white/[0.05]">
              <span className="text-[9px] sm:text-[10px] text-white/60">
                CleanBrowsing
              </span>
              <span className="flex items-center gap-0.5 text-[8px] sm:text-[9px] text-emerald-400">
                <CheckIcon className="w-2.5 h-2.5" /> Verified
              </span>
            </div>

            {/* StreamSafe row — changes with steps */}
            {step >= 4 ? (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex items-center justify-between px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-md bg-emerald-500/[0.08] border border-emerald-500/20"
              >
                <span className="text-[9px] sm:text-[10px] text-white/80 font-medium">
                  StreamSafe
                </span>
                <span className="flex items-center gap-0.5 text-[8px] sm:text-[9px] text-emerald-400 font-medium">
                  <CheckIcon className="w-2.5 h-2.5" /> Connected
                </span>
              </motion.div>
            ) : step === 0 ? (
              <button className="w-full flex items-center justify-center gap-1.5 px-2 sm:px-2.5 py-2 sm:py-2.5 rounded-md bg-brand-green/10 border border-brand-green/20 text-brand-green text-[9px] sm:text-[10px] font-semibold animate-pulse">
                Connect StreamSafe
              </button>
            ) : null}
          </div>

          {/* Status text at step 5-6 */}
          {step === 5 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 sm:mt-4 flex items-center gap-1.5 text-[9px] sm:text-[10px] text-white/50"
            >
              <Spinner className="w-3 h-3 text-brand-green" />
              Pushing rules to StreamSafe...
            </motion.div>
          )}
          {step === 6 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 sm:mt-4 flex items-center gap-1.5 text-[9px] sm:text-[10px] text-emerald-400 font-medium"
            >
              <CheckIcon className="w-3.5 h-3.5" />
              All rules enforced
            </motion.div>
          )}

          {/* Consent sheet overlay — covers ~70% of phone body */}
          <div
            className="absolute inset-x-0 bottom-0 top-[30%] rounded-t-2xl bg-[#0D1B2A]/95 backdrop-blur-2xl border-t border-white/[0.1] px-4 sm:px-5 pt-5 sm:pt-6 pb-4 sm:pb-5 z-30 flex flex-col"
            style={{
              transform: showConsent ? "translateY(0)" : "translateY(100%)",
              transition: "transform 600ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            {/* PhosraBurst centered */}
            <div className="flex justify-center mb-3 sm:mb-4">
              <PhosraBurst
                size={32}
                color="#00D47E"
                opacity={0.9}
              />
            </div>

            <p className="text-[11px] sm:text-xs font-semibold text-white text-center mb-3 sm:mb-4">
              Verify with Phosra
            </p>

            <p className="text-[9px] sm:text-[10px] text-white/35 mb-2 sm:mb-3 font-medium">
              StreamSafe requests access to:
            </p>

            <div className="space-y-2 sm:space-y-2.5 mb-4 sm:mb-5 flex-1">
              {[
                "View profiles",
                "Manage content restrictions",
                "Push rule updates",
              ].map((perm) => (
                <div
                  key={perm}
                  className="flex items-center gap-2 text-[10px] sm:text-[11px] text-white/70"
                >
                  <div className="w-4 h-4 rounded-full bg-brand-green/15 flex items-center justify-center flex-shrink-0">
                    <CheckIcon className="w-2.5 h-2.5 text-brand-green" />
                  </div>
                  {perm}
                </div>
              ))}
            </div>

            {/* Authorize button */}
            <button
              className="w-full py-2.5 sm:py-3 rounded-xl bg-brand-green text-[11px] sm:text-xs font-bold text-[#0D1B2A] flex items-center justify-center gap-1.5"
            >
              {step === 2 ? (
                <Spinner className="w-3.5 h-3.5 text-[#0D1B2A]" />
              ) : (
                "Authorize"
              )}
            </button>

            <p className="text-center text-[9px] sm:text-[10px] text-white/20 mt-2 sm:mt-2.5">
              Cancel
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── StreamSafe Card (Left) ──────────────── */

function StreamSafeCard({ step }: { step: number }) {
  const isConnected = step >= 4
  const isConnecting = step === 3
  const isEnforcing = step >= 5

  const rules = [
    { label: "Content: PG", delay: 0 },
    { label: "Screen time: 2hr", delay: 0.2 },
    { label: "Social: Off", delay: 0.4 },
  ]

  return (
    <div
      className={`w-36 sm:w-40 p-3 sm:p-4 rounded-xl border backdrop-blur-xl transition-all duration-700 ${
        isConnected
          ? "bg-emerald-500/[0.06] border-emerald-500/20 shadow-[0_0_30px_-8px_rgba(0,212,126,0.2)]"
          : "bg-white/[0.04] border-white/[0.06]"
      }`}
    >
      {/* Icon + name */}
      <div className="flex items-center gap-2 mb-2 sm:mb-3">
        <div
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-colors duration-500 ${
            isConnected
              ? "bg-gradient-to-br from-red-500 to-orange-500"
              : "bg-white/[0.06]"
          }`}
        >
          <svg
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors duration-500 ${
              isConnected ? "text-white" : "text-white/30"
            }`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
          </svg>
        </div>
        <div>
          <p
            className={`text-[10px] sm:text-xs font-bold transition-colors duration-500 ${
              isConnected ? "text-white" : "text-white/40"
            }`}
          >
            StreamSafe
          </p>
        </div>
      </div>

      {/* Status */}
      {isConnecting ? (
        <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] text-white/40">
          <Spinner className="w-3 h-3 text-brand-green" />
          Connecting...
        </div>
      ) : isConnected ? (
        <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-emerald-400 font-medium mb-2">
          <CheckIcon className="w-3 h-3" />
          Connected
        </div>
      ) : (
        <p className="text-[9px] sm:text-[10px] text-white/20">
          Not connected
        </p>
      )}

      {/* Enforced rules */}
      {isEnforcing && (
        <div className="space-y-1 mt-1.5">
          {rules.map((rule) => (
            <motion.div
              key={rule.label}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: rule.delay }}
              className="flex items-center gap-1 text-[8px] sm:text-[9px] text-white/50"
            >
              <CheckIcon className="w-2.5 h-2.5 text-emerald-400 flex-shrink-0" />
              {rule.label}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Phosra Node (Right) ─────────────────── */

function PhosraNode({ step }: { step: number }) {
  const isActive = step >= 3
  const isPulsing = step === 3 || step === 5

  return (
    <div className="relative flex flex-col items-center">
      {/* Glow ring */}
      <div
        className={`absolute -inset-6 rounded-full bg-brand-green/10 blur-2xl transition-opacity duration-700 ${
          isActive ? "opacity-100" : "opacity-20"
        }`}
      />

      <div className="relative flex flex-col items-center gap-2">
        <motion.div
          animate={
            isPulsing
              ? { scale: [1, 1.15, 1] }
              : { scale: 1 }
          }
          transition={
            isPulsing
              ? { duration: 1, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.5 }
          }
        >
          <PhosraBurst
            size={48}
            color="#00D47E"
            opacity={isActive ? 0.9 : 0.25}
            animate={isActive}
          />
        </motion.div>
        <span
          className={`text-[9px] sm:text-[10px] font-bold tracking-widest transition-colors duration-500 ${
            isActive ? "text-white" : "text-white/25"
          }`}
        >
          PHOSRA
        </span>
      </div>
    </div>
  )
}

/* ── Connection Lines (Desktop SVG) ──────── */

function ConnectionLines({
  step,
  side,
}: {
  step: number
  side: "left" | "right"
}) {
  const id = useId()
  const showParticles = step === 3 || step === 5

  return (
    <svg
      className="hidden lg:block w-16 xl:w-24 h-40 flex-shrink-0"
      viewBox="0 0 80 120"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`line-grad-${side}-${id}`}>
          <stop
            offset="0%"
            stopColor="#00D47E"
            stopOpacity={side === "left" ? 0.1 : 0.5}
          />
          <stop
            offset="100%"
            stopColor="#00D47E"
            stopOpacity={side === "left" ? 0.5 : 0.1}
          />
        </linearGradient>
      </defs>

      {/* Dashed connection line */}
      {[40, 60, 80].map((y, i) => {
        const startX = side === "left" ? 80 : 0
        const endX = side === "left" ? 0 : 80
        const cx1 = side === "left" ? 55 : 25
        const cx2 = side === "left" ? 25 : 55
        return (
          <path
            key={i}
            d={`M ${startX} 60 C ${cx1} 60, ${cx2} ${y}, ${endX} ${y}`}
            fill="none"
            stroke={`url(#line-grad-${side}-${id})`}
            strokeWidth={1.2}
            strokeDasharray="4 6"
            strokeOpacity={step >= 3 ? 0.5 : 0.15}
            className="animate-dash-flow"
            style={{
              animationDelay: `${i * 0.3}s`,
              animationDirection: side === "left" ? "normal" : "reverse",
              transition: "stroke-opacity 0.5s",
            }}
          />
        )
      })}

      {/* Particles */}
      {showParticles && (
        <>
          <circle r="2.5" fill="#00D47E" opacity={0.9}>
            <animateMotion
              dur="1.5s"
              repeatCount="indefinite"
              path={
                side === "left"
                  ? "M 80 60 C 55 60, 25 60, 0 60"
                  : "M 0 60 C 25 60, 55 60, 80 60"
              }
            />
          </circle>
          <circle r="1.5" fill="#00D47E" opacity={0.5}>
            <animateMotion
              dur="1.5s"
              repeatCount="indefinite"
              begin="0.5s"
              path={
                side === "left"
                  ? "M 80 60 C 55 60, 25 60, 0 60"
                  : "M 0 60 C 25 60, 55 60, 80 60"
              }
            />
          </circle>
        </>
      )}
    </svg>
  )
}

/* ── Mobile Down Arrow ───────────────────── */

function MobileArrow({ active }: { active: boolean }) {
  return (
    <div className="flex lg:hidden flex-col items-center gap-1 py-1">
      <div
        className={`w-px h-5 transition-colors duration-500 ${
          active
            ? "bg-gradient-to-b from-brand-green/60 to-brand-green/20"
            : "bg-white/10"
        }`}
      />
      <svg
        className={`w-3.5 h-3.5 transition-colors duration-500 ${
          active ? "text-brand-green" : "text-white/20"
        }`}
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  )
}

/* ── Step Indicator Pills ────────────────── */

function StepPills({ activeStep }: { activeStep: number }) {
  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-8 sm:mt-12">
      {STEP_PILLS.map((pill, i) => {
        const isActive = pill.steps.includes(activeStep)
        const isPast = activeStep > Math.max(...pill.steps)

        return (
          <div key={pill.label} className="flex items-center gap-1.5 sm:gap-2">
            {i > 0 && (
              <div
                className={`w-4 sm:w-6 h-px transition-colors duration-300 ${
                  isPast || isActive ? "bg-brand-green/40" : "bg-white/[0.06]"
                }`}
              />
            )}
            <div
              className={`flex items-center justify-center h-7 sm:h-8 rounded-full text-[10px] sm:text-xs font-medium transition-all duration-300 ${
                isActive
                  ? "bg-brand-green text-[#0D1B2A] px-3 sm:px-4 shadow-[0_0_16px_-4px_rgba(0,212,126,0.5)]"
                  : isPast
                    ? "bg-brand-green/10 text-brand-green/60 px-3 sm:px-4 border border-brand-green/20"
                    : "bg-white/[0.04] text-white/30 px-3 sm:px-4 border border-white/[0.06]"
              }`}
            >
              {/* Number on mobile, label on sm+ */}
              <span className="sm:hidden">{i + 1}</span>
              <span className="hidden sm:inline">{pill.label}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ── Main Section ────────────────────────── */

export function PlatformIntegration() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: false, amount: 0.3 })
  const [step, setStep] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const stepRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Reduced motion
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  useEffect(() => {
    if (typeof window !== "undefined") {
      setPrefersReducedMotion(
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      )
    }
  }, [])

  // Timer-driven step machine — uses ref to avoid stale closure / double-fire
  useEffect(() => {
    if (prefersReducedMotion || !isInView || isHovered) {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      return
    }

    const tick = () => {
      const currentStep = stepRef.current
      const duration = STEP_DURATIONS[currentStep]

      timerRef.current = setTimeout(() => {
        const nextStep = (stepRef.current + 1) % 7
        stepRef.current = nextStep
        setStep(nextStep)
        tick()
      }, duration)
    }

    tick()

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isInView, isHovered, prefersReducedMotion])

  // Reset when leaving view
  useEffect(() => {
    if (!isInView && !prefersReducedMotion) {
      stepRef.current = 0
      setStep(0)
    }
  }, [isInView, prefersReducedMotion])

  // Static state for reduced motion
  if (prefersReducedMotion) {
    return (
      <section className="relative py-24 sm:py-32 overflow-hidden bg-gradient-to-br from-[#0D1B2A] via-[#0A2F2F] to-[#0D1B2A]">
        <WaveTexture colorStart="#00D47E" colorEnd="#26A8C9" opacity={0.08} />
        <GradientMesh
          colors={["#00D47E", "#26A8C9", "#7B5CB8", "#0D1B2A"]}
          className="opacity-20"
        />
        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-brand-green bg-brand-green/10 border border-brand-green/20 rounded-full mb-5">
              Platform Integration
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-[42px] text-white leading-tight mb-4">
              Connect once.{" "}
              <span className="bg-gradient-to-r from-brand-green to-accent-teal bg-clip-text text-transparent">
                Enforce everywhere.
              </span>
            </h2>
            <p className="text-white/40 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Any parental controls app can verify account ownership and push
              safety rules to any platform — through one secure OAuth handshake
              powered by Phosra.
            </p>
          </div>
          <div className="flex items-center justify-center">
            <PhoneMockup step={4} />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative py-24 sm:py-32 overflow-hidden bg-gradient-to-br from-[#0D1B2A] via-[#0A2F2F] to-[#0D1B2A]">
      {/* Background textures */}
      <WaveTexture colorStart="#00D47E" colorEnd="#26A8C9" opacity={0.08} />
      <GradientMesh
        colors={["#00D47E", "#26A8C9", "#7B5CB8", "#0D1B2A"]}
        className="opacity-20"
      />

      {/* Brand mark */}
      <div className="absolute -bottom-20 -right-20">
        <PhosraBurst
          size={400}
          color="#00D47E"
          opacity={0.04}
          rotate={15}
          animate
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        {/* Header */}
        <AnimatedSection direction="up">
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-block px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-widest text-brand-green bg-brand-green/10 border border-brand-green/20 rounded-full mb-5">
              Platform Integration
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-[42px] text-white leading-tight mb-4">
              Connect once.{" "}
              <span className="bg-gradient-to-r from-brand-green to-accent-teal bg-clip-text text-transparent">
                Enforce everywhere.
              </span>
            </h2>
            <p className="text-white/40 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Any parental controls app can verify account ownership and push
              safety rules to any platform — through one secure OAuth handshake
              powered by Phosra.
            </p>
          </div>
        </AnimatedSection>

        {/* Animation stage */}
        <div
          ref={sectionRef}
          className="relative flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-0"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Left: StreamSafe card */}
          <AnimatedSection direction="left" delay={0.1}>
            <FloatingElement duration={7} distance={6} delay={0.5}>
              <div className="lg:mr-0">
                <StreamSafeCard step={step} />
              </div>
            </FloatingElement>
          </AnimatedSection>

          {/* Mobile down arrow (above phone) */}
          <MobileArrow active={step >= 3} />

          {/* Left SVG lines (desktop) */}
          <ConnectionLines step={step} side="left" />

          {/* Center: Phone */}
          <AnimatedSection direction="up" delay={0.05}>
            <PhoneMockup step={step} />
          </AnimatedSection>

          {/* Right SVG lines (desktop) */}
          <ConnectionLines step={step} side="right" />

          {/* Mobile down arrow (below phone) */}
          <MobileArrow active={step >= 3} />

          {/* Right: Phosra node */}
          <AnimatedSection direction="right" delay={0.1}>
            <FloatingElement duration={7} distance={6} delay={1}>
              <div className="lg:ml-0">
                <PhosraNode step={step} />
              </div>
            </FloatingElement>
          </AnimatedSection>
        </div>

        {/* Step pills */}
        <AnimatedSection direction="up" delay={0.2}>
          <StepPills activeStep={step} />
        </AnimatedSection>
      </div>
    </section>
  )
}
