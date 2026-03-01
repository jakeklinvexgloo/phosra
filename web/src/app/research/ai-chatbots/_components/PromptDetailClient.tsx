"use client"

import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useCallback, useState, useMemo } from "react"
import Link from "next/link"
import {
  ChevronLeft, ChevronRight, ChevronDown, AlertTriangle,
  Shield, MessageSquare, Info, ExternalLink, X, ArrowRight,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Breadcrumbs } from "./Breadcrumbs"
import { ConversationThread } from "./ConversationThread"
import { ScoreComparisonChart, ScoreStrip } from "./ScoreComparisonChart"
import {
  SCORE_LABELS, SCORE_DESCRIPTIONS, scoreBadge, scoreBg,
  scoreBorder, scoreBarGradient, getScoreColors,
  severityBadgeDark,
} from "./score-utils"

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

/* ─── Computed Insights ─── */
function usePromptInsights(scored: PlatformResult[], focusedResult: PlatformResult | undefined) {
  return useMemo(() => {
    const total = scored.length
    const blocked = scored.filter((r) => (r.score ?? 0) <= 1).length
    const failed = scored.filter((r) => (r.score ?? 0) >= 3).length
    const scores = scored.map((r) => r.score ?? 0)
    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
    const min = Math.min(...scores)
    const max = Math.max(...scores)
    const spread = max - min

    const focusScore = focusedResult?.score ?? 0
    const saferCount = scored.filter((s) => (s.score ?? 0) < focusScore).length
    const rank = saferCount + 1
    const best = scored.reduce((best, r) => ((r.score ?? 0) < (best.score ?? 0) ? r : best), scored[0])

    // Build headline
    let headline = ""
    if (failed > blocked) {
      headline = `${failed} of ${total} platforms provided this content with no guardrails.`
    } else if (blocked > failed) {
      headline = `${blocked} of ${total} platforms blocked this request.`
    } else {
      headline = `Platforms split evenly: ${blocked} blocked, ${failed} failed.`
    }

    // Focused platform context
    let focusContext = ""
    if (focusedResult) {
      if (focusScore <= 1) {
        if (blocked <= 2) focusContext = `${focusedResult.platformName} was one of only ${blocked} to block.`
        else focusContext = `${focusedResult.platformName} joined ${blocked - 1} others in blocking.`
      } else {
        if (failed <= 2) focusContext = `${focusedResult.platformName} was one of only ${failed} that failed.`
        else focusContext = `${focusedResult.platformName} was among the ${failed} that failed.`
      }
    }

    // Spread insight
    let spreadInsight = ""
    if (spread === 0) spreadInsight = "All platforms responded identically."
    else if (spread >= 3) spreadInsight = "Maximum disagreement across platforms."
    else if (spread >= 2) spreadInsight = "Significant variation in platform responses."

    return { total, blocked, failed, avg, spread, rank, best, headline, focusContext, spreadInsight }
  }, [scored, focusedResult])
}

/* ─── Response with Red Flag Highlighting ─── */
function ResponseWithHighlights({ text, redFlags }: { text: string; redFlags: string[] }) {
  if (!redFlags.length) return <p className="whitespace-pre-wrap">{text}</p>

  // Extract keywords from flag labels for matching
  const flagKeywords = redFlags.flatMap((flag) =>
    flag.toLowerCase().split(/\s+/).filter((w) => w.length > 3).slice(0, 3)
  )

  // Split on sentences, highlight ones containing flag keywords
  const sentences = text.split(/(?<=[.!?])\s+/)
  if (sentences.length <= 1) return <p className="whitespace-pre-wrap">{text}</p>

  return (
    <p className="whitespace-pre-wrap">
      {sentences.map((sentence, i) => {
        const lower = sentence.toLowerCase()
        const isHighlighted = flagKeywords.some((kw) => lower.includes(kw))
        if (isHighlighted) {
          return (
            <mark
              key={i}
              className="bg-red-500/[0.07] text-foreground/85 border-b border-red-400/40 px-0.5 -mx-0.5 rounded-sm"
            >
              {sentence}{" "}
            </mark>
          )
        }
        return <span key={i}>{sentence} </span>
      })}
    </p>
  )
}

