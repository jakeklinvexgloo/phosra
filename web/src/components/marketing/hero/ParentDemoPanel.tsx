"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DemoCard } from "./DemoCard"
import { PERSONA_ACCENTS } from "./persona-data"

interface ChatItem {
  type: "user" | "ai" | "tools" | "api-log" | "result"
  text?: string
  tools?: string[]
  toolsDone?: boolean[]
}

const STEPS: { type: ChatItem["type"]; text?: string; tools?: string[]; delay: number }[] = [
  { type: "user", text: "Chap is 10. Set up Netflix parental controls.", delay: 0 },
  { type: "tools", tools: ["quick_setup", "trigger_enforcement"], delay: 800 },
  { type: "api-log", text: "POST /v1/setup/quick  200 OK  142ms", delay: 1800 },
  { type: "ai", text: "Done! Chap can watch G and PG on Netflix. PG-13, R, and NC-17 are blocked.", delay: 2400 },
  { type: "result", text: "Netflix \u2014 6 rules applied", delay: 3200 },
  { type: "user", text: "Now do YouTube and Roblox.", delay: 4200 },
  { type: "tools", tools: ["quick_setup", "trigger_enforcement", "sync_platforms"], delay: 5000 },
  { type: "api-log", text: "POST /v1/setup/batch  200 OK  287ms", delay: 6000 },
  { type: "ai", text: "3 platforms \u2014 15 rules total. Chap is protected everywhere.", delay: 6800 },
  { type: "result", text: "3 platforms \u2014 15 rules total", delay: 7600 },
]

export function ParentDemoPanel({ isActive }: { isActive: boolean }) {
  const accent = PERSONA_ACCENTS.parent
  const [items, setItems] = useState<ChatItem[]>([])
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }, [])

  const runDemo = useCallback(() => {
    setItems([])
    clearTimers()

    let maxDelay = 0
    STEPS.forEach((step) => {
      if (step.delay > maxDelay) maxDelay = step.delay
      const t = setTimeout(() => {
        const item: ChatItem = { type: step.type }
        if (step.text) item.text = step.text
        if (step.tools) {
          item.tools = step.tools
          item.toolsDone = step.tools.map(() => false)
        }
        setItems((prev) => [...prev, item])

        // Resolve tool pills after delay
        if (step.tools) {
          step.tools.forEach((_, i) => {
            const tt = setTimeout(() => {
              setItems((prev) => {
                const updated = [...prev]
                const last = updated[updated.length - 1]
                if (last?.toolsDone) {
                  const newDone = [...last.toolsDone]
                  newDone[i] = true
                  updated[updated.length - 1] = { ...last, toolsDone: newDone }
                }
                return updated
              })
            }, 600 + i * 300)
            timersRef.current.push(tt)
          })
        }
      }, step.delay)
      timersRef.current.push(t)
    })

    // Loop
    const loopT = setTimeout(() => {
      runDemo()
    }, maxDelay + 3500)
    timersRef.current.push(loopT)
  }, [clearTimers])

  useEffect(() => {
    if (isActive) {
      const t = setTimeout(() => runDemo(), 200)
      timersRef.current.push(t)
    } else {
      clearTimers()
      setItems([])
    }
    return clearTimers
  }, [isActive, runDemo, clearTimers])


  return (
    <DemoCard
      title="phosra AI assistant"
      accentColor={accent.color}
      accentR={accent.r}
      accentG={accent.g}
      accentB={accent.b}
    >
      <motion.div layout className="flex flex-col gap-2.5 font-sans text-[13.5px]" transition={{ layout: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] } }}>
        <AnimatePresence mode="popLayout">
          {items.map((item, idx) => (
            <motion.div
              key={idx}
              layout
              initial={{ opacity: 0, y: 8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {item.type === "user" && (
                <div className="self-end max-w-[92%] ml-auto px-3.5 py-2.5 rounded-xl bg-[#00D47E]/[0.12] border border-[#00D47E]/20 text-white/90 leading-[1.55]">
                  {item.text}
                </div>
              )}
              {item.type === "ai" && (
                <div className="self-start max-w-[92%] px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/80 leading-[1.55]">
                  {item.text}
                </div>
              )}
              {item.type === "tools" && (
                <div className="self-start max-w-[92%] px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08]">
                  <div className="flex flex-wrap gap-2 mt-1">
                    {item.tools?.map((tool, ti) => (
                      <span
                        key={ti}
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#00D47E]/[0.08] border border-[#00D47E]/[0.15] font-mono text-[11px] text-[#00D47E]"
                      >
                        {item.toolsDone?.[ti] ? (
                          <span className="text-[11px]">&#10003;</span>
                        ) : (
                          <span className="w-2.5 h-2.5 border-[1.5px] border-[#00D47E]/30 border-t-[#00D47E] rounded-full animate-spin" />
                        )}
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {item.type === "api-log" && (
                <div className="font-mono text-[10.5px] text-white/30 mt-1">
                  {item.text}
                </div>
              )}
              {item.type === "result" && (
                <div className="mt-2 px-3.5 py-2.5 rounded-[10px] bg-[#00D47E]/[0.06] border border-[#00D47E]/[0.12] text-[13px] text-white/80">
                  <strong className="text-[#00D47E]">{item.text}</strong>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </DemoCard>
  )
}
