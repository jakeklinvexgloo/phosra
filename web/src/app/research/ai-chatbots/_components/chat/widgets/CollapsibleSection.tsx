"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface CollapsibleSectionProps {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}

export function CollapsibleSection({ title, defaultOpen = false, children }: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="mt-1.5 first:mt-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2.5 px-3 py-2 text-left rounded-lg bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-white/[0.1] transition-all group"
      >
        <span className={`flex items-center justify-center w-4 h-4 rounded-full transition-colors ${open ? "bg-brand-green/20" : "bg-white/[0.06]"}`}>
          <svg
            className={`w-2.5 h-2.5 transition-transform duration-200 ${open ? "rotate-180 text-brand-green" : "text-white/40"}`}
            viewBox="0 0 10 6"
            fill="none"
          >
            <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span className="text-[11px] font-semibold text-white/70 uppercase tracking-wider group-hover:text-white/90 transition-colors flex-1">
          {title}
        </span>
        {!open && (
          <span className="text-[10px] text-white/40 uppercase tracking-wide">expand</span>
        )}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-2 pb-1 pl-1">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
