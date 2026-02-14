"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { motion, useInView } from "framer-motion"
import { HeroChatBubble } from "./HeroChatBubble"
import { HeroToolCallPill } from "./HeroToolCallPill"
import { HeroEnforcementCard } from "./HeroEnforcementCard"
import { HeroApiLog, type LogEntry } from "./HeroApiLog"
import { DEMO_SCENARIOS, type DemoStep } from "./hero-demo-script"

/* ── Types ────────────────────────────────── */

interface ChatMessage {
  role: "user" | "assistant"
  fullText: string
  displayText: string
  complete: boolean
}

interface ToolPill {
  name: string
  label: string
  status: "running" | "complete"
  /** Unique key — tool names can repeat across turns */
  key: string
}

/* ── Main Component ───────────────────────── */

export function HeroChatDemo() {
  const ref = useRef<HTMLDivElement>(null)
  const chatScrollRef = useRef<HTMLDivElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: false, amount: 0.3 })

  // Reduced-motion check
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  useEffect(() => {
    if (typeof window !== "undefined") {
      setPrefersReducedMotion(
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      )
    }
  }, [])

  // Animation state
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [tools, setTools] = useState<ToolPill[]>([])
  const [logLines, setLogLines] = useState<LogEntry[]>([])
  const [showThinking, setShowThinking] = useState(false)
  const [resultCardText, setResultCardText] = useState<string | null>(null)
  const [fading, setFading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  // Refs for cleanup & scenario cycling
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const intervalsRef = useRef<ReturnType<typeof setInterval>[]>([])
  const logIdRef = useRef(0)
  const toolKeyRef = useRef(0)
  const isPlayingRef = useRef(false)
  const scenarioIndexRef = useRef(0)

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout)
    intervalsRef.current.forEach(clearInterval)
    timersRef.current = []
    intervalsRef.current = []
  }, [])

  const resetState = useCallback(() => {
    setMessages([])
    setTools([])
    setLogLines([])
    setShowThinking(false)
    setResultCardText(null)
    setFading(false)
    logIdRef.current = 0
    toolKeyRef.current = 0
  }, [])

  const addTimer = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms)
    timersRef.current.push(id)
    return id
  }, [])

  // Auto-scroll chat pane to bottom when content changes
  useEffect(() => {
    const container = chatScrollRef.current
    if (container) {
      container.scrollTop = container.scrollHeight
    }
  }, [messages, tools, resultCardText, showThinking])

  // Typewriter: incrementally reveal text in a message
  const typewrite = useCallback(
    (
      role: "user" | "assistant",
      text: string,
      duration: number,
      onDone: () => void
    ) => {
      const charDelay = duration / text.length

      // Add the message in "streaming" state
      setMessages((prev) => [
        ...prev,
        { role, fullText: text, displayText: "", complete: false },
      ])

      let charIndex = 0
      const interval = setInterval(() => {
        charIndex++
        setMessages((prev) => {
          const updated = [...prev]
          const last = updated[updated.length - 1]
          if (last && !last.complete) {
            updated[updated.length - 1] = {
              ...last,
              displayText: text.slice(0, charIndex),
            }
          }
          return updated
        })

        if (charIndex >= text.length) {
          clearInterval(interval)
          // Mark complete
          setMessages((prev) => {
            const updated = [...prev]
            const last = updated[updated.length - 1]
            if (last) {
              updated[updated.length - 1] = { ...last, complete: true }
            }
            return updated
          })
          onDone()
        }
      }, charDelay)

      intervalsRef.current.push(interval)
    },
    []
  )

  // Run the current scenario's script
  const runDemo = useCallback(() => {
    if (isPlayingRef.current) return
    isPlayingRef.current = true
    resetState()

    const scenario = DEMO_SCENARIOS[scenarioIndexRef.current]
    const steps = scenario.steps
    let elapsed = 0

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]
      const startAt = elapsed

      addTimer(() => processStep(step), startAt)
      elapsed += step.duration
    }

    // After all steps (including fade), advance to next scenario and restart
    addTimer(() => {
      isPlayingRef.current = false
      scenarioIndexRef.current =
        (scenarioIndexRef.current + 1) % DEMO_SCENARIOS.length
      setActiveIndex(scenarioIndexRef.current)
      resetState()
      // Small pause then restart with next scenario
      addTimer(() => runDemo(), 300)
    }, elapsed)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addTimer, resetState])

  const processStep = useCallback(
    (step: DemoStep) => {
      switch (step.type) {
        case "user":
          setShowThinking(false)
          // Hide previous result card when a new user message arrives (follow-up turn)
          setResultCardText(null)
          typewrite("user", step.text!, step.duration, () => {})
          break

        case "thinking":
          setShowThinking(true)
          addTimer(() => setShowThinking(false), step.duration)
          break

        case "tool-start":
          setShowThinking(false)
          toolKeyRef.current++
          setTools((prev) => [
            ...prev,
            {
              name: step.toolName!,
              label: step.toolLabel!,
              status: "running",
              key: `${step.toolName}-${toolKeyRef.current}`,
            },
          ])
          break

        case "tool-complete":
          // Complete the most recent tool with this name that's still running
          setTools((prev) => {
            const updated = [...prev]
            for (let j = updated.length - 1; j >= 0; j--) {
              if (
                updated[j].name === step.toolName &&
                updated[j].status === "running"
              ) {
                updated[j] = { ...updated[j], status: "complete" }
                break
              }
            }
            return updated
          })
          break

        case "log-pending":
          logIdRef.current++
          setLogLines((prev) => [
            ...prev,
            {
              id: logIdRef.current,
              type: "request",
              method: step.method,
              path: step.path,
              status: "pending",
            },
          ])
          break

        case "log-success":
          // Update the last matching pending log to success
          setLogLines((prev) => {
            const updated = [...prev]
            for (let j = updated.length - 1; j >= 0; j--) {
              if (
                updated[j].type === "request" &&
                updated[j].path === step.path &&
                updated[j].status === "pending"
              ) {
                updated[j] = {
                  ...updated[j],
                  status: "success",
                  latency: step.latency,
                }
                break
              }
            }
            return updated
          })
          break

        case "log-result":
          logIdRef.current++
          setLogLines((prev) => [
            ...prev,
            {
              id: logIdRef.current,
              type: "result",
              resultText: step.resultText,
            },
          ])
          break

        case "assistant":
          typewrite("assistant", step.text!, step.duration, () => {})
          break

        case "result":
          setResultCardText(step.resultCardText ?? null)
          break

        case "pause":
          // Just wait — the timer chain handles this
          break

        case "fade":
          setFading(true)
          break
      }
    },
    [typewrite, addTimer]
  )

  // Handle manual tab click
  const handleTabClick = useCallback(
    (index: number) => {
      clearAllTimers()
      isPlayingRef.current = false
      scenarioIndexRef.current = index
      setActiveIndex(index)
      resetState()
      // Small delay before starting so reset renders first
      const id = setTimeout(() => runDemo(), 50)
      timersRef.current.push(id)
    },
    [clearAllTimers, resetState, runDemo]
  )

  // Start/stop based on visibility
  useEffect(() => {
    if (prefersReducedMotion) return

    if (isInView) {
      // Small delay before starting so the entrance animation plays first
      const id = setTimeout(() => runDemo(), 600)
      timersRef.current.push(id)
    } else {
      clearAllTimers()
      isPlayingRef.current = false
      resetState()
    }

    return () => {
      clearAllTimers()
      isPlayingRef.current = false
    }
  }, [isInView, prefersReducedMotion, runDemo, clearAllTimers, resetState])

  // Reduced-motion: show static final state (first scenario)
  if (prefersReducedMotion) {
    return (
      <div ref={ref} className="relative bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-xl overflow-hidden max-w-md mx-auto lg:ml-auto shadow-[0_0_60px_-12px_rgba(0,212,126,0.15)] h-[420px] flex flex-col">
        <DemoHeader activeIndex={0} onTabClick={() => {}} />
        <div className="px-4 py-3 space-y-2.5 flex-1 overflow-y-auto">
          <HeroChatBubble role="user" text="Chap is 10. Set up Netflix parental controls." />
          <div className="flex flex-wrap gap-1.5">
            <HeroToolCallPill toolName="quick_setup" status="complete" />
            <HeroToolCallPill toolName="trigger_enforcement" status="complete" />
          </div>
          <HeroChatBubble
            role="assistant"
            text="Done! Chap can watch G and PG on Netflix. PG-13, R, and NC-17 are blocked."
          />
          <HeroEnforcementCard text="Netflix — 6 rules applied" />
        </div>
        <div className="border-t border-white/[0.06]">
          <HeroApiLog
            lines={[
              { id: 1, type: "request", method: "POST", path: "/v1/setup/quick", status: "success", latency: "142ms" },
              { id: 2, type: "request", method: "POST", path: "/v1/enforcement/trigger", status: "success", latency: "87ms" },
              { id: 3, type: "result", resultText: "\u2192 Netflix: 6 rules applied" },
              { id: 4, type: "result", resultText: "\u2192 Fire Tablet: 8 rules applied" },
              { id: 5, type: "result", resultText: "\u2192 NextDNS: 5 rules applied" },
            ]}
          />
        </div>
      </div>
    )
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: fading ? 0 : 1, y: 0 }}
      transition={{ duration: fading ? 0.4 : 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-xl overflow-hidden max-w-md mx-auto lg:ml-auto shadow-[0_0_60px_-12px_rgba(0,212,126,0.15)] h-[420px] flex flex-col"
    >
      <DemoHeader activeIndex={activeIndex} onTabClick={handleTabClick} />

      {/* Chat messages pane */}
      <div
        ref={chatScrollRef}
        className="relative px-4 py-3 space-y-2.5 flex-1 overflow-y-auto scrollbar-hide"
      >
        {/* Top fade overlay for clipped messages */}
        <div className="sticky top-0 left-0 right-0 h-4 bg-gradient-to-b from-white/[0.04] to-transparent -mt-3 -mx-4 px-4 z-10 pointer-events-none" />

        {messages.map((msg, i) => (
          <motion.div
            key={`msg-${i}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <HeroChatBubble
              role={msg.role}
              text={msg.displayText}
              isStreaming={!msg.complete}
            />
          </motion.div>
        ))}

        {/* Thinking dots */}
        {showThinking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-1 py-1"
          >
            <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce [animation-delay:0ms]" />
            <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce [animation-delay:300ms]" />
          </motion.div>
        )}

        {/* Tool call pills */}
        {tools.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tools.map((t) => (
              <HeroToolCallPill
                key={t.key}
                toolName={t.name}
                status={t.status}
              />
            ))}
          </div>
        )}

        {/* Enforcement result card */}
        {resultCardText && <HeroEnforcementCard text={resultCardText} />}

        {/* Scroll anchor */}
        <div ref={chatEndRef} />
      </div>

      {/* Terminal pane */}
      <div className="border-t border-white/[0.06] max-h-[140px] overflow-hidden">
        <HeroApiLog lines={logLines} />
      </div>
    </motion.div>
  )
}

/* ── Shared header bar with tabs ─────────── */

function DemoHeader({
  activeIndex,
  onTabClick,
}: {
  activeIndex: number
  onTabClick: (index: number) => void
}) {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.06] shrink-0">
      <img src="/favicon.svg" alt="" className="w-4 h-4" />
      <span className="text-xs font-medium text-white/60">Phosra AI</span>

      {/* Scenario tabs */}
      <div className="flex items-center gap-0.5 ml-3">
        {DEMO_SCENARIOS.map((scenario, i) => (
          <button
            key={scenario.id}
            onClick={() => onTabClick(i)}
            className={`px-2 py-1 text-[10px] font-medium rounded transition-colors ${
              i === activeIndex
                ? "text-white/90 bg-white/[0.08]"
                : "text-white/30 hover:text-white/50"
            }`}
          >
            {scenario.label}
          </button>
        ))}
      </div>

      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse shrink-0" />
    </div>
  )
}
