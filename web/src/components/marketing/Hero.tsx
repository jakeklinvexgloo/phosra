"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { AnimatedSection } from "./shared/AnimatedSection"
import { HeroChatDemo } from "./hero/HeroChatDemo"
import { HeroPromptBar } from "./hero/HeroPromptBar"
import { LiquidGlassModal } from "./hero/LiquidGlassModal"
import { HeroSandboxChat } from "./hero/HeroSandboxChat"
import { useHeroSession } from "./hero/useHeroSession"
import { HeroBackground } from "./hero/HeroBackground"
import { PersonaToggle } from "./hero/PersonaToggle"
import { ParentalControlsDemoPanel } from "./hero/ParentalControlsDemoPanel"
import { PlatformApiDemoPanel } from "./hero/PlatformApiDemoPanel"
import { RegulatorPipelineDemoPanel } from "./hero/RegulatorPipelineDemoPanel"
import { HeroMarquee } from "./hero/HeroMarquee"
import {
  type PersonaKey,
  PERSONA_ACCENTS,
  PERSONA_PROBLEM_TEXT,
  PERSONA_SOLUTION_TEXT,
  PERSONA_CTA,
} from "./hero/persona-data"

const PERSONA_ORDER: PersonaKey[] = [
  "parent",
  "parental-controls",
  "platform",
  "regulator",
]
const ROTATION_INTERVAL = 8000

function getPersonaFromHash(): PersonaKey | null {
  if (typeof window === "undefined") return null
  const hash = window.location.hash.replace("#", "")
  if (PERSONA_ORDER.includes(hash as PersonaKey)) return hash as PersonaKey
  return null
}

