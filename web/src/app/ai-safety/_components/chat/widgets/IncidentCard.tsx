"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, ShieldAlert, ChevronDown } from "lucide-react"

type Severity = "HIGH" | "CRITICAL"

interface IncidentCardProps {
  severity: Severity
  children: React.ReactNode
}

const severityConfig: Record<Severity, { bg: string; border: string; text: string; icon: typeof AlertTriangle }> = {
  HIGH: {
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    text: "text-orange-400",
    icon: AlertTriangle,
  },
  CRITICAL: {
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    text: "text-red-400",
    icon: ShieldAlert,
  },
}

export function IncidentCard({ severity, children }: IncidentCardProps) {
  const [expanded, setExpanded] = useState(false)
  const config = severityConfig[severity]
  const Icon = config.icon

  return (
    <div className={`my-2 rounded-lg border ${config.border} ${config.bg} overflow-hidden`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left"
      >
        <Icon className={`w-4 h-4 flex-shrink-0 ${config.text}`} />
        <span className={`text-xs font-semibold uppercase tracking-wider ${config.text}`}>
          {severity}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 ml-auto text-white/40 transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 text-sm text-white/70 [&_p]:my-1">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/** Detect severity tag in blockquote text */
export function detectSeverity(text: string): Severity | null {
  const match = text.match(/^\[?(CRITICAL|HIGH)\]?/)
  return match ? (match[1] as Severity) : null
}
