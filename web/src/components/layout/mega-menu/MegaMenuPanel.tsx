"use client"

import { useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface MegaMenuPanelProps {
  open: boolean
  variant: "dark" | "light"
  onMouseEnter: () => void
  onMouseLeave: () => void
  children: React.ReactNode
  /** Number of content columns (used to size the panel) */
  columns?: number
}

export function MegaMenuPanel({ open, variant, onMouseEnter, onMouseLeave, children, columns = 2 }: MegaMenuPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onMouseLeave()
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open, onMouseLeave])

  const isDark = variant === "dark"

  // Size panel based on column count — wider dropdowns need more room
  const widthClass = columns >= 3 ? "w-[min(92vw,960px)]" : "w-[min(92vw,780px)]"

  return (
    <AnimatePresence>
      {open && (
        /* Outer wrapper handles positioning — keeps transform separate from framer-motion */
        <div
          ref={panelRef}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          className={`absolute top-[calc(100%+10px)] left-1/2 -translate-x-1/2 ${widthClass}`}
        >
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={`rounded-2xl p-7 ${
              isDark
                ? "bg-[rgba(13,27,42,0.97)] backdrop-blur-[24px] saturate-[140%] border border-white/[0.08] shadow-[0_16px_48px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.04)]"
                : "bg-white/[0.97] backdrop-blur-[24px] saturate-[180%] border border-black/[0.06] shadow-[0_16px_48px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.8)]"
            }`}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
