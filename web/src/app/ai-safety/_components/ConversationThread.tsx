"use client"

import { useState } from "react"
import { ChevronDown, AlertTriangle } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

interface ConversationTurn {
  role: "user" | "assistant"
  content: string
}

interface ConversationThreadProps {
  turns: ConversationTurn[]
  escalationTurn?: number
}

export function ConversationThread({ turns, escalationTurn }: ConversationThreadProps) {
  const [expanded, setExpanded] = useState(turns.length <= 4)
  const visibleTurns = expanded ? turns : turns.slice(0, 4)
  const hiddenCount = turns.length - 4

  return (
    <div className="space-y-3">
      {visibleTurns.map((turn, i) => {
        const turnNumber = i + 1
        const isEscalation = escalationTurn !== undefined && turnNumber === escalationTurn

        return (
          <div key={i}>
            {/* Escalation divider */}
            {isEscalation && (
              <div className="flex items-center gap-2 mb-3 py-1">
                <div className="flex-1 h-px bg-red-500/40" />
                <span className="flex items-center gap-1.5 text-[10px] font-semibold text-red-400 uppercase tracking-wider">
                  <AlertTriangle className="w-3 h-3" />
                  Escalation Point
                </span>
                <div className="flex-1 h-px bg-red-500/40" />
              </div>
            )}

            <div className={`flex ${turn.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] relative ${turn.role === "user" ? "order-1" : ""}`}>
                {/* Turn number */}
                <span className={`absolute -top-2 ${turn.role === "user" ? "right-2" : "left-2"} text-[9px] font-medium px-1.5 py-0.5 rounded-full ${
                  isEscalation
                    ? "bg-red-500/20 text-red-400"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {turnNumber}
                </span>

                <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  turn.role === "user"
                    ? "rounded-br-sm bg-emerald-500/10 border border-emerald-500/20 text-foreground"
                    : `rounded-bl-sm bg-card border border-border text-foreground/80 ${
                        isEscalation ? "border-red-500/30 bg-red-500/5" : ""
                      }`
                }`}>
                  <p className="whitespace-pre-wrap">{turn.content}</p>
                </div>

                <span className={`block text-[9px] mt-1 text-muted-foreground ${
                  turn.role === "user" ? "text-right" : "text-left"
                }`}>
                  {turn.role === "user" ? "User" : "Assistant"}
                </span>
              </div>
            </div>
          </div>
        )
      })}

      {/* Expand/collapse button */}
      {turns.length > 4 && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mx-auto"
        >
          <ChevronDown className="w-3.5 h-3.5" />
          Show {hiddenCount} more turn{hiddenCount !== 1 ? "s" : ""}
        </button>
      )}

      {turns.length > 4 && expanded && (
        <button
          onClick={() => setExpanded(false)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mx-auto"
        >
          <ChevronDown className="w-3.5 h-3.5 rotate-180" />
          Collapse
        </button>
      )}
    </div>
  )
}
