"use client"

import { useState, useMemo } from "react"
import type { ChangeDelta, NetflixProfile, SandboxRule, ManifestExport, ProfileChangeSummary } from "@/lib/sandbox/types"
import { RULE_LABELS } from "@/lib/sandbox/rule-mappings"

interface ChangeManifestProps {
  visible: boolean
  changes: ChangeDelta[]
  profiles: NetflixProfile[]
  previousProfiles: NetflixProfile[]
  rulesApplied: number
  rulesSkipped: number
  phosraManaged: number
  rules: SandboxRule[]
  profileChangeSummaries: ProfileChangeSummary[]
  onApply: () => void
  onDiscard: () => void
  onClose: () => void
}

/** Map a ChangeDelta field back to the rule label */
function fieldToRuleLabel(field: string): string {
  const fieldRuleMap: Record<string, string> = {
    maturityRating: "content_rating",
    blockedTitles: "content_block_title",
    profileLock: "purchase_approval",
    timeLimitManaged: "time_daily_limit",
    viewingActivity: "monitoring_activity",
  }
  const category = fieldRuleMap[field]
  return category ? RULE_LABELS[category] || field : field
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "(none)"
  if (typeof value === "boolean") return value ? "true" : "false"
  if (typeof value === "string") return value || "(empty)"
  if (Array.isArray(value)) return value.length > 0 ? value.join(", ") : "(empty)"
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>
    if ("enabled" in obj && "pin" in obj) {
      return obj.enabled ? `ON (PIN: ${obj.pin})` : "OFF"
    }
    return JSON.stringify(value)
  }
  return String(value)
}

