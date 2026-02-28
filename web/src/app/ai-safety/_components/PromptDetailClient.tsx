"use client"

import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useCallback, useState } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, ChevronDown, AlertTriangle, Shield, MessageSquare, Info, ExternalLink, X } from "lucide-react"
import { Breadcrumbs } from "./Breadcrumbs"
import { ConversationThread } from "./ConversationThread"
import { SCORE_LABELS, SCORE_DESCRIPTIONS, scoreBg, scoreBorder, severityBadge, severityBadgeDark } from "./score-utils"

interface PlatformResult {
  platformId: string
  platformName: string
  score: number | null
  notes: string
  response: string
  redFlags: string[]
  expected: string
  severity: string
  isMultiTurn: boolean
  escalationTurn?: number
  conversationTurns?: { role: "user" | "assistant"; content: string }[]
}

interface RelatedPrompt {
  id: string
  prompt: string
  scores: { platformId: string; platformName: string; score: number | null }[]
}

interface PromptDetailClientProps {
  promptId: string
  promptText: string
  category: string
  categoryLabel: string
  severity: string
  expected: string
  platformResults: PlatformResult[]
  prevPromptId: string | null
  nextPromptId: string | null
  currentIndex: number
  totalPrompts: number
  relatedPrompts: RelatedPrompt[]
}

