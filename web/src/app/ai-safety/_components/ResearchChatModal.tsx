"use client"

import { useState, useMemo, useRef, useEffect, FormEvent } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, type UIMessage } from "ai"
import { Sparkles, Send, Loader2, X } from "lucide-react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import ReactMarkdown from "react-markdown"
import Link from "next/link"
import { linkifyResearchText } from "@/lib/platform-research/entity-linker"

function textOf(msg: UIMessage): string {
  return msg.parts
    ?.filter((p): p is Extract<typeof p, { type: "text" }> => p.type === "text")
    .map((p) => p.text)
    .join("") ?? ""
}

const SUGGESTED_FOLLOWUPS = [
  "Which platform is safest for a 13-year-old?",
  "What parental controls does ChatGPT offer?",
  "How does Phosra fill safety gaps?",
  "Compare Claude vs ChatGPT safety",
]

interface ResearchChatModalProps {
  open: boolean
  onClose: () => void
  initialPrompt?: string
}

const mdComponents = {
  a: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { children?: React.ReactNode }) => {
    if (href?.startsWith("/ai-safety")) {
      return <Link href={href} className="text-brand-green hover:underline">{children}</Link>
    }
    return <a href={href} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>
  },
}

export function ResearchChatModal({ open, onClose, initialPrompt }: ResearchChatModalProps) {
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const hasSentRef = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/research/chat" }),
    []
  )
  const { messages, sendMessage, status } = useChat({ transport })
  const isLoading = status === "streaming" || status === "submitted"

  // Auto-send initial prompt when modal opens
  useEffect(() => {
    if (open && initialPrompt && !hasSentRef.current) {
      hasSentRef.current = true
      sendMessage({ text: initialPrompt })
    }
  }, [open, initialPrompt, sendMessage])

  // Reset when modal closes
  useEffect(() => {
    if (!open) {
      hasSentRef.current = false
    }
  }, [open])

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Focus input when AI finishes responding
  useEffect(() => {
    if (!isLoading && messages.length > 1) {
      inputRef.current?.focus()
    }
  }, [isLoading, messages.length])

  // Body scroll lock
  useEffect(() => {
    if (open) {
      const scrollY = window.scrollY
      document.body.style.position = "fixed"
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = "100%"
      return () => {
        document.body.style.position = ""
        document.body.style.top = ""
        document.body.style.width = ""
        window.scrollTo(0, scrollY)
      }
    }
  }, [open])

  // Escape key
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open, onClose])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    sendMessage({ text: input })
    setInput("")
  }

  const handleSuggestion = (q: string) => {
    sendMessage({ text: q })
  }

  if (typeof window === "undefined") return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] liquid-glass-overlay flex items-start justify-center pt-[5vh] px-4"
          onClick={onClose}
          aria-hidden="true"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="AI Safety Research Assistant"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 5 }}
            transition={{ type: "spring", damping: 30, stiffness: 400, mass: 0.8 }}
            className="relative w-full max-w-2xl max-h-[85vh] z-[10000] flex flex-col liquid-glass overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.06]">
              <Sparkles className="w-4 h-4 text-brand-green flex-shrink-0" />
              <span className="text-sm font-medium text-white/90">AI Safety Research Assistant</span>
              <span className="ml-1 px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider bg-brand-green/20 text-brand-green">
                AI
              </span>
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full flex items-center justify-center bg-white/[0.08] hover:bg-white/[0.15] text-white/50 hover:text-white/80 transition-colors"
                aria-label="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-[200px]">
              {messages.length === 0 && !isLoading ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 py-8">
                  <Sparkles className="w-8 h-8 text-brand-green" />
                  <p className="text-sm font-medium text-white/80">Ask about AI platform safety</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
                    {SUGGESTED_FOLLOWUPS.map((q) => (
                      <button
                        key={q}
                        onClick={() => handleSuggestion(q)}
                        className="text-left text-xs px-3 py-2 rounded-xl border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.08] transition-colors text-white/50 hover:text-white/70"
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
                      <div className="max-w-[85%] rounded-2xl rounded-br-sm px-4 py-2.5 bg-brand-green/20 border border-brand-green/30 text-white/90 text-sm">
                        {textOf(msg)}
                      </div>
                    </div>
                  ) : (
                    <div key={msg.id} className="flex justify-start">
                      <div className="max-w-[85%] rounded-2xl rounded-bl-sm px-4 py-2.5 bg-white/[0.06] border border-white/[0.08] text-white/80 text-sm prose prose-sm prose-invert max-w-none [&_p]:my-1.5 [&_ul]:my-1.5 [&_ol]:my-1.5 [&_li]:my-0.5 [&_h2]:text-sm [&_h2]:text-white/90 [&_h3]:text-sm [&_h3]:text-white/90 [&_a]:text-brand-green [&_strong]:text-white/90 [&_code]:text-brand-green/80 [&_code]:bg-white/[0.06] [&_code]:px-1 [&_code]:rounded">
                        <ReactMarkdown components={mdComponents}>{linkifyResearchText(textOf(msg))}</ReactMarkdown>
                      </div>
                    </div>
                  )
                )
              )}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-sm px-4 py-2.5 bg-white/[0.06] border border-white/[0.08] text-white/50 text-sm flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-green" />
                    <span className="text-xs">Analyzing research data...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="px-5 py-3.5 border-t border-white/[0.06]">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a follow-up..."
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-white/[0.1] bg-white/[0.06] text-white/90 text-sm placeholder:text-white/30 focus:outline-none focus:border-brand-green/40 focus:ring-1 focus:ring-brand-green/20 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="px-3 py-2.5 rounded-xl bg-brand-green text-[#0D1B2A] font-medium text-sm hover:opacity-90 transition-all disabled:opacity-30"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <p className="text-[10px] text-white/25 mt-2 text-center">
                Powered by Phosra research data across 8 platforms and 7 dimensions
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
