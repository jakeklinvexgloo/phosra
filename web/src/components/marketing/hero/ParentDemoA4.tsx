"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DemoCard } from "./DemoCard"
import { PERSONA_ACCENTS } from "./persona-data"

/* ── Scenario data ────────────────────────── */

interface EnforcementLine {
  platform: string
  rules: string
}

interface OutcomeScenario {
  id: string
  prompt: string
  /** Summary shown in the result card */
  headline: string
  detail: string
  enforcement: EnforcementLine[]
  tools: string[]
}

const SCENARIOS: OutcomeScenario[] = [
  {
    id: "netflix",
    prompt: "Chap is 10. Set up Netflix parental controls.",
    headline: "Netflix — 6 rules applied",
    detail: "\u2713 G, PG allowed \u00b7 \u2717 PG-13, R, NC-17 blocked",
    tools: ["quick_setup", "trigger_enforcement", "sync_platforms"],
    enforcement: [
      { platform: "Netflix", rules: "6 rules" },
      { platform: "Fire Tablet", rules: "8 rules" },
      { platform: "NextDNS", rules: "5 rules" },
    ],
  },
  {
    id: "four-norms",
    prompt: "Follow the Four Norms. Block devices for my 4 kids during school hours.",
    headline: "Four Norms — 23 rules enforced",
    detail: "\u2713 8:30\u20133:00 blocked \u00b7 \u2713 No social media \u00b7 \u2713 2hr daily limit",
    tools: ["list_children", "bulk_upsert_rules", "trigger_enforcement"],
    enforcement: [
      { platform: "Chap", rules: "6 rules" },
      { platform: "Samson", rules: "6 rules" },
      { platform: "Mona", rules: "6 rules" },
      { platform: "Ramsay", rules: "5 rules" },
    ],
  },
  {
    id: "coppa",
    prompt: "Make Coldy COPPA 2.0 compliant. He\u2019s 5. Full privacy lockdown.",
    headline: "COPPA 2.0 — 5 protections active",
    detail: "\u2713 Ads blocked \u00b7 \u2713 Data deletion sent \u00b7 \u2713 Geo disabled",
    tools: ["quick_setup", "bulk_upsert_rules", "data_deletion_request"],
    enforcement: [
      { platform: "Ad blocking", rules: "6 platforms" },
      { platform: "Data deletion", rules: "6 requests" },
      { platform: "Privacy gates", rules: "3 controls" },
    ],
  },
]

/* ── Animation phases ────────────────────── */

type Phase =
  | "idle"
  | "typing"
  | "processing"
  | "result"
  | "enforcement"
  | "hold"
  | "fade-out"

/* ── Component ───────────────────────────── */

