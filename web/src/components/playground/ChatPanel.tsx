"use client"

import { useRef, useEffect, useCallback, useState, useMemo } from "react"
import { RotateCcw, ChevronDown } from "lucide-react"
import { ChatMessage } from "./ChatMessage"
import { ChatInput } from "./ChatInput"
import { ScenarioCard } from "./ScenarioCard"
import { getRandomScenarios } from "@/lib/playground/scenarios"
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
  const scenarios = useMemo(() => getRandomScenarios(6), [])

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
      {/* Messages area — relative/absolute pattern ensures iOS Safari computes a real height */}
      <div className="relative flex-1 min-h-0">
        <div ref={scrollRef} className="absolute inset-0 overflow-y-auto px-4 py-4 md:px-16 md:py-6">
        {isEmpty ? (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="max-w-3xl text-center mb-6 md:mb-10">
              <h3 className="text-2xl md:text-3xl font-semibold text-foreground mb-2 md:mb-3">
                What can I help with?
              </h3>
              <p className="text-sm md:text-base text-muted-foreground">
                Use natural language to create families, configure parental controls, and
                push rules to platforms.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 max-w-xl w-full px-4">
              {scenarios.map((scenario) => (
                <ScenarioCard
                  key={scenario.id}
                  scenario={scenario}
                  onClick={onSend}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            {messages.map((msg, i) => (
              <div
                key={msg.id}
                className={msg.role === "user"
                  ? "py-3 md:py-4"
                  : "pt-1 pb-8 md:pb-10"
                }
              >
                <ChatMessage
                  message={msg}
                  isStreaming={isLoading && i === lastAssistantIndex}
                  showRetry={!!error && i === messages.length - 1 && msg.role === "assistant"}
                  onRetry={() => {
                    // Remove the last assistant message and re-send the last user message
                    // For now, just trigger onReset — useChat's reload() would be better
                  }}
                />
              </div>
            ))}
            {/* Show thinking indicator when loading and no assistant message yet */}
            {isLoading && lastAssistantIndex === -1 && (
              <div className="pt-1 pb-8 md:pb-10">
                <div className="flex items-center gap-1.5 py-2">
                  <span className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}
            {/* Error display */}
            {error && (
              <div className="pt-1 pb-8 md:pb-10">
                <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                  <span className="font-medium">Error:</span>
                  <span>{error.message || "An error occurred. Please try again."}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Scroll to bottom pill */}
        {showScrollPill && (
          <button
            onClick={scrollToBottom}
            className="sticky bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 text-xs bg-foreground text-background rounded-full shadow-lg hover:bg-foreground/90 transition-colors z-10"
          >
            <ChevronDown className="w-3 h-3" />
            New messages
          </button>
        )}
        </div>
      </div>

      {/* Input */}
      <div className="px-4 pb-3 pt-2 md:px-16 md:pb-6 md:pt-3 flex-shrink-0" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0.75rem))" }}>
        <div className="max-w-3xl mx-auto">
          {/* Mobile-only reset (header is hidden on mobile) */}
          {!isEmpty && (
            <div className="flex md:hidden justify-end mb-1">
              <button
                onClick={onReset}
                className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>
          )}
          <ChatInput
            onSend={onSend}
            onStop={onStop}
            disabled={isLoading}
            isLoading={isLoading}
          />
          <p className="hidden md:block text-[11px] text-muted-foreground text-center mt-2.5">
            Sandbox mode — all data is temporary and enforcement is simulated
          </p>
        </div>
      </div>
    </div>
  )
}
