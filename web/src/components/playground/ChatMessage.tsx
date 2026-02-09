"use client"

import { useState } from "react"
import { Bot, User, Copy, Check, RotateCcw } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import type { UIMessage } from "ai"
import { isToolUIPart, getToolName } from "ai"

interface ChatMessageProps {
  message: UIMessage
  isStreaming?: boolean
  onRetry?: () => void
  showRetry?: boolean
}

export function ChatMessage({ message, isStreaming, onRetry, showRetry }: ChatMessageProps) {
  const isUser = message.role === "user"
  const [copied, setCopied] = useState(false)

  // Extract text content from parts
  const textContent = message.parts
    .filter((p): p is Extract<typeof p, { type: "text" }> => p.type === "text")
    .map((p) => p.text)
    .join("")

  // Extract tool invocations from parts
  const toolParts = message.parts.filter(isToolUIPart)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  return (
    <div className={`group flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser ? "bg-foreground text-white" : "bg-brand-green/15 text-brand-green"
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      <div
        className={`relative max-w-[80%] rounded-lg px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-foreground text-white"
            : "bg-white border border-border text-foreground"
        }`}
      >
        {isUser ? (
          <div className="whitespace-pre-wrap">{textContent}</div>
        ) : (
          <>
            {textContent && (
              <div className="prose prose-sm prose-neutral max-w-none
                prose-p:my-1.5 prose-p:leading-relaxed
                prose-headings:mt-3 prose-headings:mb-1.5 prose-headings:font-semibold
                prose-h1:text-base prose-h2:text-sm prose-h3:text-sm
                prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5
                prose-strong:font-semibold
                prose-code:text-xs prose-code:bg-black/5 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
                prose-pre:bg-neutral-900 prose-pre:text-neutral-100 prose-pre:rounded-md prose-pre:text-xs prose-pre:my-2
                prose-table:text-xs prose-th:px-2 prose-th:py-1 prose-td:px-2 prose-td:py-1
                prose-a:text-brand-green prose-a:no-underline hover:prose-a:underline
                [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {textContent}
                </ReactMarkdown>
                {/* Streaming cursor */}
                {isStreaming && (
                  <span className="inline-block w-[2px] h-[1em] bg-brand-green animate-pulse ml-0.5 align-text-bottom" />
                )}
              </div>
            )}
            {/* Show streaming cursor even when no text yet */}
            {isStreaming && !textContent && (
              <span className="inline-block w-[2px] h-[1em] bg-brand-green animate-pulse" />
            )}
          </>
        )}

        {/* Tool invocation badges */}
        {toolParts.length > 0 && (
          <div className="mt-2 pt-2 border-t border-border/30 space-y-1">
            {toolParts.map((tp) => {
              const toolStatus =
                tp.state === "output-available"
                  ? "complete"
                  : tp.state === "output-error"
                    ? "error"
                    : tp.state === "input-available" || tp.state === "input-streaming"
                      ? "running"
                      : "pending"
              return (
                <div key={tp.toolCallId} className="flex items-center gap-2 text-xs opacity-70">
                  <span className="font-mono bg-black/5 px-1.5 py-0.5 rounded">
                    {getToolName(tp)}
                  </span>
                  <span>
                    {toolStatus === "complete" ? "\u2713" : toolStatus === "error" ? "\u2717" : toolStatus === "running" ? (
                      <span className="inline-block w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                    ) : "..."}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {/* Copy button (assistant messages only) */}
        {!isUser && textContent && !isStreaming && (
          <button
            onClick={handleCopy}
            className="absolute -bottom-7 right-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                Copy
              </>
            )}
          </button>
        )}

        {/* Retry button */}
        {showRetry && onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Retry
          </button>
        )}
      </div>
    </div>
  )
}
