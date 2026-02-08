"use client"

import { Bot, User } from "lucide-react"
import type { ChatMessage as ChatMessageType } from "@/lib/playground/types"

interface ChatMessageProps {
  message: ChatMessageType
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser ? "bg-foreground text-white" : "bg-brand-green/15 text-brand-green"
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      <div
        className={`max-w-[80%] rounded-lg px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-foreground text-white"
            : "bg-white border border-border text-foreground"
        }`}
      >
        <div className="whitespace-pre-wrap">{message.content}</div>
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="mt-2 pt-2 border-t border-border/30 space-y-1">
            {message.toolCalls.map((tc) => (
              <div key={tc.id} className="flex items-center gap-2 text-xs opacity-70">
                <span className="font-mono bg-black/5 px-1.5 py-0.5 rounded">
                  {tc.name}
                </span>
                <span>
                  {tc.status === "complete" ? "✓" : tc.status === "error" ? "✗" : "..."}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
