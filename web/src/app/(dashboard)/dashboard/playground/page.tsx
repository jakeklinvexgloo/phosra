"use client"

import { useState, useCallback, useRef } from "react"
import { ChatPanel } from "@/components/playground/ChatPanel"
import { InspectorPanel } from "@/components/playground/InspectorPanel"
import type { ChatMessage, ToolCallInfo, PlaygroundEvent } from "@/lib/playground/types"

export default function PlaygroundPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [toolCalls, setToolCalls] = useState<ToolCallInfo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId] = useState(() => `s-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`)
  const abortRef = useRef<AbortController | null>(null)

  const handleSend = useCallback(
    async (content: string) => {
      // Add user message
      const userMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: "user",
        content,
        timestamp: Date.now(),
      }
      const updatedMessages = [...messages, userMsg]
      setMessages(updatedMessages)
      setIsLoading(true)

      // Prepare assistant message accumulator
      let assistantContent = ""
      let assistantToolCalls: ToolCallInfo[] = []
      const assistantId = `msg-${Date.now()}-assistant`

      try {
        abortRef.current = new AbortController()
        const response = await fetch("/api/playground/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: updatedMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            sessionId,
          }),
          signal: abortRef.current.signal,
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const reader = response.body?.getReader()
        if (!reader) throw new Error("No response body")

        const decoder = new TextDecoder()
        let buffer = ""

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split("\n")
          buffer = lines.pop() || ""

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue
            const json = line.slice(6).trim()
            if (!json) continue

            try {
              const event = JSON.parse(json) as PlaygroundEvent

              switch (event.type) {
                case "text_delta":
                  assistantContent += event.content
                  setMessages((prev) => {
                    const existing = prev.find((m) => m.id === assistantId)
                    if (existing) {
                      return prev.map((m) =>
                        m.id === assistantId
                          ? { ...m, content: assistantContent, toolCalls: assistantToolCalls }
                          : m
                      )
                    }
                    return [
                      ...prev,
                      {
                        id: assistantId,
                        role: "assistant" as const,
                        content: assistantContent,
                        toolCalls: assistantToolCalls,
                        timestamp: Date.now(),
                      },
                    ]
                  })
                  break

                case "tool_call_start": {
                  const tc: ToolCallInfo = {
                    id: event.id,
                    name: event.name,
                    input: event.input,
                    status: "running",
                  }
                  assistantToolCalls = [...assistantToolCalls, tc]
                  setToolCalls((prev) => [...prev, tc])
                  break
                }

                case "tool_call_http":
                  setToolCalls((prev) =>
                    prev.map((tc) =>
                      tc.id === event.id
                        ? {
                            ...tc,
                            http: {
                              request: event.request,
                              response: event.response,
                            },
                          }
                        : tc
                    )
                  )
                  assistantToolCalls = assistantToolCalls.map((tc) =>
                    tc.id === event.id
                      ? {
                          ...tc,
                          http: { request: event.request, response: event.response },
                        }
                      : tc
                  )
                  break

                case "tool_call_end":
                  setToolCalls((prev) =>
                    prev.map((tc) =>
                      tc.id === event.id
                        ? { ...tc, result: event.result, status: "complete" as const }
                        : tc
                    )
                  )
                  assistantToolCalls = assistantToolCalls.map((tc) =>
                    tc.id === event.id
                      ? { ...tc, result: event.result, status: "complete" as const }
                      : tc
                  )
                  break

                case "error":
                  assistantContent += `\n\n⚠️ ${event.message}`
                  setMessages((prev) => {
                    const existing = prev.find((m) => m.id === assistantId)
                    if (existing) {
                      return prev.map((m) =>
                        m.id === assistantId ? { ...m, content: assistantContent } : m
                      )
                    }
                    return [
                      ...prev,
                      {
                        id: assistantId,
                        role: "assistant" as const,
                        content: assistantContent,
                        timestamp: Date.now(),
                      },
                    ]
                  })
                  break
              }
            } catch {
              // ignore malformed SSE lines
            }
          }
        }

        // Ensure we have the final assistant message
        if (assistantContent) {
          setMessages((prev) => {
            const existing = prev.find((m) => m.id === assistantId)
            if (existing) {
              return prev.map((m) =>
                m.id === assistantId
                  ? { ...m, content: assistantContent, toolCalls: assistantToolCalls }
                  : m
              )
            }
            return [
              ...prev,
              {
                id: assistantId,
                role: "assistant" as const,
                content: assistantContent,
                toolCalls: assistantToolCalls,
                timestamp: Date.now(),
              },
            ]
          })
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setMessages((prev) => [
            ...prev,
            {
              id: `msg-error-${Date.now()}`,
              role: "assistant",
              content: `⚠️ Error: ${(err as Error).message}. Make sure ANTHROPIC_API_KEY is set and the Phosra API server is running with SANDBOX_MODE=true.`,
              timestamp: Date.now(),
            },
          ])
        }
      } finally {
        setIsLoading(false)
      }
    },
    [messages, sessionId]
  )

  const handleReset = useCallback(async () => {
    abortRef.current?.abort()
    setMessages([])
    setToolCalls([])
    setIsLoading(false)

    // Reset sandbox data
    try {
      await fetch("/api/playground/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      })
    } catch {
      // ignore
    }
  }, [sessionId])

  return (
    <div className="h-[calc(100vh-6rem)] flex">
      {/* Chat panel — left half */}
      <div className="flex-1 min-w-0 border-r border-border">
        <ChatPanel
          messages={messages}
          isLoading={isLoading}
          onSend={handleSend}
          onReset={handleReset}
        />
      </div>

      {/* Inspector panel — right half */}
      <div className="flex-1 min-w-0">
        <InspectorPanel toolCalls={toolCalls} />
      </div>
    </div>
  )
}
