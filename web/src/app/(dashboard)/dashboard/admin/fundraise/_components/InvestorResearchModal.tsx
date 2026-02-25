"use client"

import { useState, useMemo, useRef, useEffect, type FormEvent } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { X, Loader2, Send, Sparkles } from "lucide-react"

const SUGGESTED_PROMPTS = [
  "Find 5 new investors focused on child safety or regtech who have deployed capital in the last 6 months",
  "Draft a personalized outreach email to Precursor Ventures highlighting our 3 exits and compliance moat",
  "Analyze which Tier 1 targets have the strongest warm intro paths and recommend next steps",
  "Research the latest COPPA 2.0 enforcement timeline and how to position it in investor conversations",
]

export default function InvestorResearchModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState("")

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/agents/investor-research",
        headers: () => {
          const h: Record<string, string> = {}
          const sandbox =
            process.env.NEXT_PUBLIC_SANDBOX_MODE === "true" && typeof window !== "undefined"
              ? localStorage.getItem("sandbox-session")
              : null
          if (sandbox) h["X-Sandbox-Session"] = sandbox
          return h
        },
      }),
    [],
  )

  const { messages, sendMessage, status } = useChat({ transport })

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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-2xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-green" />
            <h3 className="text-sm font-semibold text-foreground">
              Investor Research Agent
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <p className="text-sm text-muted-foreground text-center">
                Ask me anything about investor targets, warm intro strategies,
                or fundraise positioning.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                {SUGGESTED_PROMPTS.map((prompt, i) => (
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

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 px-5 py-4 border-t border-border flex-shrink-0"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about investors, intros, or positioning..."
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
