"use client"

import { useState } from "react"
import { ArrowLeft, Mic, Loader2, ChevronDown, ChevronUp } from "lucide-react"
import type { PitchPersona, PitchDifficulty, PitchScenario, PitchPersonaConfig } from "@/lib/admin/types"
import { PERSONA_META, DIFFICULTY_META, SCENARIO_META } from "@/lib/admin/types"

interface SessionSetupProps {
  onStart: (persona: PitchPersona, config?: PitchPersonaConfig) => Promise<void>
  onBack: () => void
}

const personas: PitchPersona[] = ["investor", "partner", "legislator"]
const difficulties: PitchDifficulty[] = ["easy", "medium", "hard"]
const scenarios: PitchScenario[] = ["cold_pitch", "warm_intro", "board_update", "committee_hearing", "partnership_negotiation"]

const FOCUS_AREAS = [
  "Market Size & TAM",
  "Unit Economics",
  "Competitive Moat",
  "Team & Execution",
  "Go-to-Market Strategy",
  "Technical Architecture",
  "Pricing Model",
  "Regulatory Compliance",
  "Growth Metrics",
  "Fundraising & Runway",
]

export function SessionSetup({ onStart, onBack }: SessionSetupProps) {
  const [selected, setSelected] = useState<PitchPersona | null>(null)
  const [difficulty, setDifficulty] = useState<PitchDifficulty>("medium")
  const [scenario, setScenario] = useState<PitchScenario>("cold_pitch")
  const [focusAreas, setFocusAreas] = useState<string[]>([])
  const [customContext, setCustomContext] = useState("")
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [starting, setStarting] = useState(false)

  const toggleFocus = (area: string) => {
    setFocusAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    )
  }

  const handleStart = async () => {
    if (!selected) return
    setStarting(true)
    try {
      const config: PitchPersonaConfig = {
        difficulty,
        scenario,
        ...(focusAreas.length > 0 ? { focus_areas: focusAreas } : {}),
        ...(customContext.trim() ? { custom_context: customContext.trim() } : {}),
      }
      await onStart(selected, config)
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

      {/* Difficulty Selector */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">Difficulty Level</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {difficulties.map((d) => {
            const meta = DIFFICULTY_META[d]
            const isActive = difficulty === d
            return (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  isActive
                    ? "border-foreground/40 bg-muted/50"
                    : "border-border hover:border-foreground/20"
                }`}
              >
                <div className={`text-sm font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                  {meta.label}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{meta.description}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Advanced Options Toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        {showAdvanced ? "Hide" : "Show"} Advanced Options
      </button>

      {showAdvanced && (
        <div className="space-y-6 pl-1">
          {/* Scenario Selector */}
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-3">Meeting Scenario</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {scenarios.map((s) => {
                const meta = SCENARIO_META[s]
                const isActive = scenario === s
                return (
                  <button
                    key={s}
                    onClick={() => setScenario(s)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      isActive
                        ? "border-foreground/40 bg-muted/50"
                        : "border-border hover:border-foreground/20"
                    }`}
                  >
                    <div className={`text-sm font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                      {meta.label}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{meta.description}</div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Focus Areas */}
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-3">Focus Areas (optional)</h2>
            <p className="text-xs text-muted-foreground mb-3">
              The AI will prioritize asking questions about these topics.
            </p>
            <div className="flex flex-wrap gap-2">
              {FOCUS_AREAS.map((area) => {
                const isActive = focusAreas.includes(area)
                return (
                  <button
                    key={area}
                    onClick={() => toggleFocus(area)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      isActive
                        ? "border-foreground/40 bg-foreground text-background"
                        : "border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                    }`}
                  >
                    {area}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Custom Context */}
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-3">Additional Context (optional)</h2>
            <textarea
              value={customContext}
              onChange={(e) => setCustomContext(e.target.value)}
              placeholder="e.g., &quot;I just got a warm intro from partner X and they suggested I focus on our traction metrics...&quot;"
              className="w-full h-20 px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:ring-1 focus:ring-foreground/20"
            />
          </div>
        </div>
      )}

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
