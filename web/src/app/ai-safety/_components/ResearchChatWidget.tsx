"use client"

import { useState, useMemo, useRef, useEffect, FormEvent } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, type UIMessage } from "ai"
import { MessageCircle, X, Send, Sparkles, Loader2 } from "lucide-react"
import { ChatMessageContent } from "./chat"

function textOf(msg: UIMessage): string {
  return msg.parts
    ?.filter((p): p is Extract<typeof p, { type: "text" }> => p.type === "text")
    .map((p) => p.text)
    .join("") ?? ""
}

const SUGGESTED_QUESTIONS = [
  "Which platform is safest for a 13-year-old?",
  "What parental controls does ChatGPT offer?",
  "How does Phosra fill safety gaps?",
  "Compare Claude vs ChatGPT safety",
]

export function ResearchChatWidget() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [showPing, setShowPing] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => setShowPing(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/research/chat" }),
    []
  )
  const { messages, sendMessage, status } = useChat({ transport })
  const isLoading = status === "streaming" || status === "submitted"

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    sendMessage({ text: input })
    setInput("")
  }

  const handleSuggestion = (q: string) => {
    sendMessage({ text: q })
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-brand-green hover:bg-brand-green/90 text-white shadow-lg flex items-center justify-center transition-colors"
      >
        {showPing && (
          <span className="absolute inset-0 rounded-full bg-brand-green/30 animate-ping motion-reduce:hidden" />
        )}
        <MessageCircle className="w-6 h-6 relative z-10" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 sm:w-[400px] w-[calc(100vw-2rem)] h-[540px] rounded-2xl border border-border bg-card shadow-2xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gradient-to-r from-brand-green/10 to-transparent">
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-green" />
            AI Safety Assistant
          </h3>
          <p className="text-[10px] text-muted-foreground">
            Ask about platform safety, parental controls, or privacy
          </p>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="p-1 rounded-lg hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="text-center">
              <Sparkles className="w-8 h-8 text-brand-green mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">
                How can I help?
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Ask me anything about AI platform safety for kids
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2 w-full max-w-[300px]">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSuggestion(q)}
                  className="text-left text-xs px-3 py-2 rounded-xl border border-border hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) =>
            msg.role === "user" ? (
              <div key={msg.id} className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl rounded-br-sm px-4 py-2 bg-brand-green text-white text-sm">
                  {textOf(msg)}
                </div>
              </div>
            ) : (
              <div key={msg.id} className="w-full text-foreground text-sm prose prose-sm prose-neutral dark:prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5 [&_h2]:text-sm [&_h3]:text-sm [&_a]:text-brand-green">
                <ChatMessageContent text={textOf(msg)} />
              </div>
            )
          )
        )}
        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm px-4 py-2 bg-muted text-muted-foreground text-sm flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span className="text-xs">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about AI safety..."
            disabled={isLoading}
            className="flex-1 px-3 py-2 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-brand-green/50 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-2 rounded-xl bg-brand-green text-white hover:bg-brand-green/90 transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  )
}
