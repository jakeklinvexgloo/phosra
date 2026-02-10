"use client"

import { useState, useRef } from "react"
import { ArrowUp, Square } from "lucide-react"

interface ChatInputProps {
  onSend: (message: string) => void
  onStop?: () => void
  disabled?: boolean
  isLoading?: boolean
}

export function ChatInput({ onSend, onStop, disabled, isLoading }: ChatInputProps) {
  const [value, setValue] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue("")
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleInput = () => {
    const el = textareaRef.current
    if (el) {
      el.style.height = "auto"
      el.style.height = Math.min(el.scrollHeight, 160) + "px"
    }
  }

  return (
    <div className="relative rounded-3xl bg-foreground/[0.04] dark:bg-foreground/[0.06] border border-border/50 focus-within:border-border focus-within:shadow-sm transition-all">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        placeholder="Ask about parental controls, policies, or platforms..."
        disabled={disabled || isLoading}
        rows={1}
        className="w-full px-4 py-3 pr-12 md:px-5 md:py-3.5 md:pr-14 text-base resize-none bg-transparent focus:outline-none placeholder:text-muted-foreground/70 disabled:opacity-50"
      />
      {isLoading ? (
        <button
          onClick={onStop}
          className="absolute right-2.5 bottom-2.5 w-8 h-8 rounded-full flex items-center justify-center bg-foreground text-background hover:bg-foreground/80 transition-colors"
          title="Stop generation"
        >
          <Square className="w-3 h-3 fill-current" />
        </button>
      ) : (
        <button
          onClick={handleSubmit}
          disabled={disabled || !value.trim()}
          className="absolute right-2.5 bottom-2.5 w-8 h-8 rounded-full flex items-center justify-center bg-foreground text-background hover:bg-foreground/80 disabled:opacity-20 disabled:bg-transparent disabled:text-muted-foreground transition-colors"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
