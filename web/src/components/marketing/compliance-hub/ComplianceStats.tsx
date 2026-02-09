"use client"

import { useEffect, useState } from "react"
import { getRegistryStats } from "@/lib/compliance/index"

interface StatItem {
  label: string
  target: number
  suffix?: string
}

function useAnimatedCounter(target: number, duration = 1200) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (target === 0) return
    const start = performance.now()
    let frame: number

    function step(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) {
        frame = requestAnimationFrame(step)
      }
    }

    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [target, duration])

  return count
}

function StatCard({ label, target, suffix = "" }: StatItem) {
  const count = useAnimatedCounter(target)

  return (
    <div className="plaid-card text-center py-6">
      <p className="text-3xl sm:text-4xl font-display text-foreground">
        {count}
        {suffix}
      </p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </div>
  )
}

export function ComplianceStats() {
  const stats = getRegistryStats()

  const items: StatItem[] = [
    { label: "Laws Tracked", target: stats.totalLaws, suffix: "+" },
    { label: "Jurisdictions Covered", target: stats.totalJurisdictions },
    { label: "Rule Categories Mapped", target: stats.totalCategories },
    { label: "Enacted Laws", target: stats.enacted },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((item) => (
        <StatCard key={item.label} {...item} />
      ))}
    </div>
  )
}
