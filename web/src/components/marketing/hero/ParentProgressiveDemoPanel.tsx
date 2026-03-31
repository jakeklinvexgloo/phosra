"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { motion, useInView } from "framer-motion"
import { DemoCard } from "./DemoCard"
import { HeroChatBubble } from "./HeroChatBubble"
import { HeroToolCallPill } from "./HeroToolCallPill"
import { HeroEnforcementCard } from "./HeroEnforcementCard"
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
  key: string
}

interface LogLine {
  id: number
  type: "request" | "result"
  method?: string
  path?: string
  status?: "pending" | "success"
  latency?: string
  resultText?: string
}

/* ── Inline API log line (monospace, no terminal pane) ─── */

function InlineLogLine({ line }: { line: LogLine }) {
  if (line.type === "request") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -4 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
        className="font-mono text-[10px] leading-relaxed"
      >
        <span className="text-blue-400">{line.method}</span>
        <span className="text-white/35 ml-1.5">{line.path}</span>
        {line.status === "success" ? (
          <>
            <span className="text-emerald-400 ml-2">200</span>
            <span className="text-white/20 ml-1.5">{line.latency}</span>
          </>
        ) : (
          <span className="text-white/20 ml-2 animate-pulse">...</span>
        )}
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -4 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className="font-mono text-[10px] text-emerald-400/60 leading-relaxed"
    >
      {line.resultText}
    </motion.div>
  )
}

/* ── Main Component ───────────────────────── */

export function ParentProgressiveDemoPanel() {
  const ref = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
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
  const [logLines, setLogLines] = useState<LogLine[]>([])
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

  // Auto-scroll to bottom when content changes
  useEffect(() => {
    const container = scrollRef.current
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" })
    }
  }, [messages, tools, logLines, resultCardText, showThinking])

  // Typewriter: incrementally reveal text
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

  // Process a single demo step
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
  }, [addTimer, resetState, processStep])

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

  const accent = { color: "#00D47E", r: 0, g: 212, b: 126 }

  // Reduced-motion: show static final state
  if (prefersReducedMotion) {
    return (
      <div ref={ref}>
        <DemoCard
          title="phosra-ai"
          accentColor={accent.color}
          accentR={accent.r}
          accentG={accent.g}
          accentB={accent.b}
          fixedHeight={420}
        >
          <div className="space-y-2.5">
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
            <div className="font-mono text-[10px] text-emerald-400/60 space-y-0.5 pt-1">
              <div>→ Netflix: 6 rules applied</div>
              <div>→ Fire Tablet: 8 rules applied</div>
              <div>→ NextDNS: 5 rules applied</div>
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
        title="phosra-ai"
        accentColor={accent.color}
        accentR={accent.r}
        accentG={accent.g}
        accentB={accent.b}
        fixedHeight={0}
      >
        {/* Custom inner layout: header tabs + scrollable content at fixed 420px total */}
        <div className="flex flex-col" style={{ height: "368px" }}>
          {/* Scenario tabs */}
          <div className="flex items-center gap-1 pb-3 border-b border-white/[0.06] shrink-0">
            {DEMO_SCENARIOS.map((scenario, i) => (
              <button
                key={scenario.id}
                onClick={() => handleTabClick(i)}
                className={`px-2.5 py-1 text-[10px] font-medium rounded-md transition-colors duration-200 ${
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

          {/* Scrollable content area */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto pt-3"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            <style jsx>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>

            <motion.div
              animate={{ opacity: fading ? 0 : 1 }}
              transition={{ duration: fading ? 0.4 : 0.3 }}
              className="space-y-2.5"
            >
              {/* Chat messages */}
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

              {/* Inline API log lines */}
              {logLines.length > 0 && (
                <div className="space-y-0.5 pt-1 border-t border-white/[0.04] mt-2 pt-2">
                  {logLines.map((line) => (
                    <InlineLogLine key={line.id} line={line} />
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </DemoCard>
    </motion.div>
  )
}
