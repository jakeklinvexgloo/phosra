"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Search } from "lucide-react"

interface ComplianceSearchProps {
  onSearch: (query: string) => void
  resultCount?: number
}

export function ComplianceSearch({ onSearch, resultCount }: ComplianceSearchProps) {
  const [value, setValue] = useState("")
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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

  // "/" keyboard shortcut to focus search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        e.key === "/" &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(
          (e.target as HTMLElement)?.tagName
        )
      ) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value
    setValue(next)
    debouncedSearch(next)
  }

  const isSearching = value.trim().length > 0

  return (
    <div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          placeholder="Search laws by name, jurisdiction, or keyword..."
          className="w-full pl-10 pr-12 py-2.5 text-sm bg-card border border-border rounded-lg
            text-foreground placeholder:text-muted-foreground
            focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green/50
            transition-colors"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center justify-center w-5 h-5 text-[10px] font-mono text-muted-foreground bg-muted border border-border rounded">
          /
        </kbd>
      </div>
      {isSearching && resultCount != null && (
        <p className="text-xs text-muted-foreground mt-1.5">
          {resultCount} {resultCount === 1 ? "law" : "laws"} found
        </p>
      )}
    </div>
  )
}
