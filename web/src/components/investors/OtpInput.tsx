"use client"

import { useRef, useCallback, useEffect } from "react"

interface OtpInputProps {
  value: string
  onChange: (value: string) => void
  onComplete: (code: string) => void
  disabled?: boolean
  error?: string
  length?: number
}

export default function OtpInput({
  value,
  onChange,
  onComplete,
  disabled,
  error,
  length = 6,
}: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const digits = value.padEnd(length, "").slice(0, length).split("")

  const focusInput = useCallback((index: number) => {
    inputRefs.current[index]?.focus()
  }, [])

  const handleChange = useCallback(
    (index: number, char: string) => {
      if (!/^\d$/.test(char)) return

      const newDigits = [...digits]
      newDigits[index] = char
      const newValue = newDigits.join("").replace(/\s/g, "")
      onChange(newValue)

      if (newValue.length === length) {
        onComplete(newValue)
      } else if (index < length - 1) {
        focusInput(index + 1)
      }
    },
    [digits, onChange, onComplete, length, focusInput],
  )

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace") {
        e.preventDefault()
        const newDigits = [...digits]
        if (digits[index] && digits[index] !== " ") {
          newDigits[index] = " "
          onChange(newDigits.join("").trimEnd())
        } else if (index > 0) {
          newDigits[index - 1] = " "
          onChange(newDigits.join("").trimEnd())
          focusInput(index - 1)
        }
      } else if (e.key === "ArrowLeft" && index > 0) {
        focusInput(index - 1)
      } else if (e.key === "ArrowRight" && index < length - 1) {
        focusInput(index + 1)
      }
    },
    [digits, onChange, focusInput, length],
  )

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault()
      const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length)
      if (pasted.length > 0) {
        onChange(pasted)
        if (pasted.length === length) {
          onComplete(pasted)
        } else {
          focusInput(Math.min(pasted.length, length - 1))
        }
      }
    },
    [onChange, onComplete, length, focusInput],
  )

  // Auto-focus first input on mount
  useEffect(() => {
    if (!disabled) {
      focusInput(0)
    }
  }, [disabled, focusInput])

  return (
    <div className="w-full">
      <div className="flex items-center justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit === " " ? "" : digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onFocus={(e) => e.target.select()}
            disabled={disabled}
            className={`w-11 h-14 sm:w-12 sm:h-16 rounded-xl border text-center text-xl font-mono font-semibold
              bg-white/[0.03] text-white outline-none transition-all
              focus:border-brand-green/50 focus:bg-white/[0.06] focus:shadow-[0_0_0_2px_rgba(0,212,126,0.1)]
              disabled:opacity-50
              ${error ? "border-red-400/50" : "border-white/10 hover:border-white/20"}`}
          />
        ))}
      </div>
      {error && (
        <p className="text-red-400 text-xs mt-3 text-center">{error}</p>
      )}
    </div>
  )
}
