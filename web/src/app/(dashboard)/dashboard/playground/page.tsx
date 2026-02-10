"use client"

import { useState, useCallback, useMemo, useEffect, type ReactNode } from "react"
import { MessageSquare, Search } from "lucide-react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, isToolUIPart, getToolName } from "ai"
import { ChatPanel } from "@/components/playground/ChatPanel"
import { InspectorPanel } from "@/components/playground/InspectorPanel"
import type { ToolCallInfo } from "@/lib/playground/types"
import { type EntityMap, extractEntities } from "@/lib/playground/entity-registry"

export default function PlaygroundPage() {
  const [sessionId] = useState(
    () => `s-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  )
  const [toolCalls, setToolCalls] = useState<ToolCallInfo[]>([])
  const [entities, setEntities] = useState<EntityMap>(() => new Map())
  const [activePanel, setActivePanel] = useState<"chat" | "inspector">("chat")

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
    const newEntities: EntityMap = new Map()
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
            extractEntities(getToolName(part), part.output, newEntities)
          }
          newToolCalls.push(tc)
        }
      }
    }
    setToolCalls(newToolCalls)
    setEntities(newEntities)
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
    setEntities(new Map())

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
    <div className="h-full flex flex-col">
      {/* Mobile tab bar */}
      <div className="flex md:hidden border-b border-border">
        <button
          onClick={() => setActivePanel("chat")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium transition-colors ${
            activePanel === "chat"
              ? "text-foreground border-b-2 border-foreground"
              : "text-muted-foreground"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Chat
        </button>
        <button
          onClick={() => setActivePanel("inspector")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium transition-colors ${
            activePanel === "inspector"
              ? "text-foreground border-b-2 border-foreground"
              : "text-muted-foreground"
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          Inspector
          {toolCalls.length > 0 && (
            <span className="bg-muted text-muted-foreground text-[10px] px-1.5 py-0.5 rounded-full">{toolCalls.length}</span>
          )}
        </button>
      </div>

      {/* Chat + Inspector */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        <div className={`flex-1 min-w-0 border-r border-border ${activePanel !== "chat" ? "hidden md:block" : ""}`}>
          <ChatPanel
            messages={messages}
            isLoading={isLoading}
            onSend={handleSend}
            onReset={handleReset}
            onStop={stop}
            error={error}
          />
        </div>
        <div className={`flex-1 min-w-0 ${activePanel !== "inspector" ? "hidden md:block" : ""}`}>
          <InspectorPanel toolCalls={toolCalls} entities={entities} />
        </div>
      </div>
    </div>
  )
}
