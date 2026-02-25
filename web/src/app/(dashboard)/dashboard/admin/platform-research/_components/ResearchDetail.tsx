"use client"

import {
  Shield,
  Zap,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Camera,
  List,
  FileText,
  ChevronRight,
  Wrench,
} from "lucide-react"
import type { Platform, PlatformResearchResult } from "@/lib/platform-research"

interface ResearchDetailProps {
  platform: Platform
  result?: PlatformResearchResult
}

export function ResearchDetail({ platform, result }: ResearchDetailProps) {
  if (!result || result.status === "not_started") {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <FileText className="w-5 h-5 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-medium text-foreground mb-1">No research data yet</h3>
        <p className="text-xs text-muted-foreground max-w-sm">
          Click &quot;Research&quot; on the {platform.name} card to run a Playwright session
          that explores their parental control settings.
        </p>
      </div>
    )
  }

  if (result.status === "error") {
    return (
      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <span className="text-sm font-medium text-destructive">Research Failed</span>
          </div>
          {result.errors.map((err, i) => (
            <p key={i} className="text-xs text-destructive/80 font-mono">{err}</p>
          ))}
        </div>
      </div>
    )
  }

  const assessment = result.assessment

  return (
    <div className="space-y-6">
      {/* ── Header ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{platform.name}</h2>
          <p className="text-xs text-muted-foreground">
            Researched {new Date(result.researchedAt).toLocaleDateString()} via {result.researchedBy}
            {result.durationMs ? ` (${Math.round(result.durationMs / 1000)}s)` : ""}
          </p>
        </div>
      </div>

      {/* ── Assessment Summary ───────────────────────────────── */}
      {assessment && (
        <div className="grid grid-cols-4 gap-3">
          <div className="plaid-card !p-3 text-center">
            <Shield className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
            <div className="text-xl font-semibold tabular-nums">{assessment.protectionRating}</div>
            <div className="text-[10px] text-muted-foreground">Protection</div>
          </div>
          <div className="plaid-card !p-3 text-center">
            <Zap className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
            <div className="text-xl font-semibold tabular-nums">{assessment.phosraCoverage}%</div>
            <div className="text-[10px] text-muted-foreground">Phosra Coverage</div>
          </div>
          <div className="plaid-card !p-3 text-center">
            <List className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
            <div className="text-xl font-semibold tabular-nums">{assessment.featureCount}</div>
            <div className="text-[10px] text-muted-foreground">Controls Found</div>
          </div>
          <div className="plaid-card !p-3 text-center">
            <Wrench className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
            <div className="text-xl font-semibold tabular-nums">{assessment.automatableCount}</div>
            <div className="text-[10px] text-muted-foreground">Automatable</div>
          </div>
        </div>
      )}

      {/* ── Parental Controls Discovered ─────────────────────── */}
      {result.parentalControls.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Shield className="w-3.5 h-3.5" />
            Parental Controls ({result.parentalControls.length})
          </h3>
          <div className="space-y-2">
            {result.parentalControls.map((control, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
              >
                <div className="flex-shrink-0 mt-0.5">
                  {control.automatable ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-green" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{control.name}</span>
                    {control.phosraRuleCategory && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-mono">
                        {control.phosraRuleCategory}
                      </span>
                    )}
                    {control.automationMethod && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground capitalize">
                        {control.automationMethod}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{control.description}</p>
                  {control.options && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {control.options.map((opt, j) => (
                        <span
                          key={j}
                          className="text-[10px] px-1 py-0.5 rounded bg-muted/50 text-muted-foreground"
                        >
                          {opt}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Setup Steps ──────────────────────────────────────── */}
      {result.setupSteps.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <List className="w-3.5 h-3.5" />
            Setup Steps ({result.setupSteps.length})
          </h3>
          <div className="space-y-1">
            {result.setupSteps.map((step, i) => (
              <div key={i} className="flex items-center gap-2 text-xs py-1.5">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium tabular-nums">
                  {step.order}
                </span>
                <ChevronRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                <span className="text-foreground">{step.instruction}</span>
                <span className="text-[10px] text-muted-foreground capitalize ml-auto">
                  {step.actionType}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Screenshots ──────────────────────────────────────── */}
      {result.screenshots.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Camera className="w-3.5 h-3.5" />
            Screenshots ({result.screenshots.length})
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {result.screenshots.map((ss, i) => (
              <div key={i} className="plaid-card !p-2 text-center">
                <div className="w-full h-20 bg-muted rounded flex items-center justify-center mb-1.5">
                  <Camera className="w-5 h-5 text-muted-foreground/40" />
                </div>
                <div className="text-[10px] text-muted-foreground truncate">{ss.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Strengths & Gaps ─────────────────────────────────── */}
      {assessment && (
        <div className="grid grid-cols-2 gap-4">
          {assessment.strengths.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-brand-green mb-2">Strengths</h3>
              <ul className="space-y-1">
                {assessment.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3 h-3 text-brand-green flex-shrink-0 mt-0.5" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {assessment.gaps.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-2">Gaps</h3>
              <ul className="space-y-1">
                {assessment.gaps.map((g, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <AlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
                    {g}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ── Notes ────────────────────────────────────────────── */}
      {result.notes && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-2">Notes</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">{result.notes}</p>
        </div>
      )}
    </div>
  )
}
