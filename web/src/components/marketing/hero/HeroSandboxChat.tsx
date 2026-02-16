"use client"

import { useEffect, useRef, useMemo, useState, useCallback } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, isToolUIPart, getToolName } from "ai"
import { motion } from "framer-motion"
import { ExternalLink, RotateCcw, Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { useHeroSession } from "./useHeroSession"
import type { ToolCallInfo } from "@/lib/playground/types"
import { type EntityMap, extractEntities } from "@/lib/playground/entity-registry"

interface HeroSandboxChatProps {
  prompt: string
  onClose: () => void
  onTryAnother: () => void
}

export function HeroSandboxChat({ prompt, onClose, onTryAnother }: HeroSandboxChatProps) {
  const { sessionId, isReady, error: sessionError, reset } = useHeroSession()
  const scrollRef = useRef<HTMLDivElement>(null)
  const hasSentRef = useRef(false)
  const [toolCalls, setToolCalls] = useState<ToolCallInfo[]>([])
  const [entities, setEntities] = useState<EntityMap>(() => new Map())

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/playground/chat",
        body: { sessionId },
      }),
    [sessionId]
  )

  const { messages, sendMessage, status, error: chatError } = useChat({ transport })
  const isLoading = status === "streaming" || status === "submitted"
  const isDone = !isLoading && messages.length > 1

  // Extract tool calls and entities from messages
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

  // Auto-send the prompt once setup is ready
  useEffect(() => {
    if (isReady && !hasSentRef.current && prompt) {
      hasSentRef.current = true
      sendMessage({ text: prompt })
    }
  }, [isReady, prompt, sendMessage])

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, toolCalls])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      reset()
    }
  }, [reset])

  // Extract text from assistant message parts
  const getTextContent = (msg: typeof messages[0]) =>
    msg.parts
      .filter((p): p is Extract<typeof p, { type: "text" }> => p.type === "text")
      .map((p) => p.text)
      .join("")

  // Find last assistant index for streaming cursor
  const lastAssistantIndex = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "assistant") return i
    }
    return -1
  })()

  return (
    <div className="flex flex-col h-full max-h-[85vh]">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-3 border-b border-white/[0.06] flex-shrink-0">
        <img src="/favicon.svg" alt="" className="w-4 h-4" />
        <span className="text-xs font-medium text-white/60">Phosra AI</span>
        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-brand-green/10 text-brand-green border border-brand-green/20">
          LIVE
        </span>
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse flex-shrink-0" />
      </div>

      {/* Chat messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-0">
        {/* Setup loading state */}
        {!isReady && !sessionError && (
          <div className="flex items-center gap-2 text-xs text-white/40">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Setting up sandbox environment...
          </div>
        )}

        {/* Setup error */}
        {sessionError && (
          <div className="flex items-center gap-2 text-xs text-red-400">
            <AlertCircle className="w-3.5 h-3.5" />
            {sessionError.message}
          </div>
        )}

        {/* Messages */}
        {messages.map((msg, i) => {
          const isUser = msg.role === "user"
          const text = getTextContent(msg)
          const msgToolParts = msg.parts.filter(isToolUIPart)
          const isStreaming = isLoading && i === lastAssistantIndex

          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {isUser ? (
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl bg-white/[0.08] px-4 py-2.5 text-sm text-white/90 leading-relaxed">
                    {text}
                  </div>
                </div>
              ) : (
                <div className="text-sm leading-relaxed text-white/80">
                  {text && (
                    <div className="prose prose-invert prose-sm max-w-none
                      prose-p:my-1.5 prose-p:leading-relaxed prose-p:text-white/80
                      prose-headings:text-white/90 prose-headings:text-sm prose-headings:font-semibold
                      prose-strong:text-white/90 prose-strong:font-semibold
                      prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5 prose-li:text-white/80
                      prose-code:text-xs prose-code:bg-white/[0.08] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-brand-green prose-code:before:content-none prose-code:after:content-none
                      prose-a:text-brand-green prose-a:no-underline hover:prose-a:underline
                      [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {text}
                      </ReactMarkdown>
                      {isStreaming && (
                        <span className="inline-block w-[2px] h-[1em] bg-white/40 animate-pulse ml-0.5 align-text-bottom rounded-full" />
                      )}
                    </div>
                  )}
                  {isStreaming && !text && (
                    <span className="inline-block w-[2px] h-[1em] bg-white/40 animate-pulse rounded-full" />
                  )}

                  {/* Tool call badges */}
                  {msgToolParts.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {msgToolParts.map((tp) => {
                        const toolStatus =
                          tp.state === "output-available"
                            ? "complete"
                            : tp.state === "output-error"
                              ? "error"
                              : tp.state === "input-available" || tp.state === "input-streaming"
                                ? "running"
                                : "pending"
                        return (
                          <div
                            key={tp.toolCallId}
                            className="inline-flex items-center gap-1.5 text-[11px] text-white/50 bg-white/[0.05] px-2 py-1 rounded-full"
                          >
                            <span className="font-mono text-[10px] text-white/60">
                              {getToolName(tp)}
                            </span>
                            {toolStatus === "complete" && (
                              <CheckCircle2 className="w-3 h-3 text-brand-green" />
                            )}
                            {toolStatus === "error" && (
                              <XCircle className="w-3 h-3 text-red-400" />
                            )}
                            {toolStatus === "running" && (
                              <Loader2 className="w-3 h-3 text-brand-green animate-spin" />
                            )}
                            {toolStatus === "pending" && (
                              <span className="text-[10px] text-white/30">...</span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )
        })}

        {/* Loading indicator before any assistant message */}
        {isLoading && lastAssistantIndex === -1 && messages.length > 0 && (
          <div className="flex items-center gap-1.5 py-2">
            <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce [animation-delay:0ms]" />
            <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
        )}

        {/* Chat error */}
        {chatError && (
          <div className="flex items-center gap-2 text-xs text-red-400">
            <AlertCircle className="w-3.5 h-3.5" />
            {chatError.message || "Something went wrong. Please try again."}
          </div>
        )}
      </div>

      {/* Tool calls timeline (collapsible) */}
      {toolCalls.length > 0 && (
        <ToolCallsTimeline toolCalls={toolCalls} />
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-white/[0.06] flex-shrink-0">
        {isDone ? (
          <>
            <button
              onClick={onTryAnother}
              className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white/70 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Try another prompt
            </button>
            <Link
              href="/playground"
              className="flex items-center gap-1.5 text-xs font-medium text-brand-green hover:text-brand-green/80 transition-colors"
            >
              Open full playground
              <ExternalLink className="w-3 h-3" />
            </Link>
          </>
        ) : (
          <p className="text-[10px] text-white/25 mx-auto">
            Sandbox mode — all data is temporary and enforcement is simulated
          </p>
        )}
      </div>
    </div>
  )
}

/* ── Tool Calls Timeline ───────────────────────────────────────────── */

function ToolCallsTimeline({ toolCalls }: { toolCalls: ToolCallInfo[] }) {
  const [expanded, setExpanded] = useState(false)
  const visibleCalls = expanded ? toolCalls : toolCalls.slice(-3)

  return (
    <div className="border-t border-white/[0.06] flex-shrink-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-5 py-2 text-[10px] text-white/30 hover:text-white/50 transition-colors uppercase tracking-wider font-medium"
      >
        <span>API Calls ({toolCalls.length})</span>
        <span className="ml-auto text-[10px]">{expanded ? "\u25B2" : "\u25BC"}</span>
      </button>
      <div className="px-5 pb-3 space-y-1 max-h-[200px] overflow-y-auto scrollbar-hide">
        {visibleCalls.map((tc) => (
          <div
            key={tc.id}
            className="flex items-center gap-2 text-[11px] font-mono"
          >
            {tc.status === "complete" && (
              <CheckCircle2 className="w-3 h-3 text-brand-green flex-shrink-0" />
            )}
            {tc.status === "error" && (
              <XCircle className="w-3 h-3 text-red-400 flex-shrink-0" />
            )}
            {(tc.status === "running" || tc.status === "pending") && (
              <Loader2 className="w-3 h-3 text-white/30 animate-spin flex-shrink-0" />
            )}
            <span className="text-white/50 truncate">{tc.name}</span>
            {tc.http?.request?.method && (
              <span className="text-[9px] text-white/25 flex-shrink-0">
                {tc.http.request.method}
              </span>
            )}
            {tc.http?.response?.latency_ms != null && (
              <span className="text-[9px] text-white/20 flex-shrink-0 ml-auto">
                {tc.http.response.latency_ms}ms
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
