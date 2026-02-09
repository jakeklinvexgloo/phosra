"use client"

import { type ReactNode } from "react"
import { motion } from "framer-motion"

interface FloatingElementProps {
  children: ReactNode
  duration?: number
  distance?: number
  delay?: number
  className?: string
}

export function FloatingElement({
  children,
  duration = 6,
  distance = 10,
  delay = 0,
  className,
}: FloatingElementProps) {
  return (
    <motion.div
      animate={{ y: [-distance, distance, -distance] }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