/* ─── Collapsible Response with Gradient Fade ─── */
function CollapsibleResponse({
  text,
  redFlags,
  threshold = 400,
}: {
  text: string
  redFlags: string[]
  threshold?: number
}) {
  const [expanded, setExpanded] = useState(false)
  const shouldCollapse = text.length > threshold

  return (
    <div className="relative">
      <motion.div
        animate={{ height: expanded || !shouldCollapse ? "auto" : 200 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="overflow-hidden"
      >
        <div className="text-[14px] leading-[1.75] text-foreground/75 max-w-[65ch] selection:bg-brand-green/20">
          <ResponseWithHighlights text={text} redFlags={redFlags} />
        </div>
      </motion.div>

      {shouldCollapse && !expanded && (
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-card via-card/80 to-transparent flex items-end justify-center pb-2">
          <button
            onClick={() => setExpanded(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium text-foreground/70 bg-card border border-border shadow-sm hover:shadow-md hover:border-foreground/20 transition-all duration-200"
          >
            <ChevronDown className="w-3 h-3" />
            Read full response
          </button>
        </div>
      )}

      {shouldCollapse && expanded && (
        <button
          onClick={() => setExpanded(false)}
          className="mt-4 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronDown className="w-3 h-3 rotate-180" />
          Collapse
        </button>
      )}
    </div>
  )
}

/* ─── Hero Platform Card ─── */
function HeroPlatformCard({
  r,
  scoredCount,
  allResults,
}: {
  r: PlatformResult
  scoredCount: number
  allResults: PlatformResult[]
}) {
  const score = r.score ?? 0
  const colors = getScoreColors(score)
  const saferCount = allResults.filter((s) => (s.score ?? 0) < score).length
  const rank = saferCount + 1
  const rankText = rank === 1
    ? "Safest response across all platforms"
    : `Ranked ${rank}${rank === 2 ? "nd" : rank === 3 ? "rd" : "th"} of ${scoredCount} platforms (lower is safer)`

  return (
    <div className="relative">
      {/* Gradient border wrapper */}
      <div className={`absolute -inset-px rounded-2xl bg-gradient-to-b ${colors.border.replace("border-", "from-").replace("/30", "/20")} to-transparent`} />
      <div className="relative rounded-2xl bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)]">
        {/* Top glow line */}
        <div className={`absolute inset-x-0 top-0 h-px rounded-t-2xl bg-gradient-to-r from-transparent ${colors.border.replace("border-", "via-").replace("/30", "/40")} to-transparent`} />

        <div className="p-6">
          {/* Header row */}
          <div className="flex items-start gap-4 mb-6">
            {/* Score badge — large with glow */}
            <motion.span
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 25, delay: 0.2 }}
              className={`inline-flex items-center justify-center flex-shrink-0 w-14 h-14 rounded-xl text-xl font-bold tabular-nums ${scoreBadge(score)} ${colors.glow}`}
            >
              {r.score}
            </motion.span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href={`/research/ai-chatbots/${r.platformId}`}
                  className="font-display text-lg font-semibold text-foreground hover:text-brand-green transition-colors"
                >
                  {r.platformName}
                </Link>
                <span className={`text-xs font-medium ${colors.text}`}>
                  {SCORE_LABELS[score] ?? `Score ${score}`}
                </span>
                {r.isMultiTurn && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <MessageSquare className="w-2.5 h-2.5" />
                    Multi-turn
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground/60 mt-1">{rankText}</p>
            </div>
            <Link
              href={`/research/ai-chatbots/${r.platformId}`}
              className="inline-flex items-center gap-1 text-[11px] text-brand-green hover:underline flex-shrink-0"
            >
              Full report
              <ExternalLink className="w-2.5 h-2.5" />
            </Link>
          </div>

          {/* Analyst Assessment — promoted, no box wrapper */}
          {r.notes && (
            <div className={`border-l-2 ${colors.border} pl-4 mb-6`}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-widest">Safety Assessment</span>
                <div className="flex-1 h-px bg-border/40" />
              </div>
              <p className="text-[14px] text-foreground/70 leading-[1.7]">{r.notes}</p>
            </div>
          )}

          {/* Red flags */}
          {score > 0 && r.redFlags.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2.5">
                <span className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-widest">Red Flags</span>
                <div className="flex-1 h-px bg-border/40" />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {r.redFlags.map((flag, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-red-500/[0.07] text-red-400 border border-red-500/15"
                  >
                    <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                    {flag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Response text */}
          {r.isMultiTurn && r.conversationTurns && r.conversationTurns.length > 0 ? (
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-widest">Conversation</span>
                <div className="flex-1 h-px bg-border/40" />
              </div>
              <ConversationThread turns={r.conversationTurns} escalationTurn={r.escalationTurn} />
            </div>
          ) : r.response ? (
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-widest">{r.platformName}&apos;s Response</span>
                <div className="flex-1 h-px bg-border/40" />
              </div>
              <div className="rounded-xl bg-muted/[0.06] border border-border/40 overflow-hidden">
                {/* Source bar */}
                <div className="flex items-center gap-2 px-5 py-2 border-b border-border/30 bg-muted/20">
                  <span className={`w-2 h-2 rounded-full ${getScoreColors(score).dot}`} />
                  <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-widest">
                    Platform output
                  </span>
                </div>
                <div className="px-5 py-4">
                  <CollapsibleResponse text={r.response} redFlags={r.redFlags} threshold={600} />
                </div>
              </div>
            </div>
          ) : null}

          {/* Score definition */}
          <p className="text-[11px] text-muted-foreground/50 italic mt-5">
            Score {score}: {SCORE_DESCRIPTIONS[score]}
          </p>
        </div>
      </div>
    </div>
  )
}

/* ─── Collapsed Platform Card (for "Other Platforms") ─── */
function CollapsedPlatformCard({
  r,
  scoredCount,
  allResults,
  index,
}: {
  r: PlatformResult
  scoredCount: number
  allResults: PlatformResult[]
  index: number
}) {
  const [expanded, setExpanded] = useState(false)
  const score = r.score ?? 0
  const colors = getScoreColors(score)
  const saferCount = allResults.filter((s) => (s.score ?? 0) < score).length
  const rank = saferCount + 1
  const rankText = rank === 1
    ? "Safest response"
    : `Ranked ${rank}${rank === 2 ? "nd" : rank === 3 ? "rd" : "th"} of ${scoredCount}`

  // First sentence of notes for hover preview
  const notePreview = r.notes ? r.notes.split(/[.!?]\s/)[0] + (r.notes.includes(".") ? "." : "") : ""

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
    >
      <div className={`
        rounded-xl overflow-hidden transition-all duration-200
        ${expanded
          ? "bg-card border border-border shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
          : "bg-card/50 border border-border/60 shadow-sm hover:shadow-md hover:border-border hover:-translate-y-0.5"
        }
      `}>
        {/* Thin score accent line */}
        <div className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl ${colors.bar}`} />

        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full text-left flex items-center gap-3 px-5 py-3.5 group"
        >
          <span className={`inline-flex items-center justify-center flex-shrink-0 w-9 h-9 rounded-lg text-sm font-bold tabular-nums transition-transform duration-200 group-hover:scale-110 ${scoreBadge(score)}`}>
            {r.score}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Link
                href={`/research/ai-chatbots/${r.platformId}`}
                onClick={(e) => e.stopPropagation()}
                className="font-display text-sm font-semibold text-foreground hover:text-brand-green transition-colors"
              >
                {r.platformName}
              </Link>
              <span className={`text-[11px] font-medium ${colors.text}`}>
                {SCORE_LABELS[score]}
              </span>
              {r.isMultiTurn && (
                <span className="text-[10px] text-blue-400 flex items-center gap-0.5">
                  <MessageSquare className="w-2.5 h-2.5" />
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground/50 mt-0.5">{rankText}</p>
          </div>
          <ChevronDown className={`w-4 h-4 text-muted-foreground/40 flex-shrink-0 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
        </button>

        {/* Expanded content */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 pt-1 space-y-4 border-t border-border/30">
                {r.notes && (
                  <div className={`border-l-2 ${colors.border} pl-3 mt-3`}>
                    <p className="text-[13px] text-foreground/65 leading-relaxed">{r.notes}</p>
                  </div>
                )}

                {score > 0 && r.redFlags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {r.redFlags.map((flag, i) => (
                      <span key={i} className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-lg bg-red-500/[0.06] text-red-400 border border-red-500/15">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        {flag}
                      </span>
                    ))}
                  </div>
                )}

                {r.isMultiTurn && r.conversationTurns && r.conversationTurns.length > 0 ? (
                  <ConversationThread turns={r.conversationTurns} escalationTurn={r.escalationTurn} />
                ) : r.response ? (
                  <div className="rounded-lg bg-muted/[0.04] border border-border/30 p-4">
                    <CollapsibleResponse text={r.response} redFlags={r.redFlags} threshold={300} />
                  </div>
                ) : null}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

/* ─── Related Prompt Card ─── */
function RelatedPromptCard({
  rp,
  focusPlatformId,
  index,
}: {
  rp: RelatedPrompt
  focusPlatformId: string | undefined
  index: number
}) {
  const blocked = rp.scores.filter((s) => s.score !== null && s.score <= 1).length
  const failed = rp.scores.filter((s) => s.score !== null && s.score >= 3).length
  const total = rp.scores.filter((s) => s.score !== null).length
  const focusedScore = rp.scores.find((s) => s.platformId === focusPlatformId)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
    >
      <Link
        href={`/research/ai-chatbots/prompts/${rp.id}${focusPlatformId ? `?platform=${focusPlatformId}` : ""}`}
        className="group block relative"
      >
        <div className="relative rounded-xl overflow-hidden border border-border/60 bg-card shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:border-border group-hover:-translate-y-0.5">
          {/* Top accent: gradient colored by safety outcome */}
          <div className={`h-[2px] ${
            failed > 0
              ? "bg-gradient-to-r from-red-500/50 via-orange-500/40 to-red-500/50"
              : "bg-gradient-to-r from-emerald-500/30 via-blue-500/30 to-emerald-500/30"
          }`} />

          <div className="px-5 py-4">
            {/* Prompt text — 2 lines */}
            <p className="text-sm text-foreground font-medium leading-snug group-hover:text-brand-green transition-colors duration-200 line-clamp-2 mb-3">
              {rp.prompt}
            </p>

            {/* Score visualization + summary */}
            <div className="flex items-center gap-4">
              <ScoreStrip scores={rp.scores} focusPlatformId={focusPlatformId} />

              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                {blocked > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {blocked}/{total} blocked
                  </span>
                )}
                {failed > 0 && (
                  <span className="flex items-center gap-1 text-red-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    {failed} failed
                  </span>
                )}
              </div>

              {/* Focused platform score callout */}
              {focusedScore && focusedScore.score !== null && (
                <div className="ml-auto flex items-center gap-1.5 flex-shrink-0">
                  <span className={`inline-flex items-center justify-center w-5 h-5 rounded text-[9px] font-bold ${scoreBg(focusedScore.score)}`}>
                    {focusedScore.score}
                  </span>
                  <span className="text-[10px] text-muted-foreground hidden sm:inline">
                    {focusedScore.platformName}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Hover arrow */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">
            <ArrowRight className="w-4 h-4 text-brand-green" />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

/* ─── Staggered Section Wrapper ─── */
const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
}
const staggerItem = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
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

  const scored = platformResults.filter((r) => r.score !== null)
  const scoredCount = scored.length

  const focusedResult = focusPlatformId
    ? scored.find((r) => r.platformId === focusPlatformId) ?? scored[0]
    : scored[0]

  const insights = usePromptInsights(scored, focusedResult)

  const switchPlatform = useCallback((platformId: string) => {
    router.replace(`${pathname}?platform=${platformId}`, { scroll: false })
  }, [router, pathname])

  const clearPlatformFocus = useCallback(() => {
    router.replace(pathname, { scroll: false })
  }, [router, pathname])

  // Other platforms sorted for contrast
  const otherResults = scored
    .filter((r) => r.platformId !== focusedResult?.platformId)
    .sort((a, b) => (a.score ?? 0) - (b.score ?? 0))

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* ─── Sticky Nav ─── */}
      <div className="sticky top-[calc(3.5rem+37px)] z-30 bg-background/95 backdrop-blur-sm border-b border-border/80">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-2 flex items-center justify-between gap-2">
          <div className="flex items-center">
            {prevPromptId ? (
              <Link
                href={`/research/ai-chatbots/prompts/${prevPromptId}${focusPlatformId ? `?platform=${focusPlatformId}` : ""}`}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors p-1.5 -ml-1.5 rounded-md hover:bg-muted"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
              </Link>
            ) : (
              <span className="text-xs text-muted-foreground/40 p-1.5"><ChevronLeft className="w-4 h-4" /></span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {focusPlatformId && focusedResult ? (
              <span className="inline-flex items-center gap-1.5">
                <span className="font-medium text-foreground">{focusedResult.platformName}</span>
                <span>&middot;</span>
                <span>Prompt {currentIndex + 1} of {totalPrompts}</span>
                <button onClick={clearPlatformFocus} className="ml-1 p-1 rounded hover:bg-muted transition-colors" aria-label="Show all platforms">
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
                href={`/research/ai-chatbots/prompts/${nextPromptId}${focusPlatformId ? `?platform=${focusPlatformId}` : ""}`}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors p-1.5 -mr-1.5 rounded-md hover:bg-muted"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <span className="text-xs text-muted-foreground/40 p-1.5"><ChevronRight className="w-4 h-4" /></span>
            )}
          </div>
        </div>
      </div>

      {/* ─── Hero Header ─── */}
      <motion.section variants={staggerItem} className="bg-gradient-to-br from-[#0D1B2A] via-[#0F2035] to-[#0A1628] text-white">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-10">
          <Breadcrumbs
            items={[
              { label: "AI Safety", href: "/research/ai-chatbots" },
              { label: "Prompts", href: "/research/ai-chatbots/prompts" },
              { label: `Prompt #${currentIndex + 1}` },
            ]}
          />

          <div className="flex flex-wrap gap-2 mb-4">
            <Link
              href={`/research/ai-chatbots/categories/${category}`}
              className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-white/10 text-white/70 hover:bg-white/15 transition-colors border border-white/10"
            >
              {categoryLabel}
            </Link>
            <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full border ${severityBadgeDark(severity)}`}>
              <AlertTriangle className="w-2.5 h-2.5" />
              Prompt risk: {severity}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold leading-snug tracking-tight mb-4">
            &ldquo;{promptText}&rdquo;
          </h1>

          {/* Headline verdict */}
          <p className="text-base sm:text-lg font-medium text-white/90 mb-1">
            {insights.headline}
          </p>
          {insights.focusContext && (
            <p className="text-sm text-white/50">{insights.focusContext}</p>
          )}

          {/* Expected response */}
          <div className="flex items-start gap-2 text-sm text-white/40 mt-5 pt-4 border-t border-white/10">
            <Shield className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">Expected: </span>
              <span className="text-white/50">{expected}</span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ─── Score Comparison Chart ─── */}
      <motion.div variants={staggerItem} className="max-w-5xl mx-auto px-6 lg:px-8 pt-8 pb-2">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-widest">Platform Comparison</span>
          <div className="flex-1 h-px bg-border/40" />
          {insights.spreadInsight && (
            <span className="text-[11px] text-muted-foreground/50">{insights.spreadInsight}</span>
          )}
        </div>
        <ScoreComparisonChart
          results={scored}
          focusedPlatformId={focusedResult?.platformId}
          onSelectPlatform={switchPlatform}
        />
      </motion.div>

      {/* ─── Focused Platform Response ─── */}
      <AnimatePresence mode="wait">
        {focusedResult && (
          <motion.div
            key={focusedResult.platformId}
            initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="max-w-5xl mx-auto px-6 lg:px-8 py-8"
          >
            <h2 className="font-display text-lg font-semibold tracking-tight text-foreground mb-5">
              {focusedResult.platformName}&rsquo;s Response
            </h2>
            <HeroPlatformCard
              r={focusedResult}
              scoredCount={scoredCount}
              allResults={scored}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Other Platforms ─── */}
      {otherResults.length > 0 && (
        <motion.div variants={staggerItem} className="max-w-5xl mx-auto px-6 lg:px-8 pb-10">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-widest">Other Platform Responses</span>
            <div className="flex-1 h-px bg-border/40" />
            <span className="text-[11px] text-muted-foreground/50">
              {(focusedResult?.score ?? 0) >= 2 ? "Safest first" : "By score"} &middot; Click to expand
            </span>
          </div>
          <div className="space-y-2.5">
            {otherResults.map((r, i) => (
              <CollapsedPlatformCard
                key={r.platformId}
                r={r}
                scoredCount={scoredCount}
                allResults={scored}
                index={i}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* ─── Related Prompts ─── */}
      {relatedPrompts.length > 0 && (
        <motion.div variants={staggerItem} className="max-w-5xl mx-auto px-6 lg:px-8 pb-10">
          {/* Gradient divider */}
          <div className="relative py-8">
            <div className="absolute inset-x-0 top-1/2 h-px">
              <div className="mx-auto max-w-xs h-full bg-gradient-to-r from-transparent via-border to-transparent" />
            </div>
          </div>

          <h2 className="font-display text-lg font-semibold tracking-tight text-foreground mb-1">
            Related Prompts
          </h2>
          <p className="text-xs text-muted-foreground mb-6">
            Other prompts in the {categoryLabel} category
          </p>

          <div className="space-y-3">
            {relatedPrompts.slice(0, 6).map((rp, i) => (
              <RelatedPromptCard
                key={rp.id}
                rp={rp}
                focusPlatformId={focusPlatformId ?? undefined}
                index={i}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* ─── Bottom Navigation ─── */}
      <div className="max-w-5xl mx-auto px-6 lg:px-8 pb-12">
        <div className="border-t border-border/40 pt-6 flex items-center justify-between">
          {prevPromptId ? (
            <Link
              href={`/research/ai-chatbots/prompts/${prevPromptId}${focusPlatformId ? `?platform=${focusPlatformId}` : ""}`}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors p-2 -ml-2 rounded-md hover:bg-muted"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous Prompt
            </Link>
          ) : <div />}
          <Link
            href="/research/ai-chatbots/prompts"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            All Prompts
          </Link>
          {nextPromptId ? (
            <Link
              href={`/research/ai-chatbots/prompts/${nextPromptId}${focusPlatformId ? `?platform=${focusPlatformId}` : ""}`}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors p-2 -mr-2 rounded-md hover:bg-muted"
            >
              Next Prompt
              <ChevronRight className="w-4 h-4" />
            </Link>
          ) : <div />}
        </div>
      </div>
    </motion.div>
  )
}
