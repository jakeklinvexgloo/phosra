"use client"

import { useEffect, useState } from "react"
import { Globe, BookOpen, Layers, Shield } from "lucide-react"
import { getRegistryStats } from "@/lib/compliance/index"

interface StatItem {
  label: string
  target: number
  suffix?: string
  icon: React.ReactNode
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

function StatCard({ label, target, suffix = "", icon }: StatItem) {
  const count = useAnimatedCounter(target)

  return (
    <div className="glass-card text-center py-6 px-4">
      <div className="flex justify-center mb-3 text-white/40">
        {icon}
      </div>
      <p className="text-3xl sm:text-4xl font-display text-white">
        {count}
        {suffix}
      </p>
      <p className="text-sm text-white/50 mt-1">{label}</p>
    </div>
  )
}

export function ComplianceStats() {
  const stats = getRegistryStats()

  const items: StatItem[] = [
    { label: "Laws Tracked", target: stats.totalLaws, suffix: "+", icon: <Globe className="w-5 h-5" /> },
    { label: "Jurisdictions Covered", target: stats.totalJurisdictions, icon: <BookOpen className="w-5 h-5" /> },
    { label: "Rule Categories Mapped", target: stats.totalCategories, icon: <Layers className="w-5 h-5" /> },
    { label: "Enacted Laws", target: stats.enacted, icon: <Shield className="w-5 h-5" /> },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((item) => (
        <StatCard key={item.label} {...item} />
      ))}
    </div>
  )
}
