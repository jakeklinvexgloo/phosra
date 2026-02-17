"use client"

import { useEffect, useRef, useMemo, useState, useCallback } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, isToolUIPart, getToolName } from "ai"
import { motion, AnimatePresence } from "framer-motion"
import { ExternalLink, RotateCcw, Loader2, CheckCircle2, XCircle, AlertCircle, ArrowRight, X, ChevronDown } from "lucide-react"
import Link from "next/link"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { useHeroSession } from "./useHeroSession"
import type { ToolCallInfo } from "@/lib/playground/types"
import { type EntityMap, extractEntities, summarizeToolCall, annotateInput, formatPlatformId, PLATFORM_DISPLAY_NAMES } from "@/lib/playground/entity-registry"

interface HeroSandboxChatProps {
  prompt: string
  onClose: () => void
  onTryAnother: () => void
}

/* ── Entity type badge colors (dark theme) ──────────────────────── */

const ENTITY_COLORS: Record<string, string> = {
  child: "bg-purple-500/20 text-purple-300",
  family: "bg-blue-500/20 text-blue-300",
  policy: "bg-amber-500/20 text-amber-300",
  enforcement_job: "bg-green-500/20 text-green-300",
  platform_link: "bg-cyan-500/20 text-cyan-300",
  rule: "bg-rose-500/20 text-rose-300",
  webhook: "bg-orange-500/20 text-orange-300",
}

/* ── Platform upsell detection ─────────────────────────────────── */

interface UpsellDetection {
  isUpsell: boolean
  platformIds: string[]
  childName: string | null
}

// Build reverse map sorted by display name length descending (so "YouTube TV" matches before "YouTube")
const REVERSE_PLATFORM_MAP: [string, string][] = Object.entries(PLATFORM_DISPLAY_NAMES)
  .map(([id, display]) => [display.toLowerCase(), id] as [string, string])
  .sort((a, b) => b[0].length - a[0].length)

function detectPlatformUpsell(
  text: string,
  entities: EntityMap,
  toolCalls: ToolCallInfo[],
): UpsellDetection {
  const empty: UpsellDetection = { isUpsell: false, platformIds: [], childName: null }

  // Must specifically be an offer to push/expand to other platforms
  // Tighter pattern: look for "push", "apply", "expand" near "platform/protection/rule" + question mark
  const hasOffer = /(?:push|apply|expand|enforce)[\s\S]*(?:platform|protection|service|device|rule)[\s\S]*\?/i.test(text)
    || /(?:would you like|want me to|interested in)[\s\S]*(?:push|apply|expand|enforce|protection)/i.test(text)
  if (!hasOffer) return empty

  // Scan for platform display names
  const textLower = text.toLowerCase()
  const found: string[] = []
  for (const [display, id] of REVERSE_PLATFORM_MAP) {
    if (textLower.includes(display) && !found.includes(id)) {
      found.push(id)
    }
  }

  if (found.length < 2) return empty

  // Collect ALL platforms from ALL completed trigger_enforcement calls
  const allEnforced = new Set<string>()
  for (const tc of toolCalls) {
    if (tc.name === "trigger_enforcement" && tc.status === "complete") {
      const ids = tc.input?.platform_ids as string[] | undefined
      if (ids?.length) {
        ids.forEach(id => allEnforced.add(id))
      } else {
        // No platform_ids means it pushed to ALL platforms — nothing left to upsell
        return empty
      }
    }
  }
  const upsellPlatforms = allEnforced.size > 0
    ? found.filter(id => !allEnforced.has(id))
    : found

  if (upsellPlatforms.length < 2) return empty

  // Find the child name from entities
  let childName: string | null = null
  entities.forEach((entity) => {
    if (entity.type === "child") childName = entity.label
  })

  return {
    isUpsell: true,
    platformIds: upsellPlatforms,
    childName,
  }
}

/* ── PlatformActionPanel ──────────────────────────────────────── */

