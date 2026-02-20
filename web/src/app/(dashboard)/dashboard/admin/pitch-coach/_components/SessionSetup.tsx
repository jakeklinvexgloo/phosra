"use client"

import { useState } from "react"
import { ArrowLeft, Mic, Loader2 } from "lucide-react"
import type { PitchPersona } from "@/lib/admin/types"
import { PERSONA_META } from "@/lib/admin/types"

interface SessionSetupProps {
  onStart: (persona: PitchPersona) => Promise<void>
  onBack: () => void
}

const personas: PitchPersona[] = ["investor", "partner", "legislator"]

export function SessionSetup({ onStart, onBack }: SessionSetupProps) {
  const [selected, setSelected] = useState<PitchPersona | null>(null)
  const [starting, setStarting] = useState(false)

  const handleStart = async () => {
    if (!selected) return
    setStarting(true)
    try {
      await onStart(selected)
    } catch {
      setStarting(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to sessions
        </button>
        <h1 className="text-2xl font-semibold text-foreground">New Practice Session</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Choose who you want to pitch to. The AI will play this role and respond in real-time voice.
        </p>
      </div>

      {/* Persona Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {personas.map((persona) => {
          const meta = PERSONA_META[persona]
          const isSelected = selected === persona
          return (
            <button
              key={persona}
              onClick={() => setSelected(persona)}
              className={`plaid-card text-left transition-all ${
                isSelected
                  ? "ring-2 ring-brand-green border-brand-green/50"
                  : "hover:border-foreground/20"
              }`}
            >
              <div className={`w-12 h-12 rounded-lg ${meta.bgColor} flex items-center justify-center text-2xl mb-4`}>
                {meta.icon}
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1">{meta.label}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{meta.description}</p>
              {isSelected && (
                <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-brand-green">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-green" />
                  Selected
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Start Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleStart}
          disabled={!selected || starting}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-foreground text-background font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {starting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Mic className="w-4 h-4" />
          )}
          {starting ? "Starting session..." : "Start Session"}
        </button>
        {selected && !starting && (
          <span className="text-xs text-muted-foreground">
            Your browser will ask for microphone access
          </span>
        )}
      </div>
    </div>
  )
}
