"use client"

import { forwardRef } from "react"
import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string
  onChange: (value: string) => void
  onClear?: () => void
  compact?: boolean
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ value, onChange, onClear, compact, className, ...props }, ref) => {
    const handleClear = () => {
      onChange("")
      onClear?.()
    }

    return (
      <div className={cn("relative", className)}>
        <Search className={cn(
          "absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none",
          compact ? "w-3.5 h-3.5" : "w-4 h-4"
        )} />
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            compact
              ? "h-8 w-full pl-8 pr-7 text-xs bg-card border border-border/50 rounded-lg focus:outline-none focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10 placeholder:text-muted-foreground/50 transition-all"
              : "plaid-input pl-10 w-full"
          )}
          {...props}
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className={cn(compact ? "w-3 h-3" : "w-3.5 h-3.5")} />
          </button>
        )}
      </div>
    )
  }
)
SearchInput.displayName = "SearchInput"
