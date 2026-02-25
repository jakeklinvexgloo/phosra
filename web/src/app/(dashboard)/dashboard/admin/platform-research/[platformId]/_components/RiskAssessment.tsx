"use client"

import { AlertTriangle, ShieldAlert, CheckSquare } from "lucide-react"

interface DetectionVector {
  vector: string
  risk: "Low" | "Medium" | "High"
  mitigation: string
}

const DETECTION_VECTORS: DetectionVector[] = [
  {
    vector: "Headless browser detection",
    risk: "Medium",
    mitigation: "Use Playwright stealth plugin (playwright-extra) to mask automation signals",
  },
  {
    vector: "Request frequency analysis",
    risk: "Low",
    mitigation: "Rate limit to 1 action per 5-10 seconds; cache aggressively",
  },
  {
    vector: "Login from new device/IP",
    risk: "Medium",
    mitigation: "Maintain persistent browser profile and cookies across sessions",
  },
  {
    vector: "Unusual navigation patterns",
    risk: "Low",
    mitigation: "Randomize delays between actions; follow natural page flow",
  },
  {
    vector: "Multiple rapid setting changes",
    risk: "Medium",
    mitigation: "Batch changes within single sessions; add jitter between actions",
  },
]

const MITIGATIONS_CHECKLIST = [
  "Enable Playwright stealth mode for all browser sessions",
  "Cache session cookies with 7-14 day TTL to minimize logins",
  "Implement exponential backoff on retry logic",
  "Use Falcor API for reads; reserve browser automation for writes only",
  "Add human-like random delays (2-8s) between navigation steps",
  "Maintain persistent browser profiles to avoid new-device triggers",
  "Monitor for captcha/challenge responses and alert on detection",
  "Batch parental control changes into single MFA-verified sessions",
]

export function RiskAssessment() {
  return (
    <section id="risk-assessment" className="space-y-6">
      {/* Section header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-muted">
          <ShieldAlert className="w-5 h-5 text-foreground" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Risk Assessment</h2>
          <p className="text-sm text-muted-foreground">Terms of Service, detection vectors, and mitigations</p>
        </div>
      </div>

      {/* ToS Warning banner */}
      <div className="rounded-lg border-2 border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200">
              Netflix Terms of Service &mdash; Section 6
            </h3>
            <p className="text-sm text-amber-700 dark:text-amber-400 mt-1 leading-relaxed">
              Netflix ToS explicitly prohibits automated access, scraping, and use of bots or similar
              technology. There is no public API or partner program for parental control integration.
              Account suspension is possible if automation is detected.
            </p>
          </div>
        </div>
      </div>

      {/* Overall risk summary */}
      <div className="plaid-card flex items-center gap-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex-shrink-0">
          <ShieldAlert className="w-6 h-6 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <div className="text-sm font-medium text-foreground">Overall Risk Level</div>
          <div className="flex items-center gap-2 mt-0.5">
            <RiskBadge risk="Medium" size="lg" />
            <span className="text-sm text-muted-foreground">
              &mdash; manageable with stealth mode and rate limiting
            </span>
          </div>
        </div>
      </div>

      {/* Detection vectors grid */}
      <div className="plaid-card !p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <h3 className="text-sm font-medium text-foreground">Detection Vectors</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="px-4 py-2.5 text-left font-medium text-foreground">Vector</th>
                <th className="px-4 py-2.5 text-left font-medium text-foreground">Risk</th>
                <th className="px-4 py-2.5 text-left font-medium text-foreground">Mitigation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {DETECTION_VECTORS.map((dv) => (
                <tr key={dv.vector} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-2.5 font-medium text-foreground whitespace-nowrap">{dv.vector}</td>
                  <td className="px-4 py-2.5">
                    <RiskBadge risk={dv.risk} />
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{dv.mitigation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommended mitigations checklist */}
      <div className="plaid-card space-y-3">
        <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
          <CheckSquare className="w-4 h-4" />
          Recommended Mitigations
        </h3>
        <div className="space-y-2">
          {MITIGATIONS_CHECKLIST.map((item, idx) => (
            <label
              key={idx}
              className="flex items-start gap-2.5 text-sm text-muted-foreground cursor-default"
            >
              <span className="flex items-center justify-center w-5 h-5 rounded border border-border bg-muted/50 flex-shrink-0 mt-0.5 text-[10px] font-medium text-muted-foreground">
                {idx + 1}
              </span>
              {item}
            </label>
          ))}
        </div>
      </div>
    </section>
  )
}

function RiskBadge({ risk, size = "sm" }: { risk: "Low" | "Medium" | "High"; size?: "sm" | "lg" }) {
  const colors = {
    Low: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    Medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    High: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  }

  const dotColors = {
    Low: "bg-emerald-500",
    Medium: "bg-amber-500",
    High: "bg-red-500",
  }

  const sizeClasses = size === "lg"
    ? "text-xs px-2.5 py-1"
    : "text-[10px] px-2 py-0.5"

  return (
    <span className={`inline-flex items-center gap-1 font-medium rounded-full ${colors[risk]} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColors[risk]}`} />
      {risk}
    </span>
  )
}
