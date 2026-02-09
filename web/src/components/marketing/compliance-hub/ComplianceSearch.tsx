"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Search } from "lucide-react"

interface ComplianceSearchProps {
  onSearch: (query: string) => void
}

export function ComplianceSearch({ onSearch }: ComplianceSearchProps) {
  const [value, setValue] = useState("")
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const debouncedSearch = useCallback(
    (query: string) => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        onSearch(query)
      }, 200)
    },
    [onSearch]
  )

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value
    setValue(next)
    debouncedSearch(next)
  }

  return (
    <div className="plaid-card">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder="Search laws by name, jurisdiction, or keyword..."
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-card border border-border rounded-lg
            text-foreground placeholder:text-muted-foreground
            focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green/50
            transition-colors"
        />
      </div>
    </div>
  )
}
