"use client"

import { useState, type ReactNode } from "react"
import { ChevronDown, type LucideIcon } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface SectionCardProps {
  id: string
  title: string
  icon: LucideIcon
  badge?: string
  children: ReactNode
  defaultCollapsed?: boolean
}

export function SectionCard({
  id,
  title,
  icon: Icon,
  badge,
  children,
  defaultCollapsed = false,
}: SectionCardProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)

  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="plaid-card scroll-mt-20"
    >
      {/* Section heading */}
      <button
        onClick={() => setCollapsed((p) => !p)}
        className="flex items-center gap-2.5 w-full text-left group"
      >
        <Icon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        <h2 className="text-lg font-semibold text-foreground flex-1">{title}</h2>
        {badge && (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            {badge}
          </span>
        )}
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
            collapsed ? "" : "rotate-180"
          }`}
        />
      </button>

      {/* Collapsible body */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-4 mt-4 border-t border-border/50">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  )
}
