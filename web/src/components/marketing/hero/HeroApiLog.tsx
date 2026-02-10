"use client"

import { motion } from "framer-motion"

export interface LogEntry {
  id: number
  type: "request" | "result"
  /** For request lines */
  method?: string
  path?: string
  status?: "pending" | "success"
  latency?: string
  /** For result lines */
  resultText?: string
}

interface HeroApiLogProps {
  lines: LogEntry[]
}

export function HeroApiLog({ lines }: HeroApiLogProps) {
  return (
    <div className="bg-[#0D1117] rounded-b-xl">
      {/* Terminal header with traffic-light dots */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/[0.04]">
        <span className="w-2 h-2 rounded-full bg-red-500/60" />
        <span className="w-2 h-2 rounded-full bg-yellow-500/60" />
        <span className="w-2 h-2 rounded-full bg-green-500/60" />
        <span className="text-[10px] text-white/30 ml-2 font-mono">API Log</span>
      </div>

      {/* Log lines */}
      <div className="px-3 py-2.5 font-mono text-[11px] space-y-1 min-h-[96px]">
        {lines.map((line) => (
          <motion.div
            key={line.id}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="leading-relaxed"
          >
            {line.type === "request" ? (
              <span>
                <span className="text-blue-400">{line.method}</span>
                <span className="text-white/40 ml-2">{line.path}</span>
                {line.status === "success" ? (
                  <>
                    <span className="text-emerald-400 ml-3">200</span>
                    <span className="text-white/25 ml-2">{line.latency}</span>
                  </>
                ) : (
                  <span className="text-white/20 ml-3 animate-pulse">...</span>
                )}
              </span>
            ) : (
              <span className="text-emerald-400/70">{line.resultText}</span>
            )}
          </motion.div>
        ))}

        {/* Blinking cursor when empty or at end */}
        {lines.length === 0 && (
          <span className="inline-block w-[6px] h-3 bg-white/20 animate-pulse" />
        )}
      </div>
    </div>
  )
}
