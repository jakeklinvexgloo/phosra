"use client"

import { useState, useMemo, useRef } from "react"
import {
  Eye,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  FileText,
  Check,
  AlertTriangle,
  EyeIcon,
  XCircle,
} from "lucide-react"
import { ScreenshotLightbox } from "./ScreenshotLightbox"
import type {
  ScreenshotAnalysisData,
  ScreenshotAnalysis,
  AutomationFeasibility,
  FindingSeverity,
  UxRating,
  RelevanceLevel,
  CategoryAnalysisSummary,
} from "@/lib/platform-research/research-data-types"

interface Screenshot {
  filename: string
  label: string
  path: string
}

interface ScreenshotGroup {
  id: string
  label: string
  screenshots: Screenshot[]
}

interface ScreenshotEvidenceSectionProps {
  screenshots: ScreenshotGroup[]
  totalCount: number
  screenshotAnalysis?: ScreenshotAnalysisData | null
}

const ALL_TAB = "__all__"

// ── Badge / styling helpers ──────────────────────────────────────

const automationBadgeColor = (f: AutomationFeasibility) => {
  switch (f) {
    case "fully_automatable":
      return "bg-green-100 text-green-800"
    case "partially_automatable":
      return "bg-amber-100 text-amber-800"
    case "read_only":
      return "bg-blue-100 text-blue-800"
    case "not_automatable":
      return "bg-red-100 text-red-800"
  }
}

const automationLabel = (f: AutomationFeasibility) => {
  switch (f) {
    case "fully_automatable":
      return "API"
    case "partially_automatable":
      return "Playwright"
    case "read_only":
      return "Read Only"
    case "not_automatable":
      return "Manual"
  }
}

const severityColor = (s: FindingSeverity) => {
  switch (s) {
    case "critical":
      return "border-red-500 bg-red-50"
    case "important":
      return "border-amber-500 bg-amber-50"
    case "informational":
      return "border-blue-500 bg-blue-50"
  }
}

const uxColor = (r: UxRating) => {
  switch (r) {
    case "excellent":
      return "bg-green-100 text-green-800"
    case "good":
      return "bg-emerald-100 text-emerald-800"
    case "fair":
      return "bg-amber-100 text-amber-800"
    case "poor":
      return "bg-red-100 text-red-800"
  }
}

const relevanceDot = (r: RelevanceLevel) => {
  switch (r) {
    case "high":
      return "bg-green-500"
    case "medium":
      return "bg-yellow-500"
    case "low":
      return "bg-gray-400"
    case "none":
      return "bg-gray-200"
  }
}

// ── Inline sub-components ────────────────────────────────────────

function AutomationIcon({ feasibility }: { feasibility: AutomationFeasibility }) {
  switch (feasibility) {
    case "fully_automatable":
      return <Check className="w-3 h-3" />
    case "partially_automatable":
      return <AlertTriangle className="w-3 h-3" />
    case "read_only":
      return <EyeIcon className="w-3 h-3" />
    case "not_automatable":
      return <XCircle className="w-3 h-3" />
  }
}

