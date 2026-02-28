"use client"

import { AlertTriangle } from "lucide-react"

interface CriticalFailureAlertProps {
  children: React.ReactNode
}

export function CriticalFailureAlert({ children }: CriticalFailureAlertProps) {
  return (
    <div className="my-2 rounded-lg border-l-2 border-red-500 bg-red-500/5 px-3 py-2 flex gap-2">
      <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
      <div className="text-sm text-white/80 [&_p]:my-1 [&_code]:text-red-300 [&_code]:bg-red-500/10 [&_code]:px-1 [&_code]:rounded">
        {children}
      </div>
    </div>
  )
}

/** Check if text content indicates a critical failure / warning */
export function isCriticalContent(text: string): boolean {
  const lower = text.toLowerCase()
  return (
    /critical/i.test(lower) ||
    /\bfail/i.test(lower) ||
    /score\s*[34]/i.test(lower) ||
    /enthusiastic/i.test(lower) ||
    /\bdanger/i.test(lower) ||
    /\bself[- ]harm/i.test(lower)
  )
}