export function Hero() {
  const [persona, setPersona] = useState<PersonaKey>("parent")
  const [pinned, setPinned] = useState(false)
  const [modalPrompt, setModalPrompt] = useState<string | null>(null)
  const heroSession = useHeroSession()
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // On mount: check URL hash for deep-linked persona
  useEffect(() => {
    const hashPersona = getPersonaFromHash()
    if (hashPersona) {
      setPersona(hashPersona)
      setPinned(true)
    }

    const onHashChange = () => {
      const p = getPersonaFromHash()
      if (p) {
        setPersona(p)
        setPinned(true)
      }
    }
    window.addEventListener("hashchange", onHashChange)
    return () => window.removeEventListener("hashchange", onHashChange)
  }, [])

  // Auto-rotation: cycles tabs every 8s unless pinned
  useEffect(() => {
    if (pinned) {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      return
    }

    timerRef.current = setInterval(() => {
      setPersona((prev) => {
        const idx = PERSONA_ORDER.indexOf(prev)
        const next = PERSONA_ORDER[(idx + 1) % PERSONA_ORDER.length]
        window.history.replaceState(null, "", `#${next}`)
        return next
      })
    }, ROTATION_INTERVAL)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [pinned])

  // Manual tab click: pin and update URL
  const handlePersonaChange = useCallback((p: PersonaKey) => {
    setPersona(p)
    setPinned(true)
    window.history.replaceState(null, "", `#${p}`)
  }, [])

  const handleCloseModal = useCallback(() => setModalPrompt(null), [])
  const handleTryAnother = useCallback(() => setModalPrompt(null), [])

  const accent = PERSONA_ACCENTS[persona]
  const cta = PERSONA_CTA[persona]

  return (
    <section className="relative overflow-hidden min-h-dvh flex flex-col">
      <HeroBackground persona={persona} />

      <div className="relative z-[1] w-full max-w-[900px] mx-auto px-5 sm:px-6 flex-1 flex flex-col">
        <div className="text-center" style={{ paddingTop: "clamp(72px, 10vh, 120px)" }}>
          <AnimatedSection delay={0.1}>
            <div
              className="font-mono text-[11px] font-medium tracking-[0.2em] uppercase mb-5 transition-colors duration-700"
              style={{ color: `rgba(${accent.r}, ${accent.g}, ${accent.b}, 0.9)` }}
            >
              The child safety protocol
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <h1
              className="font-display font-bold leading-[1.12] tracking-tighter text-white max-w-[880px] mx-auto mb-5"
              style={{
                fontSize: "clamp(2.2rem, 4.8vw, 4rem)",
                textWrap: "balance",
                background: "linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.85) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              One protocol. Four&nbsp;missions. Every&nbsp;child&nbsp;protected.
            </h1>
          </AnimatedSection>

          <AnimatedSection delay={0.3}>
            <p
              className="font-display italic text-white/45 max-w-[640px] mx-auto leading-relaxed"
              style={{ fontSize: "clamp(1rem, 2vw, 1.2rem)" }}
            >
              Parents set the rules. Control apps enforce them. Platforms comply. Regulators verify. Phosra connects all four.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.4}>
            <PersonaToggle active={persona} onChange={handlePersonaChange} />
          </AnimatedSection>
        </div>

        <AnimatedSection delay={0.5}>
          <div className="text-center relative" style={{ minHeight: "520px" }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={persona}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center"
              >
                <p
                  className="font-display italic text-white/40 max-w-[580px] mx-auto mb-3 leading-relaxed"
                  style={{ fontSize: "clamp(1rem, 2vw, 1.15rem)" }}
                >
                  {PERSONA_PROBLEM_TEXT[persona]}
                </p>
                <p
                  className="font-display font-bold text-white mb-8 tracking-tight leading-[1.2]"
                  style={{ fontSize: "clamp(1.3rem, 3vw, 1.8rem)" }}
                >
                  {PERSONA_SOLUTION_TEXT[persona]}
                </p>

                {persona === "parent" && (
                  <div className="w-full max-w-[560px] mx-auto mb-8 text-left [&>div]:max-w-none [&>div]:mx-0 [&>div]:lg\:ml-0">
                    <HeroChatDemo />
                  </div>
                )}
                {persona === "parental-controls" && (
                  <ParentalControlsDemoPanel isActive={persona === "parental-controls"} />
                )}
                {persona === "platform" && (
                  <PlatformApiDemoPanel isActive={persona === "platform"} />
                )}
                {persona === "regulator" && (
                  <RegulatorPipelineDemoPanel isActive={persona === "regulator"} />
                )}

                {persona === "parent" && (
                  <div className="w-full max-w-[560px] mx-auto mb-6">
                    <HeroPromptBar onSubmit={setModalPrompt} />
                  </div>
                )}

                <div className="flex gap-3.5 justify-center flex-wrap mb-6">
                  <Link
                    href={cta.primaryHref}
                    className="inline-flex items-center gap-2 px-7 py-3.5 border-none rounded-[10px] font-sans text-[15px] font-semibold transition-all duration-300 hover:-translate-y-px"
                    style={{
                      background: accent.color,
                      color: persona === "regulator" ? "#fff" : "#0D1B2A",
                      boxShadow: `0 8px 24px rgba(${accent.r}, ${accent.g}, ${accent.b}, 0.2)`,
                    }}
                  >
                    {cta.primary}
                  </Link>
                  <Link
                    href={cta.ghostHref}
                    className="inline-flex items-center gap-2 px-7 py-3.5 border border-white/15 rounded-[10px] bg-transparent font-sans text-[15px] font-medium text-white/70 transition-all duration-300 hover:border-white/30 hover:bg-white/[0.04] hover:-translate-y-px"
                  >
                    {cta.ghost}
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </AnimatedSection>

        <HeroMarquee persona={persona} />
        <div className="pb-16 sm:pb-20" />
      </div>

      <LiquidGlassModal open={!!modalPrompt} onClose={handleCloseModal}>
        {modalPrompt && (
          <HeroSandboxChat
            prompt={modalPrompt}
            onClose={handleCloseModal}
            onTryAnother={handleTryAnother}
            session={heroSession}
          />
        )}
      </LiquidGlassModal>
    </section>
  )
}
