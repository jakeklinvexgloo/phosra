"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { motion, useInView } from "framer-motion"
import { Loader2, Check } from "lucide-react"
import { DemoCard } from "./DemoCard"
import { DEMO_SCENARIOS, type DemoStep } from "./hero-demo-script"
import type { LogEntry } from "./HeroApiLog"

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
  key: string
}

/* ── Inline sub-components (compact for split layout) ── */

function SplitChatBubble({
  role,
  text,
  isStreaming,
}: {
  role: "user" | "assistant"
  text: string
  isStreaming?: boolean
}) {
  const cursor = isStreaming ? (
    <span className="inline-block w-[2px] h-[1em] bg-brand-green animate-pulse ml-0.5 align-text-bottom" />
  ) : null

  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="bg-white/[0.08] rounded-xl rounded-br-sm px-2.5 py-1.5 max-w-[92%]">
          <p className="text-[12px] text-white/90 leading-relaxed">
            {text}
            {cursor}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[95%]">
      <p className="text-[12px] text-white/70 leading-relaxed">
        {text}
        {cursor}
      </p>
    </div>
  )
}

function SplitToolPill({
  toolName,
  status,
}: {
  toolName: string
  status: "running" | "complete"
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="inline-flex items-center gap-1 bg-brand-green/10 border border-brand-green/20 rounded-full px-2 py-0.5"
    >
      {status === "running" ? (
        <Loader2 className="w-2.5 h-2.5 text-brand-green animate-spin" />
      ) : (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 25 }}
        >
          <Check className="w-2.5 h-2.5 text-brand-green" />
        </motion.div>
      )}
      <span className="text-[9px] font-mono text-brand-green">{toolName}</span>
    </motion.div>
  )
}

function SplitEnforcementCard({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="bg-brand-green/5 border border-brand-green/20 rounded-md px-2.5 py-1.5 flex items-center gap-1.5"
    >
      <Check className="w-3 h-3 text-brand-green flex-shrink-0" />
      <span className="text-[11px] text-white/80">{text}</span>
    </motion.div>
  )
}

/* ── Terminal pane (right side) ─────────── */

function SplitTerminal({ lines }: { lines: LogEntry[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [lines])

  return (
    <div className="h-full flex flex-col bg-[#0D1117] sm:rounded-r-xl rounded-b-xl sm:rounded-bl-none overflow-hidden">
      {/* Terminal header */}
      <div className="flex items-center gap-1 px-2.5 py-1.5 border-b border-white/[0.04] shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500/50" />
        <span className="w-1.5 h-1.5 rounded-full bg-green-500/50" />
        <span className="text-[9px] text-white/25 ml-1.5 font-mono tracking-wide">API Log</span>
      </div>

      {/* Log lines */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-2.5 py-2 font-mono text-[10px] space-y-0.5 scrollbar-hide"
      >
        {lines.map((line) => (
          <motion.div
            key={line.id}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.18 }}
            className="leading-relaxed whitespace-nowrap"
          >
            {line.type === "request" ? (
              <span>
                <span className="text-blue-400 font-semibold">{line.method}</span>
                <span className="text-white/35 ml-1.5">{line.path}</span>
                {line.status === "success" ? (
                  <>
                    <span className="text-emerald-400 ml-2">200</span>
                    <span className="text-white/20 ml-1.5">{line.latency}</span>
                  </>
                ) : (
                  <span className="text-white/20 ml-2 animate-pulse">...</span>
                )}
              </span>
            ) : (
              <span className="text-emerald-400/60">{line.resultText}</span>
            )}
          </motion.div>
        ))}

        {/* Blinking cursor */}
        <div className="h-3 flex items-center">
          <span className="inline-block w-[5px] h-2.5 bg-white/15 animate-pulse" />
        </div>
      </div>
    </div>
  )
}

/* ── Main Component ───────────────────────── */

