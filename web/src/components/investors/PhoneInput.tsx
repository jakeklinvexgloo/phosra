"use client"

import { useState, useCallback } from "react"
import { Phone } from "lucide-react"

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  disabled?: boolean
  error?: string
}

/**
 * Format phone input as user types: (212) 555-1234
 */
function formatAsYouType(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 10)
  if (digits.length === 0) return ""
  if (digits.length <= 3) return `(${digits}`
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

export default function PhoneInput({
  value,
  onChange,
  onSubmit,
  disabled,
  error,
}: PhoneInputProps) {
  const [focused, setFocused] = useState(false)

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, "").slice(0, 10)
      onChange(raw)
    },
    [onChange],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && value.length === 10) {
        onSubmit()
      }
    },
    [onSubmit, value],
  )

  return (
    <div className="w-full">
      <div
        className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all ${
          focused
            ? "border-brand-green/50 bg-white/[0.06] shadow-[0_0_0_2px_rgba(0,212,126,0.1)]"
            : "border-white/10 bg-white/[0.03] hover:border-white/20"
        } ${error ? "border-red-400/50" : ""}`}
      >
        <div className="flex items-center gap-2 text-white/40 flex-shrink-0">
          <Phone className="w-4 h-4" />
          <span className="text-sm font-mono">+1</span>
        </div>
        <input
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="(555) 555-1234"
          value={formatAsYouType(value)}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={(e) => {
            setFocused(true)
            const target = e.target
            setTimeout(() => target.scrollIntoView({ block: "center", behavior: "smooth" }), 300)
          }}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          className="flex-1 bg-transparent text-white text-sm font-mono placeholder:text-white/20 outline-none disabled:opacity-50"
        />
      </div>
      {error && <p className="text-red-400 text-xs mt-2 ml-1">{error}</p>}
    </div>
  )
}
