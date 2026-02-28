"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { AlertTriangle, ArrowRight, MessageSquare } from "lucide-react"

const SCORE_LABELS: Record<number, string> = {
  0: "Full Block",
  1: "Partial Block",
  2: "Soft Warning",
  3: "Compliant",
  4: "Enthusiastic",
}

function scoreBg(score: number): string {
  if (score === 0) return "bg-emerald-500 text-white"
  if (score === 1) return "bg-blue-500 text-white"
  if (score === 2) return "bg-amber-500 text-white"
  if (score === 3) return "bg-orange-500 text-white"
  return "bg-red-500 text-white"
}

interface ScorePopoverProps {
  score: number
  platformName: string
  promptId: string
  platformId: string
  response?: string
  notes?: string
  redFlags?: string[]
  isMultiTurn?: boolean
  children: React.ReactNode
}

export function ScorePopover({
  score,
  platformName,
  promptId,
  platformId,
  response,
  notes,
  redFlags,
  isMultiTurn,
  children,
}: ScorePopoverProps) {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState<{ top: number; left: number; placement: "above" | "below" }>({
    top: 0,
    left: 0,
    placement: "above",
  })
  const triggerRef = useRef<HTMLDivElement>(null)
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const popoverHeight = 260
    const spaceAbove = rect.top
    const placement = spaceAbove > popoverHeight + 20 ? "above" : "below"

    setPosition({
      top: placement === "above" ? rect.top + window.scrollY - 8 : rect.bottom + window.scrollY + 8,
      left: rect.left + rect.width / 2 + window.scrollX,
      placement,
    })
  }, [])

  const handleEnter = useCallback(() => {
    hoverTimeout.current = setTimeout(() => {
      updatePosition()
      setOpen(true)
    }, 200)
  }, [updatePosition])

  const handleLeave = useCallback(() => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current)
      hoverTimeout.current = null
    }
    setOpen(false)
  }, [])

  const truncatedResponse = response
    ? response.length > 200
      ? response.substring(0, 200) + "..."
      : response
    : null

  const firstNoteSentence = notes
    ? notes.split(/[.!?]\s/)[0] + (notes.includes(".") ? "." : "")
    : null

  const displayFlags = redFlags?.slice(0, 3) ?? []

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        className="inline-block"
      >
        {children}
      </div>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: position.placement === "above" ? 6 : -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", damping: 25, stiffness: 400 }}
                className="fixed z-[100] pointer-events-none"
                style={{
                  top: position.top,
                  left: position.left,
                  transform: `translate(-50%, ${position.placement === "above" ? "-100%" : "0"})`,
                }}
              >
                <div className="w-72 rounded-xl border border-border bg-popover shadow-xl p-3.5 pointer-events-auto text-left"
                  onMouseEnter={() => {
                    if (hoverTimeout.current) clearTimeout(hoverTimeout.current)
                  }}
                  onMouseLeave={handleLeave}
                >
                  {/* Header */}
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold ${scoreBg(score)}`}>
                      {score}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{platformName}</p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        {SCORE_LABELS[score] ?? `Score ${score}`}
                        {isMultiTurn && (
                          <span className="inline-flex items-center gap-0.5 text-blue-400">
                            <MessageSquare className="w-2.5 h-2.5" />
                            Multi-turn
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Response preview */}
                  {truncatedResponse && (
                    <div className="mb-2.5 p-2 rounded-lg bg-muted/30 border border-border/50">
                      <p className="text-[11px] text-foreground/70 leading-relaxed line-clamp-4">
                        &ldquo;{truncatedResponse}&rdquo;
                      </p>
                    </div>
                  )}

                  {/* Red flags */}
                  {displayFlags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {displayFlags.map((flag, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20"
                        >
                          <AlertTriangle className="w-2.5 h-2.5" />
                          {flag.length > 30 ? flag.substring(0, 30) + "..." : flag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Notes */}
                  {firstNoteSentence && (
                    <p className="text-[10px] text-muted-foreground mb-2.5 leading-relaxed">
                      {firstNoteSentence}
                    </p>
                  )}

                  {/* CTA */}
                  <Link
                    href={`/ai-safety/prompts/${promptId}?platform=${platformId}`}
                    className="flex items-center gap-1 text-[10px] font-medium text-brand-green hover:underline"
                  >
                    Click for full details
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  )
}
