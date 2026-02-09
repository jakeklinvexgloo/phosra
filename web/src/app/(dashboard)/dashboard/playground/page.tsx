"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, isToolUIPart, getToolName } from "ai"
import { ChatPanel } from "@/components/playground/ChatPanel"
import { InspectorPanel } from "@/components/playground/InspectorPanel"
import type { ToolCallInfo } from "@/lib/playground/types"

export default function PlaygroundPage() {
  const [sessionId] = useState(
    () => `s-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  )
  const [toolCalls, setToolCalls] = useState<ToolCallInfo[]>([])

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/playground/chat",
        body: { sessionId },
      }),
    [sessionId]
  )

  const chat = useChat({ transport })

  const { messages, sendMessage, stop, status, setMessages, error } = chat

  const isLoading = status === "streaming" || status === "submitted"

  // Extract tool calls from UIMessage parts for the Inspector panel
  useEffect(() => {
    const newToolCalls: ToolCallInfo[] = []
    for (const msg of messages) {
      if (msg.role !== "assistant") continue
      for (const part of msg.parts) {
        if (isToolUIPart(part)) {
          const tc: ToolCallInfo = {
            id: part.toolCallId,
            name: getToolName(part),
            input: (part.input ?? {}) as Record<string, unknown>,
            status:
              part.state === "output-available"
                ? "complete"
                : part.state === "output-error"
                  ? "error"
                  : part.state === "input-available" || part.state === "input-streaming"
                    ? "running"
                    : "pending",
          }
          if (part.state === "output-available") {
            tc.result = part.output
          }
          newToolCalls.push(tc)
        }
      }
    }
    setToolCalls(newToolCalls)
  }, [messages])

  const handleSend = useCallback(
    (content: string) => {
      sendMessage({ text: content })
    },
    [sendMessage]
  )

  const handleReset = useCallback(async () => {
    stop()
    setMessages([])
    setToolCalls([])

    try {
      await fetch("/api/playground/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      })
    } catch {
      // ignore
    }
  }, [sessionId, stop, setMessages])

  return (
    <div className="h-[calc(100vh-6rem)] flex">
      {/* Chat panel — left half */}
      <div className="flex-1 min-w-0 border-r border-border">
        <ChatPanel
          messages={messages}
          isLoading={isLoading}
          onSend={handleSend}
          onReset={handleReset}
          onStop={stop}
          error={error}
        />
      </div>

      {/* Inspector panel — right half */}
      <div className="flex-1 min-w-0">
        <InspectorPanel toolCalls={toolCalls} />
      </div>
    </div>
  )
}
