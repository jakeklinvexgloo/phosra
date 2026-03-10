"use client"

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react"
import type {
  SandboxState,
  SandboxAction,
  ChangeDelta,
  ProfileChangeSummary,
} from "@/lib/sandbox/types"
import { DEFAULT_PROFILES } from "@/lib/sandbox/netflix-defaults"
import { buildNetflixSandboxRules } from "@/lib/sandbox/rule-mappings"
import { enforceRules } from "@/lib/sandbox/netflix-enforcer"
import { useChangeHighlight } from "@/lib/sandbox/animation"
import { computeAllProtectionScores } from "@/lib/sandbox/protection-score"
import { RulesPanel } from "./_components/RulesPanel"
import { SimulatorShell } from "./_components/simulators/SimulatorShell"
import { NetflixSimulator } from "./_components/simulators/NetflixSimulator"
import { ChangeManifest } from "./_components/ChangeManifest"

// ─── Initial State ───────────────────────────────────────────────────────────

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
    selectedProfileId: "emma",

    // Per-profile rule configuration
    configProfileId: "emma",
    profileRuleOverrides: {},

    // Preview/diff state
    previewMode: false,
    previousProfiles: null,
    previewChanges: null,
    previewRulesApplied: 0,
    previewRulesSkipped: 0,
    previewPhosraManaged: 0,

    // History
    history: [],

    // Computing
    isComputing: false,
  }
}

// ─── Reducer ─────────────────────────────────────────────────────────────────