export function ChangeManifest({
  visible,
  changes,
  profiles,
  previousProfiles,
  rulesApplied,
  rulesSkipped,
  phosraManaged,
  rules: _rules,
  profileChangeSummaries,
  onApply,
  onDiscard,
  onClose,
}: ChangeManifestProps) {
  const profilesWithChanges = profileChangeSummaries.filter((s) => s.changeCount > 0)
  const [selectedTab, setSelectedTab] = useState<string>(profilesWithChanges[0]?.profileId || "")

  // Reset tab if it's no longer valid
  const activeTab = profilesWithChanges.find((p) => p.profileId === selectedTab)
    ? selectedTab
    : profilesWithChanges[0]?.profileId || ""

  const activeChanges = useMemo(() => {
    return changes.filter((c) => c.profileId === activeTab)
  }, [changes, activeTab])

  const handleCopyJson = () => {
    const exported: ManifestExport = {
      timestamp: new Date().toISOString(),
      provider: "netflix",
      rulesApplied,
      rulesSkipped,
      phosraManaged,
      profiles: profilesWithChanges.map((summary) => ({
        profileId: summary.profileId,
        profileName: summary.profileName,
        profileType: summary.profileType,
        changes: changes
          .filter((c) => c.profileId === summary.profileId)
          .map((c) => ({
            field: c.field,
            before: c.oldValue,
            after: c.newValue,
            rule: fieldToRuleLabel(c.field),
            description: c.description,
          })),
      })),
    }
    navigator.clipboard.writeText(JSON.stringify(exported, null, 2))
  }

  const handleCopyMarkdown = () => {
    const lines: string[] = [
      `# Change Manifest - ${new Date().toLocaleString()}`,
      "",
      `**${changes.length} changes** | ${rulesApplied} rules applied | ${phosraManaged} Phosra-managed | ${rulesSkipped} skipped`,
      "",
    ]
    for (const summary of profilesWithChanges) {
      lines.push(`## ${summary.profileName} (${summary.profileType})`)
      lines.push("")
      lines.push("| Field | Before | After | Rule |")
      lines.push("|-------|--------|-------|------|")
      for (const c of changes.filter((ch) => ch.profileId === summary.profileId)) {
        lines.push(`| ${c.field} | ${formatValue(c.oldValue)} | ${formatValue(c.newValue)} | ${fieldToRuleLabel(c.field)} |`)
      }
      lines.push("")
    }
    navigator.clipboard.writeText(lines.join("\n"))
  }

  return (
    <div
      role="dialog"
      aria-label="Change Manifest"
      style={{
        position: "sticky",
        bottom: 0,
        zIndex: 20,
        marginLeft: "-16px",
        marginRight: "-16px",
        height: 280,
        borderTop: "1px solid #E5E5E5",
        boxShadow: "0 -4px 12px rgba(0,0,0,0.08)",
        backgroundColor: "#FAFAFA",
        transform: visible ? "translateY(0)" : "translateY(100%)",
        transition: "transform 300ms ease-out",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          borderBottom: "1px solid #E5E5E5",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#333" }}>
            Change Manifest
          </span>
          <span style={{ fontSize: "12px", color: "#666" }}>
            {changes.length} changes | {rulesApplied} rules applied | {phosraManaged} Phosra-managed | {rulesSkipped} skipped
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={onApply}
            style={{
              padding: "6px 16px",
              borderRadius: "6px",
              backgroundColor: "#00D47E",
              color: "#fff",
              fontSize: "12px",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
            }}
          >
            Apply Changes
          </button>
          <button
            onClick={onClose}
            style={{
              padding: "6px 8px",
              borderRadius: "6px",
              backgroundColor: "transparent",
              color: "#999",
              fontSize: "16px",
              fontWeight: 400,
              border: "1px solid #E5E5E5",
              cursor: "pointer",
              lineHeight: 1,
            }}
            aria-label="Close manifest"
          >
            &#x2715;
          </button>
        </div>
      </div>

      {/* Profile tabs */}
      <div
        style={{
          display: "flex",
          gap: "4px",
          padding: "8px 16px",
          borderBottom: "1px solid #E5E5E5",
          flexShrink: 0,
        }}
      >
        {profilesWithChanges.map((summary) => {
          const isActive = summary.profileId === activeTab
          return (
            <button
              key={summary.profileId}
              onClick={() => setSelectedTab(summary.profileId)}
              style={{
                padding: "4px 12px",
                borderRadius: "4px",
                fontSize: "12px",
                fontWeight: isActive ? 600 : 400,
                backgroundColor: isActive ? "#333" : "transparent",
                color: isActive ? "#fff" : "#666",
                border: isActive ? "none" : "1px solid #E5E5E5",
                cursor: "pointer",
              }}
            >
              {summary.profileName} ({summary.changeCount})
            </button>
          )
        })}
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflow: "auto", padding: "0 16px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
          <thead>
            <tr style={{ position: "sticky", top: 0, backgroundColor: "#FAFAFA" }}>
              <th style={{ textAlign: "left", padding: "8px 8px", fontWeight: 600, color: "#333", borderBottom: "1px solid #E5E5E5" }}>
                Field
              </th>
              <th style={{ textAlign: "left", padding: "8px 8px", fontWeight: 600, color: "#333", borderBottom: "1px solid #E5E5E5" }}>
                Before
              </th>
              <th style={{ textAlign: "left", padding: "8px 8px", fontWeight: 600, color: "#333", borderBottom: "1px solid #E5E5E5" }}>
                After
              </th>
              <th style={{ textAlign: "left", padding: "8px 8px", fontWeight: 600, color: "#333", borderBottom: "1px solid #E5E5E5" }}>
                Rule
              </th>
            </tr>
          </thead>
          <tbody>
            {activeChanges.map((change, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: "6px 8px", color: "#333", fontWeight: 500 }}>
                  {change.field}
                </td>
                <td style={{ padding: "6px 8px", color: "#D97706" }}>
                  {formatValue(change.oldValue)}
                </td>
                <td style={{ padding: "6px 8px", color: "#00D47E" }}>
                  {formatValue(change.newValue)}
                </td>
                <td style={{ padding: "6px 8px", color: "#666" }}>
                  {fieldToRuleLabel(change.field)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Actions row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 16px",
          borderTop: "1px solid #E5E5E5",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={handleCopyJson}
            style={{
              padding: "4px 12px",
              borderRadius: "4px",
              fontSize: "11px",
              fontWeight: 500,
              backgroundColor: "transparent",
              color: "#666",
              border: "1px solid #E5E5E5",
              cursor: "pointer",
            }}
          >
            Copy as JSON
          </button>
          <button
            onClick={handleCopyMarkdown}
            style={{
              padding: "4px 12px",
              borderRadius: "4px",
              fontSize: "11px",
              fontWeight: 500,
              backgroundColor: "transparent",
              color: "#666",
              border: "1px solid #E5E5E5",
              cursor: "pointer",
            }}
          >
            Copy as Markdown
          </button>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={onApply}
            style={{
              padding: "4px 16px",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: 600,
              backgroundColor: "#00D47E",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            Apply Changes
          </button>
          <button
            onClick={onDiscard}
            style={{
              padding: "4px 12px",
              borderRadius: "4px",
              fontSize: "11px",
              fontWeight: 500,
              backgroundColor: "transparent",
              color: "#666",
              border: "1px solid #E5E5E5",
              cursor: "pointer",
            }}
          >
            Discard
          </button>
        </div>
      </div>
    </div>
  )
}
