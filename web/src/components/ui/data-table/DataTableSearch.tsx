"use client"

import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface DataTableSearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function DataTableSearch({ value, onChange, placeholder = "Search...", className }: DataTableSearchProps) {
  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-8 w-full pl-8 pr-7 text-xs bg-card border border-border/50 rounded-lg focus:outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10 placeholder:text-muted-foreground/50 transition-all"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  )
}
