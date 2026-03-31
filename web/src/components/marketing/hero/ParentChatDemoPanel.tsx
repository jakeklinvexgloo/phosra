"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DemoCard } from "./DemoCard"
import { HeroChatBubble } from "./HeroChatBubble"
import { HeroToolCallPill } from "./HeroToolCallPill"
import { HeroEnforcementCard } from "./HeroEnforcementCard"
import { DEMO_SCENARIOS, type DemoStep } from "./hero-demo-script"
import { PERSONA_ACCENTS } from "./persona-data"

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

interface LogEntry {
  id: number
  type: "request" | "result"
  method?: string
  path?: string
  status?: "pending" | "success"
  latency?: string
  resultText?: string
}

/* ── Main Component ───────────────────────── */

export function ParentChatDemoPanel({ isActive }: { isActive: boolean }) {
  const accent = PERSONA_ACCENTS.parent
  const chatScrollRef = useRef<HTMLDivElement>(null)

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
  const [activeScenario, setActiveScenario] = useState(0)

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
  }, [messages, tools, resultCardText, showThinking, logLines])

  // Typewriter: incrementally reveal text in a message
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

    // After all steps, advance to next scenario and restart
    addTimer(() => {
      isPlayingRef.current = false
      scenarioIndexRef.current =
        (scenarioIndexRef.current + 1) % DEMO_SCENARIOS.length
      setActiveScenario(scenarioIndexRef.current)
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
      setActiveScenario(index)
      resetState()
      const id = setTimeout(() => runDemo(), 50)
      timersRef.current.push(id)
    },
    [clearAllTimers, resetState, runDemo]
  )

  // Start/stop based on isActive
  useEffect(() => {
    if (prefersReducedMotion) return

    if (isActive) {
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
  }, [isActive, prefersReducedMotion, runDemo, clearAllTimers, resetState])

  // Reduced-motion: static final state
  if (prefersReducedMotion) {
    return (
      <DemoCard
        title="phosra AI assistant"
        accentColor={accent.color}
        accentR={accent.r}
        accentG={accent.g}
        accentB={accent.b}
        fixedHeight={420}
      >
        <ScenarioTabs activeIndex={0} onTabClick={() => {}} />
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
        </div>
        <InlineApiLog
          lines={[
            { id: 1, type: "request", method: "POST", path: "/v1/setup/quick", status: "success", latency: "142ms" },
            { id: 2, type: "request", method: "POST", path: "/v1/enforcement/trigger", status: "success", latency: "87ms" },
            { id: 3, type: "result", resultText: "\u2192 Netflix: 6 rules applied" },
          ]}
        />
      </DemoCard>
    )
  }

  return (
    <DemoCard
      title="phosra AI assistant"
      accentColor={accent.color}
      accentR={accent.r}
      accentG={accent.g}
      accentB={accent.b}
      fixedHeight={420}
    >
      {/* Scenario tabs inside card */}
      <ScenarioTabs activeIndex={activeScenario} onTabClick={handleTabClick} />

      {/* Inner content — fades between scenarios */}
      <motion.div
        className="flex flex-col min-h-0 flex-1"
        animate={{ opacity: fading ? 0 : 1 }}
        transition={{ duration: fading ? 0.4 : 0.3 }}
      >
        {/* Chat messages pane — scrollable, hidden scrollbar */}
        <div
          ref={chatScrollRef}
          className="flex-1 overflow-y-auto py-2 space-y-2.5 scrollbar-hide"
        >
          <AnimatePresence mode="popLayout">
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
          </AnimatePresence>

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
        </div>

        {/* Inline API log area at bottom */}
        <InlineApiLog lines={logLines} />
      </motion.div>
    </DemoCard>
  )
}

/* ── Scenario Tabs ─────────────────────────── */

function ScenarioTabs({
  activeIndex,
  onTabClick,
}: {
  activeIndex: number
  onTabClick: (index: number) => void
}) {
  return (
    <div className="flex items-center gap-1 mb-3 pb-2.5 border-b border-white/[0.06] shrink-0">
      <img src="/favicon.svg" alt="" className="w-3.5 h-3.5 opacity-50" width={14} height={14} />
      <span className="text-[10px] font-mono text-white/30 ml-1 mr-2">scenarios</span>
      {DEMO_SCENARIOS.map((scenario, i) => (
        <button
          key={scenario.id}
          onClick={() => onTabClick(i)}
          className={`relative px-2.5 py-1 text-[10px] font-medium rounded-md transition-all duration-300 ${
            i === activeIndex
              ? "text-white/90"
              : "text-white/30 hover:text-white/50"
          }`}
        >
          {i === activeIndex && (
            <motion.div
              layoutId="scenario-indicator"
              className="absolute inset-0 bg-white/[0.08] rounded-md"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-[1]">{scenario.label}</span>
        </button>
      ))}
      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00D47E] animate-pulse shrink-0" />
    </div>
  )
}

/* ── Inline API Log (inside the card) ──────── */

function InlineApiLog({ lines }: { lines: LogEntry[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = scrollRef.current
    if (container) {
      container.scrollTop = container.scrollHeight
    }
  }, [lines])

  return (
    <div className="border-t border-white/[0.06] mt-auto shrink-0">
      <div className="flex items-center gap-1.5 px-1 py-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500/50" />
        <span className="w-1.5 h-1.5 rounded-full bg-green-500/50" />
        <span className="text-[9px] text-white/25 ml-1 font-mono">api log</span>
      </div>
      <div
        ref={scrollRef}
        className="px-1 pb-1.5 font-mono text-[10px] space-y-0.5 max-h-[88px] overflow-y-auto scrollbar-hide"
      >
        {lines.map((line) => (
          <motion.div
            key={line.id}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="leading-relaxed"
          >
            {line.type === "request" ? (
              <span>
                <span className="text-blue-400/80">{line.method}</span>
                <span className="text-white/30 ml-1.5">{line.path}</span>
                {line.status === "success" ? (
                  <>
                    <span className="text-emerald-400/80 ml-2">200</span>
                    <span className="text-white/20 ml-1.5">{line.latency}</span>
                  </>
                ) : (
                  <span className="text-white/15 ml-2 animate-pulse">...</span>
                )}
              </span>
            ) : (
              <span className="text-emerald-400/60">{line.resultText}</span>
            )}
          </motion.div>
        ))}
        {lines.length === 0 && (
          <span className="inline-block w-[5px] h-2.5 bg-white/15 animate-pulse" />
        )}
      </div>
    </div>
  )
}
