"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Search,
  Monitor,
  Gamepad2,
  MessageCircle,
  Smartphone,
  GraduationCap,
  BarChart3,
  Shield,
  Zap,
  Terminal,
  RefreshCw,
} from "lucide-react"
import { platformRegistry, CATEGORY_LABELS, CATEGORY_ORDER } from "@/lib/platform-research"
import type {
  Platform,
  PlatformCategory,
  PlatformResearchResult,
  PlatformResearchSummary,
} from "@/lib/platform-research"
import { PlatformCard } from "./_components/PlatformCard"
import { ResearchDetail } from "./_components/ResearchDetail"

// ── Category filter config ──────────────────────────────────────

const CATEGORY_ICON: Record<PlatformCategory, typeof Monitor> = {
  streaming: Monitor,
  gaming: Gamepad2,
  social: MessageCircle,
  device: Smartphone,
  education: GraduationCap,
}

type FilterCategory = PlatformCategory | "all"

// ── Mock credential status (would be checked against .env.platform-credentials)
// In production, this would be a server-side API call
function getCredentialStatus(): Record<string, boolean> {
  // For now, return all as unconfigured — the actual check happens
  // when the research-runner.mjs script runs
  const status: Record<string, boolean> = {}
  for (const p of platformRegistry) {
    status[p.id] = false
  }
  return status
}

// ── Page ────────────────────────────────────────────────────────

