"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"

export function HeroEnforcementCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="bg-brand-green/5 border border-brand-green/20 rounded-lg px-3 py-2 flex items-center gap-2"
    >
      <Check className="w-3.5 h-3.5 text-brand-green flex-shrink-0" />
      <span className="text-xs text-white/80">Netflix &mdash; 6 rules applied</span>
    </motion.div>
  )
}
