"use client"

import { useEffect, useRef, useState } from "react"

const STATS = [
  { value: 35, suffix: "", label: "Rule categories", description: "Covering every aspect of child digital safety" },
  { value: 500, suffix: "+", label: "Platform integrations", description: "YouTube, TikTok, Roblox, and more — all connected" },
  { value: 5, suffix: "", label: "Rating systems", description: "MPAA, TV, ESRB, PEGI, CSM — mapped automatically" },
  { value: 11, suffix: "+", label: "Compliance laws", description: "KOSA, COPPA 2.0, EU DSA, and more — built in" },
]

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          let start = 0
          const duration = 1200
          const startTime = performance.now()

          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime
            const progress = Math.min(elapsed / duration, 1)
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3)
            start = Math.round(eased * value)
            setCount(start)

            if (progress < 1) {
              requestAnimationFrame(animate)
            }
          }

          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [value, hasAnimated])

  return (
    <span ref={ref} className="tabular-nums">
      {count}{suffix}
    </span>
  )
}

export function Stats() {
  return (
    <section className="py-16 sm:py-24 bg-[#FAFAFA]">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Built for the laws that protect children
          </h2>
          <p className="text-muted-foreground text-base max-w-2xl mx-auto">
            Phosra encodes child safety legislation from around the world into enforceable rules — so your parental controls app is always compliant.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl sm:text-5xl font-bold text-foreground mb-2">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-sm font-semibold text-foreground mb-1">{stat.label}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
