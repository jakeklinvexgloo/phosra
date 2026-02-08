"use client"

import { useRef, useEffect } from "react"
import { RotateCcw } from "lucide-react"
import { ChatMessage } from "./ChatMessage"
import { ChatInput } from "./ChatInput"
import { ScenarioCard } from "./ScenarioCard"
import { SCENARIOS } from "@/lib/playground/scenarios"
import type { ChatMessage as ChatMessageType } from "@/lib/playground/types"

interface ChatPanelProps {
  messages: ChatMessageType[]
  isLoading: boolean
  onSend: (message: string) => void
  onReset: () => void
}

export function ChatPanel({ messages, isLoading, onSend, onReset }: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const isEmpty = messages.length === 0

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
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4">
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
            <div className="grid grid-cols-2 gap-3 max-w-lg w-full">
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
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-green/15 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-brand-green border-t-transparent rounded-full animate-spin" />
                </div>
                <div className="bg-white border border-border rounded-lg px-4 py-3 text-sm text-muted-foreground">
                  Thinking...
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-6 pb-4 pt-2 flex-shrink-0">
        <ChatInput onSend={onSend} disabled={isLoading} />
        <p className="text-[10px] text-muted-foreground text-center mt-2">
          Sandbox mode — all data is temporary and enforcement is simulated
        </p>
      </div>
    </div>
  )
}