/** Renders the full analysis panel content for a single screenshot */
function AnalysisPanel({ analysis }: { analysis: ScreenshotAnalysis }) {
  return (
    <div className="space-y-4">
      {/* Description */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Description
        </h4>
        <p className="text-sm text-foreground leading-relaxed">{analysis.description}</p>
      </div>

      {/* Phosra Relevance */}
      <div className="rounded-lg border border-border bg-card p-4 border-l-4 border-l-purple-500">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Phosra Relevance
        </h4>
        <p className="text-sm text-foreground leading-relaxed">{analysis.phosraRelevance}</p>
        {analysis.relatedRuleCategories.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {analysis.relatedRuleCategories.map((rc) => (
              <span
                key={rc}
                className="inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-purple-100 text-purple-800"
              >
                {rc}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Automation */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Automation
        </h4>
        <div className="flex items-center gap-2 mb-2">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${automationBadgeColor(
              analysis.automation.feasibility
            )}`}
          >
            <AutomationIcon feasibility={analysis.automation.feasibility} />
            {automationLabel(analysis.automation.feasibility)}
          </span>
        </div>
        <p className="text-sm text-foreground mb-1">
          <span className="font-medium">Method:</span> {analysis.automation.method}
        </p>
        <p className="text-sm text-muted-foreground">{analysis.automation.notes}</p>
        {analysis.automation.technicalDetails && (
          <p className="text-xs text-muted-foreground mt-1 font-mono bg-muted p-2 rounded">
            {analysis.automation.technicalDetails}
          </p>
        )}
      </div>

      {/* Findings */}
      {analysis.findings.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Findings
          </h4>
          <div className="space-y-2">
            {analysis.findings.map((finding, i) => (
              <div
                key={i}
                className={`border-l-4 rounded-r-lg p-3 ${severityColor(finding.severity)}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">{finding.label}</span>
                  <span className="text-[10px] uppercase font-semibold tracking-wider opacity-70">
                    {finding.severity}
                  </span>
                  {finding.ruleCategory && (
                    <span className="text-[10px] font-mono bg-white/60 px-1.5 py-0.5 rounded">
                      {finding.ruleCategory}
                    </span>
                  )}
                </div>
                <p className="text-sm opacity-80">{finding.detail}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* UX Assessment */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          UX Assessment
        </h4>
        <div className="flex items-center gap-2 mb-2">
          <span
            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${uxColor(
              analysis.ux.rating
            )}`}
          >
            {analysis.ux.rating}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{analysis.ux.notes}</p>
      </div>

      {/* Security Notes */}
      {analysis.securityNotes.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Security Notes
          </h4>
          <ul className="list-disc list-inside space-y-1">
            {analysis.securityNotes.map((note, i) => (
              <li key={i} className="text-sm text-foreground">
                {note}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* API Indicators */}
      {analysis.apiIndicators.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            API Indicators
          </h4>
          <ul className="list-disc list-inside space-y-1">
            {analysis.apiIndicators.map((indicator, i) => (
              <li key={i} className="text-sm text-foreground">
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                  {indicator}
                </code>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Gaps Identified */}
      {analysis.gapsIdentified.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Gaps Identified
          </h4>
          <ul className="list-disc list-inside space-y-1">
            {analysis.gapsIdentified.map((gap, i) => (
              <li key={i} className="text-sm text-foreground">
                {gap}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Comparison Notes */}
      {analysis.comparisonNotes && (
        <div className="rounded-lg border border-border bg-card p-4">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Comparison Notes
          </h4>
          <p className="text-sm text-foreground leading-relaxed">{analysis.comparisonNotes}</p>
        </div>
      )}

      {/* Metadata footer */}
      {(analysis.analyst || analysis.analyzedAt) && (
        <div className="text-[10px] text-muted-foreground flex items-center gap-3">
          {analysis.analyst && <span>Analyst: {analysis.analyst}</span>}
          {analysis.analyzedAt && <span>Analyzed: {analysis.analyzedAt}</span>}
        </div>
      )}
    </div>
  )
}

/** Category summary card shown above screenshots in analysis mode */
function CategorySummaryCard({ summary }: { summary: CategoryAnalysisSummary }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 mb-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <p className="text-sm text-foreground leading-relaxed flex-1">{summary.summary}</p>
        <span
          className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${automationBadgeColor(
            summary.automationFeasibility
          )}`}
        >
          <AutomationIcon feasibility={summary.automationFeasibility} />
          {automationLabel(summary.automationFeasibility)}
        </span>
      </div>

      {summary.keyTakeaways.length > 0 && (
        <div className="mb-3">
          <h5 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            Key Takeaways
          </h5>
          <ul className="list-disc list-inside space-y-0.5">
            {summary.keyTakeaways.map((t, i) => (
              <li key={i} className="text-sm text-foreground">
                {t}
              </li>
            ))}
          </ul>
        </div>
      )}

      {summary.relatedAdapterMethods.length > 0 && (
        <div>
          <h5 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            Related Adapter Methods
          </h5>
          <div className="flex flex-wrap gap-1.5">
            {summary.relatedAdapterMethods.map((m) => (
              <code
                key={m}
                className="text-[10px] font-mono bg-muted px-2 py-0.5 rounded text-foreground"
              >
                {m}
              </code>
            ))}
          </div>
        </div>
      )}

      {summary.comparisonSummary && (
        <p className="text-xs text-muted-foreground mt-3 border-t border-border pt-2">
          {summary.comparisonSummary}
        </p>
      )}
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────────

export function ScreenshotEvidenceSection({
  screenshots,
  totalCount,
  screenshotAnalysis,
}: ScreenshotEvidenceSectionProps) {
  const [activeTab, setActiveTab] = useState(ALL_TAB)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<"gallery" | "analysis">("gallery")
  const [analysisIndex, setAnalysisIndex] = useState(0)
  const tabBarRef = useRef<HTMLDivElement>(null)

  const hasAnalysis = !!screenshotAnalysis && Object.keys(screenshotAnalysis.screenshots).length > 0

  // Flat list of all screenshots for "All" tab
  const allScreenshots = useMemo(
    () => screenshots.flatMap((g) => g.screenshots),
    [screenshots]
  )

  // Current visible screenshots based on active tab
  const visibleScreenshots = useMemo(() => {
    if (activeTab === ALL_TAB) return allScreenshots
    const group = screenshots.find((g) => g.id === activeTab)
    return group ? group.screenshots : allScreenshots
  }, [activeTab, allScreenshots, screenshots])

  // Get analysis for a given screenshot filename
  const getAnalysis = (filename: string): ScreenshotAnalysis | null => {
    if (!screenshotAnalysis) return null
    return screenshotAnalysis.screenshots[filename] ?? null
  }

  // Category summary for active tab
  const activeCategorySummary = useMemo((): CategoryAnalysisSummary | null => {
    if (!screenshotAnalysis || activeTab === ALL_TAB) return null
    return (
      screenshotAnalysis.categorySummaries.find((cs) => cs.categoryId === activeTab) ?? null
    )
  }, [screenshotAnalysis, activeTab])

  // Current screenshot and analysis in analysis mode
  const currentAnalysisScreenshot = visibleScreenshots[analysisIndex] ?? null
  const currentAnalysis = currentAnalysisScreenshot
    ? getAnalysis(currentAnalysisScreenshot.filename)
    : null

  // Reset analysis index when tab or view mode changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    setAnalysisIndex(0)
  }

  // For lightbox
  const openLightbox = (idx: number) => setLightboxIndex(idx)
  const closeLightbox = () => setLightboxIndex(null)

  // Analysis mode navigation
  const goAnalysisPrev = () =>
    setAnalysisIndex((prev) => (prev > 0 ? prev - 1 : visibleScreenshots.length - 1))
  const goAnalysisNext = () =>
    setAnalysisIndex((prev) => (prev < visibleScreenshots.length - 1 ? prev + 1 : 0))

  if (totalCount === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-8">
        No screenshots captured yet.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* View mode toggle + Category tab bar */}
      <div className="flex items-center gap-3">
        {/* View mode segmented control — only shown when analysis data exists */}
        {hasAnalysis && (
          <div className="shrink-0 inline-flex rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setViewMode("gallery")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === "gallery"
                  ? "bg-indigo-600 text-white"
                  : "bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Gallery
            </button>
            <button
              onClick={() => {
                setViewMode("analysis")
                setAnalysisIndex(0)
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === "analysis"
                  ? "bg-indigo-600 text-white"
                  : "bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Analysis
            </button>
          </div>
        )}

        {/* Category tab bar */}
        <div
          ref={tabBarRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 flex-1"
        >
          {/* All tab */}
          <button
            onClick={() => handleTabChange(ALL_TAB)}
            className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeTab === ALL_TAB
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            All
            <span
              className={`text-[10px] tabular-nums ${
                activeTab === ALL_TAB ? "text-background/70" : "text-muted-foreground/70"
              }`}
            >
              {totalCount}
            </span>
          </button>

          {screenshots.map((group) => (
            <button
              key={group.id}
              onClick={() => handleTabChange(group.id)}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeTab === group.id
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {group.label}
              <span
                className={`text-[10px] tabular-nums ${
                  activeTab === group.id
                    ? "text-background/70"
                    : "text-muted-foreground/70"
                }`}
              >
                {group.screenshots.length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Category Summary Bar — shown only in analysis mode with active category */}
      {viewMode === "analysis" && activeCategorySummary && (
        <CategorySummaryCard summary={activeCategorySummary} />
      )}

      {/* ── Gallery Mode ─────────────────────────────────────────── */}
      {viewMode === "gallery" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {visibleScreenshots.map((ss, i) => {
            const analysis = hasAnalysis ? getAnalysis(ss.filename) : null
            const hasCritical = analysis?.findings.some((f) => f.severity === "critical")

            return (
              <button
                key={`${activeTab}-${ss.path}`}
                onClick={() => openLightbox(i)}
                className="group relative aspect-video rounded-lg overflow-hidden border border-border bg-muted hover:scale-[1.02] hover:ring-2 hover:ring-ring/50 transition-all"
              >
                <img
                  src={ss.path}
                  alt={ss.label}
                  loading={i < 8 ? "eager" : "lazy"}
                  className="w-full h-full object-cover"
                />

                {/* Hover overlay with Eye icon */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <Eye className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                </div>

                {/* Caption */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-1.5 pt-4">
                  <span className="text-[10px] text-white/80 truncate block leading-tight">
                    {ss.label}
                  </span>
                </div>

                {/* Analysis badge overlays */}
                {analysis && (
                  <>
                    {/* Bottom-left: Relevance dot */}
                    <div className="absolute bottom-1.5 left-1.5 z-10">
                      <div
                        className={`w-2.5 h-2.5 rounded-full ring-1 ring-black/20 ${relevanceDot(
                          analysis.relevance
                        )}`}
                        title={`Relevance: ${analysis.relevance}`}
                      />
                    </div>

                    {/* Bottom-right: Automation badge */}
                    <div className="absolute bottom-1.5 right-1.5 z-10">
                      <span
                        className={`inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-[8px] font-medium leading-none ${automationBadgeColor(
                          analysis.automation.feasibility
                        )}`}
                        title={`Automation: ${automationLabel(analysis.automation.feasibility)}`}
                      >
                        <AutomationIcon feasibility={analysis.automation.feasibility} />
                      </span>
                    </div>

                    {/* Top-right: Critical dot */}
                    {hasCritical && (
                      <div className="absolute top-1.5 right-1.5 z-10">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500 ring-1 ring-black/20 animate-pulse" />
                      </div>
                    )}
                  </>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* ── Analysis Mode ────────────────────────────────────────── */}
      {viewMode === "analysis" && (
        <div className="space-y-4">
          {/* Navigation bar */}
          <div className="flex items-center justify-between">
            <button
              onClick={goAnalysisPrev}
              disabled={visibleScreenshots.length <= 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-muted text-muted-foreground hover:bg-muted/80 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Prev
            </button>
            <span className="text-xs text-muted-foreground tabular-nums">
              {visibleScreenshots.length > 0
                ? `${analysisIndex + 1} of ${visibleScreenshots.length}${
                    activeTab !== ALL_TAB ? " in Category" : ""
                  }`
                : "No screenshots"}
            </span>
            <button
              onClick={goAnalysisNext}
              disabled={visibleScreenshots.length <= 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-muted text-muted-foreground hover:bg-muted/80 disabled:opacity-40 transition-colors"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Large image */}
          {currentAnalysisScreenshot && (
            <div className="rounded-lg overflow-hidden border border-border bg-muted">
              <img
                src={currentAnalysisScreenshot.path}
                alt={currentAnalysisScreenshot.label}
                className="w-full max-h-[400px] object-contain"
              />
            </div>
          )}

          {/* Screenshot label */}
          {currentAnalysisScreenshot && (
            <div className="text-sm font-medium text-foreground">
              {currentAnalysisScreenshot.label}
              <span className="ml-2 text-xs text-muted-foreground font-mono">
                {currentAnalysisScreenshot.filename}
              </span>
            </div>
          )}

          {/* Analysis content */}
          {currentAnalysis ? (
            <AnalysisPanel analysis={currentAnalysis} />
          ) : (
            <div className="text-sm text-muted-foreground text-center py-8 border border-dashed border-border rounded-lg">
              No analysis available for this screenshot.
            </div>
          )}
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <ScreenshotLightbox
          images={visibleScreenshots}
          initialIndex={lightboxIndex}
          onClose={closeLightbox}
          screenshotAnalysis={screenshotAnalysis}
        />
      )}
    </div>
  )
}