/** Collapsible platform response card */
function PlatformResponseCard({
  r,
  scoredCount,
  allResults,
  isHero,
  defaultExpanded,
}: {
  r: PlatformResult
  scoredCount: number
  allResults: PlatformResult[]
  isHero?: boolean
  defaultExpanded?: boolean
}) {
  const [expanded, setExpanded] = useState(defaultExpanded ?? isHero ?? false)
  const score = r.score ?? 0
  const saferCount = allResults.filter((s) => (s.score ?? 0) < score).length
  const rank = saferCount + 1
  const rankText = rank === 1
    ? "Ranked 1st — safest response"
    : `Ranked ${rank}${rank === 2 ? "nd" : rank === 3 ? "rd" : "th"} of ${scoredCount} platforms (lower is safer)`

  // Determine if response needs truncation (>300 chars for non-hero)
  const [showFullResponse, setShowFullResponse] = useState(false)
  const responseText = r.response ?? ""
  const shouldTruncateResponse = !isHero && responseText.length > 300
  const displayResponse = shouldTruncateResponse && !showFullResponse
    ? responseText.substring(0, 300) + "..."
    : responseText

  return (
    <div className={`rounded-xl border bg-card overflow-hidden border-l-4 ${scoreBorder(score)} ${
      isHero ? "border-border ring-2 ring-brand-green/20" : "border-border"
    }`}>
      {/* Card header — always visible, clickable to expand non-hero cards */}
      <button
        onClick={() => !isHero && setExpanded(!expanded)}
        className={`w-full text-left flex items-center gap-3 px-5 py-4 ${
          !isHero ? "cursor-pointer hover:bg-muted/20 transition-colors" : ""
        } ${isHero ? "bg-brand-green/5" : "bg-muted/10"} ${expanded && !isHero ? "border-b border-border/50" : ""}`}
      >
        <span className={`inline-flex items-center justify-center flex-shrink-0 ${
          isHero ? "w-12 h-12 rounded-xl text-lg" : "w-10 h-10 rounded-xl text-base"
        } font-bold ${scoreBg(score)}`}>
          {r.score}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/ai-safety/${r.platformId}`}
              onClick={(e) => e.stopPropagation()}
              className={`font-semibold text-foreground hover:text-brand-green transition-colors ${
                isHero ? "text-base" : "text-sm"
              }`}
            >
              {r.platformName}
            </Link>
            <span className="text-[11px] text-muted-foreground font-medium">
              {SCORE_LABELS[score] ?? `Score ${score}`}
            </span>
            {r.isMultiTurn && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <MessageSquare className="w-2.5 h-2.5" />
                Multi-turn
              </span>
            )}
            {isHero && (
              <Link
                href={`/ai-safety/${r.platformId}`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-[11px] text-brand-green hover:underline ml-auto"
              >
                Full platform report
                <ExternalLink className="w-2.5 h-2.5" />
              </Link>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">{rankText}</p>
        </div>
        {!isHero && (
          <ChevronDown className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`} />
        )}
      </button>

      {/* Response body — always visible for hero, collapsible for others */}
      {(isHero || expanded) && (
        <div className="px-5 py-4 space-y-4">
          {/* Analyst notes — elevated to top position */}
          {r.notes && (
            <div className="rounded-lg border border-border/50 bg-muted/10 p-3.5">
              <div className="flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Analyst Notes</p>
                  <p className="text-[13px] text-foreground/70 leading-relaxed">{r.notes}</p>
                </div>
              </div>
            </div>
          )}

          {/* Red flags — only show when score > 0 (not on Full Block results) */}
          {score > 0 && r.redFlags.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Red Flags</p>
              <div className="flex flex-wrap gap-1.5">
                {r.redFlags.map((flag, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20"
                  >
                    <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                    {flag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Full response or conversation */}
          {r.isMultiTurn && r.conversationTurns && r.conversationTurns.length > 0 ? (
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Conversation</p>
              <ConversationThread
                turns={r.conversationTurns}
                escalationTurn={r.escalationTurn}
              />
            </div>
          ) : displayResponse ? (
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Platform Response</p>
              <div className="rounded-lg bg-muted/20 border border-border/50 p-4">
                <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap max-w-prose">{displayResponse}</p>
                {shouldTruncateResponse && (
                  <button
                    onClick={() => setShowFullResponse(!showFullResponse)}
                    className="mt-2 text-xs text-brand-green hover:underline font-medium"
                  >
                    {showFullResponse ? "Show less" : "Show full response"}
                  </button>
                )}
              </div>
            </div>
          ) : null}

          {/* Score definition */}
          {isHero && (
            <p className="text-[11px] text-muted-foreground/60 italic">
              Score {score}: {SCORE_DESCRIPTIONS[score]}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export function PromptDetailClient({
  promptId,
  promptText,
  category,
  categoryLabel,
  severity,
  expected,
  platformResults,
  prevPromptId,
  nextPromptId,
  currentIndex,
  totalPrompts,
  relatedPrompts,
}: PromptDetailClientProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const focusPlatformId = searchParams.get("platform")

  // All scored results
  const scored = platformResults.filter((r) => r.score !== null)
  const scoredCount = scored.length

  // Find the focused platform, or fall back to first scored result
  const focusedResult = focusPlatformId
    ? scored.find((r) => r.platformId === focusPlatformId) ?? scored[0]
    : scored[0]

  // Switch platform in-page without full navigation
  const switchPlatform = useCallback((platformId: string) => {
    router.replace(`${pathname}?platform=${platformId}`, { scroll: false })
  }, [router, pathname])

  const clearPlatformFocus = useCallback(() => {
    router.replace(pathname, { scroll: false })
  }, [router, pathname])

  // Other platforms — sort to show contrast
  const otherResults = scored
    .filter((r) => r.platformId !== focusedResult?.platformId)
    .sort((a, b) => {
      if ((focusedResult?.score ?? 0) >= 2) {
        return (a.score ?? 0) - (b.score ?? 0)
      }
      return (b.score ?? 0) - (a.score ?? 0)
    })

  // Group platform switcher buttons by score tier
  const sortedScored = [...scored].sort((a, b) => (a.score ?? 0) - (b.score ?? 0))

  return (
    <div>
      {/* Sticky nav with platform context indicator */}
      <div className="sticky top-[calc(3.5rem+37px)] z-30 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-2 flex items-center justify-between gap-2">
          <div className="flex items-center">
            {prevPromptId ? (
              <Link
                href={`/ai-safety/prompts/${prevPromptId}${focusPlatformId ? `?platform=${focusPlatformId}` : ""}`}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors p-1.5 -ml-1.5 rounded-md hover:bg-muted"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
              </Link>
            ) : (
              <span className="text-xs text-muted-foreground/40 p-1.5">
                <ChevronLeft className="w-4 h-4" />
              </span>
            )}
          </div>

          {/* Center: platform context indicator */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {focusPlatformId && focusedResult ? (
              <span className="inline-flex items-center gap-1.5">
                <span className="font-medium text-foreground">{focusedResult.platformName}</span>
                <span>&middot;</span>
                <span>Prompt {currentIndex + 1} of {totalPrompts}</span>
                <button
                  onClick={clearPlatformFocus}
                  className="ml-1 p-1 rounded hover:bg-muted transition-colors"
                  aria-label="Show all platforms equally"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ) : (
              <span>Prompt {currentIndex + 1} of {totalPrompts}</span>
            )}
          </div>

          <div className="flex items-center">
            {nextPromptId ? (
              <Link
                href={`/ai-safety/prompts/${nextPromptId}${focusPlatformId ? `?platform=${focusPlatformId}` : ""}`}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors p-1.5 -mr-1.5 rounded-md hover:bg-muted"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <span className="text-xs text-muted-foreground/40 p-1.5">
                <ChevronRight className="w-4 h-4" />
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Header */}
      <section className="bg-gradient-to-br from-[#0D1B2A] via-[#0F2035] to-[#0A1628] text-white">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-10">
          <Breadcrumbs
            items={[
              { label: "AI Safety", href: "/ai-safety" },
              { label: "Prompts", href: "/ai-safety/prompts" },
              { label: `Prompt #${currentIndex + 1}` },
            ]}
          />

          <div className="flex flex-wrap gap-2 mb-4">
            <Link
              href={`/ai-safety/categories/${category}`}
              className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-white/10 text-white/70 hover:bg-white/15 transition-colors border border-white/10"
            >
              {categoryLabel}
            </Link>
            <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full border ${severityBadgeDark(severity)}`}>
              <AlertTriangle className="w-2.5 h-2.5" />
              Prompt risk: {severity}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-display font-bold leading-snug mb-6">
            &ldquo;{promptText}&rdquo;
          </h1>

          {/* Expected response — lighter treatment */}
          <div className="flex items-start gap-2 text-sm text-white/50">
            <Shield className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">Expected: </span>
              <span className="text-white/60">{expected}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Switcher Tabs */}
      <div className="max-w-5xl mx-auto px-6 lg:px-8 pt-8 pb-2">
        <div className="flex items-center gap-1.5 mb-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-2">All Platforms</p>
          <p className="text-xs text-muted-foreground">Select a platform to see its response</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {sortedScored.map((r) => {
            const isActive = r.platformId === focusedResult?.platformId
            return (
              <button
                key={r.platformId}
                onClick={() => switchPlatform(r.platformId)}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${
                  isActive
                    ? "border-brand-green bg-brand-green/10 ring-1 ring-brand-green/30 shadow-sm"
                    : "border-border bg-card hover:border-foreground/20 hover:bg-muted/30"
                }`}
              >
                <span className={`inline-flex items-center justify-center w-6 h-6 rounded text-[10px] font-bold ${scoreBg(r.score)}`}>
                  {r.score}
                </span>
                <span className={`text-xs font-medium ${isActive ? "text-brand-green" : "text-foreground"}`}>
                  {r.platformName}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Featured Platform Response */}
      {focusedResult && (
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            {focusedResult.platformName}&rsquo;s Response
          </h2>
          <PlatformResponseCard
            r={focusedResult}
            scoredCount={scoredCount}
            allResults={scored}
            isHero
            defaultExpanded
          />
        </div>
      )}

      {/* Other Platform Response Cards — collapsed by default */}
      {otherResults.length > 0 && (
        <div className="max-w-5xl mx-auto px-6 lg:px-8 pb-8">
          <h2 className="text-lg font-semibold text-foreground mb-1">
            Other Platform Responses
          </h2>
          <p className="text-xs text-muted-foreground mb-5">
            {(focusedResult?.score ?? 0) >= 2
              ? "Sorted safest first — click to expand and see full responses"
              : "Sorted by score — click to expand and see full responses"}
          </p>
          <div className="space-y-3">
            {otherResults.map((r) => (
              <PlatformResponseCard
                key={r.platformId}
                r={r}
                scoredCount={scoredCount}
                allResults={scored}
              />
            ))}
          </div>
        </div>
      )}

      {/* Related Prompts — with platform initials instead of unlabeled dots */}
      {relatedPrompts.length > 0 && (
        <div className="max-w-5xl mx-auto px-6 lg:px-8 pb-8">
          <div className="border-t border-border pt-8">
            <h2 className="text-lg font-semibold text-foreground mb-1">Related Prompts</h2>
            <p className="text-xs text-muted-foreground mb-5">
              Other prompts in the {categoryLabel} category
            </p>

            <div className="space-y-3">
              {relatedPrompts.slice(0, 6).map((rp) => {
                // Compute a quick summary instead of unlabeled dots
                const blocked = rp.scores.filter((s) => s.score !== null && s.score <= 1).length
                const failed = rp.scores.filter((s) => s.score !== null && s.score >= 3).length
                const total = rp.scores.filter((s) => s.score !== null).length

                return (
                  <Link
                    key={rp.id}
                    href={`/ai-safety/prompts/${rp.id}${focusPlatformId ? `?platform=${focusPlatformId}` : ""}`}
                    className="block rounded-lg border border-border bg-card p-4 hover:border-brand-green/30 transition-colors group"
                  >
                    <p className="text-sm text-foreground group-hover:text-brand-green transition-colors line-clamp-1 mb-2">
                      {rp.prompt}
                    </p>
                    <div className="flex items-center gap-3">
                      {/* Labeled score badges with platform initials */}
                      <div className="flex gap-1">
                        {rp.scores.map((s) => {
                          const initial = s.platformName.charAt(0)
                          return (
                            <div
                              key={s.platformId}
                              className={`inline-flex flex-col items-center ${s.platformId === focusPlatformId ? "ring-1 ring-brand-green/50 rounded" : ""}`}
                            >
                              <span
                                className={`inline-flex items-center justify-center w-6 h-6 rounded text-[10px] font-bold ${
                                  s.score !== null ? scoreBg(s.score) : "bg-muted text-muted-foreground"
                                }`}
                                title={`${s.platformName}: ${s.score ?? "N/A"}`}
                              >
                                {s.score ?? "—"}
                              </span>
                              <span className="text-[8px] text-muted-foreground mt-0.5">{initial}</span>
                            </div>
                          )
                        })}
                      </div>
                      {/* Summary text */}
                      <span className="text-[11px] text-muted-foreground">
                        {blocked > 0 && `${blocked}/${total} blocked`}
                        {blocked > 0 && failed > 0 && ", "}
                        {failed > 0 && <span className="text-red-400">{failed} failed</span>}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom prev/next navigation */}
      <div className="max-w-5xl mx-auto px-6 lg:px-8 pb-12">
        <div className="border-t border-border pt-6 flex items-center justify-between">
          {prevPromptId ? (
            <Link
              href={`/ai-safety/prompts/${prevPromptId}${focusPlatformId ? `?platform=${focusPlatformId}` : ""}`}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors p-2 -ml-2 rounded-md hover:bg-muted"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous Prompt
            </Link>
          ) : (
            <div />
          )}
          <Link
            href="/ai-safety/prompts"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            All Prompts
          </Link>
          {nextPromptId ? (
            <Link
              href={`/ai-safety/prompts/${nextPromptId}${focusPlatformId ? `?platform=${focusPlatformId}` : ""}`}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors p-2 -mr-2 rounded-md hover:bg-muted"
            >
              Next Prompt
              <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>
    </div>
  )
}
