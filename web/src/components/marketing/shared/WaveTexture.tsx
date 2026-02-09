"use client"

import { useId } from "react"

interface WaveTextureProps {
  colorStart?: string
  colorEnd?: string
  opacity?: number
  className?: string
}

export function WaveTexture({
  colorStart = "#00D47E",
  colorEnd = "#26A8C9",
  opacity = 0.15,
  className = "",
}: WaveTextureProps) {
  const id = useId()

  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 800"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full"
        style={{ willChange: "transform" }}
      >
        <defs>
          <linearGradient
            id={`wave-a-${id}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop
              offset="0%"
              stopColor={colorStart}
              stopOpacity={opacity}
            />
            <stop
              offset="100%"
              stopColor={colorEnd}
              stopOpacity={opacity * 0.4}
            />
          </linearGradient>
          <linearGradient
            id={`wave-b-${id}`}
            x1="100%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop
              offset="0%"
              stopColor={colorEnd}
              stopOpacity={opacity * 0.6}
            />
            <stop
              offset="100%"
              stopColor={colorStart}
              stopOpacity={opacity * 0.2}
            />
          </linearGradient>
        </defs>

        {/* Wave layer 1 — sweeping from bottom-left */}
        <path
          d="M0,500 C200,350 400,550 720,400 S1200,480 1440,380 L1440,800 L0,800 Z"
          fill={`url(#wave-a-${id})`}
        />

        {/* Wave layer 2 — counter-flow */}
        <path
          d="M0,550 C300,420 600,600 900,450 S1300,520 1440,440 L1440,800 L0,800 Z"
          fill={`url(#wave-b-${id})`}
          style={{ opacity: 0.6 }}
        />

        {/* Wave layer 3 — subtle top accent */}
        <path
          d="M0,200 C360,100 720,280 1080,150 S1440,200 1440,180 L1440,0 L0,0 Z"
          fill={`url(#wave-a-${id})`}
          style={{ opacity: 0.3 }}
        />

        {/* Fine detail lines */}
        <path
          d="M0,600 C480,500 960,650 1440,550"
          stroke={colorStart}
          strokeWidth="1"
          strokeOpacity={opacity * 0.5}
          fill="none"
        />
        <path
          d="M0,620 C480,530 960,670 1440,570"
          stroke={colorEnd}
          strokeWidth="0.5"
          strokeOpacity={opacity * 0.3}
          fill="none"
        />
      </svg>
    </div>
  )
}
