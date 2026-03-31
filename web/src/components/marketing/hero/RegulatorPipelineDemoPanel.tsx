"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DemoCard } from "./DemoCard"
import { PERSONA_ACCENTS } from "./persona-data"

interface StageData {
  icon: string
  label: string
  detail?: string
  chips?: string[]
}

interface ArrowData {
  arrow: true
}

type PipelineItem = (StageData | ArrowData) & { delay: number }

const PIPELINE: PipelineItem[] = [
  { icon: "\uD83D\uDCC4", label: "Your Standard", detail: "Published safety guidelines", delay: 0 },
  { arrow: true, delay: 500 },
  { icon: "\u2699\uFE0F", label: "PCSS Translation", chips: ["content_filter", "screen_time_limit", "social_restriction", "age_gate", "data_collection_ban"], delay: 800 },
  { arrow: true, delay: 1800 },
  { icon: "\uD83D\uDD0C", label: "Platform APIs", chips: ["Netflix", "YouTube", "Roblox", "TikTok", "Discord", "Spotify"], delay: 2100 },
  { arrow: true, delay: 3200 },
  { icon: "\uD83D\uDCF1", label: "Every Device", detail: "Phone, tablet, console, desktop", delay: 3500 },
]

export function RegulatorPipelineDemoPanel({ isActive }: { isActive: boolean }) {
  const accent = PERSONA_ACCENTS.regulator
  const [visibleItems, setVisibleItems] = useState<number[]>([])
  const [litItems, setLitItems] = useState<number[]>([])
  const [visibleChips, setVisibleChips] = useState<Record<number, number[]>>({})
  const [showResult, setShowResult] = useState(false)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }, [])

  const runDemo = useCallback(() => {
    setVisibleItems([])
    setLitItems([])
    setVisibleChips({})
    setShowResult(false)
    clearTimers()

    let maxDelay = 0
    PIPELINE.forEach((item, i) => {
      if (item.delay > maxDelay) maxDelay = item.delay

      const t1 = setTimeout(() => {
        setVisibleItems((prev) => [...prev, i])
        // Light up stages after 200ms
        if (!("arrow" in item)) {
          const t = setTimeout(() => setLitItems((prev) => [...prev, i]), 200)
          timersRef.current.push(t)
        }
      }, item.delay)
      timersRef.current.push(t1)

      // Reveal chips one by one
      if (!("arrow" in item) && (item as StageData).chips) {
        const chips = (item as StageData).chips!
        chips.forEach((_, ci) => {
          const tc = setTimeout(() => {
            setVisibleChips((prev) => ({
              ...prev,
              [i]: [...(prev[i] || []), ci],
            }))
          }, item.delay + 400 + ci * 200)
          timersRef.current.push(tc)
        })
      }
    })

    const tr = setTimeout(() => setShowResult(true), maxDelay + 1000)
    timersRef.current.push(tr)

    const loopT = setTimeout(() => runDemo(), maxDelay + 5000)
    timersRef.current.push(loopT)
  }, [clearTimers])

  useEffect(() => {
    if (isActive) {
      const t = setTimeout(() => runDemo(), 200)
      timersRef.current.push(t)
    } else {
      clearTimers()
      setVisibleItems([])
      setLitItems([])
      setVisibleChips({})
      setShowResult(false)
    }
    return clearTimers
  }, [isActive, runDemo, clearTimers])

  return (
    <DemoCard
      title="enforcement pipeline"
      accentColor={accent.color}
      accentR={accent.r}
      accentG={accent.g}
      accentB={accent.b}
      fixedHeight={420}
    >
      <div className="flex flex-col gap-3 items-center">
        <AnimatePresence mode="popLayout">
          {PIPELINE.map((item, i) => {
            if (!visibleItems.includes(i)) return null

            if ("arrow" in item) {
              return (
                <motion.div
                  key={`arrow-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-center text-[#7B5CB8]/40 text-sm"
                >
                  &#8595;
                </motion.div>
              )
            }

            const stage = item as StageData
            const isLit = litItems.includes(i)
            const chipIndices = visibleChips[i] || []

            return (
              <motion.div
                key={`stage-${i}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className={`flex items-start gap-3 w-full px-4 py-2.5 rounded-[10px] border transition-colors duration-500 ${
                  isLit
                    ? "border-[#7B5CB8]/30 bg-[#7B5CB8]/[0.06]"
                    : "border-white/[0.06] bg-white/[0.03]"
                }`}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base bg-[#7B5CB8]/10 flex-shrink-0">
                  {stage.icon}
                </div>
                <div>
                  <div className="font-sans text-[13px] font-medium text-white/70">{stage.label}</div>
                  {stage.detail && (
                    <div className="font-mono text-[10.5px] text-white/35 mt-0.5">{stage.detail}</div>
                  )}
                  {stage.chips && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {stage.chips.map((chip, ci) => (
                        <span
                          key={ci}
                          className={`px-2 py-0.5 rounded font-mono text-[10px] bg-[#7B5CB8]/10 border border-[#7B5CB8]/15 text-white/50 transition-opacity duration-300 ${
                            chipIndices.includes(ci) ? "opacity-100" : "opacity-0"
                          }`}
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {/* Result */}
        <motion.div
          initial={false}
          animate={{ opacity: showResult ? 1 : 0 }}
          transition={{ duration: 0.4 }}
          className="text-center font-mono text-[11.5px] text-[#7B5CB8] px-2.5 py-2.5 rounded-lg bg-[#7B5CB8]/[0.06] border border-[#7B5CB8]/15 w-full"
        >
          23 rules enforced across 12 platforms &middot; Propagation: 2.4 seconds
        </motion.div>
      </div>
    </DemoCard>
  )
}