export function ParentDemoA4({ isActive }: { isActive: boolean }) {
  const accent = PERSONA_ACCENTS.parent

  const [scenarioIdx, setScenarioIdx] = useState(0)
  const [phase, setPhase] = useState<Phase>("idle")
  const [typedText, setTypedText] = useState("")
  const [toolStates, setToolStates] = useState<("running" | "done")[]>([])
  const [enforcementVisible, setEnforcementVisible] = useState(0)
  const [containerFade, setContainerFade] = useState(1) // 0 or 1

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const intervalsRef = useRef<ReturnType<typeof setInterval>[]>([])
  const isPlayingRef = useRef(false)

  const scenario = SCENARIOS[scenarioIdx]

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout)
    intervalsRef.current.forEach(clearInterval)
    timersRef.current = []
    intervalsRef.current = []
  }, [])

  const addTimer = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms)
    timersRef.current.push(id)
    return id
  }, [])

  const resetState = useCallback(() => {
    setPhase("idle")
    setTypedText("")
    setToolStates([])
    setEnforcementVisible(0)
    setContainerFade(1)
  }, [])

  /* ── Run one scenario ─────────────────── */

  const runScenario = useCallback(
    (idx: number) => {
      if (isPlayingRef.current) return
      isPlayingRef.current = true

      const s = SCENARIOS[idx]
      setScenarioIdx(idx)
      resetState()

      let t = 0

      // Phase 1: Typewriter prompt
      addTimer(() => {
        setPhase("typing")
        let charIdx = 0
        const charDelay = 1400 / s.prompt.length
        const iv = setInterval(() => {
          charIdx++
          setTypedText(s.prompt.slice(0, charIdx))
          if (charIdx >= s.prompt.length) clearInterval(iv)
        }, charDelay)
        intervalsRef.current.push(iv)
      }, t)
      t += 1500

      // Phase 2: Processing — show 3 tool pills, resolve quickly
      addTimer(() => {
        setPhase("processing")
        setToolStates(s.tools.map(() => "running" as const))
      }, t)
      t += 200

      // Resolve tools one by one (every 400ms)
      s.tools.forEach((_, i) => {
        addTimer(() => {
          setToolStates((prev) => {
            const next = [...prev]
            next[i] = "done"
            return next
          })
        }, t + i * 400)
      })
      t += s.tools.length * 400 + 200

      // Phase 3: Result card slides in
      addTimer(() => setPhase("result"), t)
      t += 800

      // Phase 4: Enforcement lines stagger in
      addTimer(() => {
        setPhase("enforcement")
        s.enforcement.forEach((_, i) => {
          addTimer(() => setEnforcementVisible(i + 1), i * 280)
        })
      }, t)
      t += s.enforcement.length * 280 + 2200

      // Phase 5: Hold
      addTimer(() => setPhase("hold"), t)
      t += 1800

      // Phase 6: Fade out and cycle
      addTimer(() => {
        setPhase("fade-out")
        setContainerFade(0)
      }, t)
      t += 600

      addTimer(() => {
        isPlayingRef.current = false
        const nextIdx = (idx + 1) % SCENARIOS.length
        resetState()
        addTimer(() => runScenario(nextIdx), 100)
      }, t)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [addTimer, resetState]
  )

  /* ── Manual dot click ─────────────────── */

  const handleDotClick = useCallback(
    (idx: number) => {
      clearTimers()
      isPlayingRef.current = false
      resetState()
      addTimer(() => runScenario(idx), 50)
    },
    [clearTimers, resetState, addTimer, runScenario]
  )

  /* ── Start / stop on visibility ────────── */

  useEffect(() => {
    if (isActive) {
      const id = setTimeout(() => runScenario(0), 300)
      timersRef.current.push(id)
    } else {
      clearTimers()
      isPlayingRef.current = false
      resetState()
    }
    return () => {
      clearTimers()
      isPlayingRef.current = false
    }
  }, [isActive, runScenario, clearTimers, resetState])

  /* ── Render ────────────────────────────── */

  const showResult = phase === "result" || phase === "enforcement" || phase === "hold" || phase === "fade-out"
  const showEnforcement = phase === "enforcement" || phase === "hold" || phase === "fade-out"
  const showTools = phase === "processing" || showResult

  return (
    <DemoCard
      title="phosra AI"
      accentColor={accent.color}
      accentR={accent.r}
      accentG={accent.g}
      accentB={accent.b}
    >
      <motion.div
        animate={{ opacity: containerFade }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-0 min-h-[260px]"
      >
        {/* User prompt */}
        {phase !== "idle" && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="px-3.5 py-2.5 rounded-xl bg-[#00D47E]/[0.10] border border-[#00D47E]/20 text-[13.5px] text-white/90 leading-[1.55] mb-3"
          >
            {typedText}
            {phase === "typing" && (
              <span className="inline-block w-[2px] h-[14px] bg-white/60 ml-0.5 align-middle animate-pulse" />
            )}
          </motion.div>
        )}

        {/* Tool pills — compact row */}
        <AnimatePresence>
          {showTools && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="flex flex-wrap gap-1.5 mb-3"
            >
              {scenario.tools.map((tool, i) => (
                <motion.span
                  key={tool}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.08, duration: 0.2 }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#00D47E]/[0.08] border border-[#00D47E]/[0.15] font-mono text-[10px] text-[#00D47E]"
                >
                  {toolStates[i] === "done" ? (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      className="text-[10px]"
                    >
                      &#10003;
                    </motion.span>
                  ) : (
                    <span className="w-2.5 h-2.5 border-[1.5px] border-[#00D47E]/30 border-t-[#00D47E] rounded-full animate-spin" />
                  )}
                  {tool}
                </motion.span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result card */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-xl bg-[#00D47E]/[0.06] border border-[#00D47E]/[0.15] px-4 py-3 mb-3"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-5 h-5 rounded-full bg-[#00D47E]/20 flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-[#00D47E]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-[13.5px] font-semibold text-white/90">
                  {scenario.headline}
                </span>
              </div>
              <p className="text-[12px] text-white/50 leading-relaxed pl-7">
                {scenario.detail}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enforcement status lines */}
        <AnimatePresence>
          {showEnforcement && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-1.5"
            >
              {scenario.enforcement.map((line, i) => (
                <motion.div
                  key={line.platform}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{
                    opacity: i < enforcementVisible ? 1 : 0,
                    x: i < enforcementVisible ? 0 : -8,
                  }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[12px]"
                >
                  <span className="text-[#00D47E] text-[11px]">&#10003;</span>
                  <span className="text-white/70 font-medium">{line.platform}</span>
                  <span className="text-white/35 ml-auto font-mono text-[10.5px]">
                    {line.rules}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Scenario indicator dots */}
      <div className="flex items-center justify-center gap-2 mt-4 pt-3 border-t border-white/[0.06]">
        {SCENARIOS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => handleDotClick(i)}
            className="group p-1"
            aria-label={`Scenario: ${s.id}`}
          >
            <span
              className={`block w-[6px] h-[6px] rounded-full transition-all duration-300 ${
                i === scenarioIdx
                  ? "bg-[#00D47E] scale-110"
                  : "bg-white/20 group-hover:bg-white/40"
              }`}
            />
          </button>
        ))}
      </div>
    </DemoCard>
  )
}