function sandboxReducer(state: SandboxState, action: SandboxAction): SandboxState {
  switch (action.type) {
    case "TOGGLE_RULE":
      if (state.previewMode) return state
      return {
        ...state,
        rules: state.rules.map((r) =>
          r.category === action.category ? { ...r, enabled: !r.enabled } : r
        ),
      }

    case "UPDATE_RULE_CONFIG":
      if (state.previewMode) return state
      return {
        ...state,
        rules: state.rules.map((r) =>
          r.category === action.category ? { ...r, config: action.config } : r
        ),
      }

    case "PREVIEW_START":
      return { ...state, isComputing: true }

    case "PREVIEW_COMPLETE":
      return {
        ...state,
        isComputing: false,
        previewMode: true,
        previousProfiles: state.profiles.map((p) => ({
          ...p,
          blockedTitles: [...p.blockedTitles],
          profileLock: { ...p.profileLock },
          viewingActivity: [...p.viewingActivity],
        })),
        profiles: action.profiles,
        previewChanges: action.changes,
        previewRulesApplied: action.rulesApplied,
        previewRulesSkipped: action.rulesSkipped,
        previewPhosraManaged: action.phosraManaged,
      }

    case "COMMIT":
      return {
        ...state,
        previewMode: false,
        previousProfiles: null,
        previewChanges: null,
        history: [
          {
            id: crypto.randomUUID(),
            timestamp: new Date(),
            profiles: state.profiles.map((p) => ({
              ...p,
              blockedTitles: [...p.blockedTitles],
              profileLock: { ...p.profileLock },
              viewingActivity: [...p.viewingActivity],
            })),
            changes: state.previewChanges || [],
            rulesApplied: state.previewRulesApplied,
            rulesSkipped: state.previewRulesSkipped,
            phosraManaged: state.previewPhosraManaged,
          },
          ...state.history,
        ],
      }

    case "DISCARD":
      return {
        ...state,
        previewMode: false,
        profiles: state.previousProfiles || state.profiles,
        previousProfiles: null,
        previewChanges: null,
      }

    case "UPDATE_PROFILE_RULE_CONFIG":
      if (state.previewMode) return state
      return {
        ...state,
        profileRuleOverrides: {
          ...state.profileRuleOverrides,
          [action.profileId]: {
            ...(state.profileRuleOverrides[action.profileId] || {}),
            [action.category]: action.config,
          },
        },
      }

    case "SELECT_CONFIG_PROFILE":
      return { ...state, configProfileId: action.profileId }

    case "SELECT_PROFILE":
      return { ...state, selectedProfileId: action.profileId }

    case "RESET":
      return createInitialState()

    default:
      return state
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Group ChangeDelta[] by profileId, handling the "all-children" synthetic ID */
function groupChangesByProfile(
  changes: ChangeDelta[],
  profiles: NetflixProfile[]
): ProfileChangeSummary[] {
  const map = new Map<string, ChangeDelta[]>()

  for (const c of changes) {
    // Handle "all-children" synthetic profileId from monitoring_activity
    if (c.profileId === "all-children") {
      for (const p of profiles) {
        if (p.type === "standard" || p.type === "kids") {
          const arr = map.get(p.id) || []
          arr.push({ ...c, profileId: p.id, profileName: p.name })
          map.set(p.id, arr)
        }
      }
      continue
    }
    const arr = map.get(c.profileId) || []
    arr.push(c)
    map.set(c.profileId, arr)
  }

  return profiles
    .filter((p) => map.has(p.id))
    .map((p) => ({
      profileId: p.id,
      profileName: p.name,
      profileType: p.type,
      changes: map.get(p.id) || [],
      changeCount: (map.get(p.id) || []).length,
    }))
}

import type { NetflixProfile, SandboxRule } from "@/lib/sandbox/types"

/**
 * For each rule, compute how many changes it would cause per profile.
 * Returns Map<ruleCategory, Map<profileId, changeCount>>
 */
function computeRuleProfileChangeCounts(
  rules: SandboxRule[],
  profiles: NetflixProfile[],
  profileOverrides?: Record<string, Record<string, Record<string, unknown>>>
): Map<string, Map<string, number>> {
  const result = new Map<string, Map<string, number>>()

  for (const rule of rules) {
    if (!rule.enabled) continue

    // Run enforcement with ONLY this rule enabled
    const singleRuleSet = rules.map((r) =>
      r.category === rule.category ? r : { ...r, enabled: false }
    )
    const enforcement = enforceRules(singleRuleSet, profiles, profileOverrides)

    const profileCounts = new Map<string, number>()
    for (const change of enforcement.changes) {
      if (change.profileId === "all-children") {
        // Distribute to child profiles
        for (const p of profiles) {
          if (p.type === "standard" || p.type === "kids") {
            profileCounts.set(p.id, (profileCounts.get(p.id) || 0) + 1)
          }
        }
      } else {
        profileCounts.set(
          change.profileId,
          (profileCounts.get(change.profileId) || 0) + 1
        )
      }
    }
    result.set(rule.category, profileCounts)
  }

  return result
}

// ─── Page Component ──────────────────────────────────────────────────────────

export default function ProviderSandboxPage() {
  const [state, dispatch] = useReducer(sandboxReducer, undefined, createInitialState)
  const { isHighlighted, triggerHighlights } = useChangeHighlight(1500)

  // Toast state
  const [commitToast, setCommitToast] = useState<{ message: string } | null>(null)

  // Stale-closure safe ref for handlePreview
  const stateRef = useRef(state)
  stateRef.current = state

  const handlePreview = useCallback(() => {
    dispatch({ type: "PREVIEW_START" })
    setTimeout(() => {
      const current = stateRef.current
      const result = enforceRules(current.rules, current.profiles, current.profileRuleOverrides)
      const phosraManaged = result.changes.some(
        (c) => c.field === "timeLimitManaged"
      )
        ? 1
        : 0
      dispatch({
        type: "PREVIEW_COMPLETE",
        profiles: result.profiles,
        changes: result.changes,
        rulesApplied: result.applied,
        rulesSkipped: result.skipped,
        phosraManaged,
      })
    }, 800)
  }, [])

  const handleCommit = useCallback(() => {
    const current = stateRef.current
    const changeCount = current.previewChanges?.length || 0
    const profileCount = new Set(current.previewChanges?.map((c) => c.profileId) || []).size

    dispatch({ type: "COMMIT" })

    // Trigger highlight animations for committed changes
    if (current.previewChanges) {
      const highlightKeys = current.previewChanges.map(
        (c: ChangeDelta) => `${c.profileId}:${c.field}`
      )
      triggerHighlights(highlightKeys)
    }

    // Show success toast
    setCommitToast({
      message: `${changeCount} change${changeCount !== 1 ? "s" : ""} applied across ${profileCount} profile${profileCount !== 1 ? "s" : ""}`,
    })
  }, [triggerHighlights])

  // Auto-dismiss toast after 5 seconds
  useEffect(() => {
    if (!commitToast) return
    const timer = setTimeout(() => setCommitToast(null), 5000)
    return () => clearTimeout(timer)
  }, [commitToast])

  // ─── Derived State ───────────────────────────────────────────────────────

  // 1. Protection scores for all profiles
  const protectionScores = useMemo(
    () => computeAllProtectionScores(state.profiles, state.rules),
    [state.profiles, state.rules]
  )

  // 2. Per-profile change summaries (for avatar badges and manifest)
  const profileChangeSummaries = useMemo((): ProfileChangeSummary[] => {
    if (!state.previewMode || !state.previewChanges) {
      // In configure mode, compute prospective changes for badge display
      const result = enforceRules(state.rules, state.profiles, state.profileRuleOverrides)
      return groupChangesByProfile(result.changes, state.profiles)
    }
    // In preview mode, use actual computed changes
    return groupChangesByProfile(state.previewChanges, state.profiles)
  }, [state.previewMode, state.previewChanges, state.rules, state.profiles, state.profileRuleOverrides])

  // 3. Per-rule, per-profile change counts (for ProfileAvatarBadges)
  const ruleProfileChangeCounts = useMemo(
    () => computeRuleProfileChangeCounts(state.rules, state.profiles, state.profileRuleOverrides),
    [state.rules, state.profiles, state.profileRuleOverrides]
  )

  // 4. Whether there are any unpreviewed changes (for button state)
  const hasUnpreviewedChanges = useMemo(() => {
    const result = enforceRules(state.rules, state.profiles, state.profileRuleOverrides)
    return result.changes.length > 0
  }, [state.rules, state.profiles, state.profileRuleOverrides])

  // 5. Total change count for the button label
  const totalChangeCount = useMemo(() => {
    const result = enforceRules(state.rules, state.profiles, state.profileRuleOverrides)
    return result.changes.length
  }, [state.rules, state.profiles, state.profileRuleOverrides])

  // ─── Render ──────────────────────────────────────────────────────────────

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
        {/* Left panel -- Rules Panel */}
        <div className="w-[35%] shrink-0">
          <div className="plaid-card p-4 h-full">
            <RulesPanel
              rules={state.rules}
              profiles={state.profiles}
              previewMode={state.previewMode}
              isComputing={state.isComputing}
              changeCount={totalChangeCount}
              hasChanges={hasUnpreviewedChanges}
              ruleProfileChangeCounts={ruleProfileChangeCounts}
              configProfileId={state.configProfileId}
              profileRuleOverrides={state.profileRuleOverrides}
              onToggleRule={(category) => dispatch({ type: "TOGGLE_RULE", category })}
              onUpdateRuleConfig={(category, config) =>
                dispatch({ type: "UPDATE_RULE_CONFIG", category, config })
              }
              onUpdateProfileRuleConfig={(profileId, category, config) =>
                dispatch({ type: "UPDATE_PROFILE_RULE_CONFIG", profileId, category, config })
              }
              onSelectConfigProfile={(profileId) =>
                dispatch({ type: "SELECT_CONFIG_PROFILE", profileId })
              }
              onPreview={handlePreview}
              onApply={handleCommit}
              onDiscard={() => dispatch({ type: "DISCARD" })}
              onReset={() => dispatch({ type: "RESET" })}
            />
          </div>
        </div>

        {/* Right panel -- Simulator */}
        <div className="flex-1 min-w-0">
          <div className="plaid-card p-4">
            <SimulatorShell provider={state.provider} previewMode={state.previewMode}>
              <NetflixSimulator
                profiles={state.profiles}
                previousProfiles={state.previousProfiles}
                previewMode={state.previewMode}
                selectedProfileId={state.selectedProfileId}
                onSelectProfile={(profileId) =>
                  dispatch({ type: "SELECT_PROFILE", profileId })
                }
                isHighlighted={isHighlighted}
                profileChangeSummaries={profileChangeSummaries}
                protectionScores={protectionScores}
              />
            </SimulatorShell>
          </div>
        </div>
      </div>

      {/* Change Manifest drawer -- sticky bottom */}
      {state.previewMode && state.previewChanges && state.previousProfiles && (
        <ChangeManifest
          visible={state.previewMode}
          changes={state.previewChanges}
          profiles={state.profiles}
          previousProfiles={state.previousProfiles}
          rulesApplied={state.previewRulesApplied}
          rulesSkipped={state.previewRulesSkipped}
          phosraManaged={state.previewPhosraManaged}
          rules={state.rules}
          profileChangeSummaries={profileChangeSummaries}
          onApply={handleCommit}
          onDiscard={() => dispatch({ type: "DISCARD" })}
          onClose={() => dispatch({ type: "DISCARD" })}
        />
      )}

      {/* Success toast */}
      {commitToast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "12px 20px",
            borderRadius: "8px",
            backgroundColor: "#00D47E",
            color: "#fff",
            fontSize: "13px",
            fontWeight: 600,
            boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M13.5 4.5L6 12L2.5 8.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {commitToast.message}
          <button
            onClick={() => setCommitToast(null)}
            style={{
              marginLeft: "8px",
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.8)",
              cursor: "pointer",
              fontSize: "14px",
              padding: "0 4px",
            }}
            aria-label="Dismiss"
          >
            &#x2715;
          </button>
        </div>
      )}
    </div>
  )
}