export default function PlatformResearchPage() {
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<FilterCategory>("all")
  const [selectedPlatformId, setSelectedPlatformId] = useState<string | null>(null)
  const [results, setResults] = useState<Record<string, PlatformResearchResult>>({})
  const [credentialStatus, setCredentialStatus] = useState<Record<string, boolean>>({})
  const [researchingId, setResearchingId] = useState<string | null>(null)

  // Load saved research results from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("platform-research-results")
    if (saved) {
      try {
        setResults(JSON.parse(saved))
      } catch {
        // ignore
      }
    }
    setCredentialStatus(getCredentialStatus())
  }, [])

  // Save results to localStorage when they change
  useEffect(() => {
    if (Object.keys(results).length > 0) {
      localStorage.setItem("platform-research-results", JSON.stringify(results))
    }
  }, [results])

  // ── Filtered platforms ──────────────────────────────────────

  const filteredPlatforms = useMemo(() => {
    let platforms = platformRegistry

    if (categoryFilter !== "all") {
      platforms = platforms.filter((p) => p.category === categoryFilter)
    }

    if (search) {
      const q = search.toLowerCase()
      platforms = platforms.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.audience.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      )
    }

    return platforms
  }, [categoryFilter, search])

  // ── Summary stats ──────────────────────────────────────────

  const summary: PlatformResearchSummary = useMemo(() => {
    const researched = Object.values(results).filter((r) => r.status === "completed").length
    const needsUpdate = Object.values(results).filter((r) => r.status === "needs_update").length
    const ratings = Object.values(results)
      .filter((r) => r.assessment)
      .map((r) => r.assessment!.protectionRating)
    const coverages = Object.values(results)
      .filter((r) => r.assessment)
      .map((r) => r.assessment!.phosraCoverage)

    const byCategory = {} as PlatformResearchSummary["byCategory"]
    for (const cat of CATEGORY_ORDER) {
      const catPlatforms = platformRegistry.filter((p) => p.category === cat)
      const catResults = catPlatforms
        .map((p) => results[p.id])
        .filter((r) => r?.status === "completed")
      const catRatings = catResults
        .filter((r) => r.assessment)
        .map((r) => r.assessment!.protectionRating)

      byCategory[cat] = {
        total: catPlatforms.length,
        researched: catResults.length,
        avgRating: catRatings.length ? +(catRatings.reduce((a, b) => a + b, 0) / catRatings.length).toFixed(1) : 0,
      }
    }

    return {
      totalPlatforms: platformRegistry.length,
      researched,
      notStarted: platformRegistry.length - researched - needsUpdate,
      needsUpdate,
      avgProtectionRating: ratings.length
        ? +(ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
        : 0,
      avgPhosraCoverage: coverages.length
        ? Math.round(coverages.reduce((a, b) => a + b, 0) / coverages.length)
        : 0,
      byCategory,
    }
  }, [results])

  // ── Selected platform ──────────────────────────────────────

  const selectedPlatform = useMemo(
    () => platformRegistry.find((p) => p.id === selectedPlatformId) || null,
    [selectedPlatformId]
  )

  // ── Research trigger ───────────────────────────────────────

  const handleResearch = useCallback(
    (platformId: string) => {
      setResearchingId(platformId)

      // Simulate research (in production this would call an API endpoint
      // that triggers the Playwright script via the worker system)
      setTimeout(() => {
        const platform = platformRegistry.find((p) => p.id === platformId)
        if (!platform) return

        // For demo: create a placeholder result
        const newResult: PlatformResearchResult = {
          platformId,
          researchedAt: new Date().toISOString(),
          researchedBy: "playwright",
          status: "completed",
          durationMs: 12000 + Math.random() * 8000,
          screenshots: [
            { filename: "01-homepage.png", label: "Homepage", step: 1 },
            { filename: "02-login.png", label: "Login Page", step: 2 },
            { filename: "03-parental-controls.png", label: "Parental Controls", step: 3 },
          ],
          parentalControls: [
            {
              name: "Content Rating Filter",
              description: `Filter content by age-appropriateness on ${platform.name}`,
              phosraRuleCategory: "age_gate",
              automatable: true,
              automationMethod: "playwright",
              options: ["All ages", "7+", "13+", "16+", "18+"],
            },
            {
              name: "Profile PIN Lock",
              description: "Require a PIN to access this profile",
              phosraRuleCategory: "profile_lock",
              automatable: true,
              automationMethod: "playwright",
              options: ["Enabled", "Disabled"],
            },
          ],
          setupSteps: [
            { order: 1, instruction: `Navigate to ${platform.name} login page`, actionType: "navigate" },
            { order: 2, instruction: "Sign in with credentials", actionType: "type" },
            { order: 3, instruction: "Navigate to parental controls / settings", actionType: "navigate" },
            { order: 4, instruction: "Document available parental control features", actionType: "verify" },
          ],
          assessment: {
            complexity: "moderate",
            ageGatingMethod: "profile_based",
            featureCount: 2,
            automatableCount: 2,
            phosraCoverage: 40,
            gaps: ["Detailed research needed — run with real credentials"],
            strengths: ["Placeholder assessment"],
            protectionRating: 5,
          },
          notes:
            "This is a placeholder result. Configure credentials in .env.platform-credentials and run the Playwright research script for real data.",
          errors: [],
        }

        setResults((prev) => ({ ...prev, [platformId]: newResult }))
        setResearchingId(null)
        setSelectedPlatformId(platformId)
      }, 3000)
    },
    []
  )

  // ── Render ─────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Platform Research</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            Automated research of parental controls across kids&apos; apps and streaming providers using Playwright browser automation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-border hover:bg-muted transition-colors"
          >
            <Terminal className="w-3 h-3" />
            Run Script
          </a>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-5 gap-3">
        <div className="plaid-card !p-3">
          <div className="text-[11px] text-muted-foreground mb-1">Total Platforms</div>
          <div className="text-xl font-semibold tabular-nums">{summary.totalPlatforms}</div>
        </div>
        <div className="plaid-card !p-3">
          <div className="text-[11px] text-muted-foreground mb-1">Researched</div>
          <div className="text-xl font-semibold tabular-nums text-brand-green">{summary.researched}</div>
        </div>
        <div className="plaid-card !p-3">
          <div className="text-[11px] text-muted-foreground mb-1">Not Started</div>
          <div className="text-xl font-semibold tabular-nums">{summary.notStarted}</div>
        </div>
        <div className="plaid-card !p-3">
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground mb-1">
            <Shield className="w-3 h-3" /> Avg Protection
          </div>
          <div className="text-xl font-semibold tabular-nums">{summary.avgProtectionRating || "—"}</div>
        </div>
        <div className="plaid-card !p-3">
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground mb-1">
            <Zap className="w-3 h-3" /> Avg Coverage
          </div>
          <div className="text-xl font-semibold tabular-nums">{summary.avgPhosraCoverage || "—"}%</div>
        </div>
      </div>

      {/* Search + Category Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search platforms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-foreground/20"
          />
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCategoryFilter("all")}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
              categoryFilter === "all"
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            All ({platformRegistry.length})
          </button>
          {CATEGORY_ORDER.map((cat) => {
            const Icon = CATEGORY_ICON[cat]
            const count = platformRegistry.filter((p) => p.category === cat).length
            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                  categoryFilter === cat
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-3 h-3" />
                {CATEGORY_LABELS[cat]} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Two-panel layout */}
      <div className="flex gap-4" style={{ minHeight: "calc(100vh - 340px)" }}>
        {/* Left: Platform Grid */}
        <div className="w-[55%] shrink-0">
          <div className="grid grid-cols-2 gap-3">
            {filteredPlatforms.map((platform) => (
              <PlatformCard
                key={platform.id}
                platform={platform}
                result={results[platform.id]}
                hasCredentials={credentialStatus[platform.id] ?? false}
                onResearch={handleResearch}
                isResearching={researchingId === platform.id}
                isSelected={selectedPlatformId === platform.id}
                onSelect={setSelectedPlatformId}
              />
            ))}
          </div>
          {filteredPlatforms.length === 0 && (
            <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
              No platforms match your search
            </div>
          )}
        </div>

        {/* Right: Detail Panel */}
        <div className="flex-1 min-w-0">
          <div className="plaid-card p-5 sticky top-4">
            {selectedPlatform ? (
              <ResearchDetail
                platform={selectedPlatform}
                result={results[selectedPlatform.id]}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <BarChart3 className="w-5 h-5 text-muted-foreground" />
                </div>
                <h3 className="text-sm font-medium text-foreground mb-1">Select a platform</h3>
                <p className="text-xs text-muted-foreground max-w-sm">
                  Click on any platform card to view research details, parental control features,
                  and Phosra coverage analysis.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CLI Instructions */}
      <div className="plaid-card !p-4">
        <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5" />
          Running Research Scripts
        </h3>
        <div className="text-xs text-muted-foreground space-y-2">
          <p>
            <strong>1.</strong> Copy credentials template:{" "}
            <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-[11px]">
              cp .env.platform-credentials.example .env.platform-credentials
            </code>
          </p>
          <p>
            <strong>2.</strong> Fill in your credentials for the platforms you want to research.
          </p>
          <p>
            <strong>3.</strong> Run the research script:
          </p>
          <div className="bg-muted/50 rounded-md p-3 font-mono text-[11px] space-y-1">
            <div className="text-muted-foreground"># Research all platforms with configured credentials</div>
            <div>node scripts/platform-research/research-runner.mjs</div>
            <div className="text-muted-foreground mt-2"># Research a specific platform</div>
            <div>node scripts/platform-research/research-runner.mjs --platform netflix</div>
            <div className="text-muted-foreground mt-2"># Research a category</div>
            <div>node scripts/platform-research/research-runner.mjs --category streaming</div>
            <div className="text-muted-foreground mt-2"># List platforms and credential status</div>
            <div>node scripts/platform-research/research-runner.mjs --list</div>
          </div>
          <p className="mt-2">
            <strong>MCP Browser alternative:</strong> You can also use the Playwright MCP Chrome browser
            to interactively research platforms in real-time with AI guidance.
          </p>
        </div>
      </div>
    </div>
  )
}
