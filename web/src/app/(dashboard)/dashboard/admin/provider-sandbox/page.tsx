"use client"

import { useCallback, useReducer } from "react"
import type { SandboxState, SandboxAction, ChangeDelta } from "@/lib/sandbox/types"
import { DEFAULT_PROFILES } from "@/lib/sandbox/netflix-defaults"
import { buildNetflixSandboxRules } from "@/lib/sandbox/rule-mappings"
import { enforceRules } from "@/lib/sandbox/netflix-enforcer"
import { useChangeHighlight } from "@/lib/sandbox/animation"
import { SandboxControlPanel } from "./_components/SandboxControlPanel"
import { SimulatorShell } from "./_components/simulators/SimulatorShell"
import { NetflixSimulator } from "./_components/simulators/NetflixSimulator"

function createInitialState(): SandboxState {
  return {
    provider: "netflix",
    profiles: DEFAULT_PROFILES.map((p) => ({
      ...p,
      blockedTitles: [...p.blockedTitles],
      profileLock: { ...p.profileLock },
      viewingActivity: [...p.viewingActivity],
    })),
    rules: buildNetflixSandboxRules(),
    enforcementLog: [],
    pendingChanges: [],
    isEnforcing: false,
    selectedProfileId: "emma",
  }
}

function sandboxReducer(state: SandboxState, action: SandboxAction): SandboxState {
  switch (action.type) {
    case "TOGGLE_RULE":
      return {
        ...state,
        rules: state.rules.map((r) =>
          r.category === action.category ? { ...r, enabled: !r.enabled } : r
        ),
      }

    case "UPDATE_RULE_CONFIG":
      return {
        ...state,
        rules: state.rules.map((r) =>
          r.category === action.category ? { ...r, config: action.config } : r
        ),
      }

    case "ENFORCE_START":
      return { ...state, isEnforcing: true }

    case "ENFORCE_COMPLETE":
      return {
        ...state,
        isEnforcing: false,
        profiles: action.profiles,
        pendingChanges: action.changes,
        enforcementLog: [
          {
            id: crypto.randomUUID(),
            timestamp: new Date(),
            rulesApplied: action.rulesApplied,
            rulesSkipped: action.rulesSkipped,
            changes: action.changes,
          },
          ...state.enforcementLog,
        ],
      }

    case "SELECT_PROFILE":
      return { ...state, selectedProfileId: action.profileId }

    case "RESET":
      return createInitialState()

    default:
      return state
  }
}

export default function ProviderSandboxPage() {
  const [state, dispatch] = useReducer(sandboxReducer, undefined, createInitialState)
  const { isHighlighted, triggerHighlights } = useChangeHighlight(1500)

  const handleEnforce = useCallback(() => {
    dispatch({ type: "ENFORCE_START" })

    // Fake 800ms delay to simulate API call
    setTimeout(() => {
      const result = enforceRules(state.rules, state.profiles)

      dispatch({
        type: "ENFORCE_COMPLETE",
        profiles: result.profiles,
        changes: result.changes,
        rulesApplied: result.applied,
        rulesSkipped: result.skipped,
      })

      // Trigger highlight animations
      const highlightKeys = result.changes.map((c: ChangeDelta) => `${c.profileId}:${c.field}`)
      triggerHighlights(highlightKeys)
    }, 800)
  }, [state.rules, state.profiles, triggerHighlights])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">Provider Sandbox</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">
          Visual simulator for parental control settings. Toggle Phosra rules and see how they map to provider-specific settings in real-time.
        </p>
      </div>

      {/* Two-panel layout */}
      <div className="flex gap-4" style={{ minHeight: "calc(100vh - 140px)" }}>
        {/* Left panel — Control Panel */}
        <div className="w-[40%] shrink-0">
          <div className="plaid-card p-4 h-full">
            <SandboxControlPanel
              rules={state.rules}
              enforcementLog={state.enforcementLog}
              isEnforcing={state.isEnforcing}
              onToggleRule={(category) => dispatch({ type: "TOGGLE_RULE", category })}
              onUpdateRuleConfig={(category, config) =>
                dispatch({ type: "UPDATE_RULE_CONFIG", category, config })
              }
              onEnforce={handleEnforce}
              onReset={() => dispatch({ type: "RESET" })}
            />
          </div>
        </div>

        {/* Right panel — Simulator */}
        <div className="flex-1 min-w-0">
          <div className="plaid-card p-4">
            <SimulatorShell provider={state.provider}>
              <NetflixSimulator
                profiles={state.profiles}
                selectedProfileId={state.selectedProfileId}
                onSelectProfile={(profileId) =>
                  dispatch({ type: "SELECT_PROFILE", profileId })
                }
                isHighlighted={isHighlighted}
              />
            </SimulatorShell>
          </div>
        </div>
      </div>
    </div>
  )
}
