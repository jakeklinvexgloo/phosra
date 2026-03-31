"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DemoCard } from "./DemoCard"
import { PERSONA_ACCENTS } from "./persona-data"

const LINES: { html: React.ReactNode; delay: number }[] = [
  { html: <><span className="text-[#26A8C9] font-semibold">POST</span> <span className="text-white/70">/v1/enforcement/trigger</span></>, delay: 0 },
  { html: <span className="text-white/35">Authorization: Bearer sk_live_...</span>, delay: 200 },
  { html: <>{`{`}</>, delay: 500 },
  { html: <>&nbsp;&nbsp;<span className="text-white/50">&quot;child_id&quot;</span>: <span className="text-[#f0c674]">&quot;ch_abc&quot;</span>,</>, delay: 650 },
  { html: <>&nbsp;&nbsp;<span className="text-white/50">&quot;platform&quot;</span>: <span className="text-[#f0c674]">&quot;netflix&quot;</span>,</>, delay: 800 },
  { html: <>&nbsp;&nbsp;<span className="text-white/50">&quot;policy&quot;</span>: <span className="text-[#f0c674]">&quot;age_10_standard&quot;</span></>, delay: 950 },
  { html: <>{`}`}</>, delay: 1100 },
  { html: <>&nbsp;</>, delay: 1400 },
  { html: <><span className="text-[#26A8C9] font-bold">&rarr;</span> <span className="text-[#26A8C9] font-semibold">200 OK</span>&nbsp;&nbsp;<span className="text-[#b5cea8]">23ms</span></>, delay: 1600 },
  { html: <>{`{`}</>, delay: 1900 },
  { html: <>&nbsp;&nbsp;<span className="text-white/50">&quot;rules_applied&quot;</span>: <span className="text-[#b5cea8]">6</span>,</>, delay: 2050 },
  { html: <>&nbsp;&nbsp;<span className="text-white/50">&quot;laws_satisfied&quot;</span>: [<span className="text-[#c9a0dc]">&quot;COPPA_2&quot;</span>, <span className="text-[#c9a0dc]">&quot;KOSA&quot;</span>, <span className="text-[#c9a0dc]">&quot;EU_DSA&quot;</span>, <span className="text-[#c9a0dc]">&quot;CA_AADC&quot;</span>],</>, delay: 2200 },
  { html: <>&nbsp;&nbsp;<span className="text-white/50">&quot;platforms_synced&quot;</span>: <span className="text-[#b5cea8]">3</span></>, delay: 2350 },
  { html: <>{`}`}</>, delay: 2500 },
]

export function PlatformApiDemoPanel({ isActive }: { isActive: boolean }) {
  const accent = PERSONA_ACCENTS.platform
  const [visibleCount, setVisibleCount] = useState(0)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }, [])

  const runDemo = useCallback(() => {
    setVisibleCount(0)
    clearTimers()

    let maxDelay = 0
    LINES.forEach((line, i) => {
      if (line.delay > maxDelay) maxDelay = line.delay
      const t = setTimeout(() => setVisibleCount(i + 1), line.delay)
      timersRef.current.push(t)
    })

    const loopT = setTimeout(() => runDemo(), maxDelay + 3500)
    timersRef.current.push(loopT)
  }, [clearTimers])

  useEffect(() => {
    if (isActive) {
      const t = setTimeout(() => runDemo(), 200)
      timersRef.current.push(t)
    } else {
      clearTimers()
      setVisibleCount(0)
    }
    return clearTimers
  }, [isActive, runDemo, clearTimers])

  return (
    <DemoCard
      title="api terminal"
      accentColor={accent.color}
      accentR={accent.r}
      accentG={accent.g}
      accentB={accent.b}
      fixedHeight={420}
    >
      <div className="font-mono text-[12px] leading-[1.8] text-white/55 text-left">
        <AnimatePresence mode="popLayout">
          {LINES.slice(0, visibleCount).map((line, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              {line.html}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </DemoCard>
  )
}
