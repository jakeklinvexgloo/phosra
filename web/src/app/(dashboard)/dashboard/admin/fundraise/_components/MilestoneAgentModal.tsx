"use client"

import { useState, useMemo, useRef, useEffect, type FormEvent } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { X, Loader2, Send, Sparkles, AlertCircle } from "lucide-react"

type MilestoneProps = {
  id: string
  title: string
  description: string
  owner: string
  status: string
  dueDate: string
  agentId: string
}

type AgentProps = {
  id: string
  name: string
  role: string
  description: string
  tasks: string[]
  tools: string[]
  cadence: string
  color: string
  bgColor: string
}

type PhaseProps = {
  name: string
  dates: string
}

export default function MilestoneAgentModal({
  open,
  onClose,
  milestone,
  agent,
  phase,
}: {
  open: boolean
  onClose: () => void
  milestone: MilestoneProps
  agent: AgentProps
  phase: PhaseProps
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState("")

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/agents/milestone",
        headers: () => {
          const h: Record<string, string> = {}
          const sandbox =
            process.env.NEXT_PUBLIC_SANDBOX_MODE === "true" && typeof window !== "undefined"
              ? localStorage.getItem("sandbox-session")
              : null
          if (sandbox) h["X-Sandbox-Session"] = sandbox
          return h
        },
        body: { milestone, agent, phase },
      }),
    [milestone.id],
  )

  const { messages, sendMessage, status, error } = useChat({ transport })

  const isLoading = status === "streaming" || status === "submitted"

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  if (!open) return null

  const send = (text: string) => {
    if (!text.trim() || isLoading) return
    setInput("")
    sendMessage({ text })
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    send(input)
  }

  const suggestedPrompts = [
    `Assess the current state of this milestone: '${milestone.title}'. What's already been done and what remains?`,
    `Execute this milestone: '${milestone.title}'. Produce the key deliverable.`,
    `What are the immediate next steps to move '${milestone.title}' forward this week?`,
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-2xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Sparkles className={`w-4 h-4 ${agent.color}`} />
              <h3 className="text-sm font-semibold text-foreground">
                {agent.name} Agent
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {milestone.title} &middot; Due {milestone.dueDate}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground flex-shrink-0 ml-3"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <p className="text-sm text-muted-foreground text-center max-w-md">
                Chat with the <strong>{agent.name}</strong> agent about this milestone.
              </p>
              <div className="grid grid-cols-1 gap-2 w-full max-w-lg">
                {suggestedPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => send(prompt)}
                    className="text-left text-xs p-3 rounded-lg border border-border hover:bg-muted/40 transition-colors text-muted-foreground hover:text-foreground"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed ${
                    m.role === "user"
                      ? "bg-brand-green/10 text-foreground"
                      : "bg-muted/40 text-foreground"
                  }`}
                >
                  <div className="whitespace-pre-wrap">
                    {m.parts
                      ?.filter((p) => p.type === "text")
                      .map(
                        (p) =>
                          (p as { type: "text"; text: string }).text,
                      )
                      .join("") || ""}
                  </div>
                </div>
              </div>
            ))
          )}
          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex justify-start">
              <div className="bg-muted/40 rounded-lg px-3 py-2">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
        </div>

        {/* Error display */}
        {error && (
          <div className="flex items-start gap-2 mx-5 mb-0 mt-2 p-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-700 dark:text-red-400">{error.message || "Failed to get a response. Please try again."}</p>
          </div>
        )}

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 px-5 py-4 border-t border-border flex-shrink-0"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask ${agent.name} about this milestone...`}
            className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm placeholder:text-muted-foreground/50 outline-none focus:border-brand-green"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-green text-[#0D1B2A] text-xs font-semibold hover:bg-brand-green/90 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