function PlatformActionPanel({
  platformIds,
  childName,
  onPush,
  onPushAll,
  disabled,
}: {
  platformIds: string[]
  childName: string | null
  onPush: (platformId: string) => void
  onPushAll: () => void
  disabled: boolean
}) {
  const [clicked, setClicked] = useState<Set<string>>(() => new Set())
  const [allClicked, setAllClicked] = useState(false)

  const handlePush = (id: string) => {
    if (clicked.has(id) || allClicked || disabled) return
    setClicked(prev => new Set(prev).add(id))
    onPush(id)
  }

  const handlePushAll = () => {
    if (allClicked || disabled) return
    setAllClicked(true)
    onPushAll()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: 0.1 }}
      className="mt-3 bg-white/[0.04] border border-white/[0.08] rounded-xl p-3 space-y-2.5"
    >
      <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">
        Expand protection
      </p>
      <div className="flex flex-wrap gap-1.5">
        {platformIds.map((id) => {
          const isDone = clicked.has(id) || allClicked
          const isWaiting = isDone && disabled
          return (
            <button
              key={id}
              onClick={() => handlePush(id)}
              disabled={isDone || disabled}
              className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-all ${
                isDone
                  ? "bg-brand-green/10 text-brand-green/60 cursor-default"
                  : "bg-white/[0.06] hover:bg-white/[0.10] text-white/70 hover:text-white/90"
              }`}
            >
              <span>{formatPlatformId(id)}</span>
              {isWaiting ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : isDone ? (
                <CheckCircle2 className="w-3 h-3" />
              ) : (
                <ArrowRight className="w-3 h-3 opacity-40" />
              )}
            </button>
          )
        })}
        {/* Enforce All */}
        <button
          onClick={handlePushAll}
          disabled={allClicked || disabled}
          className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
            allClicked
              ? "bg-brand-green/10 text-brand-green/60 cursor-default"
              : "bg-brand-green/10 text-brand-green hover:bg-brand-green/20 border border-brand-green/20"
          }`}
        >
          {allClicked ? (
            <>
              {disabled ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
              <span>All pushed</span>
            </>
          ) : (
            <>
              <span>Enforce all</span>
              <ArrowRight className="w-3 h-3" />
            </>
          )}
        </button>
      </div>
    </motion.div>
  )
}

/* ── describeToolResult ─────────────────────────────────────────── */

function describeToolResult(toolName: string, result: unknown, entities: EntityMap): string {
  if (!result) return "No response."

  const data = result as Record<string, unknown>
  const arr = Array.isArray(result) ? result : null

  switch (toolName) {
    case "get_current_user": {
      const name = data.name || data.email || "user"
      return `Signed in as ${name}.`
    }
    case "quick_setup": {
      const child = data.child as Record<string, unknown> | undefined
      const policy = data.policy as Record<string, unknown> | undefined
      const platforms = data.platforms_connected as unknown[] | undefined
      const childName = child?.name || "child"
      const ageGroup = child?.age_group ? ` (${child.age_group})` : ""
      const ruleCount = policy?.rules_count || (data.rules as unknown[])?.length || ""
      const platCount = platforms?.length || 0
      const parts = [`${childName}${ageGroup} set up with age-appropriate protections.`]
      if (ruleCount) parts.push(`Policy created with ${ruleCount} rules.`)
      if (platCount) parts.push(`${platCount} platforms connected.`)
      return parts.join(" ")
    }
    case "list_families": {
      if (arr) {
        if (arr.length === 0) return "No families found."
        const names = arr.slice(0, 3).map((f: Record<string, unknown>) => f.name).filter(Boolean)
        return `Found ${arr.length} ${arr.length === 1 ? "family" : "families"}${names.length ? ": " + names.join(", ") : ""}.`
      }
      return "Families retrieved."
    }
    case "create_family":
      return `Created family "${data.name || ""}".`
    case "get_family":
      return data.name ? `${data.name} loaded.` : "Family details retrieved."
    case "update_family":
      return `Family updated${data.name ? ` to "${data.name}"` : ""}.`
    case "delete_family":
      return "Family deleted."
    case "list_family_members": {
      if (arr) {
        if (arr.length === 0) return "No members found."
        return `Found ${arr.length} ${arr.length === 1 ? "member" : "members"}.`
      }
      return "Members retrieved."
    }
    case "add_family_member":
      return `Member added${data.role ? ` as ${data.role}` : ""}.`
    case "remove_family_member":
      return "Member removed."
    case "list_children": {
      if (arr) {
        if (arr.length === 0) return "No children found."
        const names = arr.map((c: Record<string, unknown>) => {
          const age = c.age_group ? ` (${c.age_group})` : ""
          return `${c.name}${age}`
        })
        return `Found ${arr.length} ${arr.length === 1 ? "child" : "children"}: ${names.join(", ")}.`
      }
      return "Children retrieved."
    }
    case "create_child": {
      const name = data.name || "Child"
      const ageGroup = data.age_group ? ` (${data.age_group})` : ""
      return `Added ${name}${ageGroup} to the family.`
    }
    case "get_child": {
      const name = data.name || "Child"
      const ageGroup = data.age_group ? `, ${data.age_group}` : ""
      return `${name}${ageGroup} details loaded.`
    }
    case "update_child":
      return "Child profile updated."
    case "delete_child":
      return "Child and all policies deleted."
    case "get_child_age_ratings": {
      if (data.ratings && typeof data.ratings === "object") {
        return `Age-appropriate ratings retrieved across all rating systems.`
      }
      return "Age ratings retrieved."
    }
    case "list_policies": {
      if (arr) {
        if (arr.length === 0) return "No policies found."
        const active = arr.filter((p: Record<string, unknown>) => p.status === "active").length
        return `Found ${arr.length} ${arr.length === 1 ? "policy" : "policies"}${active ? ` (${active} active)` : ""}.`
      }
      return "Policies retrieved."
    }
    case "create_policy":
      return `Created "${data.name || "policy"}" policy (${data.status || "draft"}).`
    case "get_policy":
      return `${data.name || "Policy"} — ${data.status || "unknown status"}.`
    case "update_policy":
      return "Policy updated."
    case "delete_policy":
      return "Policy and all rules deleted."
    case "activate_policy":
      return "Policy activated. Rules are now enforceable."
    case "pause_policy":
      return "Policy paused. Enforcement suspended."
    case "generate_rules_from_age": {
      const rules = data.rules as unknown[] | undefined
      const count = rules?.length || data.rules_count
      return count ? `Generated ${count} age-appropriate rules.` : "Age-based rules generated."
    }
    case "list_rules": {
      if (arr) {
        if (arr.length === 0) return "No rules in this policy."
        const enabled = arr.filter((r: Record<string, unknown>) => r.enabled).length
        return `Found ${arr.length} rules (${enabled} enabled).`
      }
      return "Rules retrieved."
    }
    case "create_rule": {
      const cat = data.category ? formatCategory(String(data.category)) : "rule"
      return `Created ${cat} rule.`
    }
    case "bulk_upsert_rules": {
      const rules = data.rules as unknown[] | undefined
      const count = rules?.length || data.count
      return count ? `Updated ${count} rules.` : "Rules updated."
    }
    case "update_rule":
      return "Rule updated."
    case "delete_rule":
      return "Rule deleted."
    case "list_platforms": {
      if (arr) return `Found ${arr.length} supported platforms.`
      return "Platforms retrieved."
    }
    case "get_platform": {
      const name = data.name || data.platform_id || "Platform"
      const cat = data.category ? ` (${data.category})` : ""
      return `${name}${cat} details loaded.`
    }
    case "list_platforms_by_category": {
      if (arr) return `Found ${arr.length} platforms in this category.`
      return "Platforms retrieved."
    }
    case "list_platforms_by_capability": {
      if (arr) return `Found ${arr.length} platforms with this capability.`
      return "Platforms retrieved."
    }
    case "list_compliance_links": {
      if (arr) {
        const verified = arr.filter((l: Record<string, unknown>) => l.status === "verified").length
        return `${arr.length} platforms connected${verified ? `, ${verified} verified` : ""}.`
      }
      return "Connected platforms retrieved."
    }
    case "connect_platform": {
      const plat = data.platform_id ? formatPlatformId(String(data.platform_id)) : "Platform"
      return `${plat} connected${data.status === "verified" ? " and verified" : ""}.`
    }
    case "disconnect_platform":
      return "Platform disconnected."
    case "verify_connection":
      return data.status === "verified" ? "Connection verified \u2014 credentials valid." : `Connection status: ${data.status || "unknown"}.`
    case "trigger_enforcement": {
      const status = data.status || "running"
      return `Enforcement job ${status}. Rules are being pushed to connected platforms.`
    }
    case "list_enforcement_jobs": {
      if (arr) {
        if (arr.length === 0) return "No enforcement history."
        const completed = arr.filter((j: Record<string, unknown>) => j.status === "completed").length
        return `Found ${arr.length} ${arr.length === 1 ? "job" : "jobs"}${completed ? ` (${completed} completed)` : ""}.`
      }
      return "Enforcement jobs retrieved."
    }
    case "get_enforcement_job": {
      const status = data.status || "unknown"
      if (status === "completed") return "Job completed \u2014 all platforms enforced successfully."
      if (status === "running") return "Job running \u2014 enforcement in progress."
      if (status === "failed") return "Job failed \u2014 one or more platforms had errors."
      if (status === "partial") return "Job partially completed \u2014 some platforms had errors."
      return `Job status: ${status}.`
    }
    case "get_enforcement_results": {
      if (arr && arr.length > 0) {
        const summaries = arr.slice(0, 4).map((r: Record<string, unknown>) => {
          const plat = r.platform_id ? formatPlatformId(String(r.platform_id)) : "Platform"
          const applied = Number(r.rules_applied ?? 0)
          const failed = Number(r.rules_failed ?? 0)
          if (failed > 0) return `${plat}: ${applied} applied, ${failed} failed`
          return `${plat}: ${applied} applied`
        })
        const remaining = arr.length > 4 ? ` (+${arr.length - 4} more)` : ""
        return summaries.join(". ") + remaining + "."
      }
      return "Enforcement results retrieved."
    }
    case "retry_enforcement":
      return "Enforcement job restarted."
    case "list_rating_systems": {
      if (arr) return `${arr.length} rating systems available.`
      return "Rating systems retrieved."
    }
    case "get_ratings_for_age":
      return "Age-appropriate ratings retrieved across all systems."
    case "convert_rating":
      return "Cross-system rating conversion retrieved."
    case "family_overview_report":
      return "Family overview report generated."
    case "list_webhooks": {
      if (arr) return `Found ${arr.length} webhook ${arr.length === 1 ? "subscription" : "subscriptions"}.`
      return "Webhooks retrieved."
    }
    case "create_webhook":
      return `Webhook registered${data.url ? ` for ${data.url}` : ""}.`
    case "test_webhook":
      return "Test delivery sent."
    default:
      return "Completed."
  }
}

function formatCategory(category: string): string {
  return category.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

/* ── Main Component ─────────────────────────────────────────────── */

export function HeroSandboxChat({ prompt, onClose, onTryAnother }: HeroSandboxChatProps) {
  const { sessionId, isReady, error: sessionError, reset } = useHeroSession()
  const scrollRef = useRef<HTMLDivElement>(null)
  const replyInputRef = useRef<HTMLInputElement>(null)
  const hasSentRef = useRef(false)
  const [toolCalls, setToolCalls] = useState<ToolCallInfo[]>([])
  const [entities, setEntities] = useState<EntityMap>(() => new Map())
  const [replyText, setReplyText] = useState("")
  const [selectedToolCallId, setSelectedToolCallId] = useState<string | null>(null)

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/playground/chat",
        body: { sessionId },
      }),
    [sessionId]
  )

  const { messages, sendMessage, status, error: chatError } = useChat({ transport })
  const isLoading = status === "streaming" || status === "submitted"
  const isDone = !isLoading && messages.length > 1

  // Derive selected tool call
  const selectedToolCall = selectedToolCallId
    ? toolCalls.find((tc) => tc.id === selectedToolCallId) ?? null
    : null

  // Extract tool calls and entities from messages
  useEffect(() => {
    const newToolCalls: ToolCallInfo[] = []
    const newEntities: EntityMap = new Map()
    for (const msg of messages) {
      if (msg.role !== "assistant") continue
      for (const part of msg.parts) {
        if (isToolUIPart(part)) {
          const tc: ToolCallInfo = {
            id: part.toolCallId,
            name: getToolName(part),
            input: (part.input ?? {}) as Record<string, unknown>,
            status:
              part.state === "output-available"
                ? "complete"
                : part.state === "output-error"
                  ? "error"
                  : part.state === "input-available" || part.state === "input-streaming"
                    ? "running"
                    : "pending",
          }
          if (part.state === "output-available") {
            tc.result = part.output
            extractEntities(getToolName(part), part.output, newEntities)
          }
          newToolCalls.push(tc)
        }
      }
    }
    setToolCalls(newToolCalls)
    setEntities(newEntities)
  }, [messages])

  // Auto-send the prompt once setup is ready
  useEffect(() => {
    if (isReady && !hasSentRef.current && prompt) {
      hasSentRef.current = true
      sendMessage({ text: prompt })
    }
  }, [isReady, prompt, sendMessage])

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, toolCalls])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      reset()
    }
  }, [reset])

  // Auto-focus reply input when AI finishes responding
  useEffect(() => {
    if (isDone && replyInputRef.current) {
      replyInputRef.current.focus()
    }
  }, [isDone])

  // Handle reply submission
  const handleReply = useCallback(() => {
    const text = replyText.trim()
    if (!text || isLoading) return
    sendMessage({ text })
    setReplyText("")
  }, [replyText, isLoading, sendMessage])

  // Extract text from assistant message parts
  const getTextContent = (msg: typeof messages[0]) =>
    msg.parts
      .filter((p): p is Extract<typeof p, { type: "text" }> => p.type === "text")
      .map((p) => p.text)
      .join("")

  // Find last assistant index for streaming cursor
  const lastAssistantIndex = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "assistant") return i
    }
    return -1
  })()

  return (
    <div className="flex flex-col h-full max-h-[85vh] relative">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-3 border-b border-white/[0.06] flex-shrink-0">
        <img src="/favicon.svg" alt="" className="w-4 h-4" />
        <span className="text-xs font-medium text-white/60">Phosra AI</span>
        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-brand-green/10 text-brand-green border border-brand-green/20">
          LIVE
        </span>
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse flex-shrink-0" />
      </div>

      {/* Chat messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-0">
        {/* Setup loading state */}
        {!isReady && !sessionError && (
          <div className="flex items-center gap-2 text-xs text-white/40">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Setting up sandbox environment...
          </div>
        )}

        {/* Setup error */}
        {sessionError && (
          <div className="flex items-center gap-2 text-xs text-red-400">
            <AlertCircle className="w-3.5 h-3.5" />
            {sessionError.message}
          </div>
        )}

        {/* Messages */}
        {messages.map((msg, i) => {
          const isUser = msg.role === "user"
          const text = getTextContent(msg)
          const msgToolParts = msg.parts.filter(isToolUIPart)
          const isStreaming = isLoading && i === lastAssistantIndex

          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {isUser ? (
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl bg-white/[0.08] px-4 py-2.5 text-sm text-white/90 leading-relaxed">
                    {text}
                  </div>
                </div>
              ) : (
                <div className="text-sm leading-relaxed text-white/80">
                  {text && (
                    <div className="prose prose-invert prose-sm max-w-none
                      prose-p:my-1.5 prose-p:leading-relaxed prose-p:text-white/80
                      prose-headings:text-white/90 prose-headings:text-sm prose-headings:font-semibold
                      prose-strong:text-white/90 prose-strong:font-semibold
                      prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5 prose-li:text-white/80
                      prose-code:text-xs prose-code:bg-white/[0.08] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-brand-green prose-code:before:content-none prose-code:after:content-none
                      prose-a:text-brand-green prose-a:no-underline hover:prose-a:underline
                      [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {text}
                      </ReactMarkdown>
                      {isStreaming && (
                        <span className="inline-block w-[2px] h-[1em] bg-white/40 animate-pulse ml-0.5 align-text-bottom rounded-full" />
                      )}
                    </div>
                  )}
                  {isStreaming && !text && (
                    <span className="inline-block w-[2px] h-[1em] bg-white/40 animate-pulse rounded-full" />
                  )}

                  {/* Tool call badges — now clickable */}
                  {msgToolParts.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {msgToolParts.map((tp) => {
                        const toolStatus =
                          tp.state === "output-available"
                            ? "complete"
                            : tp.state === "output-error"
                              ? "error"
                              : tp.state === "input-available" || tp.state === "input-streaming"
                                ? "running"
                                : "pending"
                        const isSelected = selectedToolCallId === tp.toolCallId
                        return (
                          <button
                            key={tp.toolCallId}
                            onClick={() =>
                              setSelectedToolCallId(isSelected ? null : tp.toolCallId)
                            }
                            className={`inline-flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-full transition-all ${
                              isSelected
                                ? "bg-white/[0.12] text-white/80 ring-1 ring-white/[0.15]"
                                : "text-white/50 bg-white/[0.05] hover:bg-white/[0.08] hover:text-white/70"
                            }`}
                          >
                            <span className="font-mono text-[10px]">
                              {getToolName(tp)}
                            </span>
                            {toolStatus === "complete" && (
                              <CheckCircle2 className="w-3 h-3 text-brand-green" />
                            )}
                            {toolStatus === "error" && (
                              <XCircle className="w-3 h-3 text-red-400" />
                            )}
                            {toolStatus === "running" && (
                              <Loader2 className="w-3 h-3 text-brand-green animate-spin" />
                            )}
                            {toolStatus === "pending" && (
                              <span className="text-[10px] text-white/30">...</span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {/* Platform action panel — upsell */}
                  {!isStreaming && i === lastAssistantIndex && (() => {
                    const upsell = detectPlatformUpsell(text, entities, toolCalls)
                    if (!upsell.isUpsell) return null
                    return (
                      <PlatformActionPanel
                        platformIds={upsell.platformIds}
                        childName={upsell.childName}
                        onPush={(platformId) => {
                          const name = upsell.childName || "the child"
                          const platName = formatPlatformId(platformId)
                          sendMessage({ text: `Yes, push ${name}'s protections to ${platName}` })
                        }}
                        onPushAll={() => {
                          const name = upsell.childName || "the child"
                          sendMessage({ text: `Yes, push ${name}'s protections to all remaining platforms` })
                        }}
                        disabled={isLoading}
                      />
                    )
                  })()}
                </div>
              )}
            </motion.div>
          )
        })}

        {/* Loading indicator before any assistant message */}
        {isLoading && lastAssistantIndex === -1 && messages.length > 0 && (
          <div className="flex items-center gap-1.5 py-2">
            <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce [animation-delay:0ms]" />
            <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
        )}

        {/* Chat error */}
        {chatError && (
          <div className="flex items-center gap-2 text-xs text-red-400">
            <AlertCircle className="w-3.5 h-3.5" />
            {chatError.message || "Something went wrong. Please try again."}
          </div>
        )}
      </div>

      {/* Tool call detail overlay */}
      <AnimatePresence>
        {selectedToolCall && (
          <ToolCallDetail
            toolCall={selectedToolCall}
            entities={entities}
            onClose={() => setSelectedToolCallId(null)}
          />
        )}
      </AnimatePresence>

      {/* Tool calls timeline (collapsible) */}
      {toolCalls.length > 0 && (
        <ToolCallsTimeline
          toolCalls={toolCalls}
          entities={entities}
          selectedId={selectedToolCallId}
          onSelect={setSelectedToolCallId}
        />
      )}

      {/* Footer — chat input or status */}
      <div className="px-5 py-3 border-t border-white/[0.06] flex-shrink-0">
        {isDone ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                ref={replyInputRef}
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleReply()
                  }
                }}
                placeholder="Reply..."
                className="flex-1 bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/[0.15] transition-colors"
              />
              <button
                onClick={handleReply}
                disabled={!replyText.trim()}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-brand-green text-[#0D1B2A] disabled:opacity-20 disabled:bg-white/10 disabled:text-white/30 hover:opacity-90 transition-all flex-shrink-0"
                aria-label="Send reply"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <button
                onClick={onTryAnother}
                className="flex items-center gap-1.5 text-[10px] text-white/40 hover:text-white/60 transition-colors"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                Try another
              </button>
              <Link
                href="/playground"
                className="flex items-center gap-1.5 text-[10px] font-medium text-brand-green/70 hover:text-brand-green transition-colors"
              >
                Open full playground
                <ExternalLink className="w-2.5 h-2.5" />
              </Link>
            </div>
          </div>
        ) : (
          <p className="text-[10px] text-white/25 mx-auto text-center">
            Sandbox mode — all data is temporary and enforcement is simulated
          </p>
        )}
      </div>
    </div>
  )
}

/* ── Tool Call Detail Overlay ───────────────────────────────────── */

function ToolCallDetail({
  toolCall,
  entities,
  onClose,
}: {
  toolCall: ToolCallInfo
  entities: EntityMap
  onClose: () => void
}) {
  const [showJson, setShowJson] = useState(false)

  const summary = summarizeToolCall(toolCall.name, toolCall.input, entities)
  let resultDesc = "Pending..."
  if (toolCall.result != null) {
    resultDesc = describeToolResult(toolCall.name, toolCall.result, entities)
  } else if (toolCall.status === "complete") {
    resultDesc = "Completed successfully."
  } else if (toolCall.status === "running") {
    resultDesc = "In progress..."
  } else if (toolCall.status === "error") {
    resultDesc = "Failed."
  }
  const annotatedParams = annotateInput(toolCall.input, entities)

  const statusIcon = {
    pending: <Loader2 className="w-3.5 h-3.5 text-white/30 animate-spin" />,
    running: <Loader2 className="w-3.5 h-3.5 text-brand-green animate-spin" />,
    complete: <CheckCircle2 className="w-3.5 h-3.5 text-brand-green" />,
    error: <XCircle className="w-3.5 h-3.5 text-red-400" />,
  }[toolCall.status]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.15 }}
      className="absolute bottom-0 left-0 right-0 z-20 mx-3 mb-3 bg-[#0d1b2a]/95 backdrop-blur-xl border border-white/[0.1] rounded-xl shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
        {statusIcon}
        <span className="font-mono text-xs font-medium text-white/90 truncate">
          {toolCall.name}
        </span>
        <button
          onClick={onClose}
          className="ml-auto w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/[0.08] text-white/40 hover:text-white/70 transition-colors flex-shrink-0"
          aria-label="Close detail"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-3 max-h-[250px] overflow-y-auto scrollbar-hide">
        {/* Summary */}
        {summary && (
          <p className="text-sm text-white/80 font-medium">{summary}</p>
        )}

        {/* What happened */}
        <p className="text-xs text-white/55 leading-relaxed">{resultDesc}</p>

        {/* Annotated params */}
        {annotatedParams.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">
              Parameters
            </p>
            {annotatedParams.map((param) => (
              <div key={param.key} className="flex items-start gap-1.5 text-[11px] font-mono">
                <span className="text-white/35 flex-shrink-0">{param.key}:</span>
                <div className="min-w-0">
                  {param.entity ? (
                    <span className="inline-flex items-center gap-1 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          ENTITY_COLORS[param.entity.type] || "bg-white/[0.08] text-white/60"
                        }`}
                      >
                        {param.entity.label}
                        {param.entity.detail && (
                          <span className="opacity-60">({param.entity.detail})</span>
                        )}
                      </span>
                    </span>
                  ) : (
                    <span className="text-white/60 break-all">
                      {typeof param.value === "string"
                        ? param.value.length > 40
                          ? param.value.slice(0, 37) + "..."
                          : param.value
                        : String(JSON.stringify(param.value))}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Raw JSON toggle */}
        {toolCall.result != null && (
          <div>
            <button
              onClick={() => setShowJson(!showJson)}
              className="flex items-center gap-1 text-[10px] text-white/25 hover:text-white/40 transition-colors"
            >
              <ChevronDown
                className={`w-3 h-3 transition-transform ${showJson ? "" : "-rotate-90"}`}
              />
              Raw response
            </button>
            {showJson && (
              <pre className="mt-1.5 bg-black/30 rounded-lg p-2.5 text-[10px] font-mono text-white/35 overflow-x-auto max-h-[150px] scrollbar-hide">
                {String(JSON.stringify(toolCall.result, null, 2))}
              </pre>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}

/* ── Tool Calls Timeline ────────────────────────────────────────── */

function ToolCallsTimeline({
  toolCalls,
  entities,
  selectedId,
  onSelect,
}: {
  toolCalls: ToolCallInfo[]
  entities: EntityMap
  selectedId: string | null
  onSelect: (id: string | null) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const visibleCalls = expanded ? toolCalls : toolCalls.slice(-3)

  return (
    <div className="border-t border-white/[0.06] flex-shrink-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-5 py-2 text-[10px] text-white/30 hover:text-white/50 transition-colors uppercase tracking-wider font-medium"
      >
        <span>API Calls ({toolCalls.length})</span>
        <span className="ml-auto text-[10px]">{expanded ? "\u25B2" : "\u25BC"}</span>
      </button>
      <div className="px-5 pb-3 space-y-1 max-h-[200px] overflow-y-auto scrollbar-hide">
        {visibleCalls.map((tc) => {
          const isSelected = selectedId === tc.id
          const summary = summarizeToolCall(tc.name, tc.input, entities)
          return (
            <button
              key={tc.id}
              onClick={() => onSelect(isSelected ? null : tc.id)}
              className={`w-full flex items-center gap-2 text-[11px] font-mono py-1 px-1.5 rounded transition-all text-left ${
                isSelected
                  ? "bg-white/[0.08] text-white/80"
                  : "hover:bg-white/[0.04] text-white/50"
              }`}
            >
              {tc.status === "complete" && (
                <CheckCircle2 className="w-3 h-3 text-brand-green flex-shrink-0" />
              )}
              {tc.status === "error" && (
                <XCircle className="w-3 h-3 text-red-400 flex-shrink-0" />
              )}
              {(tc.status === "running" || tc.status === "pending") && (
                <Loader2 className="w-3 h-3 text-white/30 animate-spin flex-shrink-0" />
              )}
              <span className="truncate flex-1">
                {summary || tc.name}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
