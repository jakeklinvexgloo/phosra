"use client"

import { useEffect, useRef, useState } from "react"

interface AnimatedScoreRevealProps {
  target: number
  suffix?: string
  duration?: number
  className?: string
}

export function AnimatedScoreReveal({
  target,
  suffix = "",
  duration = 1200,
  className = "",
}: AnimatedScoreRevealProps) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const animated = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated.current) {
          animated.current = true
          const start = Date.now()
          const step = () => {
            const elapsed = Date.now() - start
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.round(target * eased))
            if (progress < 1) requestAnimationFrame(step)
          }
          requestAnimationFrame(step)
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [target, duration])

  return (
    <span ref={ref} className={`font-mono tabular-nums ${className}`}>
      {count}
      {suffix}
    </span>
  )
}
