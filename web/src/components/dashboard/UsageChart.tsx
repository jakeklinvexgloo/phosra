"use client"

import { useState } from "react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

// Mock data — in production, fetch from /api/v1/analytics/usage
const generateMockData = (days: number) => {
  const data = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const label = date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    data.push({
      date: label,
      calls: Math.floor(Math.random() * 800) + 200 + (days - i) * 15,
      errors: Math.floor(Math.random() * 20),
    })
  }
  return data
}

const data7d = generateMockData(7)
const data30d = generateMockData(30)

export function UsageChart() {
  const [range, setRange] = useState<"7d" | "30d">("30d")
  const data = range === "7d" ? data7d : data30d

  const totalCalls = data.reduce((sum, d) => sum + d.calls, 0)
  const totalErrors = data.reduce((sum, d) => sum + d.errors, 0)
  const avgCalls = Math.round(totalCalls / data.length)

  return (
    <div className="plaid-card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="section-header">API Usage</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {totalCalls.toLocaleString()} total calls &middot; {avgCalls.toLocaleString()} avg/day &middot;{" "}
            <span className={totalErrors > 50 ? "text-destructive" : "text-muted-foreground"}>
              {totalErrors} errors
            </span>
          </p>
        </div>
        <div className="flex items-center gap-1 bg-muted rounded-full p-0.5">
          <button
            onClick={() => setRange("7d")}
            className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
              range === "7d" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            7 days
          </button>
          <button
            onClick={() => setRange("30d")}
            className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
              range === "30d" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            30 days
          </button>
        </div>
      </div>

      <div className="h-[180px] sm:h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="usageGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.2} />
                <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fontFamily: "var(--font-mono)", fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={{ stroke: "hsl(var(--border))" }}
              interval={range === "30d" ? 4 : 0}
            />
            <YAxis
              tick={{ fontSize: 11, fontFamily: "var(--font-mono)", fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)",
                fontSize: 12,
                fontFamily: "var(--font-mono)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
              labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 500 }}
              itemStyle={{ color: "hsl(var(--muted-foreground))" }}
            />
            <Area
              type="monotone"
              dataKey="calls"
              stroke="hsl(var(--accent))"
              strokeWidth={2}
              fill="url(#usageGradient)"
              name="API Calls"
            />
            <Area
              type="monotone"
              dataKey="errors"
              stroke="hsl(var(--destructive))"
              strokeWidth={1.5}
              fill="none"
              name="Errors"
              strokeDasharray="4 4"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
