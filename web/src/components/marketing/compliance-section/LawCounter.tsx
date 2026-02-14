"use client"

import { useEffect, useRef, useState } from "react"

interface CounterItemProps {
  target: number
  suffix?: string
  label: string
}

function CounterItem({ target, suffix = "", label }: CounterItemProps) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const animated = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated.current) {
          animated.current = true
          const duration = 1200
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
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target])

  return (
    <div ref={ref} className="text-center">
      <div className="text-3xl sm:text-4xl font-display bg-gradient-to-b from-brand-green to-accent-teal bg-clip-text text-transparent">
        {count}
        {suffix}
      </div>
      <div className="text-xs text-white/40 mt-1">{label}</div>
    </div>
  )
}

interface LawCounterProps {
  totalLaws: number
  jurisdictions: number
  categories: number
  enacted: number
}

export function LawCounter({
  totalLaws,
  jurisdictions,
  categories,
  enacted,
}: LawCounterProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      <CounterItem target={totalLaws} suffix="+" label="Laws Tracked" />
      <CounterItem target={jurisdictions} suffix="+" label="Jurisdictions" />
      <CounterItem target={categories} label="Rule Categories" />
      <CounterItem target={enacted} label="Enacted Laws" />
    </div>
  )
}
