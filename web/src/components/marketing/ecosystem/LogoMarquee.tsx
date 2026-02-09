"use client"

import type { PlatformEntry } from "../ecosystem-data"
import { PlatformIcon } from "./PlatformIcon"

interface LogoMarqueeProps {
  items: PlatformEntry[]
  /** "left" scrolls left, "right" scrolls right */
  direction?: "left" | "right"
  /** Duration of one full loop in seconds */
  speed?: number
  /** Fallback hex for platforms without icons */
  fallbackHex?: string
  className?: string
}

export function LogoMarquee({
  items,
  direction = "left",
  speed = 60,
  fallbackHex = "94A3B8",
  className = "",
}: LogoMarqueeProps) {
  // Double the array for seamless infinite scroll
  const doubled = [...items, ...items]

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Gradient fade masks */}
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

      <div
        className="flex gap-3 hover:[animation-play-state:paused]"
        style={{
          animation: `${direction === "left" ? "scroll" : "scroll-right"} ${speed}s linear infinite`,
          width: "max-content",
        }}
      >
        {doubled.map((platform, i) => (
          <div
            key={`${platform.name}-${i}`}
            className="group flex items-center gap-2 px-3 py-1.5 bg-white border border-border rounded-full flex-shrink-0 whitespace-nowrap transition-all duration-200 hover:shadow-md hover:scale-105 hover:border-border/80"
          >
            <PlatformIcon
              platform={platform}
              size={16}
              grayscale
              fallbackHex={fallbackHex}
              className="group-hover:hidden"
            />
            <PlatformIcon
              platform={platform}
              size={16}
              grayscale={false}
              fallbackHex={fallbackHex}
              className="hidden group-hover:block"
            />
            <span className="text-xs text-muted-foreground font-medium group-hover:text-foreground transition-colors duration-200">
              {platform.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
