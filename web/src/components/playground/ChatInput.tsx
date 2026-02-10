"use client"

import { useState, useRef } from "react"
import { Send, Square } from "lucide-react"

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
    <div className="relative border border-border rounded-lg bg-white focus-within:border-foreground transition-colors">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        placeholder="Ask about parental controls, policies, or platforms..."
        disabled={disabled || isLoading}
        rows={1}
        className="w-full px-3 py-2.5 pr-11 md:px-4 md:py-3 md:pr-12 text-sm resize-none bg-transparent focus:outline-none placeholder:text-muted-foreground disabled:opacity-50"
      />
      {isLoading ? (
        <button
          onClick={onStop}
          className="absolute right-2 bottom-2 w-8 h-8 rounded flex items-center justify-center bg-red-500 hover:bg-red-600 text-white transition-colors"
          title="Stop generation"
        >
          <Square className="w-3 h-3 fill-current" />
        </button>
      ) : (
        <button
          onClick={handleSubmit}
          disabled={disabled || !value.trim()}
          className="absolute right-2 bottom-2 w-8 h-8 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
