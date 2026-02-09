"use client"

import { useState, type ReactNode } from "react"
import { ChevronDown } from "lucide-react"
import type { LawEntry } from "@/lib/compliance/types"
import { STATUS_META } from "@/lib/compliance/types"

interface JurisdictionGroupProps {
  flag: string
  label: string
  count: number
  borderColor: string
  defaultOpen?: boolean
  forceOpen?: boolean
  renderAbove?: ReactNode
  laws?: LawEntry[]
  children: ReactNode
}

export function JurisdictionGroup({
  flag,
  label,
  count,
  borderColor,
  defaultOpen = true,
  forceOpen = false,
  renderAbove,
  laws,
  children,
}: JurisdictionGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const open = forceOpen || isOpen

  // Status breakdown dots
  const statusCounts = laws
    ? {
        enacted: laws.filter((l) => l.status === "enacted").length,
        passed: laws.filter((l) => l.status === "passed").length,
        pending: laws.filter(
          (l) => l.status === "pending" || l.status === "proposed"
        ).length,
      }
    : null

  return (
    <div className={`border-l-4 ${borderColor} rounded-lg bg-card border border-border overflow-hidden`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl" aria-hidden>{flag}</span>
          <h3 className="text-base font-semibold text-foreground">{label}</h3>
          <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full bg-muted text-muted-foreground">
            {count}
          </span>
          {statusCounts && (
            <div className="hidden sm:flex items-center gap-1 ml-1">
              {statusCounts.enacted > 0 && (
                <span className="flex items-center gap-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${STATUS_META.enacted.dotColor}`} />
                  <span className="text-[10px] text-muted-foreground">{statusCounts.enacted}</span>
                </span>
              )}
              {statusCounts.passed > 0 && (
                <span className="flex items-center gap-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${STATUS_META.passed.dotColor}`} />
                  <span className="text-[10px] text-muted-foreground">{statusCounts.passed}</span>
                </span>
              )}
              {statusCounts.pending > 0 && (
                <span className="flex items-center gap-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${STATUS_META.pending.dotColor}`} />
                  <span className="text-[10px] text-muted-foreground">{statusCounts.pending}</span>
                </span>
              )}
            </div>
          )}
        </div>
        <ChevronDown
          className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className="grid transition-all duration-300 ease-in-out"
        style={{
          gridTemplateRows: open ? "1fr" : "0fr",
        }}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-5 pt-1">
            {renderAbove}
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
