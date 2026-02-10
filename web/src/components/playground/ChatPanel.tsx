"use client"

import { useRef, useEffect, useCallback, useState } from "react"
import { RotateCcw, ChevronDown } from "lucide-react"
import { ChatMessage } from "./ChatMessage"
import { ChatInput } from "./ChatInput"
import { ScenarioCard } from "./ScenarioCard"
import { SCENARIOS } from "@/lib/playground/scenarios"
import type { UIMessage } from "ai"

interface ChatPanelProps {
  messages: UIMessage[]
  isLoading: boolean
  onSend: (message: string) => void
  onReset: () => void
  onStop?: () => void
  error?: Error | undefined
}

export function ChatPanel({ messages, isLoading, onSend, onReset, onStop, error }: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const [showScrollPill, setShowScrollPill] = useState(false)

  // Check if user is scrolled near the bottom
  const checkIfAtBottom = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const threshold = 100
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold
    setIsAtBottom(atBottom)
    if (atBottom) setShowScrollPill(false)
  }, [])

  // Auto-scroll only when user is at the bottom
  useEffect(() => {
    if (isAtBottom && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    } else if (!isAtBottom && messages.length > 0) {
      setShowScrollPill(true)
    }
  }, [messages, isAtBottom])

  // Attach scroll listener
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.addEventListener("scroll", checkIfAtBottom, { passive: true })
    return () => el.removeEventListener("scroll", checkIfAtBottom)
  }, [checkIfAtBottom])

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
      setShowScrollPill(false)
      setIsAtBottom(true)
    }
  }, [])

  const isEmpty = messages.length === 0

  // Find the last assistant message for streaming cursor
  const lastAssistantIndex = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "assistant") return i
    }
    return -1
  })()

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 h-12 border-b border-border flex-shrink-0">
        <h2 className="text-sm font-semibold text-foreground">MCP Playground</h2>
        {!isEmpty && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        )}
      </div>

      {/* Messages area */}
      <div ref={scrollRef} className="relative flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 py-4" style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}>
        {isEmpty ? (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="max-w-lg text-center mb-8">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Try Phosra with AI
              </h3>
              <p className="text-sm text-muted-foreground">
                Use natural language to create families, configure parental controls, and
                push rules to platforms. Watch every API call in the inspector panel.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full">
              {SCENARIOS.map((scenario) => (
                <ScenarioCard
                  key={scenario.id}
                  scenario={scenario}
                  onClick={onSend}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-w-2xl mx-auto">
            {messages.map((msg, i) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                isStreaming={isLoading && i === lastAssistantIndex}
                showRetry={!!error && i === messages.length - 1 && msg.role === "assistant"}
                onRetry={() => {
                  // Remove the last assistant message and re-send the last user message
                  // For now, just trigger onReset — useChat's reload() would be better
                }}
              />
            ))}
            {/* Show thinking indicator when loading and no assistant message yet or between steps */}
            {isLoading && lastAssistantIndex === -1 && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-green/15 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-brand-green border-t-transparent rounded-full animate-spin" />
                </div>
                <div className="bg-white border border-border rounded-lg px-4 py-3 text-sm text-muted-foreground">
                  Thinking...
                </div>
              </div>
            )}
            {/* Error display */}
            {error && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-red-500 text-xs font-bold">!</span>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 max-w-[80%]">
                  {error.message || "An error occurred. Please try again."}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Scroll to bottom pill */}
        {showScrollPill && (
          <button
            onClick={scrollToBottom}
            className="sticky bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 text-xs bg-foreground text-white rounded-full shadow-lg hover:bg-foreground/90 transition-colors z-10"
          >
            <ChevronDown className="w-3 h-3" />
            New messages
          </button>
        )}
      </div>

      {/* Input */}
      <div className="px-6 pb-4 pt-2 flex-shrink-0">
        <ChatInput
          onSend={onSend}
          onStop={onStop}
          disabled={isLoading}
          isLoading={isLoading}
        />
        <p className="text-[10px] text-muted-foreground text-center mt-2">
          Sandbox mode — all data is temporary and enforcement is simulated
        </p>
      </div>
    </div>
  )
}
