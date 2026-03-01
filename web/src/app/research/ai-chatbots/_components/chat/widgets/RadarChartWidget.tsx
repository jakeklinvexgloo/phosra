"use client"

import { lazy, Suspense } from "react"
import { Loader2 } from "lucide-react"

// Lazy-load recharts components
const LazyRadarChart = lazy(() =>
  import("recharts").then((m) => ({
    default: function RadarChartInner({ data, platforms, colors }: {
      data: RadarDataPoint[]
      platforms: string[]
      colors: string[]
    }) {
      const { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Legend } = m
      return (
        <ResponsiveContainer width="100%" height={280}>
          <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis
              dataKey="dimension"
              tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11 }}
            />
            {platforms.map((platform, i) => (
              <Radar
                key={platform}
                name={platform}
                dataKey={platform}
                stroke={colors[i]}
                fill={colors[i]}
                fillOpacity={0.15}
                strokeWidth={2}
              />
            ))}
            <Legend
              wrapperStyle={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}
            />
          </RadarChart>
        </ResponsiveContainer>
      )
    },
  }))
)

interface RadarDataPoint {
  dimension: string
  [platform: string]: string | number
}

interface RadarChartWidgetProps {
  platforms: string[]
  data: RadarDataPoint[]
}

const PLATFORM_COLORS = [
  "#34d399", // emerald
  "#60a5fa", // blue
  "#fbbf24", // amber
  "#f87171", // red
]

export function RadarChartWidget({ platforms, data }: RadarChartWidgetProps) {
  const colors = platforms.map((_, i) => PLATFORM_COLORS[i % PLATFORM_COLORS.length])

  return (
    <div className="my-3 rounded-lg border border-white/[0.08] bg-white/[0.03] p-4">
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-[280px] text-white/40">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        }
      >
        <LazyRadarChart data={data} platforms={platforms} colors={colors} />
      </Suspense>
    </div>
  )
}

/** Parse radar code fence: "Platform1|Platform2\nDim:score1:score2\n..." */
export function parseRadar(text: string): RadarChartWidgetProps | null {
  const lines = text.trim().split("\n").map(l => l.trim()).filter(Boolean)
  if (lines.length < 2) return null

  const platforms = lines[0].split("|").map(p => p.trim())
  if (platforms.length === 0 || platforms.length > 4) return null

  const data: RadarDataPoint[] = []
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(":").map(p => p.trim())
    if (parts.length < platforms.length + 1) continue

    const point: RadarDataPoint = { dimension: parts[0] }
    for (let j = 0; j < platforms.length; j++) {
      const val = parseFloat(parts[j + 1])
      if (isNaN(val)) continue
      point[platforms[j]] = val
    }
    data.push(point)
  }

  if (data.length < 3) return null // Need at least 3 axes for a radar

  return { platforms, data }
}