export function ParentSplitDemoPanel({ isActive: _isActive }: { isActive?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const chatScrollRef = useRef<HTMLDivElement>(null)
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

  // Auto-scroll chat pane
  useEffect(() => {
    const container = chatScrollRef.current
    if (container) {
      container.scrollTop = container.scrollHeight
    }
  }, [messages, tools, resultCardText, showThinking])

  // Typewriter
  const typewrite = useCallback(
    (
      role: "user" | "assistant",
      text: string,
      duration: number,
      onDone: () => void
    ) => {
      const charDelay = duration / text.length

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

  // Process a single step
  const processStep = useCallback(
    (step: DemoStep) => {
      switch (step.type) {
        case "user":
          setShowThinking(false)
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
          break

        case "fade":
          setFading(true)
          break
      }
    },
    [typewrite, addTimer]
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

    // After all steps, advance to next scenario
    addTimer(() => {
      isPlayingRef.current = false
      scenarioIndexRef.current =
        (scenarioIndexRef.current + 1) % DEMO_SCENARIOS.length
      setActiveIndex(scenarioIndexRef.current)
      resetState()
      addTimer(() => runDemo(), 300)
    }, elapsed)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addTimer, resetState])

  // Handle manual tab click
  const handleTabClick = useCallback(
    (index: number) => {
      clearAllTimers()
      isPlayingRef.current = false
      scenarioIndexRef.current = index
      setActiveIndex(index)
      resetState()
      const id = setTimeout(() => runDemo(), 50)
      timersRef.current.push(id)
    },
    [clearAllTimers, resetState, runDemo]
  )

  // Start/stop based on visibility
  useEffect(() => {
    if (prefersReducedMotion) return

    if (isInView) {
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

  // Reduced-motion: static final state
  if (prefersReducedMotion) {
    return (
      <div ref={ref}>
        <DemoCard
          title="Phosra AI"
          accentColor="#00D47E"
          accentR={0}
          accentG={212}
          accentB={126}
        >
          <div className="flex flex-col sm:flex-row h-[450px] sm:h-[340px] -mx-5 sm:-mx-6 -mb-5 sm:-mb-6">
            <div className="flex-[3] px-3 py-2 space-y-2 overflow-y-auto">
              <SplitChatBubble role="user" text="Chap is 10. Set up Netflix parental controls." />
              <div className="flex flex-wrap gap-1">
                <SplitToolPill toolName="quick_setup" status="complete" />
                <SplitToolPill toolName="trigger_enforcement" status="complete" />
              </div>
              <SplitChatBubble
                role="assistant"
                text="Done! Chap can watch G and PG on Netflix. PG-13, R, and NC-17 are blocked."
              />
              <SplitEnforcementCard text="Netflix — 6 rules applied" />
            </div>
            <div className="flex-[2] border-t sm:border-t-0 sm:border-l border-white/[0.06]">
              <SplitTerminal
                lines={[
                  { id: 1, type: "request", method: "POST", path: "/v1/setup/quick", status: "success", latency: "142ms" },
                  { id: 2, type: "request", method: "POST", path: "/v1/enforcement/trigger", status: "success", latency: "87ms" },
                  { id: 3, type: "result", resultText: "\u2192 Netflix: 6 rules applied" },
                ]}
              />
            </div>
          </div>
        </DemoCard>
      </div>
    )
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <DemoCard
        title="Phosra AI"
        accentColor="#00D47E"
        accentR={0}
        accentG={212}
        accentB={126}
      >
        {/* Scenario tabs */}
        <div className="flex items-center gap-0.5 mb-3 -mt-1">
          {DEMO_SCENARIOS.map((scenario, i) => (
            <button
              key={scenario.id}
              onClick={() => handleTabClick(i)}
              className={`px-2 py-1 text-[10px] font-medium rounded transition-colors ${
                i === activeIndex
                  ? "text-white/90 bg-white/[0.08]"
                  : "text-white/30 hover:text-white/50"
              }`}
            >
              {scenario.label}
            </button>
          ))}
          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse shrink-0" />
        </div>

        {/* Split layout */}
        <motion.div
          animate={{ opacity: fading ? 0 : 1 }}
          transition={{ duration: fading ? 0.4 : 0.3 }}
          className="flex flex-col sm:flex-row h-[450px] sm:h-[340px] -mx-5 sm:-mx-6 -mb-5 sm:-mb-6 border-t border-white/[0.06]"
        >
          {/* LEFT: Chat pane (~60%) */}
          <div
            ref={chatScrollRef}
            className="flex-[3] overflow-y-auto px-3 py-2.5 space-y-2 scrollbar-hide sm:min-h-0 min-h-[220px] max-h-[260px] sm:max-h-none"
          >
            {messages.map((msg, i) => (
              <motion.div
                key={`msg-${i}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22 }}
              >
                <SplitChatBubble
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
                className="flex items-center gap-1 py-0.5"
              >
                <span className="w-1 h-1 bg-white/30 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1 h-1 bg-white/30 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1 h-1 bg-white/30 rounded-full animate-bounce [animation-delay:300ms]" />
              </motion.div>
            )}

            {/* Tool call pills */}
            {tools.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tools.map((t) => (
                  <SplitToolPill
                    key={t.key}
                    toolName={t.name}
                    status={t.status}
                  />
                ))}
              </div>
            )}

            {/* Enforcement result card */}
            {resultCardText && <SplitEnforcementCard text={resultCardText} />}

            {/* Scroll anchor */}
            <div className="h-1" />
          </div>

          {/* Divider */}
          <div className="border-t sm:border-t-0 sm:border-l border-white/[0.06] shrink-0" />

          {/* RIGHT: API terminal (~40%) */}
          <div className="flex-[2] sm:min-h-0 min-h-[180px] max-h-[200px] sm:max-h-none">
            <SplitTerminal lines={logLines} />
          </div>
        </motion.div>
      </DemoCard>
    </motion.div>
  )
}
