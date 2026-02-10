"use client"

import { useState } from "react"
import { Copy, Check, RotateCcw } from "lucide-react"
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
    <div className={`group ${isUser ? "flex justify-end" : ""}`}>
      {isUser ? (
        /* User message — translucent pill, right-aligned */
        <div className="max-w-[70%] rounded-2xl bg-foreground/[0.06] dark:bg-foreground/[0.08] px-4 py-2 md:py-2.5 text-base leading-normal text-foreground">
          <div className="whitespace-pre-wrap">{textContent}</div>
        </div>
      ) : (
        /* Assistant message — borderless prose on page background */
        <div className="relative max-w-none text-base leading-7 text-foreground">
          {textContent && (
            <div className="prose prose-neutral dark:prose-invert max-w-none
              prose-p:my-2 prose-p:leading-7
              prose-headings:mt-4 prose-headings:mb-2 prose-headings:font-semibold prose-headings:text-base
              prose-h1:text-base prose-h2:text-base prose-h3:text-base
              prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5
              prose-strong:font-semibold
              prose-code:text-sm prose-code:bg-foreground/[0.05] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
              prose-pre:bg-neutral-900 prose-pre:text-neutral-100 prose-pre:rounded-lg prose-pre:text-sm prose-pre:my-3
              prose-table:text-sm prose-th:px-3 prose-th:py-1.5 prose-td:px-3 prose-td:py-1.5
              prose-a:text-brand-green prose-a:no-underline hover:prose-a:underline
              [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {textContent}
              </ReactMarkdown>
              {/* Streaming cursor */}
              {isStreaming && (
                <span className="inline-block w-[3px] h-[1.1em] bg-foreground/40 animate-pulse ml-0.5 align-text-bottom rounded-full" />
              )}
            </div>
          )}
          {/* Show streaming cursor even when no text yet */}
          {isStreaming && !textContent && (
            <span className="inline-block w-[3px] h-[1.1em] bg-foreground/40 animate-pulse rounded-full" />
          )}

          {/* Tool invocation badges */}
          {toolParts.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
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
                  <div key={tp.toolCallId} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-foreground/[0.04] dark:bg-foreground/[0.06] px-2.5 py-1 rounded-full">
                    <span className="font-mono text-[11px]">
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

          {/* Copy button — icon-only, below message, left-aligned */}
          {!isUser && textContent && !isStreaming && (
            <div className="mt-1.5 flex">
              <button
                onClick={handleCopy}
                className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground hover:bg-foreground/[0.05]"
                title={copied ? "Copied" : "Copy"}
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          )}

          {/* Retry button */}
          {showRetry && onRetry && (
            <button
              onClick={onRetry}
              className="mt-1 flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Retry
            </button>
          )}
        </div>
      )}
    </div>
  )
}
