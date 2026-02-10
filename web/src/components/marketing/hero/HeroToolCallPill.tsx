"use client"

import { motion } from "framer-motion"
import { Loader2, Check } from "lucide-react"

interface HeroToolCallPillProps {
  toolName: string
  status: "running" | "complete"
}

export function HeroToolCallPill({ toolName, status }: HeroToolCallPillProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="inline-flex items-center gap-1.5 bg-brand-green/10 border border-brand-green/20 rounded-full px-2.5 py-1"
    >
      {status === "running" ? (
        <Loader2 className="w-3 h-3 text-brand-green animate-spin" />
      ) : (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 25 }}
        >
          <Check className="w-3 h-3 text-brand-green" />
        </motion.div>
      )}
      <span className="text-[10px] font-mono text-brand-green">{toolName}</span>
    </motion.div>
  )
}
