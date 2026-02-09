"use client"

import { useState, type ReactNode } from "react"
import { ChevronDown } from "lucide-react"

interface JurisdictionGroupProps {
  flag: string
  label: string
  count: number
  borderColor: string
  defaultOpen?: boolean
  forceOpen?: boolean
  children: ReactNode
}

export function JurisdictionGroup({
  flag,
  label,
  count,
  borderColor,
  defaultOpen = true,
  forceOpen = false,
  children,
}: JurisdictionGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const open = forceOpen || isOpen

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
        </div>
        <ChevronDown
          className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          open ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-5 pb-5 pt-1">
          {children}
        </div>
      </div>
    </div>
  )
}
