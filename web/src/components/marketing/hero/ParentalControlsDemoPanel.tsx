"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DemoCard } from "./DemoCard"
import { PERSONA_ACCENTS } from "./persona-data"

const PLATFORMS = [
  "Netflix", "YouTube", "Roblox", "TikTok", "Discord",
  "Spotify", "Twitch", "Apple TV+", "Xbox", "PlayStation",
  "Steam", "Snapchat",
]

interface PlatformState {
  name: string
  visible: boolean
  connected: boolean
}

export function ParentalControlsDemoPanel({ isActive }: { isActive: boolean }) {
  const accent = PERSONA_ACCENTS["parental-controls"]
  const [platforms, setPlatforms] = useState<PlatformState[]>([])
  const [connectedCount, setConnectedCount] = useState(0)
  const [showCounter, setShowCounter] = useState(false)
  const [showCode, setShowCode] = useState(false)
  const [showPropagation, setShowPropagation] = useState(false)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }, [])

  const runDemo = useCallback(() => {
    setPlatforms(PLATFORMS.map((name) => ({ name, visible: false, connected: false })))
    setConnectedCount(0)
    setShowCounter(false)
    setShowCode(false)
    setShowPropagation(false)
    clearTimers()

    PLATFORMS.forEach((_, i) => {
      const t1 = setTimeout(() => {
        setPlatforms((prev) => {
          const updated = [...prev]
          updated[i] = { ...updated[i], visible: true }
          return updated
        })
      }, i * 180)
      timersRef.current.push(t1)

      const t2 = setTimeout(() => {
        setPlatforms((prev) => {
          const updated = [...prev]
          updated[i] = { ...updated[i], connected: true }
          return updated
        })
        setConnectedCount(i + 1)
        if (i === 0) setShowCounter(true)
      }, i * 180 + 400)
      timersRef.current.push(t2)
    })

    const totalTime = PLATFORMS.length * 180 + 600
    const t3 = setTimeout(() => setShowCode(true), totalTime + 200)
    const t4 = setTimeout(() => setShowPropagation(true), totalTime + 800)
    timersRef.current.push(t3, t4)

    const loopT = setTimeout(() => runDemo(), totalTime + 4000)
    timersRef.current.push(loopT)
  }, [clearTimers])

  useEffect(() => {
    if (isActive) {
      const t = setTimeout(() => runDemo(), 200)
      timersRef.current.push(t)
    } else {
      clearTimers()
      setPlatforms([])
      setShowCounter(false)
      setShowCode(false)
      setShowPropagation(false)
    }
    return clearTimers
  }, [isActive, runDemo, clearTimers])

  return (
    <DemoCard
      title="integration dashboard"
      accentColor={accent.color}
      accentR={accent.r}
      accentG={accent.g}
      accentB={accent.b}
      fixedHeight={420}
    >
      <div className="flex flex-col gap-3.5">
        {/* Platform list */}
        <div className="flex flex-col gap-1.5 max-h-[220px] overflow-y-auto">
          <AnimatePresence mode="popLayout">
            {platforms.filter((p) => p.visible).map((p) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-colors duration-500 ${
                  p.connected
                    ? "border-[#2DB8A5]/25 bg-[#2DB8A5]/[0.04]"
                    : "border-white/[0.06] bg-white/[0.03]"
                }`}
              >
                <span className="font-sans text-[13px] font-medium text-white/70">{p.name}</span>
                <span className={`font-mono text-[11px] transition-colors duration-400 ${p.connected ? "text-[#2DB8A5]" : "text-white/30"}`}>
                  {p.connected ? "connected \u2713" : "waiting..."}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Counter */}
        <div className={`text-center font-mono text-[12px] text-white/40 transition-opacity duration-400 ${showCounter ? "opacity-100" : "opacity-0"}`}>
          <strong className="text-[#2DB8A5] font-semibold">{connectedCount}</strong> of 50+ connected
        </div>

        {/* Code snippet */}
        <motion.div
          initial={false}
          animate={{ opacity: showCode ? 1 : 0, y: showCode ? 0 : 4 }}
          transition={{ duration: 0.4 }}
          className="font-mono text-[11.5px] leading-[1.7] text-white/50 bg-black/30 rounded-lg px-3.5 py-3"
        >
          <span className="text-[#2DB8A5]">phosra</span>.<span className="text-white/70">sync</span>({`{`}<br />
          &nbsp;&nbsp;<span className="text-white/70">provider</span>: <span className="text-[#f0c674]">&quot;bark&quot;</span>,<br />
          &nbsp;&nbsp;<span className="text-white/70">rules</span>: <span className="text-[#2DB8A5]">parentPolicy</span><br />
          {`})`}
        </motion.div>

        {/* Propagation message */}
        <div className={`text-center font-mono text-[11px] text-[#2DB8A5] transition-opacity duration-400 ${showPropagation ? "opacity-100" : "opacity-0"}`}>
          All rules propagated in 340ms
        </div>
      </div>
    </DemoCard>
  )
}
